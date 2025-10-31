// frontend/src/components/DashboardLayout.js

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import TopBar from './TopBar';   // Import your styled top bar
import Footer from './Footer';   // Import your styled footer

// === Layout Container for Sidebar + Content ===
const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f7fafc;
`;

// === Wrapper for topbar + main content + footer ===
const ContentArea = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin-left: ${({ collapsed, sidebarWidth }) =>
    collapsed ? '60px' : sidebarWidth};
  transition: margin-left 0.25s ease-in-out;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

// === Main area excluding topbar and footer ===
const MainContent = styled.main`
  flex-grow: 1;
  padding: 1.5rem;
`;

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = '240px';

  // Collapse sidebar on small screens automatically
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    handleResize(); // initial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

  return (
    <LayoutContainer>
      {/* Sidebar stays fixed */}
      <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} width={sidebarWidth} />

      {/* Right content area adjusts based on sidebar state */}
      <ContentArea collapsed={collapsed} sidebarWidth={sidebarWidth}>
        <TopBar />
        <MainContent>{children}</MainContent>
        <Footer />
      </ContentArea>
    </LayoutContainer>
  );
};

export default DashboardLayout;
