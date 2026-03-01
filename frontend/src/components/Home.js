// Home.js
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  FiHome, FiUsers, FiSettings, FiFileText,
  FiList, FiGrid, FiLogOut, FiMenu, FiX
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

/*
  Home.js - Regenerated
  - Adds a smooth looping typing + deleting effect on the last word "Garage"
  - Uses only React + styled-components (no extra heavy libs)
  - Keeps original nav, mobile drawer, backgrounds, and logo
  - Small visual refinements: subtle animated overlay, blinking caret
  - Plenty of inline comments to explain changes and knobs to tune
*/

/* =========================
   Animation helpers
   ========================= */
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

/* subtle animated radial overlay to make content pop on all backgrounds */
const pulseOverlay = keyframes`
  0% { transform: scale(1); opacity: 0.04; }
  50% { transform: scale(1.03); opacity: 0.08; }
  100% { transform: scale(1); opacity: 0.04; }
`;

/* =========================
   Styled components
   ========================= */

/* change from fixed to relative + min-height:100vh so page can still scroll if needed
   This is a small usability fix while keeping the original full-screen hero feel. */
const HeroWrapper = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  background: #0f172a; /* Fallback color */
`;

/* Background images (kept exactly as before, but we add a subtle transform and transition) */
const AnimatedBackground = styled.div`
  position: absolute;
  inset: 0;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: ${props => (props.$active ? 1 : 0)};
  transition: opacity 1.5s ease-in-out, transform 8s linear;
  z-index: -3;
  transform: ${props => (props.$active ? 'scale(1.03)' : 'scale(1.02)')};
`;

/* darker gradient overlay with a soft animated pulse -- keeps backgrounds but improves contrast */
const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.28) 0%,
    rgba(0,0,0,0.22) 45%,
    rgba(0,0,0,0.72) 100%
  );
  z-index: -2;
  animation: ${pulseOverlay} 12s ease-in-out infinite;
`;

/* Header / Navigation (mostly preserved) */
const Header = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 70px;
  width: 100%;
  box-sizing: border-box;
  z-index: 50;
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
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(255, 255, 255, 0.08);
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

/* Main content center area */
const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 6rem 1rem 4rem;
`;

/* Title styles (we split static & dynamic parts for the typing effect) */
const HeroTitle = styled.h1`
  font-size: 4rem;
  font-weight: 900;
  margin: 0 0 1rem;
  color: white;
  text-shadow: 0 4px 25px rgba(0,0,0,0.6);
  letter-spacing: -1px;
  animation: ${slideUp} 0.8s ease forwards;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

/* Static part (everything except the last word) */
const StaticPart = styled.span`
  color: white;
  font-weight: 900;
`;

/* Typing word container:
   - min-width uses ch so the layout doesn't jump as letters are typed/deleted
   - we use a monospace fallback for the dynamic area to make caret/typing feel consistent */
const TypingWord = styled.span`
  display: inline-block;
  min-width: 7ch; /* "Garage" is 6 letters, so 7ch gives a small buffer */
  font-family: 'Inter', ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', monospace;
  font-weight: 900;
  letter-spacing: -0.5px;
  position: relative;
  white-space: nowrap;
  color: #f8fafc;
  -webkit-font-smoothing: antialiased;
  /* caret is handled by ::after */
`;

/* blinking caret implemented via pseudo-element for cleaner markup */
const Caret = styled.span`
  display: inline-block;
  width: 2px;
  height: 1.05em;
  margin-left: 6px;
  background: rgba(255,255,255,0.85);
  border-radius: 1px;
  animation: blink 1s steps(1) infinite;
  @keyframes blink { 50% { opacity: 0 } }
`;

/* Subtitle and action button (kept similar) */
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

/* =========================
   Typing effect configuration
   ========================= */

