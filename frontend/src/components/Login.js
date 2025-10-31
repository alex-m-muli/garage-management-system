// frontend/src/components/Login.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Styled Components
const LoginWrapper = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('/background1.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 1rem;
`;

const FormContainer = styled.div`
  background: rgba(255, 255, 255, 0.97);
  padding: 3rem 2rem 2.5rem;
  border-radius: 1.25rem;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 420px;
  text-align: center;
`;

const Logo = styled.img`
  height: 70px;
  margin-bottom: 1.25rem;
  margin-top: -1rem;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.15));
`;

const Title = styled.h2`
  margin-bottom: 1rem;
  color: #2b6cb0;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #2b6cb0;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background-color: #2c5282;
  }
`;

const Error = styled.p`
  color: #e53e3e;
  margin-bottom: 1rem;
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
      <FormContainer>
        <Logo src="/logo.png" alt="Narayan Logo" />
        <Title>Admin Login</Title>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <Error>{error}</Error>}
          <Button type="submit">Login</Button>
        </form>
      </FormContainer>
    </LoginWrapper>
  );
};

export default LoginForm;
