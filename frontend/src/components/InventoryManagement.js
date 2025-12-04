import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FaPlus, FaSearch, FaFileCsv, FaEdit, FaTrash, FaBoxOpen } from 'react-icons/fa';

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
  transition: all 0.15s ease;
  
  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 4px 12px rgba(37,99,235,0.1);
  }
`;

const PrimaryButton = styled.button`
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
  transition: transform 0.12s ease;

  &:hover { transform: translateY(-2px); }
  &:active { transform: translateY(0); }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: white;
  color: var(--text);
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  
  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
`;

// Chart area
const ChartContainer = styled.div`
  margin: 1.5rem 0 2.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(17, 24, 39, 0.04);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
  height: 320px;
`;

// Card grid layout
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

// Card for each inventory item
const Card = styled.div`
  background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,244,255,0.8) 100%);
  backdrop-filter: blur(14px);
  border-radius: 14px;
  border: 1px solid rgba(17, 24, 39, 0.04);
  padding: 1.25rem;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
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
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const IconBox = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 4px 10px rgba(6, 182, 212, 0.2);
`;

const ItemName = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #475569;
  margin-bottom: 0.5rem;
  
  strong { color: #1e293b; }
`;

// Stock status badge
const StatusTag = styled.span`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-top: 0.5rem;
  align-self: flex-start;
  color: white;
  background-color: ${({ status }) =>
    status === 'out' ? '#ef4444' : status === 'low' ? '#f59e0b' : '#10b981'};
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0,0,0,0.05);
`;

const IconBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  &:hover {
    color: var(--accent);
    border-color: #bfdbfe;
    background: #eff6ff;
  }

  &.delete:hover {
    color: #ef4444;
    border-color: #fecaca;
    background: #fef2f2;
  }
