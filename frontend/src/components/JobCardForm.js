import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled, { css } from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import JobCardPDF from './JobCardPDF.js';
import logo from '../assets/logo.png';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPrint, FaSave, FaArrowLeft, FaSpinner } from 'react-icons/fa';

// --- CRITICAL: Fallback URL ---
const API_BASE_URL = process.env.REACT_APP_API_URL

// ===== Styled Components (Compact & Professional) =====
const Root = styled.div`
  --bg: #f6f8fb;
  --text: #0b1220;
  --accent: #2563eb;
  --muted: #6b7280;
  --error: #ef4444;
  width: 100%;
  min-height: 100vh;
  padding: 2rem 1rem;
  background: linear-gradient(180deg, #f8fafc 0%, var(--bg) 100%);
  display: flex;
  justify-content: center;
  font-family: Inter, 'Segoe UI', Roboto, sans-serif;
`;

const PageContainer = styled.div`
  width: 100%;
  max-width: 850px;
  background: #ffffff;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.05);
  font-family: 'Segoe UI', sans-serif;
  position: relative;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 1rem;
`;

const LogoImg = styled.img`
  height: 50px;
  margin-bottom: 0.5rem;
`;

const CompanyTitle = styled.h1`
  font-size: 1.5rem;
  color: #1e293b;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
  line-height: 1.2;
`;

const AddressBlock = styled.div`
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.25rem;
  line-height: 1.4;
  
  p { margin: 0; }
`;

const FormTitle = styled.h2`
  text-align: center;
  font-size: 1.2rem;
  color: #2563eb;
  margin: 1rem 0;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const Label = styled.label`
  font-size: 0.8rem;
  font-weight: 700;
  color: ${props => props.$error ? 'var(--error)' : '#475569'};
  text-transform: uppercase;
  transition: color 0.2s;
