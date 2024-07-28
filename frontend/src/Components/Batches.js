import './Batches.css'
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const batches = [
  {
    lotNumber: 1,
    cellCount: 15,
    predHarvest: '8/2/2024'
  },
  {
    lotNumber: 2,
    cellCount: 15,
    predHarvest: '8/2/2024'
  },
]

const Batches = () => {
  const [batchesView, setBatchesView] = useState('batches');

  return (
    <>
    {batchesView === 'batches' ? (
      <div style={{ padding: '3%', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', marginBottom: '20px' }}>
          <h1 style={{ marginBottom: '0px', marginTop: '0px', marginRight: '40px' }}>Batches</h1>
          <button className='add-batch-btn' style={{ display: 'flex', alignItems: 'center' }} onClick={() => setBatchesView('addBatch')}> 
            <FontAwesomeIcon icon={faPlus} /> 
            <p style={{ margin: '0px', marginLeft: '5px', fontWeight: 'bold' }}>Add Batch</p>
          </button>
        </div>
        <div style={{ display: 'flex', width: '80%', padding: '20px', borderBottom: '1px solid lightgray', justifyContent: 'space-between' }}>
          <p style={{ margin: '0px' }}>Lot Number</p>
          <p style={{ margin: '0px' }}>Cell Count</p>
          <p style={{ margin: '0px' }}>Predicted Harvest</p>
        </div>
        {batches.map((item, index) => (
          <div style={{ display: 'flex', width: '80%', padding: '10px', paddingLeft: '20px', paddingRight: '20px', justifyContent: 'space-between', marginTop: '8px', borderRadius: '10px', background: '#f5f5f5' }}>
            <p style={{ margin: '0px' }}>{item.lotNumber}</p>
            <p style={{ margin: '0px' }}>{item.cellCount}</p>
            <p style={{ margin: '0px' }}>{item.predHarvest}</p>
          </div>
        ))}
      </div>
    ) : (
      <div style={{ paddingLeft: '3%', paddingTop: '3%' }}>
        <div className='back-btn' style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '20px' }}>
          <FontAwesomeIcon icon={faArrowLeft} /> 
          <p onClick={() => setBatchesView('batches')} style={{ margin: '0px', marginLeft: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Back</p>
        </div>
        <div style={{ marginTop: '30px' }}>
          <label style={{ fontWeight: 'bold' }}>Lot Number</label>
          <input className='setting-input' />
        </div>
        <div style={{ marginTop: '30px' }}>
          <label style={{ fontWeight: 'bold' }}>Batch Start Date</label>
          <input className='setting-input' type="date" />
        </div>
        <div style={{ marginTop: '30px' }}>
          <label style={{ fontWeight: 'bold' }}>Total Viable Cells</label>
          <input className='setting-input' type="number" />
        </div>
        <button className='batch-submit-btn' style={{ marginTop: '30px' }}>Submit</button>
      </div>
    )}
    </>
  );
}

export default Batches;