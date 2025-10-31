// frontend/src/components/TopBar.js

import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';

// === Top bar container ===
const TopBarWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: 1000;
  height: 64px;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 0 0.75rem;
  }
`;

// === Left side containing logo and name ===
const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

// === Logo wrapper ===
const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 0.25rem;

  @media (max-width: 768px) {
    margin-left: 1.5rem;
  }
`;

const Logo = styled.img`
  height: 42px;
  width: auto;
  object-fit: contain;
`;

const CompanyName = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2b6cb0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  @media (max-width: 768px) {
    font-size: 1.25rem;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
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
  gap: 0.5rem;
  background: #e53e3e;
  color: #fff;
  border: none;
  padding: 0.45rem 0.9rem;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #c53030;
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
          <Logo src="/logo.png" alt="Narayan Logo" />
        </LogoWrapper>
        <CompanyName>Narayan Limited</CompanyName>
      </LeftSection>

      <RightSection>
        <LogoutButton onClick={handleLogout}>
          <FiLogOut /> Logout
        </LogoutButton>
      </RightSection>
    </TopBarWrapper>
  );
};

export default TopBar;