// frontend/src/components/JobCardPrintView.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Page, Text, View, Document, StyleSheet, Image, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f2f2f2',
    padding: 40,
    fontFamily: 'Times-Roman',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#4a6fa5',
    position: 'relative',
  },
  watermark: {
    position: 'absolute',
    top: '35%',
    left: '25%',
    opacity: 0.08,
    width: 300,
  },
  topTitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#b22222',
  },
  addressBlock: {
    fontSize: 9,
    textAlign: 'right',
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 10,
    textDecoration: 'underline',
    color: '#2c5282',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  column: {
    width: '30%',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  field: {
    border: '1px solid #aaa',
    padding: 6,
    borderRadius: 3,
    marginBottom: 6,
    color: '#000',
  },
  divider: {
    borderTopWidth: 2,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
    marginVertical: 10,
  },
  repairsBox: {
    border: '1px solid #aaa',
    padding: 10,
    fontSize: 14,
    minHeight: 100,
    borderRadius: 4,
    marginBottom: 10,
    color: '#000',
  },
  centerText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  footerNote: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 11,
    marginTop: 20,
    color: '#b22222',
  },
});

const JobCardPDF = ({ card }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Watermark Image */}
      <Image src="/logo.png" style={styles.watermark} />

      <Text style={styles.topTitle}>NARAYAN LIMITED</Text>
      <View style={styles.addressBlock}>
        <Text>P.O. Box 6111-00300</Text>
        <Text>Nairobi, Kenya</Text>
        <Text>Cell: +254722102951</Text>
        <Text>+254786102951</Text>
      </View>
      <Text style={styles.sheetTitle}>SERVICE INSTRUCTIONS SHEET</Text>

      <View style={styles.row}>
        {[['NAME', card.name], ['P.O. BOX', card.poBox], ['TEL. OFFICE', card.tel]].map(([label, value], i) => (
          <View style={styles.column} key={i}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.field}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.row}>
        {[['DATE', card.date], ['TOWN', card.town], ['MOBILE', card.mobile]].map(([label, value], i) => (
          <View style={styles.column} key={i}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.field}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.row}>
        {[['MAKE', card.make], ['MODEL', card.model], ['REG. NO.', card.regNo], ['SPEEDO', card.speedo]].map(([label, value], i) => (
          <View key={i} style={{ width: '23%' }}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.field}>{value}</Text>
    </View>
  ))}
</View>


      <View style={styles.divider} />

      <Text style={styles.label}>Please carry out the following repairs:</Text>
      <Text style={styles.repairsBox}>{card.repairs}</Text>

      {/* TOTAL COST */}
      {card.totalCost && (
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.label}>Total Cost (KES)</Text>
          <Text style={styles.field}>{card.totalCost}</Text>
        </View>
      )}

      <View style={styles.divider} />

      <Text style={styles.centerText}>
        I accept the conditions governing the acceptance of this vehicle as set out overleaf
      </Text>

      <Text style={styles.label}>Customer's Signature</Text>
      <Text style={[styles.field, { width: '40%' }]}>{card.signature}</Text>

      <Text style={styles.footerNote}>CARS DRIVEN AND STORED AT OWNER'S RISK</Text>
      <Text style={{ marginTop: 10 }}>
        <Text style={{ fontWeight: 'bold', color: '#2c5282' }}>JOB No.:</Text>{' '}
        <Text style={{ color: '#000' }}>{card.jobNo}</Text>
      </Text>
    </Page>
  </Document>
);

const JobCardPrintView = () => {
  const { id } = useParams();
  const [card, setCard] = useState(null);
  const [showDialog, setShowDialog] = useState(true);
  const [printStatus, setPrintStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobCard = async () => {
      const res = await axios.get(`http://localhost:5000/api/jobcards/${id}`);
      setCard(res.data);
    };
    fetchJobCard();
  }, [id]);

  const handlePrint = async () => {
    const blob = await pdf(<JobCardPDF card={card} />).toBlob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `JobCard_${card.jobNo}.pdf`;
    link.click();
    setShowDialog(false);
    setPrintStatus('success');
  };

  const handleCancel = () => {
    setShowDialog(false);
    setPrintStatus('cancelled');
  };

  if (!card) return <p>Loading...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      {showDialog ? (
        <div style={{ textAlign: 'center', background: '#edf2f7', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#2c5282' }}>Print the Jobcard?</p>
          <button
            onClick={handlePrint}
            style={{ marginRight: '1rem', padding: '0.7rem 1.5rem', backgroundColor: '#2c5282', color: '#fff', border: 'none', borderRadius: '5px' }}>
            YES
          </button>
          <button
            onClick={handleCancel}
            style={{ padding: '0.7rem 1.5rem', backgroundColor: '#e53e3e', color: '#fff', border: 'none', borderRadius: '5px' }}>
            NO
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ fontSize: '1rem', color: '#4a5568' }}>
            {printStatus === 'success' ? 'Print successful.' : 'Print cancelled.'}
          </p>
          <button
            onClick={() => navigate('/jobcard-list')}
            style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '5px' }}>
            Back to Form
          </button>
        </div>
      )}
    </div>
  );
};

export default JobCardPrintView;
