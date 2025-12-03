import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import {
  FaTools, FaEdit, FaTrash, FaPlus, FaExclamationTriangle
} from 'react-icons/fa';
import {
  GiCarWheel, GiCarDoor, GiAutoRepair,
  GiSuspensionBridge, GiCarBattery, GiPaintBrush
} from 'react-icons/gi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- CRITICAL: Fallback URL ---
const API_BASE_URL = process.env.REACT_APP_API_URL;

// ===== Icon & Color Configurations =====
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
  'Engine Diagnostics': 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  'Wheel Alignment': 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
  'Brake Services': 'linear-gradient(135deg, #ff7a18 0%, #ff3d00 100%)',
  'Battery Services': 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
  'Paint and Body': 'linear-gradient(135deg, #ff5fa2 0%, #be185d 100%)',
  'Interior Detailing': 'linear-gradient(135deg, #06b6d4 0%, #0369a1 100%)',
  'General Repairs': 'linear-gradient(135deg, #6d28d9 0%, #4338ca 100%)'
};

const defaultGradient = 'linear-gradient(135deg, #64748b 0%, #475569 100%)';

// ===== Styled Components & Theme Tokens =====
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
  --radius-sm: 8px;
  width: 100%;
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
  background: linear-gradient(180deg, #f8fafc 0%, var(--bg) 100%);
  min-height: 100%;
  font-family: Inter, 'Segoe UI', Roboto, system-ui, -apple-system, sans-serif;
`;

/* Container keeps your original name for compatibility */
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

/* Header */
const Header = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

/* Primary Add Button (bolder, softer shadow) */
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
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  will-change: transform;

  &:hover { transform: translateY(-3px); }
  &:active { transform: translateY(-1px) scale(0.995); }
`;

/* Grid */
const Grid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  margin-top: 8px;
`;

/* Card - premium + bold mix: glass plate with accent rim */
const Card = styled.article`
  /* 🔥 Updated gradient */
  background: linear-gradient(
    135deg,
    rgba(15, 205, 230, 0.67) 0%,
    rgba(90, 120, 255, 0.15) 100%
  );

  /* keep your glass look */
  backdrop-filter: blur(14px);

  border-radius: var(--radius-md);
  border: 1px solid rgba(17, 24, 39, 0.04);
  padding: 18px;

  /* slight deeper, premium shadow */
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);

  transition: transform 0.18s cubic-bezier(.2, .9, .3, 1),
              box-shadow 0.18s,
              border-color 0.18s;

  display: flex;
  flex-direction: column;
  min-height: 130px;
  overflow: hidden;
  position: relative;

  &:hover {
    transform: translateY(-8px) rotateX(0.01deg);

    /* bold + premium hover elevation */
    box-shadow: 0 30px 60px rgba(10, 18, 30, 0.22);

    /* neon rim on hover */
    border-color: rgba(90, 120, 255, 0.28);
  }
`;

/* top row contains icon + actions but changed layout to left aligned group */
const CardHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

/* Animated icon badge (3D plate) */
const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${({ gradient }) => gradient};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.98);
  font-size: 1.25rem;
  box-shadow: 0 8px 18px rgba(12, 18, 35, 0.18), inset 0 -6px 20px rgba(255,255,255,0.06);
  transform: translateZ(0);
  flex-shrink: 0;
`;

/* left group containing icon + title (compact for mobile) */
const LeftGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
`;

/* Actions trimmed & subtle */
const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: auto;
`;

/* Circular action buttons with glass rim for boldness */
const ActionBtn = styled.button`
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.04);
  background: rgba(255,255,255,0.6);
  color: var(--muted);
  transition: all 0.14s ease;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(8,12,20,0.04);

  &:hover {
    color: var(--accent);
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(14,28,60,0.12);
  }

  &.delete {
    color: #9b1c1c;
    background: linear-gradient(180deg, rgba(255,235,235,0.95), rgba(255,245,245,0.85));
    border-color: rgba(220,38,38,0.08);
  }
`;

/* content area */
const ServiceContent = styled.div`
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

/* Title inside card */
const ServiceTitle = styled.h3`
  font-size: 1.02rem;
  margin: 0;
  color: var(--text);
  font-weight: 700;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

/* sub description with better tone */
const Description = styled.p`
  margin: 0;
  color:rgb(7, 8, 8);
  line-height: 1.45;
  font-size: 0.92rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/* small footer: meta or CTA placeholder (kept minimal) */
const CardFooter = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`;

/* small pill label */
const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.82rem;
  color: white;
  background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
  backdrop-filter: blur(4px);
`;

/* Empty state */
const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: #7b8694;
`;

/* Keep your modal styles exactly as-is: dialogs/dialogue styling preserved */
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
  max-width: 420px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideIn 0.2s ease-out;

  @keyframes slideIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const ModalHeader = styled.h3`
  font-size: 1.25rem;
  color: #1e293b;
  margin-bottom: 1.5rem;
  font-weight: 700;
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

const Input = styled.input`
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #e6eef8;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.12s, box-shadow 0.12s;
  background: #fbfdff;

  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 6px 20px rgba(37,99,235,0.12);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #e6eef8;
  border-radius: 8px;
  font-size: 0.95rem;
  min-height: 100px;
  resize: vertical;
  background: #fbfdff;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 6px 20px rgba(37,99,235,0.12);
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
  transition: opacity 0.12s;

  &:hover { opacity: 0.9; }

  &.cancel {
    background: #f1f5f9;
    color: #475569;
  }

  &.confirm {
    background: var(--accent);
    color: white;
  }

  &.delete {
    background: #dc2626;
    color: white;
  }
