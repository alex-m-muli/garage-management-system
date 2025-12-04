import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaEdit, FaTrash, FaPlus, FaFileCsv, FaClock, FaSearch, FaExclamationTriangle 
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
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text);
`;

const Subtitle = styled.p`
  margin: 8px 0 0;
  color: var(--muted);
`;

/* Stats Grid */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6));
  backdrop-filter: blur(10px);
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.5);
  box-shadow: var(--soft-shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  &.export {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white;
    cursor: pointer;
    justify-content: center;
    font-weight: 600;
  }
`;

const IconBox = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.1);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

/* Glass Card for Form & Table */
const GlassCard = styled.div`
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--deep-shadow);
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(0,0,0,0.05);
`;

/* Form Styling */
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 0.5rem;
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

const PrimaryButton = styled.button`
  background: linear-gradient(180deg, #3380ff 0%, #1f66e6 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  height: 44px;
  margin-top: auto; /* Align with inputs */
  width: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  }
`;

/* Search Bar */
const SearchWrapper = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
  }

  input {
    padding-left: 2.5rem;
  }
`;

/* Table Styling */
const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    background: #f1f5f9;
    padding: 1rem;
    text-align: left;
    font-size: 0.85rem;
    font-weight: 700;
    color: #475569;
    white-space: nowrap;
  }

  td {
    padding: 1rem;
    border-top: 1px solid #e2e8f0;
    color: #334155;
    font-size: 0.9rem;
  }

  tr:hover td {
    background: #f8fafc;
  }
`;

const ActionBtn = styled.button`
  background: none;
  border: 1px solid transparent;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  color: #64748b;
  transition: all 0.2s;
  margin-right: 4px;

  &:hover {
    background: #f1f5f9;
    color: var(--accent);
  }

  &.delete:hover {
    background: #fef2f2;
    color: #dc2626;
  }
`;

