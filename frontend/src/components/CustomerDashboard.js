import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaSearch, FaPlus, FaExclamationTriangle, FaEye, FaTrash, FaCar } from 'react-icons/fa';
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
  letter-spacing: -0.02em;
`;

const Subtitle = styled.span`
  margin-top: 6px;
  font-size: 0.92rem;
  color: var(--muted);
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
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
  transition: all 0.15s ease;
  
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
  box-shadow: var(--deep-shadow);
  transition: transform 0.12s ease;

  &:hover { transform: translateY(-3px); }
  &:active { transform: translateY(-1px); }
`;

const Grid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

/* Matching Card Style */
const Card = styled.div`
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(240, 244, 255, 0.8) 100%
  );
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
    border-color: rgba(90, 120, 255, 0.28);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
`;

const IconAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  flex-shrink: 0;
  box-shadow: 0 6px 12px rgba(37,99,235,0.25);
`;

const CardMeta = styled.div`
  flex: 1;
  min-width: 0;
`;

const Name = styled.h3`
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Mobile = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
`;

const VehicleList = styled.div`
  background: rgba(255,255,255,0.5);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 14px;
  flex: 1;
  border: 1px solid rgba(0,0,0,0.03);
`;

const VehicleItem = styled.div`
  font-size: 0.85rem;
  color: #334155;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:last-child { margin-bottom: 0; }
  
  svg { color: #94a3b8; font-size: 0.8rem; }
`;

const CardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: auto;
`;

const ActionBtn = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &.view {
    background: #eff6ff;
    color: #2563eb;
  }
  &.view:hover { background: #dbeafe; }

  &.delete {
    background: #fef2f2;
    color: #ef4444;
  }
  &.delete:hover { background: #fee2e2; }
`;

/* Modal Styles */
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
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.2s ease-out;

  @keyframes slideIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  
  &.cancel { background: #f1f5f9; color: #475569; }
  &.delete { background: #dc2626; color: white; }
`;

// ===== Main Component =====

function CustomerDashboard() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  const navigate = useNavigate();

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/customers`);
      // --- CRITICAL FIX: Ensure it is an array to prevent "e.filter" crash ---
      if (Array.isArray(response.data)) {
        setCustomers(response.data);
      } else {
        console.error("API did not return an array:", response.data);
        setCustomers([]); 
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
      setCustomers([]); // Safe fallback
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/customers/${deleteId}`);
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (err) {
      toast.error('Failed to delete customer');
    } finally {
      setDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const filtered = Array.isArray(customers) ? customers.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile?.includes(search) ||
    c.vehicles?.some(
      (v) =>
        v.make?.toLowerCase().includes(search.toLowerCase()) ||
        v.model?.toLowerCase().includes(search.toLowerCase()) ||
        v.regNo?.toLowerCase().includes(search.toLowerCase())
    )
  ) : [];

  return (
    <Root>
      <Container>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
        
        <Header>
          <TitleBlock>
            <Title>Customer Dashboard</Title>
            <Subtitle>Manage your client base and vehicles</Subtitle>
          </TitleBlock>
          
          <Controls>
            <SearchWrapper>
              <SearchIcon />
              <SearchInput 
                placeholder="Search clients..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </SearchWrapper>
            <AddButton onClick={() => navigate('/add-customer')}>
              <FaPlus /> Add Customer
            </AddButton>
          </Controls>
        </Header>

        <Grid>
          {filtered.map((customer) => (
            <Card key={customer._id}>
              <CardHeader>
                <IconAvatar>
                  <FaUser />
                </IconAvatar>
                <CardMeta>
                  <Name>{customer.name}</Name>
                  <Mobile>{customer.mobile}</Mobile>
                </CardMeta>
              </CardHeader>

              <VehicleList>
                {customer.vehicles && customer.vehicles.length > 0 ? (
                  customer.vehicles.slice(0, 3).map((v, idx) => (
                    <VehicleItem key={idx}>
                      <FaCar /> {v.make} {v.model} <span style={{color: '#94a3b8', marginLeft: 'auto'}}>({v.regNo})</span>
                    </VehicleItem>
                  ))
                ) : (
                  <span style={{fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic'}}>No vehicles registered</span>
                )}
                {customer.vehicles?.length > 3 && (
                  <div style={{fontSize: '0.8rem', color: '#3b82f6', marginTop: '6px', textAlign: 'center', fontWeight: '600'}}>
                    +{customer.vehicles.length - 3} more vehicles
                  </div>
                )}
              </VehicleList>

              <CardActions>
                <ActionBtn 
                  className="view"
                  onClick={() => navigate(`/customer-history/${encodeURIComponent(customer.mobile)}`)}
                >
                  <FaEye /> View
                </ActionBtn>
                <ActionBtn 
                  className="delete"
                  onClick={() => handleDeleteClick(customer._id)}
                >
                  <FaTrash /> Delete
                </ActionBtn>
              </CardActions>
            </Card>
          ))}
        </Grid>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <h3>No customers found.</h3>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <ModalBackdrop onClick={() => setDeleteModalOpen(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ color: '#dc2626', fontSize: '1.5rem' }}><FaExclamationTriangle /></div>
                <h3 style={{ margin: 0, color: '#1e293b' }}>Delete Customer?</h3>
              </div>
              <p style={{ color: '#64748b', lineHeight: '1.5' }}>
                Are you sure you want to delete this customer? All their vehicle history and job cards will be affected.
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
}

export default CustomerDashboard;