import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { FaUser, FaPhone, FaCar, FaIdCard, FaArrowLeft, FaSave } from 'react-icons/fa';
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
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(180deg, #f8fafc 0%, var(--bg) 100%);
  font-family: Inter, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const Card = styled.div`
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,244,255,0.9) 100%);
  backdrop-filter: blur(14px);
  border-radius: var(--radius-md);
  border: 1px solid rgba(17, 24, 39, 0.04);
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(10, 18, 30, 0.12);
  width: 100%;
  max-width: 600px;
  margin-top: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: var(--muted);
  font-size: 0.95rem;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 0.9rem;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg { color: var(--accent); }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #e6eef8;
  border-radius: 10px;
  font-size: 1rem;
  background: #fbfdff;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 4px 12px rgba(37,99,235,0.1);
    background: #ffffff;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.85rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: transform 0.1s, opacity 0.2s;

  &:hover { opacity: 0.95; transform: translateY(-1px); }
  &:active { transform: translateY(0); }

  &.primary {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(37,99,235,0.25);
  }

  &.secondary {
    background: #f1f5f9;
    color: #475569;
  }
`;

function AddCustomerForm() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleRegNo: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const phoneRegex = /^07\d{8}$/;
    // Relaxed Regex to allow common variations if needed, or keep strict
    const regNoRegex = /^[A-Z]{3} \d{3}[A-Z]$/; 

    if (!formData.name || !formData.mobile || !formData.vehicleMake || !formData.vehicleModel || !formData.vehicleRegNo) {
      toast.warn('All fields are required.');
      return false;
    }
    if (!phoneRegex.test(formData.mobile)) {
      toast.warn('Mobile number must be in the format 07XXXXXXXX.');
      return false;
    }
    if (!regNoRegex.test(formData.vehicleRegNo)) {
      toast.warn('Registration number must be like "KAA 123A".');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // --- FIXED: Uses API_BASE_URL ---
      const response = await axios.post(`${API_BASE_URL}/api/customers`, formData);
      toast.success(response.data.message || 'Customer added successfully!');
      
      // Delay navigation slightly so user sees the toast
      setTimeout(() => {
        navigate('/customer-dashboard');
      }, 1500);
      
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to add customer.');
    }
  };

  return (
    <Root>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      
      <Card>
        <Header>
          <Title>Add New Customer</Title>
          <Subtitle>Register a new client and their vehicle</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label><FaUser /> Customer Name</Label>
            <Input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="e.g. John Doe" 
              required 
            />
          </FormGroup>

          <FormGroup>
            <Label><FaPhone /> Mobile Number</Label>
            <Input 
              name="mobile" 
              value={formData.mobile} 
              onChange={handleChange} 
              placeholder="07XXXXXXXX" 
              required 
            />
          </FormGroup>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormGroup>
              <Label><FaCar /> Vehicle Make</Label>
              <Input 
                name="vehicleMake" 
                value={formData.vehicleMake} 
                onChange={handleChange} 
                placeholder="e.g. Toyota" 
                required 
              />
            </FormGroup>

            <FormGroup>
              <Label><FaCar /> Vehicle Model</Label>
              <Input 
                name="vehicleModel" 
                value={formData.vehicleModel} 
                onChange={handleChange} 
                placeholder="e.g. Corolla" 
                required 
              />
            </FormGroup>
          </div>

          <FormGroup>
            <Label><FaIdCard /> Registration No.</Label>
            <Input 
              name="vehicleRegNo" 
              value={formData.vehicleRegNo} 
              onChange={handleChange} 
              placeholder="KAA 123A" 
              required 
            />
          </FormGroup>

          <ButtonRow>
            <Button type="button" className="secondary" onClick={() => navigate('/customer-dashboard')}>
              <FaArrowLeft /> Cancel
            </Button>
            <Button type="submit" className="primary">
              <FaSave /> Save Customer
            </Button>
          </ButtonRow>
        </Form>
      </Card>
    </Root>
  );
}

export default AddCustomerForm;