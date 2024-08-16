import './Home.css';
import Sidebar from './Sidebar';
import Simulation from './Simulation';
import Batches from './Batches';
import Schedule from './Schedule';
import Trends from './Trends';
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
        <Trends />
      )}
    </div>
  );
}

export default Home;
