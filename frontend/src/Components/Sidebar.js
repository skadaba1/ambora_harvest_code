import './Sidebar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVial, faAtom, faUser, faGear } from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ setAppView }) => {

  return (
    <div style={{ width: '16%', background: '#222222', padding: '2%', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ margin: '0px', marginBottom: '20px', paddingLeft: '10px', fontFamily: "'Helvetica Neue', Arial, sans-serif", color: 'white' }}> ambora labs </h1>
      <a className='side-btn' onClick={() => setAppView('batches')}>
        <FontAwesomeIcon icon={faVial} style={{ marginRight: '10px' }} />
        Batches
      </a>
      {/* <a className='side-btn' onClick={() => setAppView('schedule')}>Schedule</a> */}
      <a className='side-btn' onClick={() => setAppView('simulation')}>
        <FontAwesomeIcon icon={faAtom} style={{ marginRight: '10px' }} />
        Simulation
      </a>
      <a className='side-btn' style={{ marginTop: 'auto' }}>
        <FontAwesomeIcon icon={faUser} style={{ marginRight: '10px' }} />
        Account
      </a>
      <a className='side-btn'>
        <FontAwesomeIcon icon={faGear} style={{ marginRight: '10px' }} />
        Settings
      </a>
    </div>
  );
}

export default Sidebar