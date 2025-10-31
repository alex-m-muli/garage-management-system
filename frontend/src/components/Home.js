// Home.js
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  FiHome, FiUsers, FiSettings, FiFileText, FiTruck,
  FiTool, FiDatabase, FiClipboard, FiList, FiGrid, FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

// === Animations ===
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const fakeScrollOut = keyframes`
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-100px); opacity: 0; }
`;

// === Styled Components ===
const HeroWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const AnimatedBackground = styled.div`
  position: fixed;
  inset: 0;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: ${props => (props.active ? 1 : 0)};
  transition: opacity 1.5s ease-in-out;
  z-index: -2;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: -1;
`;

const TopMenu = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.8rem 2rem;
  background: rgba(26, 32, 44, 0.95);
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LogoImg = styled.img`
  height: 40px;
  width: auto;
`;

const MenuLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const MenuLink = styled(NavLink)`
  color: #e2e8f0;
  text-decoration: none;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.3s;

  &.active {
    background: #2b6cb0;
  }

  &:hover {
    background: #4a5568;
    color: white;
  }
`;

const LogoutButton = styled.button`
  background: #e53e3e;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #c53030;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
  padding: 5rem 2rem 2rem;
  animation: ${fadeIn} 1s ease-in;
  animation-name: ${props => props.exiting ? fakeScrollOut : fadeIn};
  animation-duration: 0.6s;
  animation-fill-mode: forwards;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  animation: ${slideUp} 1s ease forwards;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  max-width: 700px;
  margin: 0 auto 2rem;
  animation: ${slideUp} 1.2s ease forwards;
`;

const CTAButton = styled.button`
  background: linear-gradient(to right, #2b6cb0, #3182ce);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: background 0.3s ease, transform 0.2s ease;
  animation: ${slideUp} 1.4s ease forwards;

  &:hover {
    background: linear-gradient(to right, #2563eb, #1d4ed8);
    transform: scale(1.05);
  }
`;

const Footer = styled.footer`
  background: rgba(0, 0, 0, 0.75);
  color: #cbd5e0;
  padding: 1.5rem 1rem;
  text-align: center;
  font-size: 0.95rem;
  position: relative;
`;

// === Component ===
const Home = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const backgrounds = ['/background.jpg', '/background2.jpg', '/background3.jpg'];
  const [bgIndex, setBgIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % backgrounds.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCTA = () => {
    setExiting(true);
    setTimeout(() => navigate('/services'), 500); // route after animation
  };

  return (
    <HeroWrapper>
      {backgrounds.map((bg, i) => (
        <AnimatedBackground key={i} image={bg} active={i === bgIndex} />
      ))}
      <Overlay />

      <TopMenu>
        <LogoContainer>
          <LogoImg src="/logo.png" alt="Narayan Logo" />
        </LogoContainer>

        <MenuLinks>
          <MenuLink to="/homepage"><FiHome /> Home</MenuLink>
          <MenuLink to="/services"><FiSettings /> Services</MenuLink>
          <MenuLink to="/customer-dashboard"><FiUsers /> Customers</MenuLink>
          <MenuLink to="/supplier-management"><FiTruck /> Suppliers</MenuLink>
          <MenuLink to="/labor-tracking"><FiTool /> Labor</MenuLink>
          <MenuLink to="/user-management"><FiGrid /> Users</MenuLink>
          <MenuLink to="/inventory-management"><FiDatabase /> Inventory</MenuLink>
          <MenuLink to="/jobcard-management"><FiClipboard /> New Jobcard</MenuLink>
          <MenuLink to="/jobcard-list"><FiList /> Jobcards</MenuLink>
          <MenuLink to="/reports-management"><FiFileText /> Reports</MenuLink>
          <LogoutButton onClick={handleLogout}><FiLogOut /> Logout</LogoutButton>
        </MenuLinks>
      </TopMenu>

      <Content exiting={exiting}>
        <Title>Welcome to Narayan Limited</Title>
        <Subtitle>Your Trusted Garage For Your Vehicle</Subtitle>
        <CTAButton onClick={handleCTA}>View Our Services</CTAButton>
      </Content>

      <Footer>
        © 2025 Narayan Limited. All rights reserved.
      </Footer>
    </HeroWrapper>
  );
};

export default Home;
