// TextEditor.js
import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { REACT_APP_API_URL } from "../consts";

const TextEditor = ({selectedSession}) => {
    const [editorText, setEditorText] = useState('');
    const [newText, setNewText] = useState('');

    useEffect(() => {
        fetchTextFromBackend()
        console.log(selectedSession)
    }, [selectedSession]);

    const fetchTextFromBackend = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.get(REACT_APP_API_URL + `fetch-backup/${selectedSession.id}/`, {
        }, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          }
        });
        console.log(response)
        if(response.data.content != "") {
            setEditorText(JSON.parse(response.data.content))
        } else {
          setEditorText("")
        }
      } catch (error) {
        console.error('Error fetching editor for session:', error);
      } 
    };  

    const handleAddText = () => {
        setEditorText(prevText => prevText + '\n' + newText);
    };

    const handleTextChange = (value) => {
        setEditorText(value);
        saveTextToBackend(value);
    };

    const saveTextToBackend = async (content) => {
        try {
          const accessToken = localStorage.getItem('accessToken');
          const response = await axios.post(REACT_APP_API_URL + `editor-backup/${selectedSession.id}/`, {
            editor_backup: JSON.stringify(content),
          }, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            }
          });
        } catch (error) {
          console.error('Error fetching editor for session:', error);
        }
      };  

    return (
        <div style={{ margin: '20px'}}>
            <ReactQuill 
                value={editorText} 
                onChange={handleTextChange} 
                theme="snow" 
                style={{ height: '600px', marginBottom: '20px' }}
            />
            <textarea 
                value={newText} 
                onChange={(e) => setNewText(e.target.value)} 
                placeholder=""
                style={{ width: '100%', height: '100%', marginBottom: '20px'}}
            />
            {/* <button onClick={handleAddText} style={{ padding: '10px 20px', fontSize: '16px' }}>Add Text</button> */}
        </div>
    );
};

export default TextEditor;
