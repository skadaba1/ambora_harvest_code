import React, { useState, useEffect } from 'react';
import './App.css';
import posthog from './posthog';
import Home from './Components/Home.js'
import Inputs from './Components2/Inputs.js';
import Website from './website/Website.js';
import Login from './website/Website/Login.js';
import JoinWaitlist from './website/Website/JoinWaitlist.js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MiniProjects from './website/Website/MiniProjects.js';
import { createTheme, ThemeProvider } from '@mui/material';

const customTheme = createTheme({
  typography: {
    fontFamily: 'PoppinsFont, sans-serif'
  },
});

function App() {
  useEffect(() => {
    // Automatically start session recording when the component mounts
    posthog.capture('$pageview');
  }, []);

  const basePath = process.env.REACT_APP_URL_EXT;

  return (
    <ThemeProvider theme={customTheme}>
      <Router>
        <Routes>
          <Route path={'/'} element={<Website />} />
          <Route path={'/login'} element={<Login />} />
          <Route path={'/join-waitlist'} element={<JoinWaitlist />} />
          <Route path={'/amborasocial'} element={<MiniProjects />} />
          <Route path={basePath} element={<Inputs />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
