import './Sidebar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVial, faAtom, faUser, faGear, faChartLine, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ setAppView }) => {

  return (
    <div style={{ minWidth: '16%', background: '#222222', padding: '2%', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ margin: '0px', marginBottom: '20px', paddingLeft: '10px', fontFamily: "'Helvetica Neue', Arial, sans-serif", color: 'white' }}> ambora labs </h1>
      <a className='side-btn' onClick={() => setAppView('batches')}>
        <FontAwesomeIcon icon={faVial} style={{ marginRight: '20px' }} />
        Batches
      </a>
      {/* <a className='side-btn' onClick={() => setAppView('schedule')}>Schedule</a> */}
      <a className='side-btn' onClick={() => setAppView('trends')}>
        <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '20px' }} />
        Trends
      </a>
      <a className='side-btn' onClick={() => setAppView('simulation')}>
        <FontAwesomeIcon icon={faAtom} style={{ marginRight: '20px' }} />
        Simulation
      </a>
      <a className='side-btn' style={{ marginTop: 'auto' }} onClick={() => setAppView('upload')}>
        <FontAwesomeIcon icon={faCloudArrowUp} style={{ marginRight: '20px' }} />
        Upload Data
      </a>
      <a className='side-btn'>
        <FontAwesomeIcon icon={faUser} style={{ marginRight: '20px' }} />
        Account
      </a>
      <a className='side-btn'>
        <FontAwesomeIcon icon={faGear} style={{ marginRight: '20px' }} />
        Settings
      </a>
    </div>
  );
}

export default Sidebar