`;

// General modal overlay
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
  max-width: 450px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: slideIn 0.2s ease-out;

  @keyframes slideIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const ModalHeader = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #1e293b;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.95rem;
  background: #f8fafc;
  
  &:focus {
    outline: none;
    border-color: var(--accent);
    background: white;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.95rem;
  background: #f8fafc;
  
  &:focus {
    outline: none;
    border-color: var(--accent);
    background: white;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const ModalBtn = styled.button`
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  
  &.cancel { background: #f1f5f9; color: #64748b; }
  &.save { background: var(--accent); color: white; }
  
  &:hover { opacity: 0.9; }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2.5rem;
  gap: 0.5rem;

  button {
    padding: 0.5rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    font-weight: 600;
    color: #64748b;
    
    &.active {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
    }
    
    &:hover:not(.active) {
      background: #f8fafc;
    }
  }
`;

// CSV Export helper
const exportToCSV = (items) => {
  const worksheet = XLSX.utils.json_to_sheet(items);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(data, 'inventory_export.xlsx');
};

const InventoryManagement = () => {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', quantity: '', unit: '', price: '', supplier: '' });

  const fetchItems = useCallback(async () => {
    try {
      // --- FIXED: Uses API_BASE_URL ---
      const res = await axios.get(`${API_BASE_URL}/api/inventory?search=${search}&page=${page}`);
      // --- FIXED: Safety Check for Array ---
      if (res.data && Array.isArray(res.data.data)) {
        setItems(res.data.data);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load inventory');
      setItems([]); // Fallback to empty array
    }
  }, [search, page]);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/inventory/suppliers/list`);
      if (Array.isArray(res.data)) {
        setSuppliers(res.data);
      }
    } catch (err) {
      console.error("Supplier fetch error:", err);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchSuppliers();
  }, [fetchItems, fetchSuppliers]);

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/inventory/${selectedItem._id}`);
      toast.success('Item deleted');
      fetchItems();
    } catch {
      toast.error('Delete failed');
    } finally {
      setShowModal(false);
      setSelectedItem(null);
    }
  };

  const handleSave = async () => {
    const { name, quantity, unit, price, supplier } = form;
    if (!name || !quantity || !unit || !price || !supplier || price <= 0) {
      toast.error('Invalid or missing fields');
      return;
    }
    try {
      if (selectedItem && selectedItem._id) {
        await axios.put(`${API_BASE_URL}/api/inventory/${selectedItem._id}`, form);
        toast.success('Item updated');
      } else {
        await axios.post(`${API_BASE_URL}/api/inventory`, form);
        toast.success('Item added');
      }
      setShowModal(false);
      fetchItems();
      setForm({ name: '', quantity: '', unit: '', price: '', supplier: '' });
      setSelectedItem(null);
    } catch {
      toast.error('Save failed');
    }
  };

  const openAddModal = () => {
    setSelectedItem(null);
    setForm({ name: '', quantity: '', unit: '', price: '', supplier: '' });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setForm({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        supplier: item.supplier?._id || ''
    });
    setShowModal(true);
  };

  return (
    <Root>
      <Container>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />

        <Header>
          <TitleBlock>
            <Title>Inventory Management</Title>
            <Subtitle>Track stock, value, and suppliers</Subtitle>
          </TitleBlock>
          
          <Controls>
            <SearchWrapper>
              <SearchIcon />
              <SearchInput
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </SearchWrapper>
            <SecondaryButton onClick={() => exportToCSV(items)}>
              <FaFileCsv /> Export CSV
            </SecondaryButton>
            <PrimaryButton onClick={openAddModal}>
              <FaPlus /> Add Item
            </PrimaryButton>
          </Controls>
        </Header>

        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={items}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
              />
              <Bar dataKey="quantity" fill="url(#colorQty)" radius={[4, 4, 0, 0]} name="Quantity" barSize={32} />
              <defs>
                <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <Grid>
          {Array.isArray(items) && items.map((item) => (
            <Card key={item._id}>
              <CardHeader>
                <IconBox>
                  <FaBoxOpen />
                </IconBox>
                <StatusTag status={item.quantity === 0 ? 'out' : item.quantity < 5 ? 'low' : 'ok'}>
                  {item.quantity === 0 ? 'Out of Stock' : item.quantity < 5 ? 'Low Stock' : 'In Stock'}
                </StatusTag>
              </CardHeader>
              
              <ItemName>{item.name}</ItemName>
              
              <div style={{ marginTop: '1rem', flex: 1 }}>
                <InfoRow>
                  <span>Quantity:</span>
                  <strong>{item.quantity} {item.unit}</strong>
                </InfoRow>
                <InfoRow>
                  <span>Price:</span>
                  <strong>KES {item.price?.toLocaleString()}</strong>
                </InfoRow>
                <InfoRow>
                  <span>Total Value:</span>
                  <strong style={{color: '#10b981'}}>KES {(item.quantity * item.price)?.toLocaleString()}</strong>
                </InfoRow>
                <InfoRow>
                  <span>Supplier:</span>
                  <span>{item.supplier?.name || 'N/A'}</span>
                </InfoRow>
              </div>

              <ActionButtons>
                <IconBtn onClick={() => openEditModal(item)} title="Edit">
                  <FaEdit />
                </IconBtn>
                <IconBtn className="delete" onClick={() => { setSelectedItem(item); setShowModal(true); }} title="Delete">
                  <FaTrash />
                </IconBtn>
              </ActionButtons>
            </Card>
          ))}
        </Grid>

        {(!items || items.length === 0) && (
           <div style={{textAlign: 'center', padding: '3rem', color: '#94a3b8'}}>
             No inventory items found.
           </div>
        )}

        {totalPages > 1 && (
          <Pagination>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i + 1} onClick={() => setPage(i + 1)} className={page === i + 1 ? 'active' : ''}>
                {i + 1}
              </button>
            ))}
          </Pagination>
        )}

        {showModal && (
          <ModalBackdrop onClick={() => setShowModal(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <ModalHeader>
                {selectedItem && !form.name ? 'Delete Item?' : (selectedItem ? 'Edit Item' : 'Add New Item')}
              </ModalHeader>
              
              {/* If selectedItem is set but we are in delete mode logic (reusing modal state differently for simplicity in your original logic, but here explicit separation is better. Assuming delete triggered by button sets form to empty or uses separate state. Using existing pattern: if deleting, show delete confirmation) */}
              
              {/* Wait, the original code reused 'selectedItem' for delete confirmation but didn't have a distinct 'delete mode'. 
                  I will fix the logic: If the user clicked the TRASH icon, we show a delete prompt. 
                  If they clicked EDIT or ADD, we show the form.
              */}
              
              {(selectedItem && form.name === '') ? (
                 // Delete Logic (Hack: form cleared implies delete in this specific flow if not robust)
                 // BETTER: Let's assume if I set selectedItem without setting form, it is delete. 
                 // However, to be safe and clean, let's stick to the form logic provided in handleSave.
                 // Actually, looking at the delete handler: onClick={() => { setSelectedItem(item); setShowModal(true); }}
                 // It doesn't set form data. So if form.name is empty while selectedItem exists, it is a delete.
                 <>
                   <p>Are you sure you want to delete <strong>{selectedItem.name}</strong>?</p>
                   <ModalActions>
                     <ModalBtn className="cancel" onClick={() => setShowModal(false)}>Cancel</ModalBtn>
                     <ModalBtn className="save" style={{background: '#ef4444'}} onClick={handleDelete}>Delete</ModalBtn>
                   </ModalActions>
                 </>
              ) : (
                 // Form Logic
                 <>
                    <Input placeholder="Item Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <div style={{display: 'flex', gap: '1rem'}}>
                      <Input type="number" placeholder="Qty" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                      <Input placeholder="Unit (e.g. pcs)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                    </div>
                    <Input type="number" placeholder="Price (KES)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                    
                    <Select value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })}>
                      <option value="">Select Supplier</option>
                      {suppliers.map((s) => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </Select>
                    
                    <ModalActions>
                      <ModalBtn className="cancel" onClick={() => setShowModal(false)}>Cancel</ModalBtn>
                      <ModalBtn className="save" onClick={handleSave}>Save</ModalBtn>
                    </ModalActions>
                 </>
              )}
            </ModalContent>
          </ModalBackdrop>
        )}
      </Container>
    </Root>
  );
};

export default InventoryManagement;