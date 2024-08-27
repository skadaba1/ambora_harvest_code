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

const options2 = {
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
        text: 'Viable Cell Density (%)'
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
  const [hoveredMeasurement, setHoveredMeasurement] = useState(null);
  const [visibleGraph, setVisibleGraph] = useState('TVC');

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

  const updateBatchStatus = async (newStatus) => {
    console.log("harvest");
    try {
      const response = await fetch(REACT_APP_API_URL + 'api/update-batch-status/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lotId: batchesView.id,
          status: newStatus
        }),
      });
    } catch (error) {
      console.error('Error deleting batch:', error);
    }
  }

  return (
    <div style={{ paddingLeft: '3%', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '20px', paddingTop: '20px', borderBottom: '1px solid lightgray' }}>
        <div onClick={() => setBatchesView('batches')} className='back-btn' style={{ display: 'inline-flex', alignItems: 'center' }}>
          <FontAwesomeIcon icon={faArrowLeft} />
          <p style={{ margin: '0px', marginLeft: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Back</p>
        </div>
        <h1 style={{ margin: '0px', marginLeft: '5%' }}> Lot #{batchesView.lotNumber} </h1>
        <p style={{ margin: '0px', marginLeft: '5%', backgroundColor: '#f0f0f0', padding: '10px 20px', borderRadius: '10px', border: '1px solid gray' }}>Status: {batchesView.status}</p>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '25%', borderRight: '1px solid lightgray', display: 'flex', flexDirection: 'column', height: '80vh' }}>
          { singleBatchView === 'buttons' ? (
          <>
            <h3 className='batch-btn' onClick={() => setSingleBatchView('add-measurement')} style={{ marginTop: '30px' }}>
              <FontAwesomeIcon icon={faPlus} style={{ marginRight: '10px' }}/>
              Add Measurement
            </h3>
            <h3 className='batch-btn harvest' onClick={() => updateBatchStatus('Harvested')} style={{ marginTop: '10px' }} >
              <FontAwesomeIcon icon={faCircleCheck} style={{ marginRight: '10px' }}/>
              Harvest Batch
            </h3>
            <h3 className='batch-btn terminate' onClick={() => updateBatchStatus('Terminated')} style={{ marginTop: '10px' }}>
              <FontAwesomeIcon icon={faCircleXmark} style={{ marginRight: '10px' }}/>
              Terminate Batch
            </h3>
            <h3 className='delete-batch-btn' onClick={() => onDeleteBatchClick()} style={{ marginTop: 'auto' }}>
              <FontAwesomeIcon icon={faTrash} style={{ marginRight: '10px' }}/>
              Remove Batch
            </h3>
          </>
          ) : singleBatchView === 'add-measurement' ? (
          <>
            <div style={{ marginTop: '30px' }}>
              <label style={{ fontWeight: 'bold', color: 'gray' }}>Measurement Date</label>
              <input className='setting-input' type="datetime-local" ref={newMeasurementDateRef} />
            </div>
            <div style={{ marginTop: '30px', color: 'gray' }}>
              <label style={{ fontWeight: 'bold' }}>Total Viable Cells</label>
              <input className='setting-input' type="number" ref={newTotalViableCellsRef} />
            </div>
            <div style={{ marginTop: '30px', color: 'gray' }}>
              <label style={{ fontWeight: 'bold' }}>Viable Cell Density</label>
              <input className='setting-input' type="number" ref={newViableCellDensityRef} />
            </div>
            <div style={{ marginTop: '30px', color: 'gray' }}>
              <label style={{ fontWeight: 'bold' }}>Cell Diameter</label>
              <input className='setting-input' type="number" ref={newCellDiameterRef} />
            </div>
            <div style={{ marginTop: '30px', color: 'gray' }}>
              <label style={{ fontWeight: 'bold' }}>Process Time (Hours)</label>
              <input className='setting-input' type="number" ref={newProcessTimeRef} />
            </div>
            <div style={{ display: 'flex' }}>
              <p className='add-param-btn' onClick={() => setSingleBatchView('edit-params')}>
                <FontAwesomeIcon icon={faPlus} style={{ marginRight: '10px' }}/>
                Edit Parameters
              </p>
            </div>
            <div style={{ display: 'flex', width: '86%', marginTop: '10px', justifyContent: 'space-between' }}>
              <h3 className='batch-btn' style={{ textAlign: 'center', marginRight: '20px' }} onClick={() => setSingleBatchView('buttons')}>Cancel</h3>
              <h3 className='batch-btn harvest' style={{ textAlign: 'center' }} onClick={() => onAddMeasurementClick()}>Done</h3>
            </div>
          </>
          ) : (
            <>
              <p>My Parameters</p>
              <input className='setting-input' ref={newProcessTimeRef} placeholder='Parameter Name'/>
              <input className='setting-input' ref={newProcessTimeRef} placeholder='Data Type'/>
              <div style={{ display: 'flex', width: '86%', marginTop: '10px', justifyContent: 'space-between' }}>
                <h3 className='batch-btn' style={{ textAlign: 'center', marginRight: '20px' }} onClick={() => setSingleBatchView('add-measurement')}>Cancel</h3>
                <h3 className='batch-btn harvest' style={{ textAlign: 'center' }} onClick={() => onAddMeasurementClick()}>Done</h3>
              </div>
            </>
          )}
        </div>
        <div style={{ paddingLeft: '30px', width: '69%', overflowY: 'auto', height: '89vh' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '10px', marginTop: '10px' }}>
            <p onClick={() => setVisibleGraph('TVC')} className={ visibleGraph === 'TVC' ? 'graph-header-active' : 'graph-header'}>Total Viable Cells</p>
            <p onClick={() => setVisibleGraph('VCD')} className={ visibleGraph === 'VCD' ? 'graph-header-active' : 'graph-header'}>Viable Cell Density</p>
          </div>
          { visibleGraph === 'TVC' ? (
            <div style={{ width: '85%', marginLeft: '5%' }}>
              <Scatter data={chartDataA} options={options} width={100} height={50}/>
            </div>
          ) : (
            <div style={{ width: '85%', marginLeft: '5%' }}>
              <Scatter data={chartDataB} options={options2} width={100} height={50}/>
            </div>
          )}
          <div style={{ position : "relative", width: '100%', overflowX: 'auto', border: '1px solid lightgray', borderRadius: '5px', marginTop: '20px' }}>
            <div style={{ 
              display: 'flex', 
              width: "100%", 
              paddingTop : "30px", 
              paddingBottom : "30px", 
              paddingLeft: '20px', 
              paddingRight : "50px", 
              borderBottom: '1px solid lightgray',
            }}>
              <p className='measurement-header' style={{ minWidth: '100px' }}>Date</p>
              <p className='measurement-header' style={{ minWidth: '50px' }}>TVC</p>
              <p className='measurement-header' style={{ minWidth: '50px' }}>VCD</p>
              <p className='measurement-header' style={{ minWidth: '50px' }}>CD</p>
              <p className='measurement-header' style = {{ minWidth : "75px" }}> Phenotyping </p>
              <p className='measurement-header' style={{ minWidth: '80px' }}>Delete</p>
            </div>
            {measurements.map((item, index) => (
              <div
                key={index}
                className='measurement-row'
                style={{ 
                  display: 'flex', 
                  alignItems : "center", 
                  position : "relative", 
                  paddingTop: '20px', 
                  paddingBottom : "20px", 
                  paddingLeft: '20px', 
                  paddingRight: '50px', 
                  width: "100%",
                  borderBottom: '1px solid lightgray', 
                  cursor: 'pointer',
                  gap: "70px",
                }}
                onClick={() => handleMeasurementClick(batchesView.id, item.id)}
              >
                <div>
                  <p style={{ margin: '0px', minWidth: '100px' }}>{item.measurement_date.split('T')[0]}</p>
                  <p style={{ margin: '0px', color: 'gray', fontSize: '12px' }}>{item.measurement_date.split('T')[1]}</p>
                </div>
		{item.data["TVC (cells)"] ? (<p style={{ margin: '0px', minWidth: '50px' }}>{(item.data["TVC (cells)"] / 1000000000).toFixed(3)}b</p>) : (<p style = {{margin : "0px", minWidth : "50px"}}> - </p>)}
                {item.data["Avg Viability (%)"] ? (<p style={{ margin: '0px', minWidth: '50px' }}>{item.data["Avg Viability (%)"].toFixed(3)}</p>) : (<p style = {{margin : "0px", minWidth : "50px"}}> - </p>)}
                {item.data["Avg Cell Diameter (um)"] ? (<p style={{ margin: '0px', minWidth: '50px' }}>{item.data["Avg Cell Diameter (um)"].toFixed(3)}</p>) : (<p style = {{margin : "0px", minWidth : "50px"}}> - </p>)}
                {(item.data["CD3%"] || item.data["CD8%"] || item.data["CD4%"] || item.data["CM %"] || item.data["CM %"] || item.data["Naive %"] || item.data["Effector %"] || item.data["EM %"] || item.data["CD14%"] || item.data["CD19%"] || item.data["CD20%"] || item.data["CD56%"]) ? (
                  <div
                    onMouseEnter={() => setHoveredMeasurement(index)}
                    onMouseLeave={() => setHoveredMeasurement(null)}
                  >
                    <p style = {{
                      margin : "0px",
                      minWidth : "75px",
                      position : "relative",
                      borderBottom : "2px dashed black",
                      display : "inline-flex",
                    }}>
                      {item.data["Unit Ops"]}
                    </p>
                    {hoveredMeasurement == index && (
                      <div style = {{
                        backgroundColor : "#333",
                        color : "#fff",
                        zIndex : "10",
                        position : "absolute",
                        left : "250px",
                        bottom : "5px",
                        borderRadius : "12px",
                        columnCount : 2,
                        maxHeight : "120px",
                        padding : "10px",
                      }}>
                        {Object.entries(item.data).map(([key, value]) => {
                          if (value && ["CD3%", "CD8%", "CD4%", "CM %", "Naive %", "Effector %", "EM %", "CD14%", "CD19%", "CD20%", "CD56%"].includes(key)) {
                            return (
                              <div key = {key}>
                                <strong> {key}: </strong> {value.toFixed(1)}
                              </div>
                            )
                          }
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <p style = {{ margin : "0px", minWidth : "75px" }}>
                    -
                  </p>
                )}
		<FontAwesomeIcon className='delete-measurement-btn' icon={faTrash} style={{ width: '80px' }}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SingleBatch;
