import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import {
  FaTools, FaEdit, FaTrash, FaPlus
} from 'react-icons/fa';
import {
  GiCarWheel, GiCarDoor, GiAutoRepair,
  GiSuspensionBridge, GiCarBattery, GiPaintBrush
} from 'react-icons/gi';

// ===== Icon + Gradient Color Mapping =====
const iconMap = {
  'Engine Diagnostics': <FaTools />,
  'Wheel Alignment': <GiCarWheel />,
  'Brake Services': <GiSuspensionBridge />,
  'Battery Services': <GiCarBattery />,
  'Paint and Body': <GiPaintBrush />,
  'Interior Detailing': <GiCarDoor />,
  'General Repairs': <GiAutoRepair />
};

const gradientMap = {
  'Engine Diagnostics': 'linear-gradient(135deg, #3b82f6, #60a5fa)',
  'Wheel Alignment': 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
  'Brake Services': 'linear-gradient(135deg, #f97316, #fb923c)',
  'Battery Services': 'linear-gradient(135deg, #10b981, #34d399)',
  'Paint and Body': 'linear-gradient(135deg, #ec4899, #f472b6)',
  'Interior Detailing': 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
  'General Repairs': 'linear-gradient(135deg, #6366f1, #818cf8)'
};

// ===== Styled Components =====
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: auto;

  @media (max-width: 768px) {
    padding: 1.2rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #1a202c;
`;

const AddButton = styled.button`
  background-color: #38a169;
  color: white;
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;

  &:hover {
    background-color: #2f855a;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: linear-gradient(145deg, #ffffff, #f1f5f9);
  padding: 1.6rem 1.2rem;
  border-radius: 1.2rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
  position: relative;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const IconCircle = styled.div`
  background: ${({ gradient }) => gradient || '#3b82f6'};
  padding: 1rem;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: white;
  margin-bottom: 1rem;
`;

const ServiceTitle = styled.h3`
  font-size: 1.25rem;
  color: #1e293b;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  font-size: 0.95rem;
  color: #4a5568;
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  display: flex;
  gap: 0.5rem;
`;

const IconBtn = styled.button`
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  font-size: 1.1rem;

  &:hover {
    color: #2b6cb0;
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 400px;
`;

const Input = styled.input`
  margin: 0.6rem 0;
  padding: 0.7rem;
  width: 100%;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 1rem;
`;

const Button = styled.button`
  margin-top: 1rem;
  padding: 0.6rem 1.2rem;
  background-color: #2b6cb0;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;

  &:hover {
    background-color: #2c5282;
  }
`;

const Services = () => {
  const [services, setServices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [editId, setEditId] = useState(null);

  const fetchServices = () => {
    axios.get('/api/services')
      .then(res => setServices(res.data))
      .catch(() => alert('Failed to fetch services'));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const request = editId
      ? axios.put(`/api/services/${editId}`, formData)
      : axios.post('/api/services', formData);

    request.then(() => {
      fetchServices();
      setModalOpen(false);
      setEditId(null);
      setFormData({ title: '', description: '' });
    }).catch(() => alert('Failed to save service'));
  };

  const handleEdit = (service) => {
    setEditId(service._id);
    setFormData(service);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      axios.delete(`/api/services/${id}`)
        .then(() => fetchServices())
        .catch(() => alert('Failed to delete'));
    }
  };

  return (
    <Container>
      {/* === Top Section === */}
      <Header>
        <Title>Our Services</Title>
        <AddButton onClick={() => setModalOpen(true)}>
          <FaPlus /> Add Service
        </AddButton>
      </Header>

      {/* === Services Grid === */}
      <Grid>
        {services.map(service => (
          <Card key={service._id}>
            <ActionButtons>
              <IconBtn title="Edit" onClick={() => handleEdit(service)}><FaEdit /></IconBtn>
              <IconBtn title="Delete" onClick={() => handleDelete(service._id)}><FaTrash /></IconBtn>
            </ActionButtons>

            <IconCircle gradient={gradientMap[service.title]}>
              {iconMap[service.title] || <FaTools />}
            </IconCircle>

            <ServiceTitle>{service.title}</ServiceTitle>
            <Description>{service.description}</Description>
          </Card>
        ))}
      </Grid>

      {/* === Modal === */}
      {modalOpen && (
        <ModalBackdrop onClick={() => setModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem' }}>{editId ? 'Edit Service' : 'Add New Service'}</h3>
            <form onSubmit={handleFormSubmit}>
              <Input
                name="title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Title"
                required
              />
              <Input
                name="description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description"
                required
              />
              <Button type="submit">{editId ? 'Update' : 'Add'}</Button>
            </form>
          </ModalContent>
        </ModalBackdrop>
      )}
    </Container>
  );
};

export default Services;
