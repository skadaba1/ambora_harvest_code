import './Sidebar.css'

const Sidebar = ({ setAppView }) => {

  return (
    <div style={{ width: '16%', background: 'lightgray', padding: '2%', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ margin: '0px', marginBottom: '20px', paddingLeft: '10px' }}> ambora labs </h1>
      <a className='side-btn' onClick={() => setAppView('batches')}>Batches</a>
      {/* <a className='side-btn' onClick={() => setAppView('schedule')}>Schedule</a> */}
      <a className='side-btn' onClick={() => setAppView('simulation')}>Simulation</a>
    </div>
  );
}

export default Sidebar