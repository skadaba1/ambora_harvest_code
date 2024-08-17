import { REACT_APP_API_URL } from "../consts";
import { useState, useEffect } from 'react';

const Trends = () => {
  const [batchStatusData, setBatchStatusData] = useState({
    'Ongoing': [],
    'Harvested': [],
    'Terminated': []
  });

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
        const groupedBatches = {
            'Ongoing': [],
            'Harvested': [],
            'Terminated': []
        };
        result.forEach(batch => {
            const status = batch.status;
            groupedBatches[status].push(batch);  // Add the batch to the appropriate list
        });
        console.log(groupedBatches);
        setBatchStatusData(groupedBatches);
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

  return (
    <div>
      <h1>Trends</h1>
      <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
      <div>
        <h3>Ongoing</h3>
        <p>{batchStatusData['Ongoing'].length}</p>
      </div>
      <div>
        <h3>Harvested</h3>
        <p>{batchStatusData['Harvested'].length}</p>
      </div>
      <div>
        <h3>Terminated</h3>
        <p>{batchStatusData['Terminated'].length}</p>
      </div>
      </div>
    </div>
  )
}

export default Trends