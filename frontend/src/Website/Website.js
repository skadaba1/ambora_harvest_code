import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Hero from './Website/Hero';
import HeroBio from './Website/HeroBio';
import Login from './Website/Login';
import MiniProjects from "./Website/MiniProjects";

const AppContent = () => {

  return (
      <div style={{ height: '100vh' }}>
        <HeroBio />
      </div>
  );
};

function Website() {
  return (
    <AppContent />
  );
}

export default Website;