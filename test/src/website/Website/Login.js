import React from 'react'
import './Hero.css'
import WebNavbar from './WebNavbar'
import { TextField, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import Auth from './Auth';

const Login = () => {
    const navigate = useNavigate();
    const handleLoginChange = (event) => {
        if (event.target.value === process.env.REACT_APP_URL_EXT) {
            navigate(`${process.env.REACT_APP_URL_EXT}`);
        }
    };

    return (
        <>
        <WebNavbar />
            <div className='hero' style={{ height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {/* <Typography className='text-white'>Early Access</Typography>
                <input style={{ marginLeft: '10px', width: '200px', padding: '10px'}} placeholder='Enter Code' onChange={handleLoginChange}/> */}
                { <Auth /> }
            </div>
        </>
    )
}

export default Login