`;

const Input = styled.input`
  padding: 0.6rem;
  border: 1px solid ${props => props.$error ? 'var(--error)' : '#e2e8f0'};
  border-radius: 6px;
  font-size: 0.9rem;
  background: ${props => props.$error ? '#fef2f2' : '#f8fafc'};
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.$error ? 'var(--error)' : '#2563eb'};
    background: #fff;
    box-shadow: 0 0 0 2px ${props => props.$error ? 'rgba(239,68,68,0.2)' : 'rgba(37, 99, 235, 0.1)'};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 100px;
  padding: 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #f8fafc;
  font-family: inherit;
  resize: vertical;
  line-height: 1.4;

  &:focus {
    outline: none;
    border-color: #2563eb;
    background: #fff;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }
`;

const CostSection = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
  gap: 1rem;
`;

const TotalInput = styled(Input)`
  font-size: 1.1rem;
  font-weight: 700;
  color: #10b981;
  text-align: right;
  width: 180px;
`;

const Disclaimer = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.75rem;
  font-style: italic;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px dashed #e2e8f0;
`;

const Button = styled.button`
  padding: 0.7rem 1.4rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover { transform: translateY(-2px); }
  &:active { transform: translateY(0); }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  &.primary {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  }

  &.secondary {
    background: white;
    border: 1px solid #e2e8f0;
    color: #475569;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  }

  &.print {
    background: #10b981;
    color: white;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  }
`;

const SpinIcon = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  @keyframes spin { 100% { transform: rotate(360deg); } }
`;

// === Component ===
const JobCardForm = () => {
  const [form, setForm] = useState({});
  const [jobNo, setJobNo] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [savedCardData, setSavedCardData] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get('id');

  useEffect(() => {
    if (editId) {
      fetchJobCard(editId);
      setIsEditing(true);
    } else {
      generateJobNo();
    }
  }, [editId]);

  const fetchJobCard = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/jobcards/${id}`);
      setForm(res.data);
      setJobNo(res.data.jobNo);
    } catch (err) {
      console.error('Failed to load job card:', err);
      toast.error('Failed to load job card details.');
    }
  };

  const generateJobNo = () => {
    const timestamp = Date.now();
    const unique = `J-${timestamp.toString().slice(-6)}`;
    setJobNo(unique);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleBack = () => {
    navigate('/jobcard-list');
  };

  const validate = () => {
    const required = ['name', 'mobile', 'regNo', 'make', 'model', 'date', 'totalCost'];
    const newErrors = {};
    let isValid = true;

    for (const field of required) {
      if (!form[field]) {
        newErrors[field] = true;
        isValid = false;
      }
    }

    if (form.mobile && !/^((\+254|0)7\d{8})$/.test(form.mobile)) {
      newErrors.mobile = true;
      toast.warn('Invalid mobile number format.');
      isValid = false;
    }

    setFieldErrors(newErrors);
    
    if (!isValid) {
      toast.error('Please fill in all required highlighted fields.');
    }
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        totalCost: Number(form.totalCost),
        jobNo,
      };

      let res;
      if (isEditing && editId) {
        res = await axios.put(`${API_BASE_URL}/api/jobcards/${editId}`, payload);
        toast.success('Job Card updated successfully!');
        setSavedCardData({ ...payload, _id: res.data._id });
        // In editing mode, we usually don't clear the form immediately 
        // so the user can see what they updated.
      } else {
        res = await axios.post(`${API_BASE_URL}/api/jobcards`, payload);
        toast.success('Job Card created successfully!');
        
        // --- FEATURE: Clear Form & Reset for Next ---
        setSavedCardData({ ...payload, _id: res.data._id }); // Keep for printing if needed immediately
        
        // Small delay to allow visual confirmation before clear
        setTimeout(() => {
            setForm({}); 
            generateJobNo(); 
            setFieldErrors({});
            // Optional: Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1500);
      }
      
    } catch (err) {
      console.error('Failed to save job card:', err);
      toast.error('Failed to save Job Card.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = async () => {
    if (!savedCardData) {
      toast.info('Please save the job card first.');
      return;
    }
    try {
      const blob = await pdf(<JobCardPDF card={savedCardData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${savedCardData.jobNo}_JobCard.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started.');
    } catch (error) {
      toast.error('Failed to generate PDF.');
    }
  };

  return (
    <Root>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      
      <PageContainer>
        <HeaderSection>
          <LogoImg src={logo} alt="Company Logo" />
          <CompanyTitle>NARAYAN LIMITED</CompanyTitle>
          <AddressBlock>
            <p>P.O. Box 6111-00300, Nairobi, Kenya</p>
            <p>Cell: +254 722 102 951 | +254 786 102 951</p>
          </AddressBlock>
        </HeaderSection>

        <FormTitle>Service Instructions Sheet</FormTitle>

        <form onSubmit={handleSubmit}>
          <SectionGrid>
            <FormGroup>
              <Label $error={fieldErrors.name}>Client Name</Label>
              <Input 
                name="name" 
                value={form.name || ''} 
                onChange={handleChange} 
                placeholder="Full Name" 
                $error={fieldErrors.name}
              />
            </FormGroup>
            <FormGroup>
              <Label $error={fieldErrors.date}>Date</Label>
              <Input 
                name="date" 
                type="date" 
                value={form.date || ''} 
                onChange={handleChange} 
                $error={fieldErrors.date}
              />
            </FormGroup>
            <FormGroup>
              <Label $error={fieldErrors.mobile}>Mobile</Label>
              <Input 
                name="mobile" 
                value={form.mobile || ''} 
                onChange={handleChange} 
                placeholder="07XXXXXXXX" 
                $error={fieldErrors.mobile}
              />
            </FormGroup>
            <FormGroup>
              <Label>P.O. Box / Town</Label>
              <Input name="poBox" value={form.poBox || ''} onChange={handleChange} placeholder="Address" />
            </FormGroup>
          </SectionGrid>

          <SectionGrid>
            <FormGroup>
              <Label $error={fieldErrors.make}>Vehicle Make</Label>
              <Input 
                name="make" 
                value={form.make || ''} 
                onChange={handleChange} 
                placeholder="e.g. Toyota" 
                $error={fieldErrors.make}
              />
            </FormGroup>
            <FormGroup>
              <Label $error={fieldErrors.model}>Model</Label>
              <Input 
                name="model" 
                value={form.model || ''} 
                onChange={handleChange} 
                placeholder="e.g. Land Cruiser" 
                $error={fieldErrors.model}
              />
            </FormGroup>
            <FormGroup>
              <Label $error={fieldErrors.regNo}>Reg No.</Label>
              <Input 
                name="regNo" 
                value={form.regNo || ''} 
                onChange={handleChange} 
                placeholder="KAA 123A" 
                $error={fieldErrors.regNo}
              />
            </FormGroup>
            <FormGroup>
              <Label>Odometer</Label>
              <Input name="speedo" value={form.speedo || ''} onChange={handleChange} placeholder="KM Reading" />
            </FormGroup>
          </SectionGrid>

          <FormGroup>
            <Label>Repairs Required / Instructions</Label>
            <TextArea 
              name="repairs" 
              value={form.repairs || ''} 
              onChange={handleChange} 
              placeholder="List all repairs and checks..."
            />
          </FormGroup>

          <CostSection>
            <Label $error={fieldErrors.totalCost}>Estimated Total Cost (KES)</Label>
            <TotalInput 
              name="totalCost" 
              type="number" 
              value={form.totalCost || ''} 
              onChange={handleChange} 
              placeholder="0.00"
              $error={fieldErrors.totalCost}
            />
          </CostSection>

          <div style={{marginTop: '1.5rem'}}>
             <Label>Customer Signature (Type Name)</Label>
             <Input 
                name="signature" 
                value={form.signature || ''} 
                onChange={handleChange} 
                style={{width: '50%', fontFamily: 'cursive', marginTop: '0.3rem'}}
                placeholder="Digital Signature"
             />
          </div>

          <Disclaimer>
            CARS DRIVEN AND STORED AT OWNER'S RISK. <br/>
            JOB No: <strong>{jobNo}</strong>
          </Disclaimer>

          <ActionBar>
            <Button type="button" className="secondary" onClick={handleBack}>
              <FaArrowLeft /> Back
            </Button>
            
            <Button type="submit" className="primary" disabled={isSubmitting}>
              {isSubmitting ? <SpinIcon /> : <FaSave />} 
              {isSubmitting ? ' Saving...' : (isEditing ? ' Update Job Card' : ' Save Job Card')}
            </Button>
            
            {savedCardData && !isSubmitting && (
              <Button type="button" className="print" onClick={handlePrint}>
                <FaPrint /> Print
              </Button>
            )}
          </ActionBar>
        </form>
      </PageContainer>
    </Root>
  );
};

export default JobCardForm;