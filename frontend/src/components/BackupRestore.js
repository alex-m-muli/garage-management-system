import React, { useState } from 'react';
import styled from 'styled-components';
import { FiDownload, FiUploadCloud, FiDatabase } from 'react-icons/fi';
import axios from 'axios';

const Container = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', sans-serif;
`;

const Title = styled.h2`
  text-align: center;
  font-size: 1.8rem;
  color: #2b6cb0;
  margin-bottom: 1.5rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Description = styled.p`
  color: #4a5568;
  font-size: 0.95rem;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  padding: 0.65rem 1.2rem;
  background: #2b6cb0;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.3s;

  &:hover {
    background: #2c5282;
  }
`;

const FileInput = styled.input`
  margin-top: 0.8rem;
`;

const AutoBackupNote = styled.div`
  background: #ebf8ff;
  border-left: 4px solid #3182ce;
  padding: 1rem;
  border-radius: 6px;
  color: #2a4365;
  font-size: 0.9rem;
`;

const BackupRestore = () => {
  const [restoreFile, setRestoreFile] = useState(null);

  const handleBackup = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/backup/create');
      const backupName = res.data.folder;

      const zipUrl = `http://localhost:5000/backups/${backupName}.zip`;
      const response = await fetch(zipUrl);
      const blob = await response.blob();

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${backupName}.zip`;
      link.click();

      alert('Backup created and downloaded successfully.');
    } catch (error) {
      console.error(error);
      alert('Failed to create or download backup.');
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) return alert('Please select a backup file.');

    const folderName = restoreFile.name.replace(/\.(zip|json)$/i, '');

    try {
      await axios.post('http://localhost:5000/api/backup/restore', { folderName });
      alert('Backup restored successfully.');
    } catch (error) {
      console.error(error);
      alert('Failed to restore backup.');
    }
  };

  return (
    <Container>
      <Title>Backup & Restore</Title>

      {/* === BACKUP SECTION === */}
      <Section>
        <SectionTitle><FiDownload /> Manual Backup</SectionTitle>
        <Description>
          Click the button below to manually export a backup of your current data.
        </Description>
        <Button onClick={handleBackup}>
          <FiDownload /> Download Backup
        </Button>
      </Section>

      {/* === AUTO BACKUP === */}
      <Section>
        <SectionTitle><FiDatabase /> Automatic Backup</SectionTitle>
        <AutoBackupNote>
          Your system performs daily auto-backups stored in a secure location, protected from MongoDB crashes or uninstallation.
        </AutoBackupNote>
      </Section>

      {/* === RESTORE SECTION === */}
      <Section>
        <SectionTitle><FiUploadCloud /> Restore Backup</SectionTitle>
        <Description>
          Select a backup file to restore data into the system. Ensure it's a valid backup file created by the system.
        </Description>
        <FileInput
          type="file"
          accept=".json,.zip"
          onChange={(e) => setRestoreFile(e.target.files[0])}
        />
        <Button style={{ marginTop: '1rem' }} onClick={handleRestore}>
          <FiUploadCloud /> Restore Backup
        </Button>
      </Section>
    </Container>
  );
};

export default BackupRestore;
