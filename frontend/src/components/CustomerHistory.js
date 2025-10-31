// frontend/src/components/CustomerHistory.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  max-width: 1000px;
  margin: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  color: #2c5282;
  font-size: 1.8rem;
`;

const BackButton = styled.button`
  background-color: #e53e3e;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: #c53030;
  }
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const VehicleInline = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-weight: 500;
`;

const PaginationControls = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  gap: 1rem;
`;

const PageButton = styled.button`
  background-color: #edf2f7;
  border: 1px solid #cbd5e0;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #e2e8f0;
  }
`;

const PageDisplay = styled.span`
  display: flex;
  align-items: center;
  font-weight: bold;
`;

const CustomerHistory = () => {
  const { mobile } = useParams();
  const navigate = useNavigate();
  const [jobcards, setJobcards] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const decodedMobile = decodeURIComponent(mobile);
        const [jobRes, customerRes] = await Promise.all([
          axios.get(`/api/jobcards/customer/${decodedMobile}`),
          axios.get(`/api/customers/by-mobile/${decodedMobile}`),
        ]);

        setJobcards(jobRes.data);
        setCustomer(customerRes.data);
      } catch (err) {
        console.error('Failed to fetch customer history:', err);
      }
    };
    if (mobile) fetchData();
  }, [mobile]);

  const totalPages = Math.ceil(jobcards.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const currentRecords = jobcards.slice(start, end);

  return (
    <Container>
      <Header>
        <Title>
          Service History for {customer?.name} ({customer?.mobile})
        </Title>
        <BackButton onClick={() => navigate('/customer-dashboard')}>Back</BackButton>
      </Header>

      {currentRecords.length > 0 ? (
        currentRecords.map((record, index) => (
          <Card key={index}>
            <Row><strong>Job No:</strong> {record.jobNo}</Row>
            <Row><strong>Date:</strong> {record.date}</Row>
            <Row>
              <strong>Vehicle:</strong>
              <VehicleInline>
                <span>{record.make || '-'}</span>
                <span>{record.model || '-'}</span>
                <span>({record.regNo || '-'})</span>
              </VehicleInline>
            </Row>
            <Row><strong>Repairs:</strong> {record.repairs}</Row>
            <Row><strong>Total Cost:</strong> KES {record.totalCost?.toLocaleString()}</Row>
          </Card>
        ))
      ) : (
        <p>No service history found.</p>
      )}

      <PaginationControls>
        <PageButton onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</PageButton>
        <PageDisplay>Page {currentPage} of {totalPages}</PageDisplay>
        <PageButton onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Next</PageButton>
      </PaginationControls>
    </Container>
  );
};

export default CustomerHistory;
