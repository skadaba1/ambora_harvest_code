import './Home.css';
import Sidebar from './Sidebar';
import Simulation from './Simulation';
import Batches from './Batches';
import { useState } from 'react';

function Home() {
  const [appView, setAppView] = useState('simulation');

  return (
    <div className="App" style={{ display: 'flex', height: '100vh' }}>
      <Sidebar setAppView={setAppView} />
      {appView === 'simulation' ? (
        <Simulation />
      ) : (
        <Batches />
      )}
    </div>
  );
}

export default Home;
