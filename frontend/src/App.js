import './App.css';
import Sidebar from './Components/Sidebar';
import Simulation from './Components/Simulation';
import Batches from './Components/Batches';
import { useState } from 'react';

function App() {
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

export default App;
