import React, { useState, useEffect } from 'react';
import './App.css';
// import posthog from './posthog';
import Home from './Components/Home.js'
import Website from './Website/Website.js';
import Login from './Website/Website/Login.js';
import JoinWaitlist from './Website/Website/JoinWaitlist.js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MiniProjects from './Website/Website/MiniProjects.js';
import { createTheme, ThemeProvider } from '@mui/material';

// const customTheme = createTheme({
//   typography: {
//     fontFamily: 'PoppinsFont, sans-serif'
//   },
// });

function App() {
  // useEffect(() => {
  //   // Automatically start session recording when the component mounts
  //   posthog.capture('$pageview');
  // }, []);

  const basePath = '/home';

  return (
    // <ThemeProvider theme={customTheme}>
      <Router>
        <Routes>
          <Route path={'/'} element={<Home />} />
          {/* <Route path={'/login'} element={<Login />} />
          <Route path={'/join-waitlist'} element={<JoinWaitlist />} />
          <Route path={'/amborasocial'} element={<MiniProjects />} />
          <Route path={basePath} element={<Home />} /> */}
        </Routes>
      </Router>
    // </ThemeProvider>
  );
}

export default App;
