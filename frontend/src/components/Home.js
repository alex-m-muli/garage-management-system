// Home.js
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Typewriter } from 'react-simple-typewriter';
import {
  FiHome, FiUsers, FiSettings, FiFileText,
  FiList, FiGrid, FiLogOut, FiMenu, FiX
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

// === Animations ===

const slideUp = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const cinematicPan = keyframes`
  0% { transform: scale(1.02) translate(0, 0); }
  50% { transform: scale(1.08) translate(-1%, -1%); }
  100% { transform: scale(1.02) translate(0, 0); }
`;

// Professional Cursor Blink (Standard 1.06s cycle)
const standardBlink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const buttonShine = keyframes`
  0% { left: -100%; }
  20% { left: 100%; }
  100% { left: 100%; }
`;

// === Styled Components ===

const HeroWrapper = styled.div`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  background: #0f172a;
`;

const AnimatedBackground = styled.div`
  position: absolute;
  inset: 0;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: ${props => (props.$active ? 1 : 0)};
  transition: opacity 5s ease-in-out; 
  z-index: -2;
  will-change: transform, opacity;
  animation: ${cinematicPan} 30s ease-in-out infinite alternate;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(15, 23, 42, 0.4) 0%,
    rgba(15, 23, 42, 0.3) 50%,
    rgba(15, 23, 42, 0.85) 100%
  );
  z-index: -1;
`;

const Header = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 80px;
  width: 100%;
  box-sizing: border-box;
  z-index: 50;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%);
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  img { height: 42px; width: auto; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.6)); }
  h2 { color: white; font-size: 1.35rem; margin: 0; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.8); }
`;

const DesktopNav = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  @media (max-width: 1100px) { display: none; }
`;

const NavItem = styled(NavLink)`
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  padding: 0.6rem 1.2rem;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  &:hover { background: rgba(255, 255, 255, 0.1); color: white; }
  &.active { background: rgba(37, 99, 235, 0.9); color: white; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4); }
`;

const LogoutBtn = styled.button`
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.6rem 1.4rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center; gap: 8px;
  margin-left: 12px;
  transition: all 0.3s ease;
  &:hover { background: #ef4444; transform: scale(1.05); }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 0 1.5rem;
`;

const HeroTitle = styled.h1`
  font-size: 4.5rem;
  font-weight: 900;
  margin: 0 0 1rem;
  color: white;
  text-shadow: 0 4px 25px rgba(0,0,0,0.8); 
  display: flex;
  flex-wrap: nowrap; /* Prevents wrapping which causes the 'jump' */
  align-items: center;
  justify-content: center;
  gap: 15px;
  animation: ${slideUp} 0.8s ease forwards;
  
  @media (max-width: 768px) { font-size: 2.2rem; gap: 8px; flex-wrap: wrap; }
`;

/* FIXED WIDTH LOGIC:
   The min-width ensures that 'Workshop' (the longest word) doesn't push the 
   'Welcome' text around. Text-align: left ensures the typing grows outward.
*/
const TypedWordWrapper = styled.div`
  display: inline-block;
  min-width: 320px; 
  text-align: left;
  color: #60a5fa; 
  position: relative;

  /* Bulletproof Thin Cursor Fix */
  .react-simple-typewriter-cursor {
    color: transparent !important; /* Hide the actual character */
    display: inline-block;
    width: 2px !important; /* The physical width of the line */
    height: 1em;
    background-color: #3b82f6 !important; /* Use background to create the line */
    margin-left: 4px;
    vertical-align: middle;
    animation: ${standardBlink} 1.06s step-end infinite !important;
  }

  @media (max-width: 768px) { min-width: auto; text-align: center; }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3.5rem;
  max-width: 650px;
  line-height: 1.6;
  text-shadow: 0 2px 10px rgba(0,0,0,0.9);
  animation: ${slideUp} 1s ease forwards;
`;

const ActionButton = styled.button`
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 50%, #1e3a8a 100%);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.2rem 3.5rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${slideUp} 1.2s ease forwards;
  letter-spacing: 1px;
  text-transform: uppercase;

  &:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(37, 99, 235, 0.6); }

  &::after {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 50%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: ${buttonShine} 10s infinite;
  }
`;

const Footer = styled.footer`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  z-index: 20;
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
    }, 12000); 
    return () => clearInterval(interval);
  }, [backgrounds.length]);

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
      {backgrounds.map((bg, i) => (
        <AnimatedBackground key={i} image={bg} $active={i === bgIndex} />
      ))}
      <Overlay />

      <Header>
        <LogoSection>
          <img src="/logo.png" alt="Logo" />
          <h2>Narayan Garage</h2>
        </LogoSection>

        <DesktopNav>
          {navItems.map((item, idx) => (
            <NavItem key={idx} to={item.to}>{item.icon} {item.label}</NavItem>
          ))}
          <LogoutBtn onClick={() => { logout(); navigate('/login'); }}><FiLogOut /> Logout</LogoutBtn>
        </DesktopNav>

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          style={{background:'none', border:'none', color:'white', fontSize:'2rem', cursor:'pointer', display: window.innerWidth < 1100 ? 'block' : 'none'}}
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </Header>

      <MainContent>
        <HeroTitle>
          <span>Welcome To Narayan Auto</span>
          <TypedWordWrapper>
            <Typewriter
              words={['Garage']}
              loop={0}
              cursor
              cursorStyle='|'
              typeSpeed={250}   // Requested speed: very slow and professional
              deleteSpeed={150}  
              delaySpeed={4000}  
            />
          </TypedWordWrapper>
        </HeroTitle>
        
        <HeroSubtitle>
          Your Trusted Partner for Vehicle Maintenance & Repair.<br/>
          Professional Service. Guaranteed Quality.
        </HeroSubtitle>
        
        <ActionButton onClick={() => navigate('/services')}>
          Access Dashboard
        </ActionButton>
      </MainContent>

      <Footer>© {new Date().getFullYear()} Narayan Limited. All rights reserved.</Footer>
    </HeroWrapper>
  );
};

export default Home;