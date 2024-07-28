import React, { useState } from 'react';
import '../Styles/ArrowButton.css'; // Import the CSS for styling

const ArrowButton = ({ onClick, isSidebarOpen}) => {
  const [isOpen, setIsOpen] = useState(isSidebarOpen);

  // Function to toggle the isOpen state and run any additional onClick functionality
  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (onClick) {
      onClick(!isOpen);
    }
  };

  // Set the class for the arrow direction based on the isOpen state
  const arrowClass = isOpen ? 'arrow left' : 'arrow right';

  // Apply dynamic styling to the outermost div based on isOpen
  const containerStyle = {
      width: isOpen ? '0px' : '2%',
      backgroundColor: isOpen ? 'rgba(240, 240, 240, 1)' : 'rgba(255,255,255,255)',
  };

  return (
    <div style={containerStyle}>
        <button className="arrow-button" onClick={toggleOpen}>
        <div className={arrowClass}></div>
        </button>
    </div>
  );
};

export default ArrowButton;