/* Pagination */
const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
  gap: 1rem;

  button {
    padding: 0.5rem 1rem;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    color: #64748b;

    &:hover:not(:disabled) {
      border-color: var(--accent);
      color: var(--accent);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

/* === Modal Styles (From Services.js) === */
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
  max-width: 380px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.2s ease-out;

  @keyframes slideIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  
  h3 {
    margin: 0;
    color: #1e293b;
    font-size: 1.25rem;
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
  
  &.cancel {
    background: #f1f5f9;
    color: #475569;
    &:hover { background: #e2e8f0; }
  }

  &.delete {
    background: #dc2626;
    color: white;
    &:hover { opacity: 0.9; }
  }
`;

// ==========================================
// ===== Component Logic ====================
// ==========================================

export default function LaborTracking() {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    technician: '', vehicleMake: '', vehicleModel: '', vehicleReg: '',
    workType: '', workDetails: '', hours: ''
  });
  const [filter, setFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/labor`);
      setEntries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Could not load labor entries.');
    }
  };
  
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editData) {
        const res = await axios.put(`${API_BASE_URL}/api/labor/${editData._id}`, formData);
        setEntries(entries.map(en => en._id === editData._id ? res.data : en));
        setEditData(null);
        toast.success('Entry updated successfully!');
      } else {
        const res = await axios.post(`${API_BASE_URL}/api/labor`, formData);
        setEntries(prev => [...prev, res.data]);
        toast.success('New entry added successfully!');
      }
      setFormData({ technician: '', vehicleMake: '', vehicleModel: '', vehicleReg: '', workType: '', workDetails: '', hours: '' });
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Failed to save entry.");
    }
  };

  const confirmDelete = id => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };
  
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/labor/${deleteId}`);
      setEntries(entries.filter(e => e._id !== deleteId));
      setShowDeleteModal(false);
      toast.success('Entry deleted successfully.');
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete entry.");
    }
  };

  const exportCSV = () => {
    if (!entries.length) {
        toast.warn("No data to export.");
        return;
    }
    
    const headers = ['Technician', 'Vehicle', 'Reg No', 'Work Type', 'Hours', 'Date'];
    const csvContent = [
      headers.join(','),
      ...entries.map(e => {
        const vehicle = `${e.vehicleMake} ${e.vehicleModel}`.replace(/,/g, '');
        return [
          e.technician,
          vehicle,
          e.vehicleReg,
          e.workType.replace(/,/g, ''),
          e.hours,
          new Date(e.date).toLocaleDateString()
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `labor_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export downloaded!');
  };

  // Compute stats safely
  const today = new Date().toDateString();
  const safeEntries = Array.isArray(entries) ? entries : [];
  
  const stats = safeEntries.reduce((acc, e) => {
    if (!acc[e.technician]) acc[e.technician] = { total: 0, today: 0 };
    acc[e.technician].total += Number(e.hours || 0);
    if (new Date(e.date).toDateString() === today) acc[e.technician].today += Number(e.hours || 0);
    return acc;
  }, {});

  const filtered = safeEntries.filter(e =>
    Object.values(e).some(v => typeof v === 'string' && v.toLowerCase().includes(filter.toLowerCase()))
  );
  
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage) || 1;

  // Edit handler helper
  const handleEditClick = (e) => {
    setFormData(e);
    setEditData(e);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  return (
    <Root>
      <Container>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />

        <Header>
          <Title>Labor Tracking</Title>
          <Subtitle>Monitor technician hours and work logs</Subtitle>
        </Header>

        {/* Stats Grid */}
        <StatsGrid>
          {Object.entries(stats).map(([tech, s]) => (
            <StatCard key={tech}>
              <IconBox><FaClock /></IconBox>
              <div>
                <div style={{fontWeight: 700, color: '#1e293b'}}>{tech}</div>
                <div style={{fontSize: '0.85rem', color: '#64748b'}}>
                  Today: {s.today}h <span style={{margin: '0 4px'}}>•</span> Total: {s.total}h
                </div>
              </div>
            </StatCard>
          ))}
          {safeEntries.length > 0 && (
            <StatCard className="export" onClick={exportCSV}>
              <FaFileCsv size={24} />
              <span>Export CSV Report</span>
            </StatCard>
          )}
        </StatsGrid>

        {/* Form Section */}
        <GlassCard>
            <h3 style={{margin: '0 0 1.5rem', color: '#334155', fontSize: '1.1rem'}}>
               {editData ? <><FaEdit /> Edit Entry</> : <><FaPlus /> New Work Log</>}
            </h3>
            <form onSubmit={handleSubmit}>
              <FormGrid>
                <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                  <FormGroup>
                    <Label>Technician</Label>
                    <StyledInput name="technician" placeholder="e.g. John Doe" value={formData.technician} onChange={handleChange} required />
                  </FormGroup>
                  <FormGroup>
                    <Label>Vehicle Make</Label>
                    <StyledInput name="vehicleMake" placeholder="e.g. Toyota" value={formData.vehicleMake} onChange={handleChange} required />
                  </FormGroup>
                  <FormGroup>
                    <Label>Vehicle Model</Label>
                    <StyledInput name="vehicleModel" placeholder="e.g. Corolla" value={formData.vehicleModel} onChange={handleChange} required />
                  </FormGroup>
                </div>

                <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                  <FormGroup>
                    <Label>Reg Number</Label>
                    <StyledInput name="vehicleReg" placeholder="e.g. KDA 123X" value={formData.vehicleReg} onChange={handleChange} required />
                  </FormGroup>
                  <FormGroup>
                    <Label>Work Type</Label>
                    <StyledInput name="workType" placeholder="e.g. Service, Repair" value={formData.workType} onChange={handleChange} required />
                  </FormGroup>
                  <div style={{display: 'flex', gap: '1rem'}}>
                    <FormGroup style={{flex: 1}}>
                        <Label>Hours</Label>
                        <StyledInput name="hours" type="number" step="0.1" min="0" placeholder="0.0" value={formData.hours} onChange={handleChange} required />
                    </FormGroup>
                  </div>
                </div>

                <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                    <FormGroup style={{flex:1}}>
                        <Label>Details (Optional)</Label>
                        <StyledInput as="textarea" rows="4" name="workDetails" placeholder="Task description..." value={formData.workDetails} onChange={handleChange} style={{height: 'auto'}} />
                    </FormGroup>
                    <PrimaryButton type="submit">
                        {editData ? 'Update Record' : 'Log Hours'}
                    </PrimaryButton>
                </div>
              </FormGrid>
            </form>
        </GlassCard>

        {/* Filter & Table */}
        <GlassCard>
            <SearchWrapper>
                <FaSearch />
                <StyledInput 
                    type="text" 
                    placeholder="Search logs by technician, vehicle or reg..." 
                    value={filter} 
                    onChange={e => setFilter(e.target.value)} 
                />
            </SearchWrapper>

            <TableWrapper>
                <StyledTable>
                    <thead>
                    <tr>
                        <th>Technician</th>
                        <th>Vehicle</th>
                        <th>Work</th>
                        <th>Details</th>
                        <th>Hrs</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginated.length > 0 ? (
                        paginated.map(e => (
                        <tr key={e._id}>
                            <td>{e.technician}</td>
                            <td>{e.vehicleMake} {e.vehicleModel}<br/><small style={{color:'#94a3b8'}}>{e.vehicleReg}</small></td>
                            <td>{e.workType}</td>
                            <td style={{maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{e.workDetails}</td>
                            <td><span style={{fontWeight:'bold', color: '#2563eb'}}>{e.hours}</span></td>
                            <td>{new Date(e.date).toLocaleDateString()}</td>
                            <td>
                                <ActionBtn onClick={() => handleEditClick(e)} title="Edit">
                                    <FaEdit />
                                </ActionBtn>
                                <ActionBtn className="delete" onClick={() => confirmDelete(e._id)} title="Delete">
                                    <FaTrash />
                                </ActionBtn>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" style={{textAlign: 'center', padding: '2rem', color: '#94a3b8'}}>
                                No logs found matching your search.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </StyledTable>
            </TableWrapper>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination>
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                    <span style={{color: '#64748b', fontSize: '0.9rem'}}>Page {page} of {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                </Pagination>
            )}
        </GlassCard>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
            <ModalBackdrop onClick={() => setShowDeleteModal(false)}>
                <ModalContent onClick={e => e.stopPropagation()}>
                    <ModalHeader>
                        <div style={{ color: '#dc2626', fontSize: '1.5rem', display: 'flex' }}><FaExclamationTriangle /></div>
                        <h3>Delete Log?</h3>
                    </ModalHeader>
                    <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                        Are you sure you want to delete this work log? This action cannot be undone.
                    </p>
                    <ButtonGroup>
                        <ModalButton className="cancel" onClick={() => setShowDeleteModal(false)}>Cancel</ModalButton>
                        <ModalButton className="delete" onClick={handleDelete}>Delete</ModalButton>
                    </ButtonGroup>
                </ModalContent>
            </ModalBackdrop>
        )}
      </Container>
    </Root>
  );
}