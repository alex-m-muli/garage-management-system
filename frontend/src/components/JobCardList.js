import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import JobCardPDF from './JobCardPDF';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaSearch, FaFileInvoice, FaUser, FaCar, FaPhone, 
  FaEye, FaEdit, FaTrash, FaPrint, FaExclamationTriangle 
} from 'react-icons/fa';

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
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
`;

const Subtitle = styled.span`
  margin-top: 6px;
  font-size: 0.95rem;
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
  width: 300px;
  @media (max-width: 600px) { width: 100%; }
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
  padding: 0.7rem 1rem 0.7rem 2.4rem;
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

const Grid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
`;

/* Card Styles */
const Card = styled.div`
  background: linear-gradient(135deg, rgba(18, 241, 241, 0.95) 0%, rgba(221, 224, 235, 0.9) 100%);
  backdrop-filter: blur(14px);
  border-radius: var(--radius-md);
  border: 1px solid rgba(17, 24, 39, 0.04);
  padding: 18px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 30px rgba(10, 18, 30, 0.1);
    border-color: rgba(90, 120, 255, 0.28);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
`;

const JobBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #eff6ff;
  color: var(--accent);
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  color:rgb(26, 24, 24);
  
  svg { color: #94a3b8; font-size: 0.9rem; }
`;

const Highlight = styled.span`
  background-color: #fef08a;
  color: #854d0e;
  padding: 0 2px;
  border-radius: 2px;
  font-weight: 600;
`;

const CardActions = styled.div`
  display: flex;
  /* CHANGE: 'center' moves buttons to the middle (was 'flex-end') */
  justify-content: center; 
  gap: 12px; 
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px dashed #e2e8f0;
`;

