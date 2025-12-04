// frontend/src/components/TopBar.js

import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiMenu } from 'react-icons/fi';

// === Top bar container ===
const TopBarWrapper = styled.header`
  position: fixed; /* FIXED: Changed from sticky to fixed to remove gaps */
  top: 0;
  left: 0;
  width: 100%;
  height: 64px;
  z-index: 1100; /* Must be higher than Sidebar (1050) */
  
  /* Dark Bluish Tint Background */
  background: linear-gradient(90deg, #0f172a 0%, #1e3a8a 100%);
  color: white;
  
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 1rem;
    padding-left: 3.5rem; /* Space for the mobile menu toggle */
  }
`;

// === Left side containing logo and name ===
const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

// === Logo wrapper ===
const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff; 
  padding: 6px 10px; 
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
`;

const Logo = styled.img`
  height: 32px;
  width: auto;
  object-fit: contain;
`;

const CompanyName = styled.h1`
  font-size: 1.35rem;
  font-weight: 800;
  color: #ffffff; 
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  letter-spacing: 0.5px;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(230, 16, 16, 0.93); /* Glassy Red */
  color:rgb(241, 235, 235);
  border: 1px solid rgba(229, 62, 62, 0.3);
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background:rgb(250, 5, 5);
    color: white;
    border-color: #e53e3e;
    box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
  }
  
  @media (max-width: 600px) {
    span { display: none; } /* Hide text on mobile */
    padding: 0.5rem;
  }
`;

const TopBar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <TopBarWrapper>
      <LeftSection>
        <LogoWrapper>
          <Logo src="/logo.png" alt="Logo" />
        </LogoWrapper>
        <CompanyName>Narayan Limited</CompanyName>
      </LeftSection>

      <RightSection>
        <LogoutButton onClick={handleLogout}>
          <FiLogOut /> <span>Logout</span>
        </LogoutButton>
      </RightSection>
    </TopBarWrapper>
  );
};

export default TopBar;