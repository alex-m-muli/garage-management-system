// Home.js
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  FiHome, FiUsers, FiSettings, FiFileText,
  FiList, FiGrid, FiLogOut, FiMenu, FiX
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

// === Styled Components ===

/* FIX: position: fixed + inset: 0 prevents ANY scrolling */
const HeroWrapper = styled.div`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  background: #0f172a; /* Fallback color */
`;

const AnimatedBackground = styled.div`
  position: absolute;
  inset: 0;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: ${props => (props.$active ? 1 : 0)};
  transition: opacity 1.5s ease-in-out;
  z-index: -2;
  /* Subtle zoom effect for premium feel */
  transform: scale(1.02);
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  /* Darker gradient at bottom to make footer/button legible */
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.3) 0%,
    rgba(0,0,0,0.2) 50%,
    rgba(0,0,0,0.7) 100%
  );
  z-index: -1;
`;

/* === Header / Navigation === */
const Header = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 70px;
  width: 100%;
  box-sizing: border-box; /* Ensures padding doesn't add width */
  z-index: 50;
  /* Very subtle gradient for top bar visibility */
  background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%);
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  img {
    height: 38px;
    width: auto;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
  }
  
  h2 {
    color: white;
    font-size: 1.25rem;
    margin: 0;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  }
`;

const DesktopNav = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;

  @media (max-width: 1100px) {
    display: none;
  }
`;

const NavItem = styled(NavLink)`
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 50px; /* Pill shape */
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  background: rgba(0, 0, 0, 0.2); /* Slight tint for readability */
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    transform: translateY(-2px);
  }

  &.active {
    background: #2563eb;
    color: white;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
  }
`;

const LogoutBtn = styled.button`
  background: #dc2626;
  border: none;
  color: white;
  padding: 0.5rem 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 10px;
  transition: transform 0.2s;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);

  &:hover {
    background: #ef4444;
    transform: scale(1.05);
  }
`;

const MobileToggle = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.8rem;
  cursor: pointer;
  display: none;
  z-index: 101;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
  
  @media (max-width: 1100px) {
    display: block;
  }
`;

const MobileDrawer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 280px;
  background: rgba(15, 23, 42, 0.98);
  padding: 5rem 1.5rem 2rem;
  z-index: 100;
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: -10px 0 30px rgba(0,0,0,0.5);
`;

/* === Main Content === */
const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 0 1rem;
`;

const HeroTitle = styled.h1`
  font-size: 4rem;
  font-weight: 900;
  margin: 0 0 1rem;
  color: white;
  /* Heavy text shadow replaces the glass card background */
  text-shadow: 0 4px 25px rgba(0,0,0,0.6); 
  letter-spacing: -1px;
  animation: ${slideUp} 0.8s ease forwards;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.35rem;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 3rem;
  max-width: 700px;
  line-height: 1.5;
  text-shadow: 0 2px 10px rgba(0,0,0,0.8);
  font-weight: 500;
  animation: ${slideUp} 1s ease forwards;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 1.2rem 3rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  /* Strong shadow to lift button off background */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${slideUp} 1.2s ease forwards;
  letter-spacing: 0.5px;
  text-transform: uppercase;

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 20px 40px rgba(37, 99, 235, 0.5);
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }
`;

const Footer = styled.footer`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  z-index: 20;
  text-shadow: 0 1px 2px rgba(0,0,0,0.8);
`;

// === Component ===
const Home = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const backgrounds = ['/background.jpg', '/background2.jpg', '/background3.jpg'];
  const [bgIndex, setBgIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % backgrounds.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: "/homepage", icon: <FiHome />, label: "Home" },
    { to: "/services", icon: <FiSettings />, label: "Services" },
    { to: "/jobcard-list", icon: <FiList />, label: "Job Cards" },
    { to: "/customer-dashboard", icon: <FiUsers />, label: "Customers" },
    { to: "/user-management", icon: <FiGrid />, label: "Staff" },
    { to: "/reports-management", icon: <FiFileText />, label: "Reports" },
  ];

  return (
    <HeroWrapper>
      {/* Background Layer */}
      {backgrounds.map((bg, i) => (
        <AnimatedBackground key={i} image={bg} $active={i === bgIndex} />
      ))}
      <Overlay />

      {/* Header */}
      <Header>
        <LogoSection>
          <img src="/logo.png" alt="Logo" />
          <h2>Narayan Garage</h2>
        </LogoSection>

        <DesktopNav>
          {navItems.map((item, idx) => (
            <NavItem key={idx} to={item.to}>
              {item.icon} {item.label}
            </NavItem>
          ))}
          <LogoutBtn onClick={handleLogout}>
            <FiLogOut /> Logout
          </LogoutBtn>
        </DesktopNav>

        <MobileToggle onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </MobileToggle>
      </Header>

      {/* Mobile Drawer */}
      <MobileDrawer $isOpen={mobileMenuOpen}>
        {navItems.map((item, idx) => (
          <NavItem key={idx} to={item.to} onClick={() => setMobileMenuOpen(false)} style={{width: '100%', justifyContent:'flex-start'}}>
            {item.icon} {item.label}
          </NavItem>
        ))}
        <div style={{height: '1px', background: 'rgba(255,255,255,0.1)', margin: '10px 0'}}></div>
        <LogoutBtn onClick={handleLogout} style={{width: '100%', margin: 0, justifyContent: 'center'}}>
           <FiLogOut /> Logout
        </LogoutBtn>
      </MobileDrawer>

      {/* Content - No Box, Just Text */}
      <MainContent>
          <HeroTitle>Welcome To Narayan Garage</HeroTitle>
          <HeroSubtitle>
            Your Trusted Partner for Vehicle Maintenance & Repair.<br/>
            Professional Service. Guaranteed Quality.
          </HeroSubtitle>
          <ActionButton onClick={() => navigate('/services')}>
            Access Dashboard
          </ActionButton>
      </MainContent>

      <Footer>
        © 2025 Narayan Limited. All rights reserved.
      </Footer>
    </HeroWrapper>
  );
};

export default Home;