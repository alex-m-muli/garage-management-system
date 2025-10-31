// frontend/src/components/SupplierManagement.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaIndustry, FaPhone, FaBuilding, FaMapMarkerAlt, FaBoxOpen } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// === Animations ===
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// === Styled Components ===
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #1a202c;
`;

const AddButton = styled.button`
  background-color: #38a169;
  color: white;
  padding: 0.8rem;
  border: none;
  border-radius: 50%;
  font-size: 1.8rem;
  cursor: pointer;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 100;

  &:hover {
    background-color: #2f855a;
  }
`;

const SearchInput = styled.input`
  padding: 0.75rem 1rem;
  width: 100%;
  margin-bottom: 2rem;
  border: 1px solid #cbd5e0;
  border-radius: 10px;
  font-size: 1rem;
  background: #f7fafc;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
  border-left: 5px solid #3182ce;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  animation: ${fadeIn} 0.6s ease both;
  transition: all 0.3s ease-in-out;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    background: linear-gradient(135deg, #e0f2fe 0%, #bee3f8 100%);
  }
`;

const InfoRow = styled.p`
  color: #2d3748;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  margin: 0.4rem 0;

  svg {
    margin-right: 0.5rem;
    color: #4299e1;
  }
`;

const Name = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c5282;
  margin-bottom: 0.5rem;
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.4rem;
`;

const IconBtn = styled.button`
  background: none;
  border: none;
  color: #4a5568;
  font-size: 1.1rem;
  cursor: pointer;

  &:hover {
    color: #2c5282;
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
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

  @media (max-width: 480px) {
    width: 90%;
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
  padding: 0.6rem 1.5rem;
  background-color: #3182ce;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: #2b6cb0;
  }
`;

const Pagination = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 0.8rem;
  flex-wrap: wrap;
`;

// === Component ===
const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({ name: '', contact: '', company: '', address: '', products: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  const fetchSuppliers = useCallback(() => {
    axios.get(`/api/suppliers?search=${search}&page=${page}&limit=${itemsPerPage}`)
      .then(res => {
        setSuppliers(res.data.data);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => toast.error('Failed to fetch suppliers.'));
  }, [search, page]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const validatePhone = phone => /^\d{10}$/.test(phone);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validatePhone(formData.contact)) return toast.error("Phone must be 10 digits.");

    const request = editId
      ? axios.put(`/api/suppliers/${editId}`, formData)
      : axios.post('/api/suppliers', formData);

    request.then(() => {
      fetchSuppliers();
      setFormData({ name: '', contact: '', company: '', address: '', products: '' });
      setEditId(null);
      setModalOpen(false);
      toast.success('Saved successfully!');
    }).catch(() => toast.error('Error saving supplier.'));
  };

  const handleEdit = (supplier) => {
    setFormData(supplier);
    setEditId(supplier._id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this supplier?")) {
      axios.delete(`/api/suppliers/${id}`)
        .then(() => {
          fetchSuppliers();
          toast.success('Deleted.');
        })
        .catch(() => toast.error('Failed to delete.'));
    }
  };

  return (
    <Container>
      <ToastContainer />
      <Header>
        <Title>Supplier Management</Title>
      </Header>

      <SearchInput
        placeholder="Search by name, contact, product..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <Grid>
        {suppliers.map(s => (
          <Card key={s._id}>
            <ActionButtons>
              <IconBtn title="Edit" onClick={() => handleEdit(s)}><FaEdit /></IconBtn>
              <IconBtn title="Delete" onClick={() => handleDelete(s._id)}><FaTrash /></IconBtn>
            </ActionButtons>

            <Name>{s.name}</Name>
            <InfoRow><FaPhone /> {s.contact}</InfoRow>
            {s.company && <InfoRow><FaIndustry /> {s.company}</InfoRow>}
            {s.address && <InfoRow><FaMapMarkerAlt /> {s.address}</InfoRow>}
            {s.products && <InfoRow><FaBoxOpen /> {s.products}</InfoRow>}
          </Card>
        ))}
      </Grid>

      <Pagination>
        {Array.from({ length: totalPages }, (_, i) => (
          <Button key={i} onClick={() => setPage(i + 1)}>{i + 1}</Button>
        ))}
      </Pagination>

      <AddButton title="Add Supplier" onClick={() => setModalOpen(true)}><FaPlus /></AddButton>

      {modalOpen && (
        <ModalBackdrop onClick={() => setModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h3>{editId ? 'Edit Supplier' : 'Add Supplier'}</h3>
            <form onSubmit={handleFormSubmit}>
              <Input name="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Name" required />
              <Input name="contact" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} placeholder="Contact (10 digits)" required />
              <Input name="company" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} placeholder="Company (optional)" />
              <Input name="address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Address (optional)" />
              <Input name="products" value={formData.products} onChange={e => setFormData({ ...formData, products: e.target.value })} placeholder="Products Supplied (optional)" />
              <Button type="submit">{editId ? 'Update' : 'Add'}</Button>
            </form>
          </ModalContent>
        </ModalBackdrop>
      )}
    </Container>
  );
};

export default SupplierManagement;
