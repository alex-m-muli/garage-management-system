// frontend/src/components/Sidebar.js

import React, { useState } from 'react';
import styled from 'styled-components';
import {
  FiHome, FiTool, FiUsers, FiTruck, FiUserCheck,
  FiPackage, FiClipboard, FiList, FiMenu, FiBarChart2, FiLogOut, FiDatabase, FiX
} from 'react-icons/fi';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ==== Styled Components ====

const SidebarWrapper = styled.div`
  position: fixed;
  top: 64px; /* Matches TopBar Height */
  left: 0;
  height: calc(100vh - 64px);
  width: ${({ isOpen }) => (isOpen ? '260px' : '0')};
  
  /* --- UPDATE: MATCHING DARK THEME --- */
  background: #0f172a; /* Dark Slate to match TopBar base */
  border-right: 1px solid rgba(255,255,255,0.05);
  color: #cbd5e1; /* Light text */
  /* ---------------------------------- */

  overflow-x: hidden;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1050;
  display: flex;
  flex-direction: column;

  @media (min-width: 769px) {
    width: 260px;
  }
`;

const MobileOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  backdrop-filter: blur(2px);
  z-index: 1040;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const MenuToggleMobile = styled.button`
  position: fixed;
  top: 14px;
  left: 14px;
  z-index: 1200;
  
  /* FIX: White background with strong shadow for visibility */
  background: #ffffff; 
  color: #1e3a8a; /* Dark Blue Icon */
  
  border: none;
  font-size: 1.3rem;
  padding: 0.6rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3); 

  @media (min-width: 769px) {
    display: none;
  }
`;
const MenuList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0; /* Removing padding ensures scrollbar hits the very edge */
  flex: 1;
  overflow-y: auto;

  /* === ROBUST SIDEBAR SCROLLBAR === */
  
  /* 1. Make it wide enough to click/grab */
  &::-webkit-scrollbar {
    width: 14px; 
  }

  /* 2. Track (Background) - Matches Sidebar Dark Blue */
  &::-webkit-scrollbar-track {
    background: #0f172a; 
    border-left: 1px solid rgba(255,255,255,0.05); /* Separator line */
  }

  /* 3. Thumb (The Handle) - Gradient */
  &::-webkit-scrollbar-thumb {
    background-image: linear-gradient(to bottom, #334155 0%, #2563eb 100%);
    border: 3px solid #0f172a; /* Creates a padding effect so it looks floating */
    border-radius: 12px;
    min-height: 40px; /* Ensures handle is never too tiny */
  }

  &::-webkit-scrollbar-thumb:hover {
    background-image: linear-gradient(to bottom, #475569 0%, #3b82f6 100%);
    border-color: #0f172a;
  }

  /* 4. BUTTONS (The Arrows) - Re-enabling them */
  &::-webkit-scrollbar-button {
    display: block;
    height: 16px;
    width: 14px;
    background-color: #0f172a; /* Match track */
    background-repeat: no-repeat;
    background-position: center;
    background-size: 8px; /* Size of the arrow icon */
    cursor: pointer;
  }

  &::-webkit-scrollbar-button:hover {
    background-color: #1e293b; /* Slightly lighter on hover */
  }

  /* UP ARROW (SVG Data URI) */
  &::-webkit-scrollbar-button:vertical:decrement {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'><path d='M12 8l6 6H6z'/></svg>");
  }

  /* DOWN ARROW (SVG Data URI) */
  &::-webkit-scrollbar-button:vertical:increment {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'><path d='M12 16l-6-6h12z'/></svg>");
  }
`;

const MenuItem = styled.li`
  margin-bottom: 0.25rem;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  /* FIX: Default state is now LIGHT Gray (Legible on dark bg) */
  color: #cbd5e1; 

  svg {
    margin-right: 0.8rem;
    font-size: 1.2rem;
    color: #94a3b8; /* Muted icon color */
    transition: color 0.2s;
  }

  /* FIX: Hover state uses transparent white (Glassy) */
  &:hover {
    background-color: rgba(255, 255, 255, 0.1); 
    color: #ffffff; /* Pure white on hover */
    
    svg {
      color: #60a5fa; /* Light Blue Icon on hover */
    }
  }

  /* FIX: Active state uses bright blue accent */
  &.active {
    background: linear-gradient(90deg, rgba(37, 99, 235, 0.2) 0%, transparent 100%);
    color: #60a5fa; /* Poppy Light Blue */
    font-weight: 600;
    border-left: 3px solid #60a5fa;

    svg {
      color: #60a5fa;
    }
  }
`;

const FooterSection = styled.div`
  padding: 1rem;
  /* HARMONIZATION: This border must match the Footer.js border-top */
  border-top: 1px solid rgba(255, 255, 255, 0.05); 
  
  background: #0f172a; /* Ensure it matches base background */
  margin-top: auto; /* Pushes this section to the very bottom */
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  
  /* Glassy Red effect that pops on the Dark Blue */
  background: rgba(220, 38, 38, 0.15); 
  border: 1px solid rgba(220, 38, 38, 0.2);
  color: #fca5a5; /* Light Red Text */
  
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #dc2626; /* Solid Red on Hover */
    color: white;
    border-color: #dc2626;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  }
`;

const CategoryLabel = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  
  /* FIX: Lighter gray for headers */
  color: #64748b; 
  
  font-weight: 700;
  padding: 1.2rem 1rem 0.5rem;
  opacity: 0.8;
`;

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { to: "/homepage", icon: <FiHome />, label: "Dashboard" },
    { to: "/jobcard-management", icon: <FiClipboard />, label: "New Job Card" },
    { to: "/jobcard-list", icon: <FiList />, label: "Job Cards" },
    
    { category: "Operations" },
    { to: "/services", icon: <FiTool />, label: "Services" },
    { to: "/labor-tracking", icon: <FiTool />, label: "Labor Tracking" },
    { to: "/inventory-management", icon: <FiPackage />, label: "Inventory" },
    
    { category: "People" },
    { to: "/customer-dashboard", icon: <FiUsers />, label: "Customers" },
    { to: "/supplier-management", icon: <FiTruck />, label: "Suppliers" },
    { to: "/user-management", icon: <FiUserCheck />, label: "Staff" },
    
    { category: "System" },
    { to: "/reports-management", icon: <FiBarChart2 />, label: "Reports" },
    { to: "/backup-restore", icon: <FiDatabase />, label: "Backup" }
  ];

  return (
    <>
      <MenuToggleMobile onClick={toggleMenu}>
        {isOpen ? <FiX /> : <FiMenu />}
      </MenuToggleMobile>

      {/* Overlay for mobile to click-to-close */}
      <MobileOverlay isOpen={isOpen} onClick={() => setIsOpen(false)} />

      <SidebarWrapper isOpen={isOpen}>
        <MenuList>
          {menuItems.map((item, index) => (
            item.category ? (
              <CategoryLabel key={`cat-${index}`}>{item.category}</CategoryLabel>
            ) : (
              <MenuItem key={item.to}>
                <StyledNavLink to={item.to} onClick={() => setIsOpen(false)}>
                  {item.icon}<span>{item.label}</span>
                </StyledNavLink>
              </MenuItem>
            )
          ))}
        </MenuList>

        <FooterSection>
          <LogoutButton onClick={handleLogout}>
            <FiLogOut /> Logout
          </LogoutButton>
        </FooterSection>
      </SidebarWrapper>
    </>
  );
};

export default Sidebar;