`;

/* Responsive tweaks */
const ResponsiveWrapper = styled.div`
  @media (max-width: 600px) {
    ${Title} { font-size: 1.25rem; }
    ${AddButton} { padding: 0.45rem 0.85rem; gap: 0.4rem; }
    ${IconWrapper} { width: 48px; height: 48px; border-radius: 10px; font-size: 1.1rem; }
    ${Card} { padding: 14px; border-radius: 12px; }
  }
`;

// =========================
// Main Component (logic unchanged)
// =========================

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({ title: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchServices = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/services`)
      .then(res => {
        setServices(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching services:", err);
        setServices([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const url = editId
      ? `${API_BASE_URL}/api/services/${editId}`
      : `${API_BASE_URL}/api/services`;

    const request = editId
      ? axios.put(url, formData)
      : axios.post(url, formData);

    request.then(() => {
      fetchServices();
      closeFormModal();
      toast.success(editId ? 'Service updated' : 'Service added');
    }).catch((err) => {
      console.error(err);
      toast.error('Failed to save service.');
    });
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    axios.delete(`${API_BASE_URL}/api/services/${deleteId}`)
      .then(() => {
        fetchServices();
        setDeleteModalOpen(false);
        setDeleteId(null);
        toast.success('Service deleted');
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to delete.');
      });
  };

  const openEditModal = (service) => {
    setEditId(service._id);
    setFormData({ title: service.title, description: service.description });
    setFormModalOpen(true);
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const closeFormModal = () => {
    setFormModalOpen(false);
    setEditId(null);
    setFormData({ title: '', description: '' });
  };

  return (
    <Root>
      <Container>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />

        <ResponsiveWrapper>
          <Header>
            <TitleBlock>
              <Title>Garage Services</Title>
              <Subtitle>Manage offered services</Subtitle>
            </TitleBlock>

            <AddButton onClick={() => setFormModalOpen(true)}>
              <FaPlus /> Add Service
            </AddButton>
          </Header>

          <Grid>
            {!loading && Array.isArray(services) && services.map(service => (
              <Card key={service._id}>
                <CardHeaderRow>
                  <LeftGroup>
                    <IconWrapper gradient={gradientMap[service.title] || defaultGradient}>
                      {iconMap[service.title] || <FaTools />}
                    </IconWrapper>

                    <div style={{ minWidth: 0 }}>
                      <ServiceTitle>{service.title}</ServiceTitle>
                    </div>
                  </LeftGroup>

                  <ActionButtons>
                    <ActionBtn onClick={() => openEditModal(service)} title="Edit">
                      <FaEdit />
                    </ActionBtn>
                    <ActionBtn className="delete" onClick={() => openDeleteModal(service._id)} title="Delete">
                      <FaTrash />
                    </ActionBtn>
                  </ActionButtons>
                </CardHeaderRow>

                <ServiceContent>
                  <Description title={service.description}>
                    {service.description}
                  </Description>

                  <CardFooter>
                    <Chip style={{ background: 'linear-gradient(90deg,#e6eefc,#dbeeff)' , color:'#164eab' }}>
                      <small>Service</small>
                    </Chip>
                    <div style={{ color: '#9aa6b6', fontSize: '0.85rem' }}>ID: {service._id?.slice(-6)}</div>
                  </CardFooter>
                </ServiceContent>
              </Card>
            ))}
          </Grid>

          {/* Empty State */}
          {!loading && services.length === 0 && (
            <EmptyState>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#1f2937' }}>No services found.</h3>
              <p style={{ marginTop: 8 }}>Click “Add Service” to create your first one.</p>
            </EmptyState>
          )}

          {/* === Add/Edit Modal === */}
          {formModalOpen && (
            <ModalBackdrop onClick={closeFormModal}>
              <ModalContent onClick={e => e.stopPropagation()}>
                <ModalHeader>{editId ? 'Edit Service' : 'New Service'}</ModalHeader>
                <form onSubmit={handleFormSubmit}>
                  <FormGroup>
                    <Label>Service Title</Label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Engine Diagnostics"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Description</Label>
                    <TextArea
                      name="description"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Service details..."
                      required
                    />
                  </FormGroup>
                  <ButtonGroup>
                    <ModalButton type="button" className="cancel" onClick={closeFormModal}>Cancel</ModalButton>
                    <ModalButton type="submit" className="confirm">{editId ? 'Save' : 'Create'}</ModalButton>
                  </ButtonGroup>
                </form>
              </ModalContent>
            </ModalBackdrop>
          )}

          {/* === Delete Modal === */}
          {deleteModalOpen && (
            <ModalBackdrop onClick={() => setDeleteModalOpen(false)}>
              <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: '380px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ color: '#dc2626', fontSize: '1.5rem' }}><FaExclamationTriangle /></div>
                    <h3 style={{ margin: 0, color: '#1e293b' }}>Delete Service?</h3>
                 </div>
                <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                  Are you sure you want to remove this service? This action cannot be undone.
                </p>
                <ButtonGroup>
                  <ModalButton className="cancel" onClick={() => setDeleteModalOpen(false)}>Cancel</ModalButton>
                  <ModalButton className="delete" onClick={confirmDelete}>Delete</ModalButton>
                </ButtonGroup>
              </ModalContent>
            </ModalBackdrop>
          )}
        </ResponsiveWrapper>
      </Container>
    </Root>
  );
};

export default Services;
