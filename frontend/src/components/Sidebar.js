// frontend/src/components/Sidebar.js

import React, { useState } from 'react';
import styled from 'styled-components';
import {
  FiHome, FiTool, FiUsers, FiTruck, FiUserCheck,
  FiPackage, FiClipboard, FiList, FiMenu, FiBarChart2, FiLogOut, FiDatabase
} from 'react-icons/fi';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ==== Styled Components ====
const SidebarWrapper = styled.div`
  position: fixed;
  top: 64px;
  left: 0;
  height: calc(100vh - 64px);
  width: ${({ isOpen }) => (isOpen ? '240px' : '0')};
  background-color: #1a202c;
  color: #e2e8f0;
  overflow-x: hidden;
  transition: width 0.3s ease-in-out;
  z-index: 1050;

  @media (min-width: 769px) {
    width: 240px;
  }
`;

const MenuToggleMobile = styled.button`
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 1200;
  background: #1a202c;
  border: none;
  color: #e2e8f0;
  font-size: 1.4rem;
  padding: 0.5rem;
  border-radius: 6px;
  display: block;
  cursor: pointer;

  @media (min-width: 769px) {
    display: none;
  }
`;

const MenuList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0.75rem 0.5rem 1rem;
  height: calc(100% - 3rem);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #4a5568;
    border-radius: 3px;
  }
`;

const MenuItem = styled.li`
  margin: 0.25rem 0;
`;

const MenuLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 0.65rem 1rem;
  font-size: 0.95rem;
  color: #cbd5e1;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.25s ease;

  svg {
    margin-right: 0.65rem;
    font-size: 1.1rem;
  }

  &.active {
    background-color: #2b6cb0;
    color: white;
  }

  &:hover {
    background-color: #2d3748;
    color: white;
  }
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 0.65rem 1rem;
  background: #e53e3e;
  border: none;
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin: 1rem 0 0.25rem 0;

  &:hover {
    background-color: #c53030;
  }
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
    { to: "/homepage", icon: <FiHome />, label: "Home" },
    { to: "/services", icon: <FiTool />, label: "Services" },
    { to: "/customer-dashboard", icon: <FiUsers />, label: "Customers" },
    { to: "/supplier-management", icon: <FiTruck />, label: "Suppliers" },
    { to: "/labor-tracking", icon: <FiTool />, label: "Labor Tracking" },
    { to: "/user-management", icon: <FiUserCheck />, label: "Users" },
    { to: "/inventory-management", icon: <FiPackage />, label: "Inventory" },
    { to: "/jobcard-management", icon: <FiClipboard />, label: "New Jobcard" },
    { to: "/jobcard-list", icon: <FiList />, label: "Manage Jobcards" },
    { to: "/reports-management", icon: <FiBarChart2 />, label: "Reports" },
    { to: "/backup-restore", icon: <FiDatabase />, label: "Backup" }
  ];

  return (
    <>
      <MenuToggleMobile onClick={toggleMenu}><FiMenu /></MenuToggleMobile>

      <SidebarWrapper isOpen={isOpen}>
        <MenuList>
          {menuItems.map(({ to, icon, label }) => (
            <MenuItem key={to}>
              <MenuLink to={to} onClick={() => setIsOpen(false)}>
                {icon}<span>{label}</span>
              </MenuLink>
            </MenuItem>
          ))}

          <MenuItem>
            <LogoutButton onClick={handleLogout}><FiLogOut /> Logout</LogoutButton>
          </MenuItem>
        </MenuList>
      </SidebarWrapper>
    </>
  );
};

export default Sidebar;
