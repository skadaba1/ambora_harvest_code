import './Home.css';
import Sidebar from './Sidebar';
import Simulation from './Simulation';
import Batches from './Batches';
import Schedule from './Schedule';
import { useState } from 'react';

function Home() {
  const [appView, setAppView] = useState('batches');

  return (
    <div className="App" style={{ display: 'flex', height: '100vh' }}>
      <Sidebar setAppView={setAppView} />
      {appView === 'simulation' ? (
        <Simulation />
      ) : appView === 'batches' ? (
        <Batches />
      ) : (
        <Schedule />
      )}
    </div>
  );
}

export default Home;
