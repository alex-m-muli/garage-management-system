// frontend/src/components/ReportsDashboard.js
import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { FaFileDownload, FaChartBar, FaCalendarAlt, FaFileCsv, FaFileExcel, FaExclamationCircle } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- CRITICAL: Fallback URL (Aligned with Services.js) ---
const API_BASE_URL = process.env.REACT_APP_API_URL
// ===== Styled Components & Theme (Aligned with Services.js) =====
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

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
  text-align: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
`;

const Subtitle = styled.span`
  margin-top: 8px;
  font-size: 0.95rem;
  color: var(--muted);
`;

/* Glass Card Style from Services.js */
const Card = styled.div`
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.6) 100%
  );
  backdrop-filter: blur(14px);
  border-radius: var(--radius-md);
  border: 1px solid rgba(17, 24, 39, 0.04);
  padding: 2rem;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;

  /* Decorative top line */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #2563eb, #7c3aed);
  }
`;

const ControlGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  align-items: end;
  margin-bottom: 1.5rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 6px;
`;

/* Input/Select styling matched to Services.js Modal Inputs */
const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e6eef8;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.15s ease;
  background: #fbfdff;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 4px 12px rgba(37,99,235,0.1);
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e6eef8;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.15s ease;
  background: #fbfdff;
  cursor: pointer;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 4px 12px rgba(37,99,235,0.1);
  }
`;

/* Primary Button matched to Services.js AddButton */
const ExportButton = styled.button`
  background: linear-gradient(180deg, #3380ff 0%, #1f66e6 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  cursor: pointer;
  box-shadow: var(--deep-shadow);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  height: 46px; /* Match input height roughly */
  margin-top: auto;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

/* Error Box Styling */
const ErrorBox = styled.div`
  background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);
  color: #9f1239;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 600;
  border: 1px solid rgba(220, 38, 38, 0.1);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.05);
`;

const IconWrapper = styled.span`
  color: var(--accent);
  display: inline-flex;
`;

// ===== Component Logic =====
const ReportsDashboard = () => {
  const [reportType, setReportType] = useState('labor');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [customError, setCustomError] = useState('');

  const handleExport = async () => {
    // Basic validation visualization via toast
    if (reportType === 'labor' && (!month || !year)) {
        toast.info('Please specify both month and year for labor reports.');
    }

    try {
      // Use API_BASE_URL to align with Services.js architecture
      let url =
        reportType === 'labor'
          ? `${API_BASE_URL}/api/labor/report/summary?month=${month}&year=${year}`
          : `${API_BASE_URL}/api/inventory/report/summary`;

      const res = await axios.get(url);

      if (!res.data || res.data.length === 0) {
        setCustomError(`No ${reportType} data found for these filters.`);
        toast.warn(`No data found for ${reportType} report.`);
        return;
      }

      if (reportType === 'labor') {
        const csv = [
          ['Technician', 'Cars Worked On', 'Total Hours'],
          ...res.data.map(e => [e.technician, e.carsWorkedOn, e.totalHours])
        ]
          .map(row => row.join(','))
          .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `labor_report_${month || 'all'}_${year || 'all'}.csv`);
        toast.success('Labor report downloaded successfully!');
      } else {
        const cleanData = res.data.map(({ itemName, quantity, unitPrice, totalPrice }) => ({
          itemName,
          quantity,
          unitPrice,
          totalPrice
        }));

        const worksheet = XLSX.utils.json_to_sheet(cleanData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory Report');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, 'inventory_report.xlsx');
        toast.success('Inventory report downloaded successfully!');
      }

      setCustomError('');
    } catch (err) {
      console.error(err);
      setCustomError('Connection failed or server error.');
      toast.error('Failed to export report.');
    }
  };

  return (
    <Root>
      <Container>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
        
        <Header>
          <Title>Reports Dashboard</Title>
          <Subtitle>Generate financial and operational insights</Subtitle>
        </Header>

        <Card>
          {customError && (
            <ErrorBox>
              <FaExclamationCircle size={20} />
              {customError}
            </ErrorBox>
          )}

          <ControlGrid>
            <FormGroup>
              <Label><FaChartBar /> Report Type</Label>
              <StyledSelect value={reportType} onChange={e => setReportType(e.target.value)}>
                <option value="labor">Labor Efficiency (CSV)</option>
                <option value="inventory">Inventory Valuation (XLSX)</option>
              </StyledSelect>
            </FormGroup>

            {reportType === 'labor' && (
              <>
                <FormGroup>
                  <Label><FaCalendarAlt /> Month (1-12)</Label>
                  <StyledInput
                    type="number"
                    placeholder="e.g. 10"
                    min="1"
                    max="12"
                    value={month}
                    onChange={e => setMonth(e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label><FaCalendarAlt /> Year</Label>
                  <StyledInput
                    type="number"
                    placeholder="e.g. 2025"
                    min="2000"
                    max="2100"
                    value={year}
                    onChange={e => setYear(e.target.value)}
                  />
                </FormGroup>
              </>
            )}

            <ExportButton onClick={handleExport}>
              <FaFileDownload />
              {reportType === 'labor' ? 'Export CSV' : 'Export Excel'}
            </ExportButton>
          </ControlGrid>

           {/* Helper/Info Section */}
           <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #eee', color: '#94a3b8', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconWrapper><FaFileCsv /></IconWrapper> Labor uses CSV
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconWrapper><FaFileExcel /></IconWrapper> Inventory uses XLSX
                </span>
              </div>
           </div>

        </Card>
      </Container>
    </Root>
  );
};

export default ReportsDashboard;