import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaUserPlus, FaUserTie, FaPhone, FaMoneyBillWave, FaEdit, FaTrash, FaExclamationTriangle 
} from 'react-icons/fa';

// --- CRITICAL: Fallback URL for Deployed Version ---
const API_BASE_URL = process.env.REACT_APP_API_URL

// ==========================================
// ===== Styled Components (Theme Match) ====
// ==========================================

const Root = styled.div`
  --bg: #f6f8fb;
  --card-bg: #ffffff;
  --muted: #6b7280;
  --text: #0b1220;
  --accent: #2563eb;
  --glass: rgba(255,255,255,0.65);
  --soft-shadow: 0 6px 18px rgba(12, 20, 30, 0.06);
  --deep-shadow: 0 18px 40px rgba(8, 12, 20, 0.12);
  --radius-md: 14px;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  background: linear-gradient(180deg, #f8fafc 0%, var(--bg) 100%);
  min-height: 100vh;
  font-family: Inter, 'Segoe UI', Roboto, sans-serif;
`;

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text);
`;

const Subtitle = styled.p`
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 0.95rem;
`;

/* Primary Add Button */
const AddButton = styled.button`
  background: linear-gradient(180deg, #3380ff 0%, #1f66e6 100%);
  color: white;
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  box-shadow: var(--deep-shadow);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
  }
`;

/* Grid Layout for Staff Cards */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding-bottom: 2rem;
`;

/* Staff Card Styling */
const Card = styled.div`
  background: linear-gradient(135deg, rgba(22, 216, 230, 0.95), rgba(187, 26, 173, 0.36));
  backdrop-filter: blur(10px);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.6);
  padding: 1.5rem;
  box-shadow: var(--soft-shadow);
  position: relative;
  transition: all 0.2s ease;
  overflow: hidden;

  /* Left accent border */
  border-left: 4px solid var(--accent);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const Name = styled.h3`
  margin: 0;
  color: var(--text);
  font-size: 1.2rem;
  font-weight: 700;
`;

const RoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
  margin-top: 6px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color:rgb(15, 15, 15);
  font-size: 0.9rem;
  margin-bottom: 0.6rem;
  
  svg {
    color: #9ca3af;
  }
`;

/* Action Buttons on Card */
const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.05);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--accent);
    transform: scale(1.05);
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  }

  &.delete:hover {
    color: #ef4444;
    background: #fef2f2;
  }