// === UPDATED ACTION BUTTON with Label ===
const ActionBtn = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  
  min-width: 48px;
  padding: 8px 4px;
  
  border-radius: 10px;
  border: 1px solid transparent;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  /* Icon Size */
  svg {
    font-size: 1.1rem;
  }

  /* Label Text */
  span {
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &:hover { transform: translateY(-2px); }

  &.view:hover { color: var(--accent); border-color: var(--accent); background: #eff6ff; }
  &.edit:hover { color: #f59e0b; border-color: #f59e0b; background: #fffbeb; }
  &.print:hover { color: #10b981; border-color: #10b981; background: #ecfdf5; }
  &.delete:hover { color: #ef4444; border-color: #ef4444; background: #fef2f2; }
`;

/* Pagination */
const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 3rem;
  gap: 0.8rem;
`;

const PageBtn = styled.button`
  padding: 0.6rem 1.2rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  color: var(--muted);
  transition: all 0.2s;
  
  &:hover:not(:disabled) { background: #f8fafc; color: var(--text); }
  
  &.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }
  
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/* Modal Styles */
const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
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
  max-width: 400px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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
  
  &.danger { color: #ef4444; }
  &.info { color: var(--accent); }
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
`;

const ModalText = styled.p`
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const ModalBtn = styled.button`
  padding: 0.7rem 1.4rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.2s;
  
  &:hover { opacity: 0.9; }

  &.cancel { background: #f1f5f9; color: #475569; }
  &.confirm-delete { background: #ef4444; color: white; }
  &.confirm-print { background: var(--accent); color: white; }
`;

// ===== Component =====
const JobCardList = () => {
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, jobNo: '' });
  const [printModal, setPrintModal] = useState({ open: false, card: null });

  const navigate = useNavigate();

  const fetchCards = useCallback(async (page = 1, term = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/jobcards?page=${page}&limit=12&search=${term}`);
      if (res.data && Array.isArray(res.data.cards)) {
        setCards(res.data.cards);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setCards([]);
      }
    } catch (err) {
      console.error('Failed to fetch cards:', err);
      toast.error('Failed to load Job Cards.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchCards(currentPage, search), 400);
    return () => clearTimeout(timeout);
  }, [search, currentPage, fetchCards]);

  const highlight = (text) => {
    if (!search || !text) return text;
    const parts = text.toString().split(new RegExp(`(${search})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? <Highlight key={i}>{part}</Highlight> : part
    );
  };

  const handlePrint = async (card) => {
    try {
      const blob = await pdf(<JobCardPDF card={card} />).toBlob();
      saveAs(blob, `JobCard_${card.jobNo}.pdf`);
      toast.success('Download started.');
      setPrintModal({ open: false, card: null });
    } catch (err) {
      toast.error('PDF Generation failed.');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/jobcards/${deleteModal.id}`);
      toast.success('Job Card deleted.');
      fetchCards(currentPage, search);
    } catch (err) {
      toast.error('Delete failed.');
    } finally {
      setDeleteModal({ open: false, id: null, jobNo: '' });
    }
  };

  return (
    <Root>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      <Container>
        <Header>
          <TitleBlock>
            <Title>Job Cards</Title>
            <Subtitle>Manage service records and invoices</Subtitle>
          </TitleBlock>
          <Controls>
            <SearchWrapper>
              <SearchIcon />
              <SearchInput 
                placeholder="Search job no, name, reg no..." 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </SearchWrapper>
          </Controls>
        </Header>

        <Grid>
          {loading ? (
            <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#94a3b8'}}>
              Loading job cards...
            </div>
          ) : cards.length > 0 ? (
            cards.map(card => (
              <Card key={card._id}>
                <CardHeader>
                  <JobBadge>
                    <FaFileInvoice /> {highlight(card.jobNo)}
                  </JobBadge>
                  <StatusDot />
                </CardHeader>

                <CardContent>
                  <InfoRow>
                    <FaUser /> <strong>Client:</strong> {highlight(card.name)}
                  </InfoRow>
                  <InfoRow>
                    <FaPhone /> <span>{highlight(card.mobile)}</span>
                  </InfoRow>
                  <InfoRow>
                    <FaCar /> <span>{highlight(card.make)} {card.model} ({highlight(card.regNo)})</span>
                  </InfoRow>
                </CardContent>

                <CardActions>
                  {/* View/Download Action */}
                  <ActionBtn 
                    className="view" 
                    title="Preview"
                    onClick={() => setPrintModal({ open: true, card })}
                  >
                    <FaEye />
                    <span>View</span>
                  </ActionBtn>
                  
                  {/* Direct Print Action */}
                  <ActionBtn 
                    className="print" 
                    title="Download PDF"
                    onClick={() => handlePrint(card)}
                  >
                    <FaPrint />
                    <span>Print</span>
                  </ActionBtn>

                  {/* Edit Action */}
                  <ActionBtn 
                    className="edit" 
                    title="Edit"
                    onClick={() => navigate(`/jobcard-management?id=${card._id}`)}
                  >
                    <FaEdit />
                    <span>Edit</span>
                  </ActionBtn>

                  {/* Delete Action */}
                  <ActionBtn 
                    className="delete" 
                    title="Delete"
                    onClick={() => setDeleteModal({ open: true, id: card._id, jobNo: card.jobNo })}
                  >
                    <FaTrash />
                    <span>Delete</span>
                  </ActionBtn>
                </CardActions>
              </Card>
            ))
          ) : (
            <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#94a3b8'}}>
              <h3>No job cards found.</h3>
            </div>
          )}
        </Grid>

        {totalPages > 1 && (
          <Pagination>
            <PageBtn 
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </PageBtn>
            <span style={{display: 'flex', alignItems: 'center', fontWeight: '600', color: '#64748b'}}>
              Page {currentPage} of {totalPages}
            </span>
            <PageBtn 
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </PageBtn>
          </Pagination>
        )}

        {/* === Delete Modal === */}
        {deleteModal.open && (
          <ModalBackdrop onClick={() => setDeleteModal({ ...deleteModal, open: false })}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <ModalHeader className="danger">
                <FaExclamationTriangle /> <ModalTitle>Delete Job Card?</ModalTitle>
              </ModalHeader>
              <ModalText>
                Are you sure you want to delete Job No: <strong>{deleteModal.jobNo}</strong>?<br/>
                This action cannot be undone.
              </ModalText>
              <ModalActions>
                <ModalBtn className="cancel" onClick={() => setDeleteModal({ ...deleteModal, open: false })}>
                  Cancel
                </ModalBtn>
                <ModalBtn className="confirm-delete" onClick={handleDelete}>
                  Yes, Delete
                </ModalBtn>
              </ModalActions>
            </ModalContent>
          </ModalBackdrop>
        )}

        {/* === View/Print Modal === */}
        {printModal.open && (
          <ModalBackdrop onClick={() => setPrintModal({ open: false, card: null })}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <ModalHeader className="info">
                <FaFileInvoice /> <ModalTitle>Download Job Card</ModalTitle>
              </ModalHeader>
              <ModalText>
                Do you want to generate and download the PDF for Job No: <strong>{printModal.card?.jobNo}</strong>?
              </ModalText>
              <ModalActions>
                <ModalBtn className="cancel" onClick={() => setPrintModal({ open: false, card: null })}>
                  Close
                </ModalBtn>
                <ModalBtn className="confirm-print" onClick={() => handlePrint(printModal.card)}>
                  <FaPrint /> Download PDF
                </ModalBtn>
              </ModalActions>
            </ModalContent>
          </ModalBackdrop>
        )}

      </Container>
    </Root>
  );
};

export default JobCardList;