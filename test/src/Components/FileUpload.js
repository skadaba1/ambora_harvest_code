import React, { useState, useEffect } from 'react';
import { FaTrash, FaTags, FaPlus } from 'react-icons/fa';
import "../Styles/FileUpload.css"
import { REACT_APP_API_URL } from "../consts";
import CircularProgress from '@mui/material/CircularProgress';// Assuming you have Material-UI installed
import Form from './Form.js';
import UploadPopup from './UploadPopup.js';

const organizationColors = {
  'reference': 'black',
  'grantor': 'green',
  'grantee': 'blue',
};

const FileUploadComponent = ({ selectedSession, selectedFileIds, setSelectedFileIds }) => {
  const [files, setFiles] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [inputs, setInputs] = useState(['']);
  const referenceFiles = files.filter(file => file.file_organization === 'reference');
  const grantorFiles = files.filter(file => file.file_organization === 'grantor');
  const granteeFiles = files.filter(file => file.file_organization === 'grantee');
  const [focusedFile, setFocusedFile] = useState(null);
  const [focusedFileOrganization, setFocusedFileOrganization] = useState(null);

  const fetchFiles = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(REACT_APP_API_URL + 'files/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });
      const result = await response.json();
      console.log(result)
      setFiles(result);
      setSelectedFileIds(JSON.parse(sessionStorage.getItem('selectedFileIds')));
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async (fileId) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${REACT_APP_API_URL}delete/${fileId}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (response.status === 204) {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
        setSelectedFileIds(prevIds => prevIds.filter(id => id !== fileId));
      } else {
        console.error('Error deleting file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFileIds(prevIds =>
      prevIds.includes(fileId)
        ? prevIds.filter(id => id !== fileId)
        : [...prevIds, fileId]
    );
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    window.location.reload();
  };

  const handleUpload = async (event, isGrantApp, fileOrganization) => {
    if(isGrantApp){
        toggleOverlay();
    }
    setIsLoading(true);
    if(!event && isGrantApp) {
        const formData = new FormData();
        formData.append('selectedFileIds', JSON.stringify(selectedFileIds));
        formData.append('questions', JSON.stringify(inputs));
        formData.append('chat_session', JSON.stringify(selectedSession.id));
        formData.append('file_organization', fileOrganization);
        console.log(formData)
        
        try {
          const accessToken = localStorage.getItem('accessToken');
          const response = await fetch(REACT_APP_API_URL + `upload/${isGrantApp}/`, {
            method: 'POST',
            body: formData,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        });
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          setShowPopup(true);
          console.log(response)
        } catch (error) {
            console.error('Error communicating questions files:', error);
        } finally {
            setIsLoading(false);
        }
        return;
    } else {
        const newFiles = Array.from(event.target.files);
        for (const file of newFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('selectedFileIds', JSON.stringify(selectedFileIds));
        formData.append('questions', JSON.stringify(inputs));
        formData.append('chat_session', JSON.stringify(selectedSession.id));
        formData.append('file_organization', fileOrganization);
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(REACT_APP_API_URL + `upload/${isGrantApp}/`, {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            });
            if (isGrantApp) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
                setShowPopup(true);
            } else {
                const result = await response.json();
                console.log(result);
                if(!('error' in result)) {
                    setFiles((prevFiles) => [...prevFiles, result]);
                    setSelectedFileIds(prevIds => [...prevIds, result.id]); // Auto-select new file
                }
            }
            
            } catch (error) {
                console.error('Error uploading files:', error);
            } finally {
                setIsLoading(false);
            }
        }
    }
  };

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };

  const submitForm = () => {
    handleUpload(null, 1, 'template');
  };

  const handleTagChange = async (fileId, newOrg) => {
    const formData = new FormData();
    formData.append('file_organization', newOrg);
        
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${REACT_APP_API_URL}edit/${fileId}/`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log(response)
      if (response.status === 204) {
        fetchFiles();
      } else {
        console.error('Error editing file');
      }
    } catch (error) {
      console.error('Error editing file:', error);
    } finally {
      setFocusedFileOrganization(null);
    }
  }
  
  return (
      <div style={{ 
        width: '300px', 
        backgroundColor: '#f0f0f0', 
        padding: '15px', 
        overflowY: 'auto',
      }}>
        <div style = {{display : "flex", flexDirection : "column", height : "100%" }}>
          <label className="add-file-btn" onClick={() => setShowUploadPopup(true)}>
            <FaPlus style={{ marginRight: '8px' }}/>
            Upload Files
          </label>
        <div style={{ marginTop: '10px', flexGrow : 1, overflowY : "auto" }}>
          {files.length === 0 ? (
            <p style={{ marginTop: '10px', color: 'gray' }}>No files uploaded yet.</p>
          ) : (
            <ul style={{ paddingLeft: '0px', marginTop: '10px' }}>
              {files.map((file) => (
                <li 
                  key={file.id} 
                  onMouseEnter={() => setFocusedFile(file.id)}
                  onMouseLeave={() => setFocusedFile(null)}
                  style={{ 
                    backgroundColor: focusedFile === file.id && 'lightgray',
                    padding: '10px', 
                    borderRadius: '5px', 
                    marginBottom: '5px' 
                  }}
                >
                  {focusedFileOrganization !== file.id && (
                    <div style={{ display: 'flex' }}>
                      <p style={{ 
                        backgroundColor: organizationColors[file.file_organization], 
                        color: 'white', 
                        padding: '3px', 
                        paddingRight: '10px', 
                        paddingLeft: '10px', 
                        borderRadius: '30px', 
                        fontSize: '10px', 
                        marginBottom: '2px', 
                        marginLeft: '20px'
                      }}>
                        {focusedFile === file.id ? file.file_organization : ''}
                      </p>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedFileIds.includes(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                      style={{ marginRight: '10px', transform: 'scale(1.3)' }}
                    />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px' }}>{file.filename}</span>
                    {focusedFile === file.id && (
                      <>
                      <FaTags
                        size={22}
                        className='tags-btn'
                        onClick={() => setFocusedFileOrganization(focusedFileOrganization === file.id ? null : file.id)}
                      />
                      <FaTrash 
                        size={20}
                        className='delete-btn'
                        onClick={() => handleDelete(file.id)} 
                      />
                      </>
                    )}
                  </div>
                  {focusedFileOrganization === file.id && (
                    <div style={{ marginTop: '10px' }}>
                      <p style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>Choose Tag</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button className='file-btn' onClick={() => handleTagChange(file.id, 'reference')}>Reference</button>
                        <button className='file-btn' onClick={() => handleTagChange(file.id, 'grantee')}>Grantee</button>
                        <button className='file-btn' onClick={() => handleTagChange(file.id, 'grantor')}>Grantor</button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          </div>

        <div style={{ position : "sticky", bottom: '0', width: '100%', margin: '20px' }}>
        <label className="custom-file-input">
            {isLoading ? (
                <div style={{color: 'white'}}>
                <CircularProgress color="inherit"/>
                </div>
            ) : (
                <div style={{ zIndex: 1000 }}>
                <button onClick={toggleOverlay}>Draft Grant</button>
                </div>
            )}
            <input
                type="file"
                multiple
                onChange={(event) => handleUpload(event, 1, 'template')}
                style={{ display: 'none' }}
            />
        </label>
    </div>

    </div>

    {showOverlay && (
      <Form
        onClose={toggleOverlay}
        handleUpload={handleUpload}
        submitForm={submitForm}
        inputs={inputs}
        setInputs={setInputs}
      />
    )}

    {showPopup && (
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
            style={{ width: '100%', height: '100%'}}
            frameBorder="0"
          />
          <button
            onClick={() => handleClosePopup()}
            style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1001}}
          >
            Close
          </button>
          <a href={pdfUrl} download="grant_application.pdf" style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 1001}}>
            Download PDF
          </a>
        </div>
      )}

      {showUploadPopup && (
        <>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
            zIndex: 999 // Make sure this is below the popup but above other content
          }}></div>
          <UploadPopup onClose={() => setShowUploadPopup(false)} handleUpload={handleUpload} fetchFiles={() => fetchFiles()} setIsLoading={setIsLoading}/>
        </>
      )}
    </div>
  );
};

export default FileUploadComponent;