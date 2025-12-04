import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import logo from '../assets/logo.png';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff', // Changed to white for cleaner print
    padding: 30, // Reduced padding to ensure single page
    fontFamily: 'Helvetica', // Standard font for reliability
    fontSize: 10,
    lineHeight: 1.4,
    color: '#334155',
    position: 'relative',
  },
  watermark: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    opacity: 0.08,
    width: '60%',
    zIndex: -1,
  },
  // === HEADER STYLING (Matches JobCardForm) ===
  logo: {
    width: 60,
    height: 60,
    alignSelf: 'center',
    marginBottom: 5,
  },
  topTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: 'bold',
    color: '#1e293b', // Matched Slate Color
    textTransform: 'uppercase',
  },
  addressBlock: {
    fontSize: 9,
    textAlign: 'center', // Centered like the form
    marginBottom: 15,
    lineHeight: 1.3,
    color: '#64748b', // Matched Muted Color
  },
  sheetTitle: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
    textDecoration: 'underline',
    color: '#2563eb', // Matched Blue Accent
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // === ORIGINAL LAYOUT PRESERVED ===
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8, // Slightly tighter to fit page
  },
  column: {
    width: '32%',
  },
  columnSmall: {
    width: '24%', // 4 items in row
  },
  label: {
    fontWeight: 'bold',
    fontSize: 8,
    marginBottom: 2,
    color: '#475569',
    textTransform: 'uppercase',
  },
  field: {
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    padding: 5,
    borderRadius: 4,
    marginBottom: 2,
    color: '#0f172a',
    minHeight: 20,
    fontSize: 10,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    borderTopStyle: 'solid',
    marginVertical: 10,
  },
  repairsBox: {
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    padding: 10,
    fontSize: 10,
    minHeight: 120, // Reduced slightly to ensure single page
    borderRadius: 4,
    marginBottom: 10,
    color: '#0f172a',
  },
  centerText: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 9,
    color: '#64748b',
    fontStyle: 'italic',
  },
  footerNote: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 9,
    marginTop: 15,
    color: '#ef4444', // Red warning
  },
  costContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  costBox: {
    width: '40%',
    textAlign: 'right',
  },
  jobNoText: {
    marginTop: 10,
    fontSize: 9,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

const JobCardPDF = ({ card }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Watermark */}
      <Image src={logo} style={styles.watermark} />

      {/* Header Section (Logo Added) */}
      <Image src={logo} style={styles.logo} />
      <Text style={styles.topTitle}>NARAYAN LIMITED</Text>

      <View style={styles.addressBlock}>
        <Text>P.O. Box 6111-00300, Nairobi, Kenya</Text>
        <Text>Cell: +254 722 102 951 | +254 786 102 951</Text>
      </View>

      <Text style={[styles.sheetTitle, {marginBottom: 20}]}>
        Service Instructions Sheet</Text>
      {/* First Row (3 Columns) */}
      <View style={styles.row}>
        {[
          ['NAME', card.name], 
          ['P.O. BOX', card.poBox], 
          ['TEL. OFFICE', card.tel]
        ].map(([label, value], i) => (
            <View style={styles.column} key={i}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.field}>{value || ' '}</Text>
            </View>
          )
        )}
      </View>

      {/* Second Row (3 Columns) */}
      <View style={styles.row}>
        {[
          ['DATE', card.date ? new Date(card.date).toLocaleDateString() : ''], 
          ['TOWN', card.town], 
          ['MOBILE', card.mobile]
        ].map(([label, value], i) => (
            <View style={styles.column} key={i}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.field}>{value || ' '}</Text>
            </View>
          )
        )}
      </View>

      {/* Third Row (4 Columns - EXACTLY AS REQUESTED) */}
      <View style={styles.row}>
        {[
          ['MAKE', card.make], 
          ['MODEL', card.model], 
          ['REG. NO.', card.regNo], 
          ['SPEEDO', card.speedo]
        ].map(([label, value], i) => (
            <View style={styles.columnSmall} key={i}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.field}>{value || ' '}</Text>
            </View>
          )
        )}
      </View>

      <View style={styles.divider} />

      {/* Repairs Section */}
      <Text style={[styles.label, { marginTop: 20 }]}>Please carry out the following repairs:</Text>
      <Text style={styles.repairsBox}>{card.repairs || ''}</Text>

      {/* Total Cost */}
      <View style={styles.costContainer}>
        <View style={styles.costBox}>
          <Text style={styles.label}>Total Cost (KES)</Text>
          <Text style={[styles.field, { fontWeight: 'bold' }]}>
            {card.totalCost ? Number(card.totalCost).toLocaleString() : '0.00'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Declaration */}
      <Text style={styles.centerText}>
        I accept the conditions governing the acceptance of this vehicle as set out overleaf
      </Text>

      {/* Signature */}
      <View style={styles.costContainer}>
        <View style={styles.costBox}>
          <Text style={styles.label}>Customer's Signature</Text>
          <Text style={[styles.field, { height: 30 }]}>{card.signature || ''}</Text>
        </View>
      </View>

      <Text style={styles.footerNote}>CARS DRIVEN AND STORED AT OWNER'S RISK</Text>

      {/* Job No. */}
      <Text style={styles.jobNoText}>JOB No.: {card.jobNo}</Text>
    </Page>
  </Document>
);

export default JobCardPDF;