// frontend/src/components/ReportsDashboard.js
import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

// ===== Styled Components =====
const Container = styled.div`
  padding: 2rem;
  background-color: #f8fafc;
  border-radius: 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  max-width: 800px;
  margin: 2rem auto;

  @media (max-width: 600px) {
    padding: 1.2rem;
  }
`;

const Title = styled.h2`
  margin-bottom: 1rem;
  color: #2b6cb0;
  text-align: center;
`;

const ControlRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  justify-content: center;
`;

const Label = styled.label`
  font-weight: 600;
  color: #2d3748;
  min-width: 80px;
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #cbd5e0;
  min-width: 160px;
`;

const Input = styled.input`
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #cbd5e0;
  width: 90px;
  text-align: center;

  &::placeholder {
    color: #a0aec0;
  }
`;

const Button = styled.button`
  padding: 0.6rem 1.2rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease;

  &:hover {
    background-color: #1e40af;
  }
`;

const ErrorBox = styled.div`
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 500;
`;

// ===== Component Logic =====
const ReportsDashboard = () => {
  const [reportType, setReportType] = useState('labor');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [customError, setCustomError] = useState('');

  const handleExport = async () => {
    try {
      let url =
        reportType === 'labor'
          ? `/api/labor/report/summary?month=${month}&year=${year}`
          : `/api/inventory/report/summary`;

      const res = await axios.get(url);

      if (!res.data || res.data.length === 0) {
        setCustomError(`No ${reportType} data to export for the selected filters.`);
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
      }

      setCustomError('');
    } catch (err) {
      console.error(err);
      setCustomError('Something went wrong during export.');
    }
  };

  return (
    <Container>
      <Title>Reports Dashboard</Title>

      {customError && <ErrorBox>{customError}</ErrorBox>}

      <ControlRow>
        <Label>Report Type:</Label>
        <Select value={reportType} onChange={e => setReportType(e.target.value)}>
          <option value="labor">Labor Report</option>
          <option value="inventory">Inventory Report</option>
        </Select>

        {reportType === 'labor' && (
          <>
            <Label>Month:</Label>
            <Input
              type="number"
              placeholder="MM"
              min="1"
              max="12"
              value={month}
              onChange={e => setMonth(e.target.value)}
            />

            <Label>Year:</Label>
            <Input
              type="number"
              placeholder="YYYY"
              min="2000"
              max="2100"
              value={year}
              onChange={e => setYear(e.target.value)}
            />
          </>
        )}

        <Button onClick={handleExport}>Export</Button>
      </ControlRow>
    </Container>
  );
};

export default ReportsDashboard;
