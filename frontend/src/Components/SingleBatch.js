import { Scatter } from 'react-chartjs-2';
import { addDays, format, parseISO } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faArrowLeft, faTrash, faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns'; // Import the date adapter
import React, { useEffect, useState, useRef } from 'react';
import { REACT_APP_API_URL } from "../consts";
import './SingleBatch.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

const options = {
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'day'
      },
      title: {
        display: true,
        text: 'Date'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Total Viable Cells (Billions)'
      }
    }
  }
};

const SingleBatch = ({ setBatchesView, batchesView, getMeasurements, getBatches, measurements, chartDataA, chartDataB, handleMeasurementClick }) => {
  const newMeasurementDateRef = useRef(null);
  const newTotalViableCellsRef = useRef(null);
  const newViableCellDensityRef = useRef(null);
  const newCellDiameterRef = useRef(null);
  const newProcessTimeRef = useRef(null);
  const [singleBatchView, setSingleBatchView] = useState('buttons');

  const onAddMeasurementClick = async () => {
    try {
      const response = await fetch(REACT_APP_API_URL + 'api/add-measurement/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lotId: batchesView.id,
          measurementDate: newMeasurementDateRef.current.value,
          totalViableCells: newTotalViableCellsRef.current.value,
          viableCellDensity: newViableCellDensityRef.current.value,
          cellDiameter: newCellDiameterRef.current.value,
          processTime: newProcessTimeRef.current.value
        }),
      });

      if (response.status === 200) {
        const result = await response.json();
        console.log(result);

        getMeasurements(batchesView.id);
      } else {
        const errorData = await response.json();
        console.error('Error adding measurement:', errorData.error);
      }
    } catch (error) {
      console.error('Error adding measurement:', error);
    }
  }

  const onDeleteBatchClick = async () => {
    try {
      const response = await fetch(REACT_APP_API_URL + 'api/delete-batch/', {
        method: 'POST',
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
        console.error('Error deleting batch:', errorData.error);
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
    }
  }

  return (
    <div style={{ paddingLeft: '3%', paddingTop: '3%', flex: 1 }}>
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <div className='back-btn' style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '20px' }}>
          <FontAwesomeIcon icon={faArrowLeft} />
          <p onClick={() => setBatchesView('batches')} style={{ margin: '0px', marginLeft: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Back</p>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '25%', borderRight: '1px solid lightgray', display: 'flex', flexDirection: 'column', height: '80vh' }}>
          <h1 style={{ margin: '0px' }}> Lot #{batchesView.lotNumber} </h1>
          { singleBatchView === 'buttons' ? (
          <>
            <h3 className='batch-btn' onClick={() => setSingleBatchView('add-measurement')} style={{ marginTop: '30px' }}>
              <FontAwesomeIcon icon={faPlus} style={{ marginRight: '10px' }}/>
              Add Measurement
            </h3>
            <h3 className='batch-btn harvest' onClick={() => {}} style={{ marginTop: '10px' }} >
              <FontAwesomeIcon icon={faCircleCheck} style={{ marginRight: '10px' }}/>
              Harvest Batch
            </h3>
            <h3 className='batch-btn terminate' onClick={() => {}} style={{ marginTop: '10px' }}>
              <FontAwesomeIcon icon={faCircleXmark} style={{ marginRight: '10px' }}/>
              Terminate Batch
            </h3>
            <h3 className='delete-batch-btn' onClick={() => onDeleteBatchClick()} style={{ marginTop: 'auto' }}>
              <FontAwesomeIcon icon={faTrash} style={{ marginRight: '10px' }}/>
              Remove Batch
            </h3>
          </>
          ) : (
          <>
            <div style={{ marginTop: '30px' }}>
              <label style={{ fontWeight: 'bold' }}>Measurement Date</label>
              <input className='setting-input' type="datetime-local" ref={newMeasurementDateRef} />
            </div>
            <div style={{ marginTop: '30px' }}>
              <label style={{ fontWeight: 'bold' }}>Total Viable Cells</label>
              <input className='setting-input' type="number" ref={newTotalViableCellsRef} />
            </div>
            <div style={{ marginTop: '30px' }}>
              <label style={{ fontWeight: 'bold' }}>Viable Cell Density</label>
              <input className='setting-input' type="number" ref={newViableCellDensityRef} />
            </div>
            <div style={{ marginTop: '30px' }}>
              <label style={{ fontWeight: 'bold' }}>Cell Diameter</label>
              <input className='setting-input' type="number" ref={newCellDiameterRef} />
            </div>
            <div style={{ marginTop: '30px' }}>
              <label style={{ fontWeight: 'bold' }}>Process Time (Hours)</label>
              <input className='setting-input' type="number" ref={newProcessTimeRef} />
            </div>
            <div style={{ display: 'flex', width: '86%', marginTop: '30px', justifyContent: 'space-between' }}>
              <h3 className='batch-btn' style={{ textAlign: 'center', marginRight: '20px' }} onClick={() => setSingleBatchView('buttons')}>Cancel</h3>
              <h3 className='batch-btn harvest' style={{ textAlign: 'center' }} onClick={() => onAddMeasurementClick()}>Done</h3>
            </div>
          </>
          )}
        </div>
        <div style={{ paddingLeft: '20px', width: '75%', overflowY: 'auto', height: '85vh' }}>
          <h1 style={{ margin: '0px', marginBottom: '20px' }}>Measurements</h1>
          <div style={{ width: '85%' }}>
            <Scatter data={chartDataA} options={options} width={100} height={50}/>
          </div>
          <div style={{ width: '85%' }}>
            <Scatter data={chartDataB} options={options} width={100} height={50}/>
          </div>
          <div style={{ display: 'flex', width: '80%', padding: '20px', borderBottom: '1px solid lightgray', justifyContent: 'space-between' }}>
            <p style={{ margin: '0px', width: '100px', fontWeight: 'bold' }}>Date</p>
            <p style={{ margin: '0px', width: '50px', fontWeight: 'bold' }}>TVC</p>
            <p style={{ margin: '0px', width: '50px', fontWeight: 'bold' }}>VCD</p>
            <p style={{ margin: '0px', width: '50px', fontWeight: 'bold' }}>CD</p>
          </div>
          {measurements.map((item, index) => (
        <div
          key={index}
          className='measurement-row'
          style={{ display: 'flex', width: '80%', padding: '20px', paddingLeft: '20px', paddingRight: '20px', justifyContent: 'space-between', borderBottom: '1px solid lightgray', cursor: 'pointer' }}
          onClick={() => handleMeasurementClick(batchesView.id, item.id)}
        >
          <div>
            <p style={{ margin: '0px', width: '100px' }}>{item.measurement_date.split('T')[0]}</p>
            <p style={{ margin: '0px', color: 'gray', fontSize: '12px' }}>{item.measurement_date.split('T')[1]}</p>
          </div>
          <p style={{ margin: '0px', width: '50px' }}>{(item.total_viable_cells / 1000000000).toFixed(3)}b</p>
          <p style={{ margin: '0px', width: '50px' }}>{item.viable_cell_density.toFixed(3)}</p>
          <p style={{ margin: '0px', width: '50px' }}>{item.cell_diameter.toFixed(3)}</p>
        </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SingleBatch;