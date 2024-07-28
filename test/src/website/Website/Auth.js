import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { Typography } from '@mui/material';
import { REACT_APP_API_URL } from "../../consts";

const Auth = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAuth = async (event) => {
    event.preventDefault();
    setSuccessMessage('');
    const url = isLogin ? 'login/' : 'register/';
    try {
      const response = await axios.post(REACT_APP_API_URL + url, {
        username: username,
        password: password,
        ...(isLogin ? {} : { email: email }) // Include email if registering
      }, {
        withCredentials: true
      });
      if (isLogin) {
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('username', username);
        navigate(`${process.env.REACT_APP_URL_EXT}`);
      } else {
        setSuccessMessage('Account created successfully.');
        setUsername(''); // Clear username
        setPassword(''); // Clear password
        setEmail(''); // Clear email
        setIsLogin(true); // Switch back to login view
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 401) {
        setError('Invalid credentials. Please try again.');
      } else {
        setError('An unexpected error occurred');
      }
    }
  };
  
  return (
    <div style={{ width: '21%' }}>
      <form onSubmit={handleAuth}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10%' }}>
          <Typography style={{ fontSize: '16px' }} htmlFor="username">
            Username
          </Typography>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div style={{ display: !isLogin ? 'flex' : 'none', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10%' }}>
          <Typography style={{ fontSize: '16px' }} htmlFor="email">
            Email
          </Typography>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10%' }}>
          <Typography style={{ fontSize: '16px' }} htmlFor="password">
            Password
          </Typography>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <Typography style={{ color: 'red', fontSize: '14px', marginBottom: '5%'  }}>{error}</Typography>}
        {successMessage && <Typography style={{ color: 'green', fontSize: '14px', marginBottom: '5%'  }}>{successMessage}</Typography>}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <button
            className='login-btn'
            type="submit">
            {isLogin ? 'Login' : 'Register'}
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMessage(''); }}
          >
            <Typography style={{ fontSize: '14px', textDecoration: 'underline' }}>
              Switch to {isLogin ? 'Register' : 'Login'}
            </Typography>
          </button>
        </div>
      </form>
    </div>
  );
};  

export default Auth;