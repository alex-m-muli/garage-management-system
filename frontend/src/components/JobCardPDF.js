import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

const logo = require('../assets/logo.png');

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
    top: '30%',
    left: '20%',
    opacity: 0.08,
    width: '60%',
  },
  topTitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: 'bold',
    color: '#b22222',
  },
  addressBlock: {
    fontSize: 9,
    textAlign: 'right',
    marginBottom: 10,
    lineHeight: 1.3,
  },
  sheetTitle: {
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 10,
    textDecoration: 'underline',
    color: '#2c5282',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  column: {
    width: '30%',
  },
  columnSmall: {
    width: '23%',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#000',
  },
  field: {
    border: '1px solid #aaa',
    padding: 6,
    borderRadius: 3,
    marginBottom: 6,
    color: '#000',
    minHeight: 18,
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
    fontSize: 12,
    minHeight: 100,
    borderRadius: 4,
    marginBottom: 10,
    color: '#000',
  },
  centerText: {
    textAlign: 'center',
    marginVertical: 8,
    fontSize: 11,
  },
  footerNote: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 11,
    marginTop: 20,
    color: '#b22222',
  },
  costContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  costBox: {
    width: '35%',
    textAlign: 'right',
  },
  jobNoText: {
    marginTop: 12,
    fontSize: 11,
    color: '#000',
  },
});

const JobCardPDF = ({ card }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Watermark */}
      <Image src={logo} style={styles.watermark} />

      <Text style={styles.topTitle}>NARAYAN LIMITED</Text>

      <View style={styles.addressBlock}>
        <Text>P.O. Box 6111-00300</Text>
        <Text>Nairobi, Kenya</Text>
        <Text>Cell: +254722102951</Text>
        <Text>+254786102951</Text>
      </View>

      <Text style={styles.sheetTitle}>SERVICE INSTRUCTIONS SHEET</Text>

      {/* First Row */}
      <View style={styles.row}>
        {[['NAME', card.name], ['P.O. BOX', card.poBox], ['TEL. OFFICE', card.tel]].map(
          ([label, value], i) => (
            <View style={styles.column} key={i}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.field}>{value || ''}</Text>
            </View>
          )
        )}
      </View>

      {/* Second Row */}
      <View style={styles.row}>
        {[['DATE', card.date], ['TOWN', card.town], ['MOBILE', card.mobile]].map(
          ([label, value], i) => (
            <View style={styles.column} key={i}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.field}>{value || ''}</Text>
            </View>
          )
        )}
      </View>

      {/* Third Row with SPEEDO */}
      <View style={styles.row}>
        {[['MAKE', card.make], ['MODEL', card.model], ['REG. NO.', card.regNo], ['SPEEDO', card.speedo]].map(
          ([label, value], i) => (
            <View style={styles.columnSmall} key={i}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.field}>{value || ''}</Text>
            </View>
          )
        )}
      </View>

      <View style={styles.divider} />

      {/* Repairs Section */}
      <Text style={styles.label}>Please carry out the following repairs:</Text>
      <Text style={styles.repairsBox}>{card.repairs || ''}</Text>

      {/* Total Cost */}
      {card.totalCost && (
        <View style={styles.costContainer}>
          <View style={styles.costBox}>
            <Text style={styles.label}>Total Cost (KES)</Text>
            <Text style={styles.field}>{card.totalCost}</Text>
          </View>
        </View>
      )}

      <View style={styles.divider} />

      {/* Declaration */}
      <Text style={styles.centerText}>
        I accept the conditions governing the acceptance of this vehicle as set out overleaf
      </Text>

      {/* Signature */}
      <View style={styles.costContainer}>
        <View style={styles.costBox}>
          <Text style={styles.label}>Customer's Signature</Text>
          <Text style={styles.field}>{card.signature || ''}</Text>
        </View>
      </View>

      <Text style={styles.footerNote}>CARS DRIVEN AND STORED AT OWNER'S RISK</Text>

      {/* Job No. */}
      <Text style={styles.jobNoText}>
        <Text style={{ fontWeight: 'bold', color: '#2c5282' }}>JOB No.:</Text>{' '}
        <Text>{card.jobNo}</Text>
      </Text>
    </Page>
  </Document>
);

export default JobCardPDF;