`;

/* Modal Styles matched to Services.js */
const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.2s ease-out;

  @keyframes slideIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  h3 {
    margin: 0 0 1.5rem 0;
    color: #1e293b;
    font-size: 1.25rem;
    font-weight: 700;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.4rem;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #f8fafc;
  box-sizing: border-box;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--accent);
    background: white;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  
  &.cancel {
    background: #f1f5f9;
    color: #475569;
    &:hover { background: #e2e8f0; }
  }

  &.confirm {
    background: var(--accent);
    color: white;
    &:hover { opacity: 0.9; }
  }

  &.delete {
    background: #dc2626;
    color: white;
    &:hover { opacity: 0.9; }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/* Specific error box for Modal */
const ModalError = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

// ==========================================
// ===== Component Logic ====================
// ==========================================

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ username: '', position: '', contact: '', salary: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ show: false, user: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get(`${API_BASE_URL}/api/users`)
      .then(res => {
        if (Array.isArray(res.data)) {
          const filtered = res.data.filter(user =>
            user.role !== 'admin' && user.username.toLowerCase() !== 'narayan'
          );
          setUsers(filtered);
        } else {
          setUsers([]);
        }
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        toast.error("Failed to load staff list.");
      });
  };

  const isValidContact = phone => /^07\d{8}$/.test(phone);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Frontend validation
    if (formData.contact && !isValidContact(formData.contact)) {
      return setError('Phone number must start with 07 and be 10 digits.');
    }

    setLoading(true);
    const payload = {
      ...formData,
      role: 'staff',
      salary: formData.salary !== '' ? Number(formData.salary) : undefined
    };

    const request = editId
      ? axios.put(`${API_BASE_URL}/api/users/${editId}`, payload)
      : axios.post(`${API_BASE_URL}/api/users`, payload);

    request
      .then(() => {
        fetchUsers();
        setModalOpen(false);
        setEditId(null);
        setFormData({ username: '', position: '', contact: '', salary: '' });
        toast.success(editId ? 'Staff updated successfully!' : 'New staff added!');
      })
      .catch((err) => {
        console.error("Save Error:", err);
        
        // --- SMART ERROR HANDLING ---
        // Check if the server sent a specific message (e.g. "User exists")
        if (err.response && err.response.data && err.response.data.message) {
             setError(err.response.data.message);
        } else if (err.response && err.response.data && err.response.data.error) {
             setError(err.response.data.error);
        } else if (err.response && err.response.status === 409) {
             // Fallback for conflict error codes if no message provided
             setError("User with this phone number already exists.");
        } else {
             setError('Connection failed. Please check your network.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleEdit = user => {
    setEditId(user._id);
    setFormData({
      username: user.username || '',
      position: user.position || '',
      contact: user.contact || '',
      salary: user.salary || ''
    });
    setError('');
    setModalOpen(true);
  };

  const confirmDelete = user => {
    setConfirmDialog({ show: true, user });
  };

  const deleteUser = () => {
    const user = confirmDialog.user;
    if (!user) return;
    
    axios.delete(`${API_BASE_URL}/api/users/${user._id}`)
      .then(() => {
        fetchUsers();
        setConfirmDialog({ show: false, user: null });
        toast.success(`Removed ${user.username} from staff.`);
      })
      .catch((err) => {
        console.error("Delete Error:", err);
        toast.error('Failed to delete user. Server error.');
      });
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({ username: '', position: '', contact: '', salary: '' });
    setError('');
    setModalOpen(true);
  };

  return (
    <Root>
      <Container>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />

        <Header>
          <TitleBlock>
            <Title>Team Management</Title>
            <Subtitle>Manage staff details, roles, and contacts</Subtitle>
          </TitleBlock>
          <AddButton onClick={openAddModal}>
            <FaUserPlus /> Add Staff
          </AddButton>
        </Header>

        <Grid>
          {Array.isArray(users) && users.length > 0 ? (
            users.map(user => (
              <Card key={user._id}>
                <CardHeader>
                  <div>
                    <Name>{user.username}</Name>
                    <RoleBadge>
                      <FaUserTie size={12} /> {user.position || "Staff"}
                    </RoleBadge>
                  </div>
                  <ActionGroup>
                    <ActionBtn onClick={() => handleEdit(user)} title="Edit">
                      <FaEdit />
                    </ActionBtn>
                    <ActionBtn className="delete" onClick={() => confirmDelete(user)} title="Delete">
                      <FaTrash />
                    </ActionBtn>
                  </ActionGroup>
                </CardHeader>

                {user.contact && (
                  <InfoRow>
                    <FaPhone size={14} /> {user.contact}
                  </InfoRow>
                )}
                
                {user.salary !== undefined && (
                  <InfoRow>
                    <FaMoneyBillWave size={14} /> KES {user.salary.toLocaleString()}
                  </InfoRow>
                )}
              </Card>
            ))
          ) : (
             <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94a3b8'}}>
                No staff members found. Click "Add Staff" to begin.
             </div>
          )}
        </Grid>

        {/* Add/Edit Modal */}
        {modalOpen && (
          <ModalBackdrop onClick={() => setModalOpen(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <h3>{editId ? 'Edit Staff Member' : 'Add New Staff'}</h3>
              
              <form onSubmit={handleFormSubmit}>
                {error && (
                    <ModalError>
                        <FaExclamationTriangle /> {error}
                    </ModalError>
                )}

                <FormGroup>
                  <Label>Full Name</Label>
                  <StyledInput
                    name="username"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Position</Label>
                  <StyledInput
                    name="position"
                    value={formData.position}
                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g. Senior Mechanic"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Phone Contact</Label>
                  <StyledInput
                    name="contact"
                    value={formData.contact}
                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="0712345678"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Monthly Salary (KES)</Label>
                  <StyledInput
                    name="salary"
                    type="number"
                    value={formData.salary}
                    onChange={e => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="e.g. 45000"
                  />
                </FormGroup>
                
                <ButtonGroup>
                    <ModalButton type="button" className="cancel" onClick={() => setModalOpen(false)}>
                        Cancel
                    </ModalButton>
                    <ModalButton type="submit" className="confirm" disabled={loading}>
                        {loading ? 'Saving...' : (editId ? 'Save Changes' : 'Create User')}
                    </ModalButton>
                </ButtonGroup>
              </form>
            </ModalContent>
          </ModalBackdrop>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDialog.show && confirmDialog.user && (
          <ModalBackdrop onClick={() => setConfirmDialog({ show: false, user: null })}>
            <ModalContent onClick={e => e.stopPropagation()} style={{maxWidth: '380px'}}>
              <div style={{display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem'}}>
                 <div style={{color: '#dc2626', fontSize: '1.5rem'}}><FaExclamationTriangle /></div>
                 <h3 style={{margin:0}}>Delete User?</h3>
              </div>
              <p style={{color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.5'}}>
                Are you sure you want to delete <strong>{confirmDialog.user.username}</strong>? This action cannot be undone.
              </p>
              <ButtonGroup>
                <ModalButton className="cancel" onClick={() => setConfirmDialog({ show: false, user: null })}>
                    Cancel
                </ModalButton>
                <ModalButton className="delete" onClick={deleteUser}>
                    Delete User
                </ModalButton>
              </ButtonGroup>
            </ModalContent>
          </ModalBackdrop>
        )}
      </Container>
    </Root>
  );
};

export default UserManagement;