// frontend/src/components/LaborTracking.js
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaEdit, FaTrash, FaFileCsv, FaClock } from 'react-icons/fa';
import axios from 'axios';
import { saveAs } from 'file-saver';

// === Animations ===
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

// === Styled Components ===
const Container = styled.div`
  padding: 2rem;
  max-width: 1100px;
  margin: 2rem auto;
  background: #f7fafc;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  animation: ${fadeIn} 0.4s ease-out;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  color: #2d3748;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 2rem;
`;

const Summary = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  flex: 1;
  min-width: 200px;
  padding: 1.25rem;
  background: #ffffff;
  border-radius: 12px;
  border-left: 5px solid #7f5af0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  position: relative;
  font-weight: 500;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #7f5af0;
    font-size: 1.5rem;
  }
`;

const ExportCard = styled(Card)`
  cursor: pointer;
  &:hover {
    background: #7f5af0;
    color: white;
    svg { color: white; }
  }
`;

const FilterInput = styled.input`
  padding: 0.7rem 1rem;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  margin-bottom: 1.5rem;
`;

const FormSection = styled.div`
  background: #ffffff;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #4a5568;
  margin-top: 1rem;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
`;
const Column = styled.div`
  flex: 1;
  min-width: 220px;
`;

const Input = styled.input`
  padding: 0.6rem;
  margin-top: 0.4rem;
  width: 100%;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
