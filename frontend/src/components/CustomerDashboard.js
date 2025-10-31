// frontend/src/components/CustomerDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// ===== Styled Components =====

const Container = styled.main`
  flex: 1;
  padding: 2rem;
  background-color: #f4f4f7;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const Title = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  color: #2d3748;
`;

const ActionGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const SearchInput = styled.input`
  padding: 0.6rem 1rem;
  width: 260px;
  border-radius: 6px;
  border: 1px solid #cbd5e0;
  font-size: 1rem;
  background-color: #fff;
`;

const AddButton = styled.button`
  background-color: #2b6cb0;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2c5282;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-4px);
  }
`;

const CardTitle = styled.h3`
  font-size: 1.3rem;
  color: #2d3748;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const CardText = styled.p`
  color: #4a5568;
  font-size: 0.95rem;
  margin: 0.25rem 0;
`;

const CardActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1.2rem;
`;

const ActionButton = styled.button`
  padding: 0.45rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &.view {
    background-color: #3182ce;
    color: white;
  }
  &.view:hover {
    background-color: #2c5282;
  }

  &.delete {
    background-color: #e53e3e;
    color: white;
  }
  &.delete:hover {
    background-color: #c53030;
  }
`;

// ===== Main Component =====

function CustomerDashboard() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Fetch all customers
  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Delete a customer
  const deleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await axios.delete(`/api/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      alert('Failed to delete customer.');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter logic
  const filtered = customers.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile?.includes(search) ||
    c.vehicles?.some(
      (v) =>
        v.make?.toLowerCase().includes(search.toLowerCase()) ||
        v.model?.toLowerCase().includes(search.toLowerCase()) ||
        v.regNo?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <Container>
      <Header>
        <Title>Customers</Title>
        <ActionGroup>
          <SearchInput
            placeholder="Search by name, phone, make, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <AddButton onClick={() => navigate('/add-customer')}>
            + Add Customer
          </AddButton>
        </ActionGroup>
      </Header>

      <Grid>
        {filtered.map((customer) => (
          <Card key={customer._id}>
            <CardTitle>{customer.name}</CardTitle>
            <CardText><strong>Mobile:</strong> {customer.mobile}</CardText>
            <CardText><strong>Vehicles:</strong></CardText>
            {customer.vehicles?.map((v, idx) => (
              <CardText key={idx}>{v.make} {v.model} ({v.regNo})</CardText>
            ))}
            <CardActions>
              <ActionButton
                className="view"
                onClick={() => navigate(`/customer-history/${encodeURIComponent(customer.mobile)}`)}
              >
                View
              </ActionButton>
              <ActionButton
                className="delete"
                onClick={() => deleteCustomer(customer._id)}
              >
                Delete
              </ActionButton>
            </CardActions>
          </Card>
        ))}
      </Grid>
    </Container>
  );
}

export default CustomerDashboard;
