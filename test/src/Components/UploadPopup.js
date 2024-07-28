import React, { useEffect, useRef, useState } from 'react';
import { REACT_APP_API_URL } from "../consts";
import '../Styles/UploadPopup.css';

const UploadPopup = ({ onClose, popupFileInputRef, handleUpload, fetchFiles, setIsLoading }) => {
  const popupRef = useRef();
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleUrlSubmit = async () => {
    onClose();
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');      
      const response = await fetch(REACT_APP_API_URL + 'upload-url/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          url: url,
          selectedFileIds: JSON.parse(sessionStorage.getItem('selectedFileIds')),
        }),
      });

      if (response.status === 201) {
        const result = await response.json();
        setIsLoading(false);
        fetchFiles();
        console.log(result);
      } else {
        const errorData = await response.json();
        console.error('Error uploading URL:', errorData.error);
      }
    } catch (error) {
      console.error('Error uploading URL:', error);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px',
        height: showUrlInput ? '150px' : '200px',
        backgroundColor: 'white',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '15px',
      }}
      ref={popupRef}
    >
      {showUrlInput ? (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '20px' }}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL"
            style={{
              padding: '10px',
              marginBottom: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              width: '100%',
            }}
          />
          <button
            className='submit-url'
            style={{
              padding: '10px',
              backgroundColor: '#cfe7dc',
              color: 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: '0.5s',
            }}
            onClick={handleUrlSubmit}
          >
            Submit URL
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', padding: '20px', borderRadius: '5px' }}>
          <label 
            className='upload-btn upload-file'
            style={{
              backgroundColor: '#a1d3e2',
              marginBottom: '20px',
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            Upload Files
            <input
              type="file"
              multiple
              onChange={(event) => {
                onClose()
                handleUpload(event, 0, 'reference')
              }}
              style={{ display: 'none' }}
            />
          </label>
          <button
            className='upload-btn upload-url'
            style={{
              backgroundColor: '#cfe7dc',
            }}
            onClick={() => setShowUrlInput(true)}
          >
            Upload URL
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadPopup;
