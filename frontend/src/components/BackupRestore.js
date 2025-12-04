import React, { useState } from 'react';
import styled from 'styled-components';
import { FiDownload, FiUploadCloud, FiDatabase, FiServer, FiAlertCircle, FiCheck, FiX } from 'react-icons/fi';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- CRITICAL: Fallback URL ---
const API_BASE_URL = process.env.REACT_APP_API_URL

// ===== Styled Components (Matched to Services.js) =====
const Root = styled.div`
  --bg: #f6f8fb;
  --text: #0b1220;
  --accent: #2563eb;
  --muted: #6b7280;
  --radius-md: 14px;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  background: linear-gradient(180deg, #f8fafc 0%, var(--bg) 100%);
  min-height: 100vh;
  font-family: Inter, 'Segoe UI', Roboto, sans-serif;
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  margin-top: 8px;
  color: var(--muted);
  font-size: 1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 2rem;
`;

const Card = styled.div`
  background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,244,255,0.8) 100%);
  backdrop-filter: blur(14px);
  border-radius: var(--radius-md);
  border: 1px solid rgba(17, 24, 39, 0.04);
  padding: 2rem;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(10, 18, 30, 0.12);
    border-color: rgba(90, 120, 255, 0.28);
  }
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: ${({ gradient }) => gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
`;

const CardDescription = styled.p`
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

const ActionButton = styled.button`
  background: ${({ $variant }) => $variant === 'danger' 
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'};
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);

  &:hover {
    transform: translateY(-2px);
    opacity: 0.95;
  }
  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
    transform: none;
  }
`;

const FileInputWrapper = styled.div`
  width: 100%;
  margin-bottom: 1rem;
  
  input[type="file"] {
    width: 100%;
    padding: 0.5rem;
    border: 1px dashed #cbd5e1;
    border-radius: 10px;
    background: #f8fafc;
    color: #64748b;
    cursor: pointer;
  }
`;

const AutoBackupNote = styled.div`
  margin-top: 3rem;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  color: #1e3a8a;
  
  svg {
    color: #3b82f6;
    font-size: 1.5rem;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

// === Modal Components ===
const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  animation: slideUp 0.2s ease-out;

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #dc2626;
  font-size: 1.5rem;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 700;
`;

const ModalText = styled.p`
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const ModalBtn = styled.button`
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &.cancel { background: #f1f5f9; color: #475569; }
  &.confirm { background: #dc2626; color: white; }
  
  &:hover { opacity: 0.9; }
`;

const BackupRestore = () => {
  const [restoreFile, setRestoreFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);

  // === DOWNLOAD BACKUP ===
  const handleBackup = async () => {
    setLoading(true);
    try {
      // 1. Trigger Backend creation
      const response = await axios.get(`${API_BASE_URL}/api/backup/create`, {
        responseType: 'blob', // Important for file download
      });

      // 2. Create local URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `garage_backup_${new Date().toISOString().slice(0, 10)}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success('Backup created successfully.');
    } catch (error) {
      console.error(error);
      toast.error('Backup failed. Server may be missing permissions.');
    } finally {
      setLoading(false);
    }
  };

  // === RESTORE FLOW ===
  const initiateRestore = () => {
    if (!restoreFile) return toast.warn('Please select a backup file first.');
    setRestoreModalOpen(true);
  };

  const confirmRestore = async () => {
    setLoading(true);
    setRestoreModalOpen(false); // Close modal
    try {
      const formData = new FormData();
      formData.append('backup', restoreFile);

      await axios.post(`${API_BASE_URL}/api/backup/restore`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success('Database restored successfully.');
    } catch (error) {
      console.error(error);
      toast.error('Restore failed. Ensure the file is a valid backup zip.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Root>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Container>
        <Header>
          <Title>System Backup & Restore</Title>
          <Subtitle>Secure your data or revert to a previous state</Subtitle>
        </Header>

        <Grid>
          {/* Manual Backup Card */}
          <Card>
            <IconWrapper gradient="linear-gradient(135deg, #3b82f6, #2563eb)">
              <FiDownload />
            </IconWrapper>
            <CardTitle>Create Backup</CardTitle>
            <CardDescription>
              Generate a snapshot of your entire database. 
              Useful before making major changes.
            </CardDescription>
            <ActionButton onClick={handleBackup} disabled={loading}>
              {loading ? 'Processing...' : (
                <>
                  <FiDatabase /> Create Backup
                </>
              )}
            </ActionButton>
          </Card>

          {/* Restore Backup Card */}
          <Card>
            <IconWrapper gradient="linear-gradient(135deg, #f59e0b, #d97706)">
              <FiUploadCloud />
            </IconWrapper>
            <CardTitle>Restore Data</CardTitle>
            <CardDescription>
              Revert your system to a previous backup. 
              <strong> Warning: This overwrites current data.</strong>
            </CardDescription>
            
            <FileInputWrapper>
              <input 
                type="file" 
                accept=".zip"
                onChange={(e) => setRestoreFile(e.target.files[0])}
              />
            </FileInputWrapper>
            
            <ActionButton $variant="danger" onClick={initiateRestore} disabled={loading}>
              {loading ? 'Restoring...' : (
                <>
                  <FiServer /> Start Restore
                </>
              )}
            </ActionButton>
          </Card>
        </Grid>

        <AutoBackupNote>
          <FiAlertCircle />
          <div>
            <strong>Note:</strong> This system performs autobackups regularly.
          </div>
        </AutoBackupNote>

        {/* === Custom Restore Modal === */}
        {restoreModalOpen && (
          <ModalBackdrop onClick={() => setRestoreModalOpen(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <ModalHeader>
                <FiAlertCircle />
                <ModalTitle>Confirm Restore</ModalTitle>
              </ModalHeader>
              <ModalText>
                This action will <strong>completely overwrite</strong> your current database with the data from the selected backup file. 
                <br/><br/>
                Are you absolutely sure you want to proceed?
              </ModalText>
              <ModalActions>
                <ModalBtn className="cancel" onClick={() => setRestoreModalOpen(false)}>
                  <FiX /> Cancel
                </ModalBtn>
                <ModalBtn className="confirm" onClick={confirmRestore}>
                  <FiCheck /> Yes, Restore
                </ModalBtn>
              </ModalActions>
            </ModalContent>
          </ModalBackdrop>
        )}

      </Container>
    </Root>
  );
};

export default BackupRestore;