import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaIndustry, FaPhone, FaMapMarkerAlt, FaBoxOpen, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- CRITICAL: Fallback URL ---
const API_BASE_URL = process.env.REACT_APP_API_URL

// ===== Styled Components (Theme Consistent) =====
const Root = styled.div`
  --bg: #f6f8fb;
  --text: #0b1220;
  --accent: #2563eb;
  --muted: #6b7280;
  --radius-md: 14px;
  width: 100%;
  padding: 20px;
  background: linear-gradient(180deg, #f8fafc 0%, var(--bg) 100%);
  min-height: 100vh;
  font-family: Inter, 'Segoe UI', Roboto, sans-serif;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text);
`;

const Subtitle = styled.span`
  margin-top: 6px;
  font-size: 0.92rem;
  color: var(--muted);
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 260px;
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.9rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.6rem 1rem 0.6rem 2.2rem;
  border: 1px solid #e6eef8;
  border-radius: 12px;
  font-size: 0.95rem;
  background: #ffffff;
  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 4px 12px rgba(37,99,235,0.1);
  }
`;

const AddButton = styled.button`
  background: linear-gradient(180deg, #3380ff 0%, #1f66e6 100%);
  color: white;
  padding: 0.6rem 1.1rem;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37,99,235,0.2);
  &:hover { transform: translateY(-3px); }
`;

const Grid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const Card = styled.div`
  background: linear-gradient(135deg, rgba(10, 238, 219, 0.9) 0%, rgba(94, 122, 199, 0.8) 100%);
  backdrop-filter: blur(14px);
  border-radius: var(--radius-md);
  border: 1px solid rgba(17, 24, 39, 0.04);
  padding: 18px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06);
  transition: transform 0.18s, box-shadow 0.18s;
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(10, 18, 30, 0.12);
    border-color: rgba(245, 158, 11, 0.3); /* Amber tint for suppliers */
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const IconAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  box-shadow: 0 6px 12px rgba(245, 158, 11, 0.25);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
`;

