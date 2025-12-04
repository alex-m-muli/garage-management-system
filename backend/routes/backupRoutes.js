const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const os = require('os'); // Import OS to find temp dir
const archiver = require('archiver');
const AdmZip = require('adm-zip');
const multer = require('multer');

// === Configuration ===
// Use system temp dir for Render compatibility (guaranteed writable)
const BACKUP_DIR = path.join(os.tmpdir(), 'garage_backups');
const MAX_BACKUPS = 5; 

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Configure Multer for temporary upload storage
const upload = multer({ dest: path.join(os.tmpdir(), 'garage_uploads') });

// === Helper: Cleanup Old Backups ===
const cleanupOldBackups = () => {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .map(name => ({
        name,
        path: path.join(BACKUP_DIR, name),
        time: fs.statSync(path.join(BACKUP_DIR, name)).mtime.getTime()
      }))
      .filter(f => f.name.endsWith('.zip'))
      .sort((a, b) => b.time - a.time); // Newest first

    if (files.length > MAX_BACKUPS) {
      files.slice(MAX_BACKUPS).forEach(f => {
        fs.unlinkSync(f.path);
        console.log(`Auto-deleted old backup: ${f.name}`);
      });
    }
  } catch (err) {
    console.error('Cleanup error:', err);
  }
};

// === ROUTE: Create Backup (Native Node Version) ===
router.get('/create', async (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `backup-${timestamp}.zip`;
  const filePath = path.join(BACKUP_DIR, fileName);

  try {
    // 1. Create a Write Stream to save the zip locally
    const output = fs.createWriteStream(filePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Listen for completion
    output.on('close', () => {
      console.log(`Backup created: ${fileName} (${archive.pointer()} bytes)`);
      cleanupOldBackups(); // Run cleanup
      res.download(filePath, fileName); // Send file to user
    });

    archive.on('error', (err) => { throw err; });

    // Pipe archive data to the file
    archive.pipe(output);

    // 2. Fetch Data from Mongoose and add to Zip
    const models = mongoose.connection.models;
    for (const [modelName, Model] of Object.entries(models)) {
      const data = await Model.find({});
      archive.append(JSON.stringify(data, null, 2), { name: `${modelName}.json` });
    }

    await archive.finalize();

  } catch (err) {
    console.error('Backup failed:', err);
    if (!res.headersSent) res.status(500).json({ error: 'Backup generation failed', details: err.message });
  }
});

// === ROUTE: Restore Backup (Native Node Version) ===
router.post('/restore', upload.single('backup'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No backup file uploaded' });

  try {
    const zip = new AdmZip(req.file.path);
    const zipEntries = zip.getEntries();
    const models = mongoose.connection.models;

    console.log('Starting Native Restore...');

    for (const entry of zipEntries) {
      if (entry.entryName.endsWith('.json')) {
        const modelName = entry.entryName.replace('.json', '');
        
        // Find matching Mongoose model (case-insensitive)
        const Model = Object.values(models).find(
          m => m.modelName.toLowerCase() === modelName.toLowerCase()
        );

        if (Model) {
          const jsonData = JSON.parse(entry.getData().toString('utf8'));
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            await Model.deleteMany({}); // Wipe existing data
            await Model.insertMany(jsonData); // Insert backup data
            console.log(`Restored ${modelName}: ${jsonData.length} docs`);
          }
        }
      }
    }

    // Cleanup temp uploaded file
    fs.unlinkSync(req.file.path);
    res.json({ message: 'Restore successful. Database updated.' });

  } catch (err) {
    console.error('Restore failed:', err);
    res.status(500).json({ error: 'Restore failed', details: err.message });
  }
});

// === ROUTE: List Backups ===
router.get('/list', (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.zip'))
      .map(name => ({
        name,
        created: fs.statSync(path.join(BACKUP_DIR, name)).mtime
      }))
      .sort((a, b) => b.created - a.created);

    res.json(files);
  } catch (err) {
    // If directory doesn't exist yet, return empty array
    res.json([]);
  }
});

module.exports = router;