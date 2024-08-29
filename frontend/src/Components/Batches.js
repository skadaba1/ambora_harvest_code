import './Batches.css'
import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faArrowLeft, faTrash, faCircle } from '@fortawesome/free-solid-svg-icons';
import { REACT_APP_API_URL } from "../consts";
import Schedule from './Schedule';
import SingleBatch from './SingleBatch';

const statusColors = [
  '#ff0f0f',
  '#eed202',
  '#4CBB17',
  '#4CBB17',
]

const Batches = () => {
  const [batchesView, setBatchesView] = useState('batches');
  const [batches, setBatches] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [chartDataA, setChartDataA] = useState({
    labels: [],
    datasets: [
      {
        label: 'Measurement Value 1',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        data: [],
      },
      {
        label: 'Measurement Value 2',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(153,102,255,0.4)',
        borderColor: 'rgba(153,102,255,1)',
        data: [],
      },
      {
        label: 'Measurement Value 3',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(255,159,64,0.4)',
        borderColor: 'rgba(255,159,64,1)',
        data: [],
      },
    ],
  });
  const [chartDataB, setChartDataB] = useState({
    labels: [],
    datasets: [
      {
        label: 'Predicted TVC',
        data: {},
        backgroundColor: 'lightblue',
        borderColor: 'lightblue',
        showLine: false // This ensures it's a scatter plot without lines
      },
      {
        label: 'Observed TVC',
        data: {},
        backgroundColor: 'blue',
        borderColor: 'blue',
        showLine: false // This ensures it's a scatter plot without lines
      },

    ]
  });
  const lotNumberRef = useRef(null);
  const batchStartDateRef = useRef(null);

  const getBatches = async () => {
    try {
      const response = await fetch(REACT_APP_API_URL + 'api/batches/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const result = await response.json();
        result.sort((a, b) => {
            if (a.status === "Ongoing" && b.status !== "Ongoing") {
                return -1; // a should come before b
            } else if (a.status !== "Ongoing" && b.status === "Ongoing") {
                return 1; // b should come before a
            } else {
                return 0; // a and b are equal in terms of sorting criteria
            }
        });
        console.log(result);
        setBatches(result);
      } else {
        const errorData = await response.json();
        console.error('Error fetching batches:', errorData.error);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  }

  useEffect(() => {
    getBatches();
  }, []);

  const onAddBatchClick = async () => {
    try {
      const response = await fetch(REACT_APP_API_URL + 'api/add-batch/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lotNumber: lotNumberRef.current.value,
          batchStartDate: batchStartDateRef.current.value,
        }),
      });

      if (response.status === 200) {
        const result = await response.json();
      } else {
        const errorData = await response.json();
        console.error('Error adding batch:', errorData.error);
      }
    } catch (error) {
      console.error('Error adding batch:', error);
    }
    setBatchesView('batches');
    getBatches();
  }

  const deleteAllBatches = async () => {
    try {
      const response = await fetch(REACT_APP_API_URL + 'api/delete-all-batches/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        getBatches();
      } else {
        const errorData = await response.json();
        console.error('Error deleting all batches:', errorData.error);
      }
    } catch (error) {
      console.error('Error deleting all batches:', error);
    }
  }

  const getMeasurements = async (batchId) => {
    try {
      const response = await fetch(REACT_APP_API_URL + 'api/get-measurements/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lotId: batchId
        }),
      });

      if (response.status === 200) {
        const result = await response.json();
        result.sort((a, b) => new Date(b.measurement_date) - new Date(a.measurement_date));
        setMeasurements(result);
        handleMeasurementClick(batchId, result[0].id);
      } else {
        const errorData = await response.json();
        console.error('Error fetching measurements:', errorData.error);
      }
    } catch (error) {
      console.error('Error fetching measurements:', error);
    }
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(REACT_APP_API_URL + 'api/upload-process-file/', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log('File uploaded successfully:', data);
        } else {
          console.error('File upload failed:', response.statusText);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  }

  const handleMeasurementClick = async (batchId, measurementId) => {
    try {
      const response = await fetch(REACT_APP_API_URL + 'api/sim-growth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchId: batchId,
          measurementId: measurementId,
        }),
      });
  
      if (response.status === 200) {
        const result = await response.json();
        let observations = result['observations'];
        let predictions = result['predictions'];
        // Handle the result as needed
        let labels_obs = []
        let labels_pred = []
        let tvc_pred = []
        let tvc_obs = []
        for (let i = 0; i < observations.length; i++) {
          labels_obs.push(observations[i]['data']['Process Time from Day 1 (hours)'])
          tvc_obs.push(observations[i]['data']['TVC (cells)'])
        }
        for (let i = 0; i < predictions.length; i++) {
          labels_pred.push(predictions[i]['Process Time from Day 1 (hours)'])
          tvc_pred.push(predictions[i]['TVC (cells)'])
        }
        setChartDataA({
          //labels: labels,
          datasets: [
            {
              label: 'Predicted TVC',
              data: tvc_pred.map((value, index) => ({ x: labels_pred[index], y: value })),
              backgroundColor: 'lightblue',
              borderColor: 'lightblue',
              showLine: false, // This ensures it's a scatter plot without lines
              pointRadius: 6,  // Adjust this value to make the points larger
              pointHoverRadius: 8  // Adjust this value to make the points larger when hovered
            },
            {
              label: 'Observed TVC',
              data: tvc_obs.map((value, index) => ({ x: labels_obs[index], y: value })),
              backgroundColor: 'blue',
              borderColor: 'blue',
              showLine: false, // This ensures it's a scatter plot without lines
              pointRadius: 6,  // Adjust this value to make the points larger
              pointHoverRadius: 8  // Adjust this value to make the points larger when hovered
            },
          ]
        });
        setChartDataB({
          // labels: labels,
          datasets: [
            {
              label: 'Predicted TVC',
              data: tvc_pred,
              backgroundColor: 'lightblue',
              borderColor: 'lightblue',
              showLine: false, // This ensures it's a scatter plot without lines
              pointRadius: 8,  // Adjust this value to make the points larger
              pointHoverRadius: 10  // Adjust this value to make the points larger when hovered
            },
            {
              label: 'Observed TVC',
              data: tvc_obs,
              backgroundColor: 'blue',
              borderColor: 'blue',
              showLine: false, // This ensures it's a scatter plot without lines
              pointRadius: 8,  // Adjust this value to make the points larger
              pointHoverRadius: 10  // Adjust this value to make the points larger when hovered
            },
          ]
        });
      } else {
        const errorData = await response.json();
        console.error('Error in API call:', errorData.error);
      }
    } catch (error) {
      console.error('Error in API call:', error);
    }
  };

  return (
    <>
      {batchesView === 'batches' ? (
        <div style={{ paddingLeft: '3%', paddingRight: '3%', flex: 1, overflowY: 'auto', paddingTop: '10px' }}>
          <Schedule />
          <div style={{ display: 'flex', marginTop: '20px', marginBottom: '20px', alignItems: 'center' }}>
            <h2 style={{ marginBottom: '0px', marginTop: '0px', marginRight: '40px' }}>Batches List <span style={{ color: 'gray', fontStyle: 'italic', fontSize: '20px', marginLeft: '5px' }}>({batches.length})</span></h2>
            <button className='add-batch-btn' style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }} onClick={() => setBatchesView('addBatch')}>
              <FontAwesomeIcon icon={faPlus} />
              <p style={{ margin: '0px', marginLeft: '5px', fontWeight: 'bold' }}>Add Batch</p>
            </button>
            <button className="file-input-container add-batch-btn" style={{ position: 'relative' }}>
              <FontAwesomeIcon icon={faPlus} />
              <p style={{ margin: '0px', marginLeft: '5px', fontWeight: 'bold' }}>Upload File</p>
              <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} style={{ position: 'absolute', top: '0', left: '0', opacity: '0', width: '100%', height: '100%', cursor: 'pointer' }} />
            </button>
            <FontAwesomeIcon icon={faTrash} onClick={deleteAllBatches} size='lg' style={{ marginLeft: '20px', cursor: 'pointer'}} />
          </div>
          <div style={{ display: 'flex', width: '95%', padding: '20px', borderBottom: '1px solid lightgray', justifyContent: 'space-between' }}>
            <p style={{ margin: '0px', width: '70px', display: 'flex', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>Status</p>
            <p style={{ margin: '0px', width: '130px', fontWeight: 'bold', fontSize: '16px' }}>Lot Number</p>
            <p style={{ margin: '0px', width: '130px', fontWeight: 'bold', fontSize: '16px' }}>Batch Start Date</p>
            <p style={{ margin: '0px', width: '200px', fontWeight: 'bold', fontSize: '16px' }}>Predicted Harvest Date</p>
          </div>
          {batches.map((item, index) => (
            <div
              key={index}
              className='batches-row'
              onClick={() => {
                setBatchesView({ id: item.id, lotNumber: item.lot_number, status: item.status });
                getMeasurements(item.id);
              }}
              style={{ display: 'flex', width: '95%', padding: '10px', paddingLeft: '20px', paddingRight: '20px', justifyContent: 'space-between', marginTop: '8px', borderRadius: '10px', alignItems: 'center' }}
            >
              <p style={{ margin: '0px', width: '70px', alignItems: 'center', display: 'flex', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', color: item.status === 'Terminated' ? 'red' : 'black' }}>
                { item.status === 'Ongoing' ? <FontAwesomeIcon icon={faCircle} color={'#4CBB17'} size='lg'/> : item.status === 'Terminated' ? 'Terminated' : 'Harvested' }
              </p>
              <p style={{ margin: '0px', width: '130px', fontWeight: 'bold', fontSize: '14px' }}>{item.lot_number}</p>
              <div style={{ width: '130px' }}>
                <p style={{ margin: '0px' }}>{item.batch_start_date.split('T')[0]}</p>
                <p style={{ margin: '0px', color: 'gray', fontSize: '12px', }}>{item.batch_start_date.split('T')[1]}</p>
              </div>
              { !item.harvest_date ? (
                <p style={{ margin: '0px', width: '200px' }}>-</p>
              ) : (
                <div style={{ width: '200px' }}>
                  <p style={{ margin: '0px', width: '100px' }}>{item.harvest_date.split('T')[0]}</p>
                  <p style={{ margin: '0px', color: 'gray', fontSize: '12px' }}>{item.harvest_date.split('T')[1]}</p>
                </div>
              )}
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
            <input className='setting-input' ref={lotNumberRef} />
          </div>
          <div style={{ marginTop: '30px' }}>
            <label style={{ fontWeight: 'bold' }}>Batch Start Date</label>
            <input className='setting-input' type="datetime-local" ref={batchStartDateRef} />
          </div>
          <button className='batch-submit-btn' onClick={() => onAddBatchClick()} style={{ marginTop: '30px' }}>Submit</button>
        </div>
      ) : (
        <SingleBatch setBatchesView={setBatchesView} batchesView={batchesView} getMeasurements={getMeasurements} getBatches={getBatches} measurements={measurements} chartDataA={chartDataA} chartDataB={chartDataB} handleMeasurementClick={handleMeasurementClick}/>
      )}
    </>
  );
}

export default Batches;
