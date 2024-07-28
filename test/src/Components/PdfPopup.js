import React from 'react';

const PdfPopup = ({ pdfUrl, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '47.5%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '80%',
      height: '90%',
      backgroundColor: 'white',
      overflow: 'scroll',
      zIndex: 1000,
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      padding: '37px',
      boxSizing: 'border-box'
    }}>
      <iframe
        src={pdfUrl}
        style={{ width: '100%', height: '100%' }}
        frameBorder="0"
      />
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1001 }}
      >
        Close
      </button>
      <a href={pdfUrl} download="grant_application.pdf" style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 1001 }}>
        Download PDF
      </a>
    </div>
  );
};

export default PdfPopup;
