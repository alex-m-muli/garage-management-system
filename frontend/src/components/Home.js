// Home.js
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  FiHome, FiUsers, FiSettings, FiFileText,
  FiList, FiGrid, FiLogOut, FiMenu, FiX
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

/* ---------------- Animations ---------------- */

const slideUp = keyframes`
  from { transform: translateY(24px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
`;

const bgZoom = keyframes`
  from { transform: scale(1.02); }
  to   { transform: scale(1.06); }
`;

/* ---------------- Layout ---------------- */

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
  background-image: url(${p => p.image});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: ${p => (p.$active ? 1 : 0)};
  transition: opacity 1.6s ease-in-out;
  z-index: -2;
  animation: ${bgZoom} 22s ease-in-out infinite alternate;
  will-change: transform, opacity;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.28) 0%,
    rgba(0,0,0,0.18) 45%,
    rgba(0,0,0,0.72) 100%
  );
`;

/* ---------------- Header ---------------- */

const Header = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 70px;
  width: 100%;
  box-sizing: border-box;
  z-index: 60;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%);
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  img {
    height: 38px;
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
  color: rgba(255,255,255,0.9);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  background: rgba(0,0,0,0.18);
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(255,255,255,0.06);
    transform: translateY(-2px);
  }

  &.active {
    background: #2563eb;
    color: white;
    box-shadow: 0 4px 12px rgba(37,99,235,0.35);
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
  gap: 8px;
  margin-left: 10px;
  transition: transform 0.18s;
  box-shadow: 0 4px 12px rgba(220,38,38,0.35);

  &:hover {
    background: #ef4444;
    transform: scale(1.03);
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
  background: rgba(15,23,42,0.98);
  padding: 5rem 1.5rem 2rem;
  z-index: 100;
  transform: translateX(${p => (p.$isOpen ? '0' : '100%')});
  transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: -12px 0 30px rgba(0,0,0,0.5);
`;

/* ---------------- Main content ---------------- */

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  text-align: center;
  padding: 0 1rem;
`;

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

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

/* fixed width so no layout shifting happens */
const TypedWord = styled.span`
  display: inline-block;
  min-width: 8ch;
  margin-left: 8px;  /* <-- controls spacing instead of JSX space or flex gap */
  font-weight: 900;
  color: #f8fafc;
  white-space: nowrap;
`;

const Caret = styled.span`
  display: inline-block;
  width: 2px;              /* slightly thicker */
  height: 1em;
  margin-left: 4px;
  background: #3b82f6;
  vertical-align: middle;
  border-radius: 1px;

  /* 3x slower blink than before */
  animation: blink 1590ms steps(1) infinite;

  @keyframes blink {
    50% { opacity: 0; }
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.35rem;
  color: rgba(255,255,255,0.95);
  margin-bottom: 3rem;
  max-width: 700px;
  line-height: 1.5;
  text-shadow: 0 2px 10px rgba(0,0,0,0.75);
  font-weight: 500;
  animation: ${slideUp} 1s ease forwards;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 1.05rem 2.6rem;
  border-radius: 50px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow:
    0 10px 30px rgba(0,0,0,0.4),
    inset 0 1px 0 rgba(255,255,255,0.12);
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${slideUp} 1.2s ease forwards;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(37,99,235,0.4);
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
  color: rgba(255,255,255,0.6);
  font-size: 0.85rem;
  z-index: 20;
`;

/* ---------------- Typing config ---------------- */

const FULL_WORD = 'Garage';

const TYPE_SPEED = 160;
const DELETE_SPEED = 90;
const HOLD_AFTER_TYPE = 2400;
const HOLD_AFTER_DELETE = 450;

/* ---------------- Component ---------------- */

const Home = () => {

  const { logout } = useAuth();
  const navigate = useNavigate();

  const backgrounds = [
    '/background.jpg',
    '/background2.jpg',
    '/background3.jpg'
  ];

  const [bgIndex, setBgIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  /* background rotation (unchanged behaviour) */
  useEffect(() => {
    const id = setInterval(() => {
      setBgIndex(prev => (prev + 1) % backgrounds.length);
    }, 11000);

    return () => clearInterval(id);
  }, [backgrounds.length]);

  /* simple smooth typing loop */
  useEffect(() => {
    let timer;

    if (!isDeleting && text === FULL_WORD) {
      timer = setTimeout(() => setIsDeleting(true), HOLD_AFTER_TYPE);
      return () => clearTimeout(timer);
    }

    if (isDeleting && text === '') {
      timer = setTimeout(() => setIsDeleting(false), HOLD_AFTER_DELETE);
      return () => clearTimeout(timer);
    }

    timer = setTimeout(() => {
      const next = isDeleting
        ? FULL_WORD.slice(0, text.length - 1)
        : FULL_WORD.slice(0, text.length + 1);

      setText(next);
    }, isDeleting ? DELETE_SPEED : TYPE_SPEED);

    return () => clearTimeout(timer);
  }, [text, isDeleting]);

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

      {backgrounds.map((bg, i) => (
        <AnimatedBackground
          key={i}
          image={bg}
          $active={i === bgIndex}
        />
      ))}

      <Overlay />

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

      <MobileDrawer $isOpen={mobileMenuOpen}>
        {navItems.map((item, idx) => (
          <NavItem
            key={idx}
            to={item.to}
            onClick={() => setMobileMenuOpen(false)}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            {item.icon} {item.label}
          </NavItem>
        ))}

        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '10px 0' }} />

        <LogoutBtn
          onClick={handleLogout}
          style={{ width: '100%', margin: 0, justifyContent: 'center' }}
        >
          <FiLogOut /> Logout
        </LogoutBtn>
      </MobileDrawer>

      <MainContent>

        <HeroTitle>
          <span>Welcome To Narayan Auto</span>
          <TypedWord>
            {text}
            <Caret />
          </TypedWord>
        </HeroTitle>

        <HeroSubtitle>
          Your Trusted Partner for Vehicle Maintenance & Repair.<br />
          Professional Service. Guaranteed Quality.
        </HeroSubtitle>

        <ActionButton onClick={() => navigate('/services')}>
          Access Dashboard
        </ActionButton>

      </MainContent>

      <Footer>
        © {new Date().getFullYear()} Narayan Limited. All rights reserved.
      </Footer>

    </HeroWrapper>
  );
};

export default Home;