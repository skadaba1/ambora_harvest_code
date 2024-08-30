import './Sidebar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVial, faAtom, faUser, faGear, faChartLine, faCloudArrowUp, faLayerGroup } from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ setAppView }) => {

  return (
    <div style={{ minWidth: '13%', background: '#222222', padding: '2%', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ margin: '0px', marginBottom: '20px', paddingLeft: '10px', fontFamily: "'Helvetica Neue', Arial, sans-serif", color: 'white' }}> ambora </h1>
      <a className='side-btn' onClick={() => setAppView('batches')}>
        <FontAwesomeIcon icon={faVial} style={{ marginRight: '20px' }} />
        Batches
      </a>
      {/* <a className='side-btn' onClick={() => setAppView('schedule')}>Schedule</a> */}
      <a className='side-btn' onClick={() => setAppView('trends')}>
        <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '20px' }} />
        Trends
      </a>
      <a className='side-btn' onClick={() => setAppView('upload')}>
        <FontAwesomeIcon icon={faLayerGroup} style={{ marginRight: '20px' }} />
        Datasets
      </a>
      <a className='side-btn' style={{ }} onClick={() => setAppView('simulation')}>
        <FontAwesomeIcon icon={faAtom} style={{ marginRight: '20px' }} />
        Simulation
      </a>
      {/* <a className='side-btn'>
        <FontAwesomeIcon icon={faUser} style={{ marginRight: '20px' }} />
        Account
      </a>
      <a className='side-btn'>
        <FontAwesomeIcon icon={faGear} style={{ marginRight: '20px' }} />
        Settings
      </a> */}
    </div>
  );
}

export default Sidebar