const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const os = require('os');
const archiver = require('archiver');
const AdmZip = require('adm-zip');

// Helper to get temporary file paths
const getTempPath = (filename) => path.join(os.tmpdir(), filename);

// === CREATE BACKUP ===
exports.createBackup = async (req, res) => {
  try {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const zipFilename = `backup-${Date.now()}.zip`;
    
    // Set headers to trigger download directly
    res.attachment(zipFilename);

    // Pipe archive data to the response
    archive.pipe(res);

    // Get all registered models
    const models = mongoose.connection.models;

    for (const [modelName, Model] of Object.entries(models)) {
      const data = await Model.find({});
      // Append each collection as a JSON file in the zip
      archive.append(JSON.stringify(data, null, 2), { name: `${modelName}.json` });
    }

    await archive.finalize();
  } catch (error) {
    console.error('Backup error:', error);
    if (!res.headersSent) res.status(500).json({ message: 'Backup failed', error: error.message });
  }
};

// === RESTORE BACKUP ===
exports.restoreBackup = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No backup file uploaded' });
  }

  try {
    const zip = new AdmZip(req.file.path);
    const zipEntries = zip.getEntries();
    const models = mongoose.connection.models;

    for (const entry of zipEntries) {
      if (entry.entryName.endsWith('.json')) {
        const modelName = entry.entryName.replace('.json', '');
        
        // Find the matching Mongoose model (case-insensitive check)
        const Model = Object.values(models).find(
          m => m.modelName.toLowerCase() === modelName.toLowerCase()
        );

        if (Model) {
          const jsonData = JSON.parse(entry.getData().toString('utf8'));
          
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            // Optional: Clear existing data before restoring
            await Model.deleteMany({});
            await Model.insertMany(jsonData);
            console.log(`Restored ${modelName}: ${jsonData.length} docs`);
          }
        }
      }
    }

    // Cleanup temp file
    fs.unlinkSync(req.file.path);

    res.json({ message: 'Restore completed successfully' });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ message: 'Restore failed', error: error.message });
  }
};