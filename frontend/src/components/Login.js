// frontend/src/components/Login.js
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLock, FiLogIn, FiAlertCircle } from 'react-icons/fi';

// === Animations ===
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// === Styled Components ===

/* FIX: Fixed position + overflow hidden prevents scrolling completely */
const LoginWrapper = styled.div`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  
  /* Background Image Handling */
  background-image: url('/background1.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  /* Fallback color */
  background-color: #0f172a;
`;

/* Dark overlay to make the glass card pop */
const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 58, 138, 0.6) 100%);
  z-index: 1;
`;

const GlassCard = styled.div`
  position: relative;
  z-index: 10;
  background: rgba(255, 255, 255, 0.85); /* Milky glass */
  backdrop-filter: blur(20px);
  padding: 3rem 2.5rem;
  border-radius: 24px;
  box-shadow: 
    0 20px 50px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  width: 100%;
  max-width: 400px;
  text-align: center;
  animation: ${slideUp} 0.6s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Logo = styled.img`
  height: 60px;
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
`;

const Title = styled.h2`
  margin-bottom: 0.5rem;
  color: #1e293b;
  font-weight: 800;
  font-size: 1.8rem;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 2rem;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 1.25rem;
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1.2rem;
  transition: color 0.2s;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 3rem; /* Left padding for icon */
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: #f8fafc;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box; /* Critical for padding calculation */
  color: #334155;
  font-weight: 500;

  &:focus {
    border-color: #2563eb;
    background: white;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
  }

  &:focus + ${IconWrapper} {
    color: #2563eb;
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.9rem;
  margin-top: 0.5rem;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ErrorBox = styled.div`
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  animation: ${slideUp} 0.3s ease;
  font-weight: 500;
`;

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/homepage');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <LoginWrapper>
      <Overlay />
      
      <GlassCard>
        <Logo src="/logo.png" alt="Logo" />
        <Title>Welcome Back</Title>
        <Subtitle>Sign in to manage your garage</Subtitle>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <ErrorBox>
              <FiAlertCircle /> {error}
            </ErrorBox>
          )}

          <InputGroup>
            <StyledInput
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <IconWrapper>
              <FiUser />
            </IconWrapper>
          </InputGroup>

          <InputGroup>
            <StyledInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <IconWrapper>
              <FiLock />
            </IconWrapper>
          </InputGroup>

          <SubmitButton type="submit">
            Login <FiLogIn />
          </SubmitButton>
        </form>
      </GlassCard>
    </LoginWrapper>
  );
};

export default LoginForm;