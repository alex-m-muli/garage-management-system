// frontend/src/components/JobCardList.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import JobCardPDF from './JobCardPDF';

// ===== Styled Components =====
const Container = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fefefe;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', sans-serif;

  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const Title = styled.h2`
  text-align: center;
  color: #2b6cb0;
  margin-bottom: 2rem;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.6rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
`;

const ClearButton = styled.button`
  padding: 0.6rem 1rem;
  border: none;
  background: #e53e3e;
  color: white;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: #c53030;
  }
`;

const Card = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.2rem;
  background: #f7fafc;
  transition: all 0.3s ease-in-out;

  &:hover {
    background: #edf2f7;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: bold;
  flex-wrap: wrap;
`;

const Highlight = styled.span`
  background-color: #ffe082;
  font-weight: bold;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.8rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  background: #2b6cb0;
  color: white;
  transition: background 0.3s ease;

  &:hover {
    background: #2c5282;
  }
`;

const DialogOverlay = styled.div`
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const DialogBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  text-align: center;

  @media (max-width: 500px) {
    margin: 1rem;
    padding: 1.5rem;
  }
`;

const Pagination = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #cbd5e0;
  background: white;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;

  &.active {
    background-color: #2b6cb0;
    color: white;
  }

  &:hover:not(.active) {
    background-color: #e2e8f0;
  }
`;

const LoadingText = styled.p`
  text-align: center;
  color: #718096;
`;

// ===== Component =====
const JobCardList = () => {
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialog, setDialog] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCards = useCallback(async (page = 1, term = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/jobcards?page=${page}&limit=10&search=${term}`);
      setCards(res.data.cards);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch cards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchCards(currentPage, search), 400);
    return () => clearTimeout(timeout);
  }, [search, currentPage, fetchCards]);

  const highlight = (text) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? <Highlight key={i}>{part}</Highlight> : part
    );
  };

  const handlePrint = async (card) => {
    const blob = await pdf(<JobCardPDF card={card} />).toBlob();
    saveAs(blob, `JobCard_${card.jobNo}.pdf`);
    setDialog({ message: 'Downloaded Successfully', buttons: ['OK'] });
  };

  const handleDelete = async (id) => {
    setDialog({
      message: 'Are you sure you want to delete this Job Card?',
      buttons: ['Yes', 'No'],
      onConfirm: async () => {
        await axios.delete(`http://localhost:5000/api/jobcards/${id}`);
        fetchCards(currentPage, search);
        setDialog({ message: 'Deleted successfully', buttons: ['OK'] });
      }
    });
  };

  const handleView = (card) => {
    setDialog({
      message: 'Do you wish to download this Jobcard to view it?',
      buttons: ['Yes', 'No'],
      onConfirm: () => handlePrint(card)
    });
  };

  const handleUpdate = (card) => {
    navigate(`/jobcard-management?id=${card._id}`);
  };

  return (
    <Container>
      <Title>All Job Cards</Title>

      <SearchContainer>
        <ClearButton onClick={() => { setSearch(''); setCurrentPage(1); }}>Clear</ClearButton>
        <SearchInput
          placeholder="Search job cards..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
      </SearchContainer>

      {loading && <LoadingText>Loading...</LoadingText>}

      {!loading && cards.map(card => (
        <Card key={card._id}>
          <CardHeader>
            <div><strong>Job No:</strong> {highlight(card.jobNo)}</div>
            <div><strong>Name:</strong> {highlight(card.name)}</div>
          </CardHeader>
          <div><strong>Mobile:</strong> {highlight(card.mobile)} | <strong>Reg No:</strong> {highlight(card.regNo)}</div>
          <ButtonRow>
            <ActionButton onClick={() => handleView(card)}>View</ActionButton>
            <ActionButton onClick={() => handleUpdate(card)}>Update</ActionButton>
            <ActionButton onClick={() => handleDelete(card._id)}>Delete</ActionButton>
            <ActionButton onClick={() => handlePrint(card)}>Print</ActionButton>
          </ButtonRow>
        </Card>
      ))}

      <Pagination>
        {currentPage > 1 && <PageButton onClick={() => setCurrentPage(currentPage - 1)}>Prev</PageButton>}
        {Array.from({ length: totalPages }, (_, i) => (
          <PageButton
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={currentPage === i + 1 ? 'active' : ''}
          >
            {i + 1}
          </PageButton>
        ))}
        {currentPage < totalPages && <PageButton onClick={() => setCurrentPage(currentPage + 1)}>Next</PageButton>}
      </Pagination>

      {dialog && (
        <DialogOverlay>
          <DialogBox>
            <p>{dialog.message}</p>
            <div style={{ marginTop: '1rem' }}>
              {dialog.buttons.map((btn, i) => (
                <ActionButton
                  key={i}
                  onClick={() => {
                    if (btn === 'Yes' && dialog.onConfirm) return dialog.onConfirm();
                    setDialog(null);
                  }}>
                  {btn}
                </ActionButton>
              ))}
            </div>
          </DialogBox>
        </DialogOverlay>
      )}
    </Container>
  );
};

export default JobCardList;
