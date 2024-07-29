import React from 'react'
import './Hero.css'
import WebNavbar from './WebNavbar'
import yc from './images/yc_logo.webp'
import screenshot from './images/screenshot2.png'
import integrations from './images/integrations2.png'
import { Link } from 'react-router-dom'
import { Typography } from '@mui/material'


const Hero = () => {
    const email = "founders@rovaai.com";
    const subject = encodeURIComponent("Join Waitlist");
    const body = encodeURIComponent("First Name:\nLast Name:\n\nCompany:\nRole:\n\nAdditional Info:");

    return (
        <>
        <WebNavbar />
        <div className='hero' style={{ background: 'black' }}>
            {true ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <div className='content' style={{ width: '50%', marginTop: '8%' }}>
                        <Typography style={{fontSize: '50px', fontWeight: 'bold'}}> Find information to write </Typography>
                        <Typography style={{fontSize: '50px', fontWeight: 'bold'}}> grants, 3x faster </Typography>

                        <Typography style={{fontSize: '16px', fontWeight: 'normal', marginTop: '5%'}}>
                            The AI-Powered Document Management System, for Community Foundations.
                        </Typography>

                        <div className='backedby'>
                            <Typography style={{marginRight: '1%', fontSize: '14px'}}>Backed By</Typography>
                            <img src={yc} alt='yc' style={{ width: '108px', height: '30px' }}/>
                        </div>
                        <div className='buttons'>
                            <div class="container">
                                {/* <a class="button2" href={`mailto:${email}?subject=${subject}&body=${body}`}> */}
                                <Link class="button2" to={'/join-waitlist'}>
                                    <span class="label-up" style={{fontFamily: 'PoppinsFont, sans-serif'}}>Join The Waitlist 🎉</span>
                                    <span class="label-up" style={{fontFamily: 'PoppinsFont, sans-serif'}}>Join the Waitlist 🎉</span>
                                </Link>
                            </div>
                        </div>
                        <Typography style={{fontSize: '14px', marginTop: '1%'}}> or email us at <a href="mailto:founders@rovaai.com" style={{color: '#FF8263'}}>founders@amboralabs.com</a></Typography>
                    </div>
                    <img 
                        src={screenshot} 
                        style={{ 
                            width: '80%',
                            borderRadius: '10px',
                            marginTop: '5%',
                        }}
                    />
                    <img 
                        src={integrations} 
                        style={{ 
                            width: '80%',
                            borderRadius: '10px',
                            marginTop: '10%',
                            marginBottom: '15%',
                        }}
                    />
                </div>
            ) : (
                <div className='signup flex'>
                    <div className='signup-description'>
                        <h1>Book a Demo</h1>
                    </div>
                </div>
            )}
        </div>
        </>
    )
}

export default Hero