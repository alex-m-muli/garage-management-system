// backend/controllers/backupController.js
import { exec } from 'child_process';
import path from 'path';

const BACKUP_DIR = path.join('C:/NarayanBackups');

export const createBackup = (req, res) => {
  const command = `mongodump --db garage_db --out ${BACKUP_DIR}`;
  exec(command, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ message: 'Backup failed', error: stderr });
    return res.json({ message: 'Backup completed successfully' });
  });
};

export const restoreBackup = (req, res) => {
  const command = `mongorestore --drop --db garage_db ${BACKUP_DIR}/garage_db`;
  exec(command, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ message: 'Restore failed', error: stderr });
    return res.json({ message: 'Restore completed successfully' });
  });
};
