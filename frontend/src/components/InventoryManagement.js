// frontend/src/components/InventoryManagement.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Responsive container
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: auto;
  background-color: #f9fafb;
`;

// Top input/search/export row
const TopBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (min-width: 600px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  input {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid #ccc;
    flex: 1;
  }

  .buttons {
    display: flex;
    gap: 0.5rem;

    button {
      background-color: #3b82f6;
      color: white;
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: bold;

      &:hover {
        background-color: #2563eb;
      }
    }
  }
`;

// Chart area
const ChartContainer = styled.div`
  margin: 2rem 0;
  padding: 1rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  height: 300px;
`;

// Card grid layout
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

// Card for each inventory item
const Card = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.015);
  }
`;

// Stock status badge
const StatusTag = styled.span`
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  color: white;
  background-color: ${({ status }) =>
    status === 'out' ? '#ef4444' : status === 'low' ? '#facc15' : '#22c55e'};
`;

// Edit/Delete buttons inside cards
const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;

  button {
    background-color: #f3f4f6;
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: 0.5rem;
    cursor: pointer;

    &:hover {
      background-color: #e5e7eb;
    }

    &.delete {
      color: #dc2626;
    }
  }
`;

// General modal overlay
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

// Modal box
const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;

  input, select {
    padding: 0.6rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;

    .save {
      background-color: #22c55e;
      color: white;
    }

    .cancel {
      background-color: #f87171;
      color: white;
    }

    button {
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
    }
  }
`;

// Pagination buttons
const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;

  button {
    padding: 0.5rem 1rem;
    border: none;
    margin: 0 0.3rem;
    border-radius: 0.5rem;
    background-color: #e5e7eb;
    cursor: pointer;

    &.active {
      background-color: #3b82f6;
      color: white;
    }
  }
`;

// Floating "+" button
const FloatingButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 999px;
  width: 60px;
  height: 60px;
  font-size: 2rem;
  cursor: pointer;
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);

  &:hover {
    background-color: #2563eb;
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
      const res = await axios.get(`/api/inventory?search=${search}&page=${page}`);
      setItems(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Failed to load inventory');
    }
  }, [search, page]);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await axios.get('/api/inventory/suppliers/list');
      setSuppliers(res.data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchItems();
    fetchSuppliers();
  }, [fetchItems, fetchSuppliers]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/inventory/${selectedItem._id}`);
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
    if (!name || !quantity || !unit || !price || !supplier || price <= 0 || /[^a-zA-Z]/.test(unit)) {
      toast.error('Invalid or missing fields');
      return;
    }
    try {
      if (selectedItem) {
        await axios.put(`/api/inventory/${selectedItem._id}`, form);
        toast.success('Item updated');
      } else {
        await axios.post('/api/inventory', form);
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

  return (
    <Container>
      <ToastContainer />

      <TopBar>
        <input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="buttons">
          <button onClick={() => exportToCSV(items)}>Export CSV</button>
        </div>
      </TopBar>

      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="quantity" fill="#3b82f6" name="Quantity" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <Grid>
        {items.map((item) => (
          <Card key={item._id}>
            <h3>{item.name}</h3>
            <p>Quantity: {item.quantity} {item.unit}</p>
            <p>Price: KES {item.price}</p>
            <p>Total: KES {item.quantity * item.price}</p>
            <p>Supplier: {item.supplier?.name || 'N/A'}</p>
            <p>Contact: {item.supplier?.contact || 'N/A'}</p>
            <StatusTag status={item.quantity === 0 ? 'out' : item.quantity < 5 ? 'low' : 'ok'}>
              {item.quantity === 0 ? 'Out of Stock' : item.quantity < 5 ? 'Low Stock' : 'In Stock'}
            </StatusTag>
            <Actions>
              <button onClick={() => { setSelectedItem(item); setForm(item); setShowModal(true); }}>Edit</button>
              <button className="delete" onClick={() => { setSelectedItem(item); setShowModal(true); }}>Delete</button>
            </Actions>
          </Card>
        ))}
      </Grid>

      <Pagination>
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i + 1} onClick={() => setPage(i + 1)} className={page === i + 1 ? 'active' : ''}>{i + 1}</button>
        ))}
      </Pagination>

      <FloatingButton onClick={() => { setForm({ name: '', quantity: '', unit: '', price: '', supplier: '' }); setSelectedItem(null); setShowModal(true); }}>+</FloatingButton>

      {showModal && (
        <Modal>
          <ModalContent>
            <input placeholder="Item Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input type="number" placeholder="Quantity (e.g. 10)" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <input type="number" placeholder="Price in KES (e.g. 1500)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input placeholder="Unit (e.g. pcs, pairs, litres)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            <select value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })}>
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <div className="modal-actions">
              <button className="cancel" onClick={() => { setShowModal(false); setSelectedItem(null); }}>Cancel</button>
              <button className="save" onClick={handleSave}>Save</button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default InventoryManagement;
