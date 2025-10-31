// backend/routes/backupRoutes.js
const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const BACKUP_DIR = path.join(__dirname, '../backups');
const DB_NAME = 'garage_db';
const MONGO_URI = 'mongodb://127.0.0.1:27017';
const MAX_BACKUPS = 5; // Keep only the 5 most recent backups

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

// === Create Backup with Auto-Cleanup ===
router.get('/create', (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = path.join(BACKUP_DIR, `backup-${timestamp}`);
  const command = `mongodump --uri="${MONGO_URI}/${DB_NAME}" --out="${outDir}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr || 'Backup failed' });

    // Cleanup old backups (retain latest N)
    const folders = fs.readdirSync(BACKUP_DIR)
      .map(name => ({
        name,
        time: fs.statSync(path.join(BACKUP_DIR, name)).mtime.getTime()
      }))
      .filter(item => fs.statSync(path.join(BACKUP_DIR, item.name)).isDirectory())
      .sort((a, b) => b.time - a.time); // Newest first

    const oldFolders = folders.slice(MAX_BACKUPS);
    oldFolders.forEach(f => {
      const fullPath = path.join(BACKUP_DIR, f.name);
      fs.rmSync(fullPath, { recursive: true, force: true });
    });

    return res.json({ message: 'Backup successful', folder: path.basename(outDir) });
  });
});

// === Restore from Backup ===
router.post('/restore', (req, res) => {
  const { folderName } = req.body;
  if (!folderName) return res.status(400).json({ error: 'Folder name required' });

  const folderPath = path.join(BACKUP_DIR, folderName);
  if (!fs.existsSync(folderPath)) return res.status(400).json({ error: 'Backup folder not found' });

  const command = `mongorestore --uri="${MONGO_URI}/${DB_NAME}" --drop "${folderPath}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr || 'Restore failed' });
    return res.json({ message: 'Restore successful' });
  });
});

// === List available backups ===
router.get('/list', (req, res) => {
  fs.readdir(BACKUP_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to list backups' });
    const folders = files.filter(f => fs.statSync(path.join(BACKUP_DIR, f)).isDirectory());
    return res.json(folders);
  });
});

module.exports = router;