/*
  NOTES:
  - We target only the word "Garage" for typing/deleting.
  - Tweak the constants below to change speeds and pauses.
*/
const TYPING_WORD = 'Garage';
const TYPING_SPEED = 90;      // ms per character when typing
const DELETING_SPEED = 55;    // ms per character when deleting
const DELAY_AFTER_TYPE = 900; // ms to wait after full word typed
const DELAY_AFTER_DELETE = 300; // ms to wait after fully deleted

/* =========================
   Component
   ========================= */
const Home = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const backgrounds = ['/background.jpg', '/background2.jpg', '/background3.jpg'];
  const [bgIndex, setBgIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Typing effect state:
  const [typed, setTyped] = useState('');      // current visible substring of TYPING_WORD
  const [isDeleting, setIsDeleting] = useState(false);

  /* Background rotation (kept same timing as original, slight improvement for smoothness)
     cycles every 7s */
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % backgrounds.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  /* Typing effect loop
     - types the word letter by letter
     - when fully typed, pauses, then deletes letter by letter
     - when fully deleted, pauses then restarts typing
  */
  useEffect(() => {
    let timeoutId;

    const handleTyping = () => {
      const full = TYPING_WORD;
      if (!isDeleting) {
        // typing forward
        const next = full.substring(0, typed.length + 1);
        setTyped(next);

        if (next === full) {
          // finished typing: pause then start deleting
          timeoutId = setTimeout(() => setIsDeleting(true), DELAY_AFTER_TYPE);
        } else {
          timeoutId = setTimeout(handleTyping, TYPING_SPEED);
        }
      } else {
        // deleting
        const next = full.substring(0, Math.max(0, typed.length - 1));
        setTyped(next);

        if (next === '') {
          // finished deleting: pause then start typing
          timeoutId = setTimeout(() => setIsDeleting(false), DELAY_AFTER_DELETE);
        } else {
          timeoutId = setTimeout(handleTyping, DELETING_SPEED);
        }
      }
    };

    // Start the cycle (or continue it)
    timeoutId = setTimeout(handleTyping, isDeleting ? DELETING_SPEED : TYPING_SPEED);

    return () => clearTimeout(timeoutId);
    // typed & isDeleting are dependencies so we react to their changes
  }, [typed, isDeleting]);

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
      {/* Backgrounds - preserved images */}
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

        <MobileToggle onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </MobileToggle>
      </Header>

      {/* Mobile Drawer */}
      <MobileDrawer $isOpen={mobileMenuOpen} aria-hidden={!mobileMenuOpen}>
        {navItems.map((item, idx) => (
          <NavItem
            key={idx}
            to={item.to}
            onClick={() => setMobileMenuOpen(false)}
            style={{width: '100%', justifyContent:'flex-start'}}
          >
            {item.icon} {item.label}
          </NavItem>
        ))}
        <div style={{height: '1px', background: 'rgba(255,255,255,0.1)', margin: '10px 0'}} />
        <LogoutBtn onClick={handleLogout} style={{width: '100%', margin: 0, justifyContent: 'center'}}>
           <FiLogOut /> Logout
        </LogoutBtn>
      </MobileDrawer>

      {/* Main hero content */}
      <MainContent>
        {/* Title: static part + dynamic typing part */}
        <HeroTitle>
          <StaticPart>Welcome To Narayan Auto</StaticPart>
          <TypingWord
            role="status"
            aria-live="polite"
            aria-atomic="true"
            title={`Narayan Auto ${TYPING_WORD}`}
          >
            {typed}
            <Caret aria-hidden="true" />
          </TypingWord>
        </HeroTitle>

        <HeroSubtitle>
          Your Trusted Partner for Vehicle Maintenance & Repair.<br/>
          Professional Service. Guaranteed Quality.
        </HeroSubtitle>

        <ActionButton onClick={() => navigate('/services')}>
          Access Dashboard
        </ActionButton>
      </MainContent>

      <Footer>
        © 2026 Narayan Limited. All rights reserved.
      </Footer>
    </HeroWrapper>
  );
};

export default Home;