// frontend/src/components/UserManagement.js
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';

// Animation for smooth fade-in
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ==== Styled Components ====
const Container = styled.div`
  padding: 2rem;
  max-width: 1000px;
  margin: auto;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #2d3748;
  margin-bottom: 2rem;
  text-align: center;
`;

const AddButton = styled.button`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition: 0.3s;

  &:hover {
    opacity: 0.9;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  position: relative;
  border-left: 6px solid #667eea;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-3px);
  }
`;

const Info = styled.div`
  margin-bottom: 0.5rem;
`;

const Name = styled.h3`
  color: #2d3748;
  font-size: 1.3rem;
  margin-bottom: 0.3rem;
`;

const Role = styled.p`
  color: #4a5568;
  font-size: 0.95rem;
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  display: flex;
  gap: 0.5rem;
`;

const IconBtn = styled.button`
  background: none;
  border: none;
  color: #4a5568;
  cursor: pointer;
  font-size: 1.2rem;

  &:hover {
    color: #5a67d8;
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 400px;
  max-width: 90%;
  animation: ${fadeIn} 0.4s ease-out;

  h3 {
    margin-bottom: 1rem;
    text-align: center;
    color: #2d3748;
  }
`;

const Input = styled.input`
  margin: 0.5rem 0;
  padding: 0.7rem;
  width: 100%;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 1rem;
`;

const Button = styled.button`
  margin-top: 1rem;
  padding: 0.7rem 1.4rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  width: 100%;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background: #5a67d8;
  }
`;

const ErrorText = styled.p`
  color: red;
  margin-top: 0.5rem;
  font-size: 0.95rem;
  text-align: center;
`;

const ConfirmBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 340px;
  max-width: 90%;
  text-align: center;
  animation: ${fadeIn} 0.3s ease-out;

  h4 {
    color: #2d3748;
    margin-bottom: 1rem;
  }

  button {
    padding: 0.6rem 1.2rem;
    margin: 0 0.5rem;
    border-radius: 6px;
    border: none;
    font-size: 1rem;
    cursor: pointer;
  }

  .yes {
    background: #e53e3e;
    color: white;
  }

  .no {
    background: #edf2f7;
    color: #2d3748;
  }
`;

// ==== Component ====

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ username: '', position: '', contact: '', salary: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ show: false, user: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get('/api/users')
      .then(res => {
        const filtered = res.data.filter(user =>
          user.role !== 'admin' && user.username.toLowerCase() !== 'narayan'
        );
        setUsers(filtered);
      })
      .catch(() => alert('Failed to fetch users'));
  };

  const isValidContact = phone => /^07\d{8}$/.test(phone);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formData.contact && !isValidContact(formData.contact)) {
      return setError('Contact must be in format 0712345678');
    }

    const payload = {
      ...formData,
      role: 'staff',
      salary: formData.salary !== '' ? Number(formData.salary) : undefined
    };

    const request = editId
      ? axios.put(`/api/users/${editId}`, payload)
      : axios.post('/api/users', payload);

    request
      .then(() => {
        fetchUsers();
        setModalOpen(false);
        setEditId(null);
        setFormData({ username: '', position: '', contact: '', salary: '' });
        setError('');
      })
      .catch(() => setError('Failed to save user'));
  };

  const handleEdit = user => {
    setEditId(user._id);
    setFormData({
      username: user.username || '',
      position: user.position || '',
      contact: user.contact || '',
      salary: user.salary || ''
    });
    setModalOpen(true);
  };

  const confirmDelete = user => {
    setConfirmDialog({ show: true, user });
  };

  const deleteUser = () => {
    const user = confirmDialog.user;
    axios.delete(`/api/users/${user._id}`)
      .then(() => {
        fetchUsers();
        setConfirmDialog({ show: false, user: null });
      })
      .catch(() => alert('Failed to delete user'));
  };

  return (
    <Container>
      <Title>Company Staff</Title>

      <AddButton onClick={() => {
        setEditId(null);
        setFormData({ username: '', position: '', contact: '', salary: '' });
        setModalOpen(true);
      }}>
        <FaUserPlus /> Add Staff
      </AddButton>

      <Grid>
        {users.map(user => (
          <Card key={user._id}>
            <ActionButtons>
              <IconBtn onClick={() => handleEdit(user)} title="Edit"><FaEdit /></IconBtn>
              <IconBtn onClick={() => confirmDelete(user)} title="Delete"><FaTrash /></IconBtn>
            </ActionButtons>
            <Info>
              <Name>{user.username}</Name>
              <Role>{user.position}</Role>
              {user.contact && <Role>📞 {user.contact}</Role>}
              {user.salary !== undefined && <Role>💰 KES {user.salary}</Role>}
            </Info>
          </Card>
        ))}
      </Grid>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <ModalBackdrop onClick={() => setModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h3>{editId ? 'Edit Staff Member' : 'Add New Staff'}</h3>
            <form onSubmit={handleFormSubmit}>
              <Input
                name="username"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                placeholder="Name"
                required
              />
              <Input
                name="position"
                value={formData.position}
                onChange={e => setFormData({ ...formData, position: e.target.value })}
                placeholder="Position (e.g. Mechanic, Receptionist)"
                required
              />
              <Input
                name="contact"
                value={formData.contact}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                placeholder="Contact (0712345678)"
              />
              <Input
                name="salary"
                type="number"
                value={formData.salary}
                onChange={e => setFormData({ ...formData, salary: e.target.value })}
                placeholder="Monthly Salary (KES)"
              />
              {error && <ErrorText>{error}</ErrorText>}
              <Button type="submit">{editId ? 'Update' : 'Add'}</Button>
            </form>
          </ModalContent>
        </ModalBackdrop>
      )}

      {/* Custom Delete Confirmation Modal */}
      {confirmDialog.show && (
        <ModalBackdrop onClick={() => setConfirmDialog({ show: false, user: null })}>
          <ConfirmBox onClick={e => e.stopPropagation()}>
            <h4>Delete {confirmDialog.user.username}?</h4>
            <button className="no" onClick={() => setConfirmDialog({ show: false, user: null })}>Cancel</button>
            <button className="yes" onClick={deleteUser}>Delete</button>
          </ConfirmBox>
        </ModalBackdrop>
      )}
    </Container>
  );
};

export default UserManagement;
