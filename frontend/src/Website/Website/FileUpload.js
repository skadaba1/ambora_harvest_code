import React, { useState } from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// import { Helmet } from 'react-helmet';
import { REACT_APP_API_URL } from '../../consts';

const FileUpload = () => {
  const [loading, setLoading] = useState('Submit');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setLoading('Joining...');
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.post(REACT_APP_API_URL + 'join-waitlist/', {
        first_name: formData.get('firstName'),
        last_name: formData.get('lastName'),
        email: formData.get('email'),
        additional_details: formData.get('additionalDetails'), 
      }, {
        withCredentials: true
      });

      alert(response.data.message);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error joining waitlist');
    }
    setLoading('Submit');
  };

  return (
    <div className="mt-5 flex flex-col" style={{color: "black"}}>
      <Box
        className='box'
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <Typography variant="h3" gutterBottom style={{ color: 'black' }}>
            Join The Waitlist
        </Typography>
        {/* <Typography className='text-sm' style={{ color: 'gray', marginBottom: '5%' }}> 
          The AI-Powered Document Management System, for Community Foundations.
        </Typography> */}
        <div className='flex gap-3' style={{ marginTop: '5%', marginBottom: '5%', justifyContent: 'space-between', gap: '5%'}}>
          <TextField className="flex-grow" required id="firstName" name="firstName" label="First Name" variant="outlined"/>
          <TextField className="flex-grow" required id="lastName" name="lastName" label="Last Name" variant="outlined"/>
          <TextField
              className="flex-grow"
              required
              id="email"
              name="email"
              label="Email"
              type="email"
              variant="outlined"
          />
        </div>
        <TextField
            id="additionalDetails"
            name="additionalDetails"
            label="Additional Notes"
            multiline
            rows={4}
            variant="outlined"
        />
        <button id="submit-btn" type="submit" variant="contained" style={{ marginTop: '5%', marginBottom: '5%' }}> {loading} </button>
        {/* <div class="launchlist-widget mt-8 mb-8" data-key-id="7KfOUJ" style={{width: '100%', marginBottom: '5%'}}></div>
        <Helmet>
          <script
            src="https://getlaunchlist.com/js/widget.js"
            type="text/javascript"
            defer
          />
        </Helmet> */}
      </Box>
    </div>
  );
};

export default FileUpload;