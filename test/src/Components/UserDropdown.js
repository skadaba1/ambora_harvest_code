// UserDropdown.js
import React, { useState } from 'react';
import '../Styles/UserDropdown.css'; // Create a new CSS file for styling this component
import { useNavigate } from 'react-router-dom';

function UserDropdown({ userName }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const onLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('accessToken')
    navigate('/login');
  };

  return (
    <div className="user-dropdown">
      <button onClick={toggleDropdown} className="user-dropdown-button">
        {userName} &#9662; {/* Down arrow symbol */}
      </button>
      {isOpen && (
        <div className="user-dropdown-content">
          <button onClick={onLogout} className="user-dropdown-logout">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default UserDropdown;
