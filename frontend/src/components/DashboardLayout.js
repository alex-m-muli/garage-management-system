// frontend/src/components/DashboardLayout.js

import React from 'react';
import styled, { createGlobalStyle } from 'styled-components'; // Added createGlobalStyle
import Sidebar from './Sidebar';
import TopBar from './TopBar';   
import Footer from './Footer';   

// === GLOBAL SCROLLBAR STYLES (Main Window) ===
const GlobalScrollbarStyle = createGlobalStyle`
  ::-webkit-scrollbar {
    width: 8px;   /* Slightly wider for the main page */
    height: 8px;  /* For horizontal scrollbars */
  }

  ::-webkit-scrollbar-track {
    background: #f1f5f9; 
  }

  ::-webkit-scrollbar-thumb {
    /* Gradient: Soft Sky Blue -> Periwinkle */
    background-image: linear-gradient(135deg, #93c5fd 0%, #818cf8 100%);
    border-radius: 4px;
    
    /* This creates a white border around the thumb, making it look like it's floating */
    border: 2px solid transparent;
    background-clip: content-box; 
  }

  ::-webkit-scrollbar-thumb:hover {
    /* Slightly deeper gradient on hover */
    background-image: linear-gradient(135deg, #60a5fa 0%, #6366f1 100%);
  }
`;

// === Main Content Wrapper ===
const MainContent = styled.main`
  /* 1. Push down so content isn't hidden behind Fixed TopBar */
  margin-top: 64px; 

  /* 2. Push right so content isn't hidden behind Fixed Sidebar */
  margin-left: 260px; 

  /* 3. Add padding at bottom so content isn't hidden behind Fixed Footer */
  padding-bottom: 80px; 

  /* 4. Layout & Theme */
  min-height: calc(100vh - 64px); 
  padding: 2rem;
  box-sizing: border-box;
  
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); 
  
  overflow-x: hidden;

  @media (max-width: 769px) {
    margin-left: 0;      
    padding: 1.5rem;     
    padding-bottom: 100px; 
  }
`;

const DashboardLayout = ({ children }) => {
  return (
    <>
      {/* Inject the Scrollbar Styles */}
      <GlobalScrollbarStyle />
      
      <TopBar />
      <Sidebar />
      
      <MainContent>
        {children}
      </MainContent>
      
      <Footer />
    </>
  );
};

export default DashboardLayout;