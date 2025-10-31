// frontend/src/components/AddCustomerForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For back navigation
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const BackButton = styled.button`
  background-color: #e53e3e;
  color: white;
  padding: 0.5rem 1rem;
  margin: 0 auto 1.5rem;
  display: block;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #c53030;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #4a5568;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #cbd5e0;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #3182ce;
  }
`;

const Button = styled.button`
  background-color: #3182ce;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2b6cb0;
  }
`;

const Message = styled.p`
  color: green;
  text-align: center;
  font-weight: bold;
`;

const Error = styled.p`
  color: red;
  text-align: center;
  font-weight: bold;
`;

function AddCustomerForm() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleRegNo: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize navigation hook

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const phoneRegex = /^07\d{8}$/;
    const regNoRegex = /^[A-Z]{3} \d{3}[A-Z]$/;

    if (!formData.name || !formData.mobile || !formData.vehicleMake || !formData.vehicleModel || !formData.vehicleRegNo) {
      return 'All fields are required.';
    }
    if (!phoneRegex.test(formData.mobile)) {
      return 'Mobile number must be in the format 07XXXXXXXX.';
    }
    if (!regNoRegex.test(formData.vehicleRegNo)) {
      return 'Registration number must be like "KAA 123A".';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await axios.post('/api/customers', formData);
      setMessage(response.data.message);
      setFormData({ name: '', mobile: '', vehicleMake: '', vehicleModel: '', vehicleRegNo: '' });
    } catch (err) {
      setError('Failed to add customer.');
      console.error(err);
    }
  };

  return (
    <Container>
      <Title>Add New Customer</Title>
      {/* Back Button added here */}
      <BackButton onClick={() => navigate('/customer-dashboard')}>
        ← Back to Dashboard
      </BackButton>

      <Form onSubmit={handleSubmit}>
        <Label>Name</Label>
        <Input name="name" value={formData.name} onChange={handleChange} required />

        <Label>Mobile Number</Label>
        <Input name="mobile" value={formData.mobile} onChange={handleChange} required />

        <Label>Vehicle Make</Label>
        <Input name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} required />

        <Label>Vehicle Model</Label>
        <Input name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} required />

        <Label>Registration Number</Label>
        <Input name="vehicleRegNo" value={formData.vehicleRegNo} onChange={handleChange} required />

        <Button type="submit">Add Customer</Button>
        {message && <Message>{message}</Message>}
        {error && <Error>{error}</Error>}
      </Form>
    </Container>
  );
}

export default AddCustomerForm;