`;

const Button = styled.button`
  margin-top: 1.5rem;
  padding: 0.8rem 1.8rem;
  background-color: #7f5af0;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background-color: #6241c7;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;

  th, td {
    padding: 0.75rem;
  }
  th {
    background-color: #edf2f7;
    font-weight: 600;
  }
  td {
    border-bottom: 1px solid #e2e8f0;
  }

  tr:hover {
    background: #f1f5f9;
  }

  svg {
    cursor: pointer;
    color: #7f5af0;
    margin-right: 0.5rem;
    transition: color 0.2s;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
  gap: 1rem;

  button {
    padding: 0.6rem 1.2rem;
    background: #7f5af0;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    &:disabled {
      background: #cbd5e0;
      cursor: not-allowed;
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ModalBox = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 90%;
  width: 360px;
  text-align: center;

  p {
    margin-bottom: 1.5rem;
  }

  button {
    margin: 0 0.5rem;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .confirm {
    background: #e53e3e;
    color: white;
  }
  
  .cancel {
    background: #a0aec0;
    color: white;
  }
`;

export default function LaborTracking() {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    technician: '', vehicleMake: '', vehicleModel: '', vehicleReg: '',
    workType: '', workDetails: '', hours: ''
  });
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await axios.get('/api/labor');
      setEntries(res.data);
      setError('');
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Could not load labor entries. Please check your connection or try again later.');
    }
  };
  
  // Handle form input changes
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add/edit entry logic
  const handleSubmit = async e => {
    e.preventDefault();
    if (editData) {
      const res = await axios.put(`/api/labor/${editData._id}`, formData);
      setEntries(entries.map(en => en._id === editData._id ? res.data : en));
      setEditData(null);
    } else {
      const res = await axios.post('/api/labor', formData);
      setEntries(prev => [...prev, res.data]);
    }
    setFormData({ technician: '', vehicleMake: '', vehicleModel: '', vehicleReg: '', workType: '', workDetails: '', hours: '' });
  };

  // Delete confirmation logic
  const confirmDelete = id => { setDeleteId(id); setShowModal(true); };
  const handleDelete = async () => {
    await axios.delete(`/api/labor/${deleteId}`);
    setEntries(entries.filter(e => e._id !== deleteId));
    setShowModal(false);
  };

  // Export CSV logic
  const exportCSV = () => {
    const csv = [
      ['Technician', 'Vehicle', 'Total Hours'],
      ...entries.map(e => [e.technician, `${e.vehicleMake} ${e.vehicleModel} (${e.vehicleReg})`, e.hours])
    ].map(r => r.join(',')).join('\n');
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'labor_report.csv');
  };

  // Compute stats
  const today = new Date().toDateString();
  const stats = entries.reduce((acc, e) => {
    if (!acc[e.technician]) acc[e.technician] = { total: 0, today: 0 };
    acc[e.technician].total += Number(e.hours);
    if (new Date(e.date).toDateString() === today) acc[e.technician].today += Number(e.hours);
    return acc;
  }, {});
  const filtered = entries.filter(e =>
    Object.values(e).some(v => typeof v === 'string' && v.toLowerCase().includes(filter.toLowerCase()))
  );
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <Container>
      <Title>Labor Tracking</Title>

      {/* Summary cards */}
      <Summary>
        {Object.entries(stats).map(([tech, s]) => (
          <Card key={tech}>
            <FaClock /> <span><strong>{tech}</strong>: Today {s.today}h, Total {s.total}h</span>
          </Card>
        ))}
        <ExportCard onClick={exportCSV}>
          <FaFileCsv /> <span>Export CSV</span>
        </ExportCard>
      </Summary>

      {/* Filter Input */}
      <FilterInput
        type="text"
        placeholder="Filter by technician, vehicle, etc."
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />

      {/* Entry Form */}
      {/* Entry Form */}
<FormSection>
  <form onSubmit={handleSubmit}>
    <Row>
      <Column>
        <Label>Technician</Label>
        <Input
          name="technician"
          placeholder="e.g. John Doe"
          value={formData.technician}
          onChange={handleChange}
          required
        />

        <Label>Vehicle Make</Label>
        <Input
          name="vehicleMake"
          placeholder="e.g. Toyota"
          value={formData.vehicleMake}
          onChange={handleChange}
          required
        />

        <Label>Vehicle Model</Label>
        <Input
          name="vehicleModel"
          placeholder="e.g. Corolla"
          value={formData.vehicleModel}
          onChange={handleChange}
          required
        />

        <Label>Registration Number</Label>
        <Input
          name="vehicleReg"
          placeholder="e.g. KDA 123X"
          value={formData.vehicleReg}
          onChange={handleChange}
          required
        />
      </Column>

      <Column>
        <Label>Work Type</Label>
        <Input
          name="workType"
          placeholder="e.g. Engine Repair, Tyre Change"
          value={formData.workType}
          onChange={handleChange}
          required
        />

        <Label>Details</Label>
        <Input
          name="workDetails"
          placeholder="Optional details about the task"
          value={formData.workDetails}
          onChange={handleChange}
        />

        <Label>Hours Worked</Label>
        <Input
          name="hours"
          type="number"
          step="0.1"
          min="0"
          placeholder="e.g. 3.5"
          value={formData.hours}
          onChange={handleChange}
          required
        />

        <Button type="submit">{editData ? 'Update Entry' : 'Add Entry'}</Button>
      </Column>
    </Row>
  </form>
</FormSection>


      {/* Data Table */}
      <Table>
        <thead>
          <tr>
            <th>Technician</th><th>Make</th><th>Model</th><th>Reg No.</th><th>Work Type</th>
            <th>Details</th><th>Hours</th><th>Date</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map(e => (
            <tr key={e._id}>
              <td>{e.technician}</td><td>{e.vehicleMake}</td><td>{e.vehicleModel}</td>
              <td>{e.vehicleReg}</td><td>{e.workType}</td><td>{e.workDetails}</td>
              <td>{e.hours}</td><td>{new Date(e.date).toLocaleDateString()}</td>
              <td>
                <FaEdit onClick={() => { setFormData(e); setEditData(e); }} />
                <FaTrash onClick={() => confirmDelete(e._id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination>
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next ›</button>
      </Pagination>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <Modal>
          <ModalBox>
            <p>Delete this entry?</p>
            <button className="confirm" onClick={handleDelete}>Yes</button>
            <button className="cancel" onClick={() => setShowModal(false)}>Cancel</button>
          </ModalBox>
        </Modal>
      )}
    </Container>
  );
}
