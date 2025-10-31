import React from 'react';
import { NavLink } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FiHome, FiFileText, FiPlusCircle, FiSettings, FiX } from 'react-icons/fi';

const Dropdown = styled.div`
  position: absolute;
  top: 60px;
  left: 1rem;
  background: rgba(26, 32, 44, 0.97);
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  z-index: 25;
  animation: ${keyframes`from{opacity: 0} to{opacity: 1}`} 0.3s ease-in;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  float: right;
  cursor: pointer;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem 0;
  color: #e2e8f0;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;

  &.active {
    color: #90cdf4;
  }

  &:hover {
    color: #bee3f8;
  }
`;

const SidebarDropdown = ({ closeMenu }) => (
  <Dropdown>
    <CloseBtn onClick={closeMenu}><FiX /></CloseBtn>
    <NavItem to="/" onClick={closeMenu}><FiHome />Dashboard</NavItem>
    <NavItem to="/jobcard-list" onClick={closeMenu}><FiFileText />Job Cards</NavItem>
    <NavItem to="/jobcard-management" onClick={closeMenu}><FiPlusCircle />New Job Card</NavItem>
    <NavItem to="/settings" onClick={closeMenu}><FiSettings />Settings</NavItem>
  </Dropdown>
);

export default SidebarDropdown;