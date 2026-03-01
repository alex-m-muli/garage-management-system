import React, { useEffect, useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import {
  FiHome, FiUsers, FiSettings, FiFileText,
  FiList, FiGrid, FiLogOut, FiMenu, FiX
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

// === Keyframe Animations ===
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const blinkCursor = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
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
  transition: background-image 1.5s ease-in-out;
  z-index: -2;
  /* Niche refinement: subtle breathing effect */
  animation: breathing 20s ease-in-out infinite;

  @keyframes breathing {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.08); }
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    /* Darker gradient at bottom for text contrast */
    background: linear-gradient(
      to bottom, 
      rgba(15, 23, 42, 0.3) 0%, 
      rgba(15, 23, 42, 0.85) 100%
    );
    z-index: -1;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 5%;
  background: transparent;
  z-index: 100;
`;

const Logo = styled.div`
  font-size: 1.4rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.5px;
  cursor: pointer;
  text-transform: uppercase;

  span {
    color: #3b82f6; /* Narayan Blue */
  }
`;

const DesktopNav = styled.nav`
  display: flex;
  gap: 1rem;
  align-items: center;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const NavItem = styled(NavLink)`
  text-decoration: none;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  padding: 8px 14px;
  border-radius: 8px;

  &:hover, &.active {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const LogoutBtn = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 9px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  margin-left: 10px;

  &:hover {
    background: #dc2626;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }
`;

const MobileToggle = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.8rem;
  display: none;
  cursor: pointer;

  @media (max-width: 1024px) {
    display: block;
  }
`;

const MobileDrawer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background: #1e293b;
  padding: 80px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(${props => (props.$isOpen ? '0' : '100%')});
  z-index: 90;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 24px;
  color: white;
  animation: ${slideUp} 0.8s ease-out forwards;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.2rem, 8vw, 4.2rem);
  font-weight: 900;
  margin-bottom: 0.8rem;
  letter-spacing: -1.5px;
  line-height: 1.1;
  min-height: 1.2em; /* Reserves space to prevent jumping */
`;

const Cursor = styled.span`
  color: #3b82f6;
  font-weight: 200;
  animation: ${blinkCursor} 0.8s infinite;
  margin-left: 4px;
`;

const HeroSubtitle = styled.p`
  font-size: clamp(1rem, 2vw, 1.3rem);
  color: rgba(255, 255, 255, 0.85);
  max-width: 750px;
  line-height: 1.6;
  margin-bottom: 2.5rem;
  
  /* Initial hidden state */
  opacity: 0;
  transform: translateY(10px);
  
  /* Step 2 Trigger */
  ${props => props.$isVisible && css`
    animation: ${fadeIn} 1.2s ease-out forwards;
  `}
`;

const ActionButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 16px 40px;
  font-size: 1.05rem;
  font-weight: 700;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);

  &:hover {
    background: #2563eb;
    transform: scale(1.05);
    box-shadow: 0 15px 30px rgba(59, 130, 246, 0.4);
  }

  /* Sync with subtitle fade */
  opacity: 0;
  ${props => props.$isVisible && css`
    animation: ${fadeIn} 1.2s ease-out 0.4s forwards;
  `}
`;

// === Main Component ===

const Home = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  // Niche refinement: High-quality professional garage imagery
  const backgrounds = [
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=1920',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920',
    'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=1920'
  ];

  const [bgIndex, setBgIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Typing state
  const [displayText, setDisplayText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const fullText = "Welcome To Narayan Auto Garage";

  const navItems = [
    { to: "/", label: "Home", icon: <FiHome /> },
    { to: "/job-card", label: "Job Cards", icon: <FiFileText /> },
    { to: "/customers", label: "Customers", icon: <FiUsers /> },
    { to: "/services", label: "Services", icon: <FiList /> },
    { to: "/inventory", label: "Inventory", icon: <FiGrid /> },
    { to: "/users", label: "Staff", icon: <FiSettings /> },
  ];

  // Logic: Background rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex(prev => (prev + 1) % backgrounds.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [backgrounds.length]);

  // Logic: Lightweight Typing Effect
  useEffect(() => {
    let index = 0;
    const speed = 65; // ms per char
    
    // Delay start until entrance animation is halfway
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayText(fullText.slice(0, index));
        index++;
        
        if (index > fullText.length) {
          clearInterval(interval);
          setIsTypingComplete(true); // Trigger Step 2: Subtitle Fade
        }
      }, speed);

      return () => clearInterval(interval);
    }, 500);

    return () => clearTimeout(startTimeout);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <HeroWrapper>
      <AnimatedBackground image={backgrounds[bgIndex]} />
      
      <Header>
        <Logo onClick={() => navigate('/')}>
          Narayan <span>Garage</span>
        </Logo>

        <DesktopNav>
          {navItems.map((item, idx) => (
            <NavItem key={idx} to={item.to} end={item.to === "/"}>
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

      <MobileDrawer $isOpen={mobileMenuOpen}>
        {navItems.map((item, idx) => (
          <NavItem key={idx} to={item.to} onClick={() => setMobileMenuOpen(false)}>
            {item.icon} {item.label}
          </NavItem>
        ))}
        <div style={{height: '1px', background: 'rgba(255,255,255,0.1)', margin: '15px 0'}} />
        <LogoutBtn onClick={handleLogout} style={{width: '100%', margin: 0, justifyContent: 'center'}}>
           <FiLogOut /> Logout
        </LogoutBtn>
      </MobileDrawer>

      <MainContent>
          <HeroTitle>
            {displayText}
            {!isTypingComplete && <Cursor>|</Cursor>}
          </HeroTitle>
          
          <HeroSubtitle $isVisible={isTypingComplete}>
            Your Trusted Partner for Vehicle Maintenance & Repair.<br/>
            Professional Service. Guaranteed Quality.
          </HeroSubtitle>
          
          <ActionButton $isVisible={isTypingComplete} onClick={() => navigate('/job-card')}>
            Get Started
          </ActionButton>
      </MainContent>

    </HeroWrapper>
  );
};

export default Home;