import { Typography } from "@mui/material";
import FileUpload from "./FileUpload";
import './MiniProjects.css';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const MiniProjects = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Call on initial render

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen">
      {!isMobile && (
        <div className="left-content" style={{ paddingTop: '2%', paddingLeft: '3%'}}>
          <Link to={`/`} className="font-bold text-4xl text-gray-100"> 
            <Typography style={{fontWeight: 'bold', fontSize: 30, color: 'white'}}> ambora labs </Typography>
          </Link> 
          <Typography className='text-6xl' style={{fontWeight: 'bold', color: 'gray', width: '80%', marginLeft: '5%', marginTop: '25%', lineHeight: '1.5', fontSize: 60}}> Be Part of Our Beta Community! </Typography>
          <div className='flex' style={{marginTop: '20%', marginLeft: '5%'}}>
            <Typography className='text-gray-400' style={{color: 'lightgray'}}>See previous and upcoming updates in our</Typography>
            <Link to={`https://docs.google.com/document/d/1i3rPc5u1l6DzS9cP671rNyzwTONgTtbvZSk9L9bPJtE/edit?usp=sharing`} target="_blank" style={{textDecoration: 'underline', color: 'white'}}>
              <Typography style={{marginLeft: '5px'}}>Patch Notes</Typography>
            </Link>
          </div>
        </div>
      )}
      <div className='signup-form' style={isMobile ? {width: '100%', padding: '10%'} : {}}>
          {isMobile && (
            <Link to={`/`} className="font-bold text-4xl"> 
              <Typography style={{fontWeight: 'bold', fontSize: 20 }}> ambora labs </Typography>
            </Link> 
          )}
          <FileUpload />
          <p className='mt-5'>Not working? Email us at <a href="mailto:founders@rovaai.com" style={{color: '#FF8263'}}>founders@amboralabs.com</a></p>
      </div>
    </div>
  )
}

export default MiniProjects