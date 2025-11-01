import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import JobCardPDF from './JobCardPDF.js';
import logo from '../assets/logo.png'; 

// --- CRITICAL ADDITION: Define the Base URL ---
const API_BASE_URL = process.env.REACT_APP_API_URL;
// ---------------------------------------------

// === Styled Components ===
const PageContainer = styled.div`
  width: 900px;
  margin: 3rem auto;
  padding: 2.5rem;
  background: linear-gradient(to bottom right, #fefefe, #f9f9ff);
  font-family: 'Georgia', serif;
  border: 1px solid #ccc;
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
  line-height: 1.4;
  border-radius: 10px;
  color: #4a6fa5;
`;

const TopTitle = styled.h1`
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #b22222;
`;

const Logo = styled.img`
  display: block;
  margin: 0 auto 1rem;
  height: 60px;
`;

const AddressBlock = styled.div`
  text-align: right;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  line-height: 1.1;
`;

const SheetTitle = styled.h2`
  text-align: center;
  font-size: 1.2rem;
  margin-top: 1rem;
  text-decoration: underline;
  color: #2c5282;
`;

const TwoColumn = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 2rem 0 1.5rem;
`;

const Column = styled.div`
  width: 48%;
`;

const InputRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const LabelGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Label = styled.label`
  font-weight: bold;
  font-size: 0.95rem;
  margin-bottom: 0.2rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #a0aec0;
  border-radius: 6px;
  font-family: inherit;
  color: #000;
  background: #fff;
  transition: border 0.3s;
  &:focus {
    border-color: #4c51bf;
    outline: none;
  }
`;

const ErrorText = styled.span`
  color: red;
  font-size: 0.8rem;
`;

const Divider = styled.hr`
  border: none;
  border-top: 2px solid #000;
  margin: 2rem 0 1rem;
`;

const SubHeader = styled.p`
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const RepairsBox = styled.textarea`
  width: 100%;
  height: 200px;
  border: 1px solid #a0aec0;
  padding: 1rem;
  font-size: 1.1rem;
  border-radius: 6px;
  font-family: inherit;
  color: #000;
`;

const CostRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const CostGroup = styled.div`
  width: 30%;
  display: flex;
  flex-direction: column;
`;

const CenteredText = styled.p`
  text-align: center;
  margin: 1.5rem 0 0.5rem;
`;

const FooterNote = styled.p`
  text-align: center;
  font-weight: bold;
  font-size: 0.95rem;
  margin-top: 1rem;
  color: #b22222;
`;

const SmallInput = styled(Input)`
  width: 25%;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  align-items: center;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const ActionButton = styled.button`
  background-color: #3182ce;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
  &:hover {
    background-color: #2c5282;
  }
`;

const DialogBox = styled.div`
  background: #f0fff4;
  color: #276749;
  padding: 1rem;
  border: 1px solid #c6f6d5;
  border-radius: 5px;
  margin-top: 1rem;
  text-align: center;
