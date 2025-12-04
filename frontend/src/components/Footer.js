// frontend/src/components/Footer.js

import React from 'react';
import styled from 'styled-components';

const FooterWrapper = styled.footer`
  /* === POSITIONING FIXES === */
  position: fixed;
  bottom: 0;
  left: 0;        /* Start at the very left edge of the screen */
  width: 100%;    /* Span the full width of the viewport */
  
  /* CRITICAL: Set z-index lower than Sidebar (1050).
     This effectively hides the left 260px of the footer behind the sidebar,
     but allows the text to center relative to the FULL screen width.
  */
  z-index: 1040; 

  /* === STYLING HARMONY === */
  background-color: #0f172a; 
  color: #94a3b8; 
  border-top: 1px solid rgba(255, 255, 255, 0.1); 
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1); 
  
  /* Layout */
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center; /* This centers items perfectly in the viewport */
  font-size: 0.85rem;
  
  transition: all 0.3s ease;
`;

const Footer = () => {
  return (
    <FooterWrapper>
      © 2025 Narayan Limited. All rights reserved.
    </FooterWrapper>
  );
};

export default Footer;