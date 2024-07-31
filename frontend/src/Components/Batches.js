import './Batches.css'
import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { REACT_APP_API_URL } from "../consts";

const Batches = () => {
  const [batchesView, setBatchesView] = useState('batches');
  const [batches, setBatches] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const lotNumberRef = useRef(null);
  const batchStartDateRef = useRef(null);
  const totalViableCellsRef = useRef(null);
  const viableCellDensityRef = useRef(null);
  const cellDiameterRef = useRef(null);
  const newMeasurementDateRef = useRef(null);
  const newTotalViableCellsRef = useRef(null);
  const newViableCellDensityRef = useRef(null);
  const newCellDiameterRef = useRef(null);

  const getBatches = async () => {
    try {
      // const accessToken = localStorage.getItem('accessToken');      
      const response = await fetch(REACT_APP_API_URL + 'api/batches/', {
        method: 'GET',  // Ensure this matches the view method
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const result = await response.json();
        console.log(result);
        setBatches(result);
      } else {
        const errorData = await response.json();
        console.error('Error uploading URL:', errorData.error);
      }
    } catch (error) {
      console.error('Error uploading URL:', error);
    }
  }

  useEffect(() => {    
    getBatches();
  }, [])

  const onAddBatchClick = async () => {
    try {     
      const response = await fetch(REACT_APP_API_URL + 'api/add-batch/', {
        method: 'POST',  // Ensure this matches the view method
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lotNumber: lotNumberRef.current.value,
          batchStartDate: batchStartDateRef.current.value,
          totalViableCells: totalViableCellsRef.current.value,
          viableCellDensity: viableCellDensityRef.current.value,
          cellDiameter: cellDiameterRef.current.value
        }),
      });

      if (response.status === 200) {
        const result = await response.json();
      } else {
        const errorData = await response.json();
        console.error('Error uploading URL:', errorData.error);
      }
    } catch (error) {
      console.error('Error uploading URL:', error);
    }
    setBatchesView('batches');
    getBatches();
  }

  const onAddMeasurementClick = async () => {
    try {     
      const response = await fetch(REACT_APP_API_URL + 'api/add-measurement/', {
        method: 'POST',  // Ensure this matches the view method
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lotId: batchesView.id,
          measurementDate: newMeasurementDateRef.current.value,
          totalViableCells: newTotalViableCellsRef.current.value,
          viableCellDensity: newViableCellDensityRef.current.value,
          cellDiameter: newCellDiameterRef.current.value
        }),
      });

      if (response.status === 200) {
        const result = await response.json();
        getMeasurements();
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const onDeleteBatchClick = async () => {
    try {
      const response = await fetch(REACT_APP_API_URL + 'api/delete-batch/', {
        method: 'POST',  // Ensure this matches the view method
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lotId: batchesView.id
        }),
      });

      if (response.status === 200) {
        setBatchesView('batches');
        getBatches();
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const getMeasurements = async () => {
    try {
      const response = await fetch(REACT_APP_API_URL + 'api/get-measurements/', {
        method: 'POST',  // Ensure this matches the view method
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lotId: batchesView.id
        }),
      });

      if (response.status === 200) {
        const result = await response.json();
        console.log(result);
        setMeasurements(result);
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }


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
          <div 
            className='batches-row' 
            onClick={() => {
              setBatchesView({id: item.id, lotNumber: item.lot_number}) 
              getMeasurements()
            }} 
            style={{ display: 'flex', width: '80%', padding: '10px', paddingLeft: '20px', paddingRight: '20px', justifyContent: 'space-between', marginTop: '8px', borderRadius: '10px' }}
          >
            <p style={{ margin: '0px' }}>{item.lot_number}</p>
            <p style={{ margin: '0px' }}>{item.total_viable_cells}</p>
            <p style={{ margin: '0px' }}>{item.batch_start_date}</p>
          </div>
        ))}
      </div>
    ) : batchesView === 'addBatch' ? (
      <div style={{ paddingLeft: '3%', paddingTop: '3%' }}>
        <div className='back-btn' style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '20px' }}>
          <FontAwesomeIcon icon={faArrowLeft} /> 
          <p onClick={() => setBatchesView('batches')} style={{ margin: '0px', marginLeft: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Back</p>
        </div>
        <div style={{ marginTop: '30px' }}>
          <label style={{ fontWeight: 'bold' }}>Lot Number</label>
          <input className='setting-input' ref={lotNumberRef}/>
        </div>
        <div style={{ marginTop: '30px' }}>
          <label style={{ fontWeight: 'bold' }}>Batch Start Date</label>
          <input className='setting-input' type="date" ref={batchStartDateRef}/>
        </div>
        <div style={{ marginTop: '30px' }}>
          <label style={{ fontWeight: 'bold' }}>Total Viable Cells</label>
          <input className='setting-input' type="number" ref={totalViableCellsRef}/>
        </div>
        <div style={{ marginTop: '30px' }}>
          <label style={{ fontWeight: 'bold' }}>Viable Cell Density</label>
          <input className='setting-input' type="number" ref={viableCellDensityRef}/>
        </div>
        <div style={{ marginTop: '30px' }}>
          <label style={{ fontWeight: 'bold' }}>Cell Diameter</label>
          <input className='setting-input' type="number" ref={cellDiameterRef}/>
        </div>
        <button className='batch-submit-btn' onClick={() => onAddBatchClick()} style={{ marginTop: '30px' }}>Submit</button>
      </div>
    ) : (
      <div style={{ paddingLeft: '3%', paddingTop: '3%', flex: 1 }}>
        <div style={{ display: 'flex', marginBottom: '20px' }}>
          <div className='back-btn' style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '20px' }}>
            <FontAwesomeIcon icon={faArrowLeft} /> 
            <p onClick={() => setBatchesView('batches')} style={{ margin: '0px', marginLeft: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Back</p>
          </div>
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ width: '30%', borderRight: '1px solid lightgray', paddingRight: '20px' }}>
            <h1 style={{margin: '0px' }}> Batch {batchesView.lotNumber} </h1>
            <div style={{ marginTop: '30px' }}>
              <label style={{ fontWeight: 'bold' }}>Measurement Date</label>
              <input className='setting-input' type="date" ref={newMeasurementDateRef}/>
            </div>
            <div style={{ marginTop: '30px' }}>
              <label style={{ fontWeight: 'bold' }}>Total Viable Cells</label>
              <input className='setting-input' type="number" ref={newTotalViableCellsRef}/>
            </div>
            <div style={{ marginTop: '30px' }}>
              <label style={{ fontWeight: 'bold' }}>Viable Cell Density</label>
              <input className='setting-input' type="number" ref={newViableCellDensityRef}/>
            </div>
            <div style={{ marginTop: '30px' }}>
              <label style={{ fontWeight: 'bold' }}>Cell Diameter</label>
              <input className='setting-input' type="number" ref={newCellDiameterRef}/>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end'  }}>
              <button className='batch-submit-btn' onClick={() => onAddMeasurementClick()} style={{ marginTop: '30px', marginRight: '40px' }}>Add Measurement</button>
            </div>
            <p className='delete-batch-btn' onClick={() => onDeleteBatchClick()} style={{marginTop: '30px'}}> Delete Batch </p>
          </div>
          <div style={{ paddingLeft: '20px', width: '70%' }}>
            <h1 style={{margin: '0px' }}>Measurements</h1>
            <div style={{ display: 'flex', width: '80%', padding: '20px', borderBottom: '1px solid lightgray', justifyContent: 'space-between' }}>
              <p style={{ margin: '0px', width: '100px', fontWeight: 'bold' }}>Date</p>
              <p style={{ margin: '0px', width: '50px', fontWeight: 'bold' }}>TVC</p>
              <p style={{ margin: '0px', width: '50px', fontWeight: 'bold' }}>VCD</p>
              <p style={{ margin: '0px', width: '50px', fontWeight: 'bold' }}>CD</p>
            </div>
            {measurements.map((item, index) => (
              <div 
                style={{ display: 'flex', width: '80%', padding: '10px', paddingLeft: '20px', paddingRight: '20px', justifyContent: 'space-between', marginTop: '8px', borderRadius: '10px', borderBottom: '1px solid lightgray' }}
              >
                <p style={{ margin: '0px', width: '100px' }}>{item.measurement_date}</p>
                <p style={{ margin: '0px', width: '50px' }}>{item.total_viable_cells}</p>
                <p style={{ margin: '0px', width: '50px' }}>{item.viable_cell_density}</p>
                <p style={{ margin: '0px', width: '50px' }}>{item.cell_diameter}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default Batches;