const ActionIconBtn = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  background: rgba(255,255,255,0.6);
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { color: var(--accent); background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
  &.delete:hover { color: #ef4444; }
`;

const Name = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 10px 0;
`;

const InfoRow = styled.div`
  font-size: 0.9rem;
  color:rgb(29, 29, 31);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  svg { color: #94a3b8; }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: var(--muted);
  background: rgba(255,255,255,0.5);
  border-radius: 12px;
  border: 2px dashed #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const Pagination = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
`;

const PageBtn = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
   
  &:hover { background: #f1f5f9; }
  &.active { background: var(--accent); color: white; border-color: var(--accent); }
`;

/* Modal Styles (Shared) */
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
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.h3`
  font-size: 1.25rem;
  color: #1e293b;
  margin-bottom: 1.5rem;
  font-weight: 700;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  &:focus { outline: none; border-color: var(--accent); }
`;

const ModalButton = styled.button`
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  width: 100%;
  margin-top: 0.5rem;
  background: var(--accent);
  color: white;
  &:hover { opacity: 0.9; }
  &.cancel { background: #f1f5f9; color: #475569; margin-top: 0; }
  &.delete { background: #dc2626; color: white; margin-top: 0; }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
`;

// === Component ===
const SupplierManagement = () => {
  // Initialize with empty array to prevent map errors
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({ name: '', contact: '', company: '', address: '', products: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  const fetchSuppliers = useCallback(() => {
    axios.get(`${API_BASE_URL}/api/suppliers?search=${search}&page=${page}&limit=${itemsPerPage}`)
      .then(res => {
        // FIX: Ensure data is an array. If undefined/null, default to []
        const data = res.data.data;
        setSuppliers(Array.isArray(data) ? data : []);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch((error) => {
        console.error("Supplier Fetch Error:", error);
        setSuppliers([]); // Safety fallback
        toast.error('Failed to fetch suppliers.');
      });
  }, [search, page]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const validatePhone = phone => /^\d{10}$/.test(phone);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validatePhone(formData.contact)) return toast.error("Phone must be 10 digits.");

    const request = editId
      ? axios.put(`${API_BASE_URL}/api/suppliers/${editId}`, formData)
      : axios.post(`${API_BASE_URL}/api/suppliers`, formData);

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

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    axios.delete(`${API_BASE_URL}/api/suppliers/${deleteId}`)
      .then(() => {
        fetchSuppliers();
        toast.success('Deleted successfully.');
      })
      .catch(() => toast.error('Failed to delete.'))
      .finally(() => {
        setDeleteModalOpen(false);
        setDeleteId(null);
      });
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
    setFormData({ name: '', contact: '', company: '', address: '', products: '' });
  };

  return (
    <Root>
      <Container>
        <ToastContainer />
        <Header>
          <TitleBlock>
            <Title>Supplier Management</Title>
            <Subtitle>Manage inventory sources and contacts</Subtitle>
          </TitleBlock>
           
          <Controls>
            <SearchWrapper>
              <SearchIcon />
              <SearchInput
                placeholder="Search suppliers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </SearchWrapper>
            <AddButton onClick={() => setModalOpen(true)}>
              <FaPlus /> Add Supplier
            </AddButton>
          </Controls>
        </Header>

        <Grid>
          {/* FIX: Check array existence and length before mapping */}
          {Array.isArray(suppliers) && suppliers.length > 0 ? (
            suppliers.map(s => (
              <Card key={s._id}>
                <CardHeader>
                  <IconAvatar>
                    <FaIndustry />
                  </IconAvatar>
                  <ActionButtons>
                    <ActionIconBtn onClick={() => handleEdit(s)} title="Edit"><FaEdit /></ActionIconBtn>
                    <ActionIconBtn className="delete" onClick={() => handleDeleteClick(s._id)} title="Delete"><FaTrash /></ActionIconBtn>
                  </ActionButtons>
                </CardHeader>

                <Name>{s.name}</Name>
                
                <div style={{ flex: 1 }}>
                  <InfoRow><FaPhone /> {s.contact}</InfoRow>
                  {s.company && <InfoRow><FaIndustry /> {s.company}</InfoRow>}
                  {s.address && <InfoRow><FaMapMarkerAlt /> {s.address}</InfoRow>}
                  {s.products && <InfoRow><FaBoxOpen /> {s.products}</InfoRow>}
                </div>
              </Card>
            ))
          ) : (
            <EmptyState>
              <FaSearch size={24} style={{ opacity: 0.5 }} />
              <p>No suppliers found.</p>
            </EmptyState>
          )}
        </Grid>

        <Pagination>
          {Array.from({ length: totalPages || 1 }, (_, i) => (
            <PageBtn 
              key={i} 
              onClick={() => setPage(i + 1)}
              className={page === i + 1 ? 'active' : ''}
            >
              {i + 1}
            </PageBtn>
          ))}
        </Pagination>

        {/* Add/Edit Modal */}
        {modalOpen && (
          <ModalBackdrop onClick={closeModal}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <ModalHeader>{editId ? 'Edit Supplier' : 'Add Supplier'}</ModalHeader>
              <form onSubmit={handleFormSubmit}>
                <Input name="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Name" required />
                <Input name="contact" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} placeholder="Contact (10 digits)" required />
                <Input name="company" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} placeholder="Company (optional)" />
                <Input name="address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Address (optional)" />
                <Input name="products" value={formData.products} onChange={e => setFormData({ ...formData, products: e.target.value })} placeholder="Products Supplied (optional)" />
                
                <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                   <ModalButton type="button" className="cancel" onClick={closeModal}>Cancel</ModalButton>
                   <ModalButton type="submit">Save Changes</ModalButton>
                </div>
              </form>
            </ModalContent>
          </ModalBackdrop>
        )}

        {/* Delete Modal */}
        {deleteModalOpen && (
          <ModalBackdrop onClick={() => setDeleteModalOpen(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ color: '#dc2626', fontSize: '1.5rem' }}><FaExclamationTriangle /></div>
                <h3 style={{ margin: 0, color: '#1e293b' }}>Delete Supplier?</h3>
              </div>
              <p style={{ color: '#64748b', lineHeight: '1.5' }}>
                Are you sure? This will remove the supplier and cannot be undone.
              </p>
              <ButtonGroup>
                <ModalButton className="cancel" onClick={() => setDeleteModalOpen(false)}>Cancel</ModalButton>
                <ModalButton className="delete" onClick={confirmDelete}>Delete</ModalButton>
              </ButtonGroup>
            </ModalContent>
          </ModalBackdrop>
        )}
      </Container>
    </Root>
  );
};

export default SupplierManagement;