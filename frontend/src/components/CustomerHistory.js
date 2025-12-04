import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { FaArrowLeft, FaCalendarAlt, FaCar, FaWrench, FaFileInvoiceDollar, FaUserCircle } from 'react-icons/fa';
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
  box-sizing: border-box;
  background: linear-gradient(180deg, #f8fafc 0%, var(--bg) 100%);
  min-height: 100vh;
  font-family: Inter, 'Segoe UI', Roboto, sans-serif;
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
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

const Subtitle = styled.div`
  margin-top: 6px;
  font-size: 0.95rem;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg { color: var(--accent); }
`;

const BackButton = styled.button`
  background: #ffffff;
  color: var(--text);
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);

  &:hover {
    background: #f1f5f9;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
  }
  
  svg { color: var(--muted); }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.2rem;
  border-radius: 12px;
  border: 1px solid #e6eef8;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  
  span.label { font-size: 0.85rem; color: var(--muted); margin-bottom: 0.3rem; }
  span.value { font-size: 1.4rem; font-weight: 700; color: var(--text); }
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const JobCardItem = styled.div`
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,247,255,0.9) 100%);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(17, 24, 39, 0.05);
  padding: 1.5rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
    border-color: rgba(37, 99, 235, 0.2);
  }
`;

const JobHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #eff6ff;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const JobBadge = styled.div`
  background: #eff6ff;
  color: var(--accent);
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`;

const JobDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--muted);
  font-size: 0.9rem;
  font-weight: 500;
`;

const JobBody = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.span`
  font-size: 0.85rem;
  color: var(--muted);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  
  svg { color: #94a3b8; }
`;

const Value = styled.span`
  font-size: 1rem;
  color: var(--text);
  font-weight: 500;
  line-height: 1.5;
`;

const RepairsList = styled.div`
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
  font-size: 0.95rem;
  color: #475569;
  white-space: pre-line; /* Preserves line breaks in repairs description */
`;

const JobFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eff6ff;
`;

const CostBadge = styled.div`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 1rem;
  color: var(--muted);
  
  h3 { font-size: 1.2rem; color: var(--text); margin-bottom: 0.5rem; }
  p { font-size: 0.95rem; }
`;

const PaginationControls = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 3rem;
  gap: 1rem;
  align-items: center;
`;

const PageButton = styled.button`
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ===== Main Component =====

const CustomerHistory = () => {
  const { mobile } = useParams();
  const navigate = useNavigate();
  const [jobcards, setJobcards] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const decodedMobile = decodeURIComponent(mobile);
        
        // Parallel Fetch for Speed
        const [jobRes, customerRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/jobcards/customer/${decodedMobile}`),
          axios.get(`${API_BASE_URL}/api/customers/by-mobile/${decodedMobile}`),
        ]);

        setJobcards(Array.isArray(jobRes.data) ? jobRes.data : []);
        setCustomer(customerRes.data);
      } catch (err) {
        console.error('Failed to fetch history:', err);
        // Don't show toast immediately if it's just "no jobs found", handling in UI
        if(err.response && err.response.status !== 404) {
            toast.error("Could not load customer history.");
        }
      } finally {
        setLoading(false);
      }
    };
    if (mobile) fetchData();
  }, [mobile]);

  // Pagination Logic
  const totalPages = Math.ceil(jobcards.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const currentRecords = jobcards.slice(start, start + itemsPerPage);

  // Total Spent Calculation
  const totalSpent = jobcards.reduce((sum, card) => sum + (card.totalCost || 0), 0);

  return (
    <Root>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      <Container>
        <Header>
          <TitleBlock>
            <Title>Service History</Title>
            <Subtitle>
              <FaUserCircle /> {customer ? customer.name : 'Loading...'} 
              <span style={{margin: '0 8px'}}>|</span> 
              {mobile}
            </Subtitle>
          </TitleBlock>
          <BackButton onClick={() => navigate('/customer-dashboard')}>
            <FaArrowLeft /> Back to Dashboard
          </BackButton>
        </Header>

        {/* Quick Stats */}
        <StatsGrid>
          <StatCard>
            <span className="label">Total Visits</span>
            <span className="value">{jobcards.length}</span>
          </StatCard>
          <StatCard>
            <span className="label">Total Spent</span>
            <span className="value" style={{color: '#10b981'}}>
              KES {totalSpent.toLocaleString()}
            </span>
          </StatCard>
          <StatCard>
            <span className="label">Last Visit</span>
            <span className="value" style={{fontSize: '1.1rem'}}>
              {jobcards.length > 0 
                ? new Date(jobcards[0].date).toLocaleDateString() 
                : 'N/A'}
            </span>
          </StatCard>
        </StatsGrid>

        {!loading && currentRecords.length > 0 ? (
          <HistoryList>
            {currentRecords.map((record, index) => (
              <JobCardItem key={record._id || index}>
                <JobHeader>
                  <JobBadge>
                    <FaFileInvoiceDollar /> #{record.jobNo}
                  </JobBadge>
                  <JobDate>
                    <FaCalendarAlt /> {new Date(record.date).toLocaleDateString()}
                  </JobDate>
                </JobHeader>

                <JobBody>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <InfoGroup>
                      <Label><FaCar /> Vehicle</Label>
                      <Value>
                        {record.make} {record.model} <span style={{color: '#94a3b8'}}>({record.regNo})</span>
                      </Value>
                    </InfoGroup>
                    <InfoGroup>
                      <Label><FaWrench /> Repairs Performed</Label>
                      <RepairsList>
                        {record.repairs || "No repairs recorded."}
                      </RepairsList>
                    </InfoGroup>
                  </div>
                </JobBody>

                <JobFooter>
                  <CostBadge>
                    KES {record.totalCost?.toLocaleString()}
                  </CostBadge>
                </JobFooter>
              </JobCardItem>
            ))}
          </HistoryList>
        ) : (
          !loading && (
            <EmptyState>
              <h3>No service history found.</h3>
              <p>This customer has not visited the garage yet.</p>
            </EmptyState>
          )
        )}

        {jobcards.length > itemsPerPage && (
          <PaginationControls>
            <PageButton 
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </PageButton>
            <span style={{fontWeight: '600', color: '#64748b'}}>
              Page {currentPage} of {totalPages}
            </span>
            <PageButton 
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </PageButton>
          </PaginationControls>
        )}
      </Container>
    </Root>
  );
};

export default CustomerHistory;