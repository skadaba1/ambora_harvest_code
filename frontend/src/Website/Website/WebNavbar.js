import React, { useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import { Link } from 'react-router-dom'

import './WebNavbar.css'
import { Typography } from '@mui/material'
import { useEffect } from 'react'



const WebNavbar = () => {
    const email = "avigyabb@gmail.com";
    const subject = encodeURIComponent("Join Waitlist");
    const body = encodeURIComponent("First Name:\nLast Name:\n\nAdditional Info:");
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        function handleResize() {
        setIsMobile(window.innerWidth < 768);
        }

        window.addEventListener('resize', handleResize);
        handleResize(); // Call on initial render

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Setting mobile nav
    const [click, setClick] = useState(false)
    const handleClick = () => setClick(!click)

    // Change nav color when scrolling
    const [color, setColor] = useState(false)
    const changeColor = () => {
        if (window.scrollY >= 90) {
            setColor(true)
        } else {
            setColor(false)
        }
    }

    window.addEventListener('scroll', changeColor)

    return (
        <div className={color ? 'web-header web-header-bg' : 'web-header'}>
            <nav className='web-navbar'>
                <div className='web-logo-container' style={{ width: '100%' }}>
                    <Link to={`/`} style={{ width: '100%' }}>
                        <Typography className="mr-auto ml-5 font-bold text-4xl" style={{fontWeight: 'bold', fontSize: 30, paddingLeft: isMobile && '5%', color: 'white' }}> ambora labs </Typography>
                    </Link>
                </div>
                <ul className={click ? "nav-menu active" : "nav-menu"}>
                    <li className='nav-item'>
                        <Link to={`/login`}>
                            <Typography class="label-down" style={{fontFamily: 'PoppinsFont, sans-serif'}}>Login</Typography>
                            <Typography class="label-down" style={{fontFamily: 'PoppinsFont, sans-serif'}}>Login</Typography>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export default WebNavbar