`;

// === Main Component ===
const JobCardForm = () => {
  const [form, setForm] = useState({});
  const [jobNo, setJobNo] = useState('');
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [savedCardData, setSavedCardData] = useState(null);
  const [showPrint, setShowPrint] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
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
      // --- AFFECTED PART: Updated API URL ---
      const res = await axios.get(`${API_BASE_URL}/api/jobcards/${id}`);
      // ------------------------------------
      setForm(res.data);
      setJobNo(res.data.jobNo);
    } catch (err) {
      console.error('Failed to load job card:', err);
    }
  };

  const generateJobNo = () => {
    const timestamp = Date.now();
    const unique = `J-${timestamp.toString().slice(-6)}`;
    setJobNo(unique);
  };

  const requiredFields = ['name', 'mobile', 'regNo', 'make', 'model', 'date', 'totalCost'];
  const phoneRegex = /^((\+254|0)7\d{8})$/;

  const validate = () => {
    const newErrors = {};
    requiredFields.forEach((field) => {
      if (!form[field]) newErrors[field] = 'This field is required.';
    });
    if (form.mobile && !phoneRegex.test(form.mobile)) {
      newErrors.mobile = 'Enter a valid mobile number';
    }
    if (form.totalCost && (!/^[0-9]+(\.[0-9]{1,2})?$/.test(form.totalCost) || Number(form.totalCost) <= 0)) {
      newErrors.totalCost = 'Total cost must be a positive number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const clearForm = () => {
    setForm({});
    generateJobNo();
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const payload = {
        ...form,
        totalCost: Number(form.totalCost),
        jobNo,
      };
      let res;
      if (isEditing && editId) {
        // --- AFFECTED PART: Updated API URL for PUT ---
        res = await axios.put(`${API_BASE_URL}/api/jobcards/${editId}`, payload);
        // -------------------------------------------
      } else {
        // --- AFFECTED PART: Updated API URL for POST ---
        res = await axios.post(`${API_BASE_URL}/api/jobcards`, payload);
        // --------------------------------------------
        clearForm();
      }
      setSavedCardData({ ...payload, _id: res.data._id });
      setShowPrint(true);
    } catch (err) {
      console.error('Failed to save job card:', err);
    }
  };

  const handlePrint = async () => {
    if (!savedCardData) return;
    const blob = await pdf(<JobCardPDF card={savedCardData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${savedCardData.jobNo}_JobCard.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccessMsg('Job card downloaded successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleBack = () => navigate('/jobcard-list');

  return (
    <PageContainer>
      <TopTitle>NARAYAN LIMITED</TopTitle>
      <Logo src={logo} alt="Company Logo" />
      <AddressBlock>
        <p>P.O. Box 6111-00300</p>
        <p>Nairobi, Kenya</p>
        <p>Cell: +254722102951</p>
        <p>+254786102951</p>
      </AddressBlock>

      <SheetTitle>SERVICE INSTRUCTIONS SHEET</SheetTitle>

      <form onSubmit={handleSubmit} noValidate>
        <TwoColumn>
          <Column>
            <LabelGroup>
              <Label>NAME</Label>
              <Input name="name" value={form.name || ''} onChange={handleChange} />
              {errors.name && <ErrorText>{errors.name}</ErrorText>}
            </LabelGroup>
            <LabelGroup>
              <Label>P.O. BOX</Label>
              <Input name="poBox" value={form.poBox || ''} onChange={handleChange} />
            </LabelGroup>
            <LabelGroup>
              <Label>TEL. OFFICE</Label>
              <Input name="tel" value={form.tel || ''} onChange={handleChange} />
            </LabelGroup>
          </Column>

          <Column>
            <LabelGroup>
              <Label>DATE</Label>
              <Input name="date" type="date" value={form.date || ''} onChange={handleChange} />
              {errors.date && <ErrorText>{errors.date}</ErrorText>}
            </LabelGroup>
            <LabelGroup>
              <Label>TOWN</Label>
              <Input name="town" value={form.town || ''} onChange={handleChange} />
            </LabelGroup>
            <LabelGroup>
              <Label>MOBILE</Label>
              <Input name="mobile" value={form.mobile || ''} onChange={handleChange} />
              {errors.mobile && <ErrorText>{errors.mobile}</ErrorText>}
            </LabelGroup>
          </Column>
        </TwoColumn>

        <InputRow>
          <LabelGroup>
            <Label>MAKE</Label>
            <Input name="make" value={form.make || ''} onChange={handleChange} />
            {errors.make && <ErrorText>{errors.make}</ErrorText>}
          </LabelGroup>
          <LabelGroup>
            <Label>MODEL</Label>
            <Input name="model" value={form.model || ''} onChange={handleChange} />
            {errors.model && <ErrorText>{errors.model}</ErrorText>}
          </LabelGroup>
          <LabelGroup>
            <Label>REG. NO.</Label>
            <Input name="regNo" value={form.regNo || ''} onChange={handleChange} />
            {errors.regNo && <ErrorText>{errors.regNo}</ErrorText>}
          </LabelGroup>
          <LabelGroup>
            <Label>SPEEDO</Label>
            <Input name="speedo" value={form.speedo || ''} onChange={handleChange} />
          </LabelGroup>
        </InputRow>

        <Divider />

        <SubHeader>Please carry out the following repairs:</SubHeader>
        <RepairsBox name="repairs" value={form.repairs || ''} onChange={handleChange} />

        <CostRow>
          <CostGroup>
            <Label>Total Cost (KES)</Label>
            <Input
              name="totalCost"
              type="number"
              min="1"
              step="0.01"
              value={form.totalCost || ''}
              onChange={handleChange}
              placeholder="e.g. 5000"
            />
            {errors.totalCost && <ErrorText>{errors.totalCost}</ErrorText>}
          </CostGroup>
        </CostRow>

        <Divider />

        <CenteredText>
          I accept the conditions governing the acceptance of this vehicle as set out overleaf
        </CenteredText>
        <LabelGroup>
          <Label>Customer's Signature</Label>
          <SmallInput name="signature" value={form.signature || ''} onChange={handleChange} />
        </LabelGroup>

        <FooterNote>CARS DRIVEN AND STORED AT OWNER'S RISK</FooterNote>

        <BottomRow>
          <p style={{ color: '#000' }}><strong>JOB No.:</strong> {jobNo}</p>
        </BottomRow>

        <ButtonRow>
          <ActionButton type="submit">{isEditing ? 'Update Job Card' : 'Save Job Card'}</ActionButton>
          {showPrint && <ActionButton type="button" onClick={handlePrint}>Print Job Card</ActionButton>}
          <ActionButton type="button" onClick={handleBack}>Back</ActionButton>
        </ButtonRow>

        {successMsg && <DialogBox>{successMsg}</DialogBox>}
      </form>
    </PageContainer>
  );
};

export default JobCardForm;