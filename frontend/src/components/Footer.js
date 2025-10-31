// frontend/src/components/Footer.js

import React from 'react';
import styled from 'styled-components';

const FooterWrapper = styled.footer`
  background-color: #1a202c;
  color: #e2e8f0;
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
  margin-top: auto;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.8rem;
  }
`;

const Footer = () => {
  return (
    <FooterWrapper>
      © 2025 Narayan Limited. All rights reserved.
    </FooterWrapper>
  );
};

export default Footer;
