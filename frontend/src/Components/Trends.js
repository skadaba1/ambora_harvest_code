import { REACT_APP_API_URL } from "../consts";
import { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';

const options = {
  scales: {
    y: {
      beginAtZero: true,
    },
  },
  plugins: {
    legend: {
      display: false, // Hide the legend
    },
  },
};

const options2 = {
  scales: {
    x: {
      title: {
        display: true,
        text: 'Day Number'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Count'
      },
      beginAtZero: true
    }
  }
};

const Trends = () => {
  const [batchStatusData, setBatchStatusData] = useState({
    'Ongoing': [],
    'Harvested': [],
    'Terminated': []
  });
  const [batchChart, setBatchChart] = useState({
    labels: ['Ongoing Batches', 'Harvested Batches', 'Terminated Batches'], // Labels for the x-axis
    datasets: [
      {
        label: 'Batches',
        data: [12, 19, 3], // The 3 numbers you want to display
        backgroundColor: [
          'rgba(50, 150, 255, 0.5)',
          'rgba(0, 200, 0, 0.4)',
          'rgba(200, 0, 0, 0.4)',
        ],
      },
    ],
  })
  const [lineChartData, setLineChartData] = useState({
    labels: Array.from({ length: 17 }, (_, i) => i), // Days (x-axis)
    datasets: [
      {
        label: 'Count per Day',
        data: [], // Counts (y-axis)
        fill: false,
        backgroundColor: 'rgba(75,192,192,1)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  })

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
        const groupedBatchesTags = {};
        const labels = Array.from({ length: 17 }, (_, i) => i); // [0, 1, 2, ..., 16]

        async function processBatches(result) {
          let datasets = [];
          for (const batch of result) {
            if (batch.data) {
              try {
                const batchData = await getMeasurementsForBatch(batch.id);
                console.log(batchData);
        
                datasets.push({
                  label: batch.id,
                  data: labels.map(label => batchData[label] || 0), // Counts (y-axis)
                  fill: false,
                  backgroundColor: 'rgba(75,192,192,1)',
                  borderColor: 'rgba(75,192,192,1)',
                });
              } catch (error) {
                console.error(`Error fetching data for batch ${batch.id}:`, error);
              }
            }
          }
          return datasets;
        }

        const newDatasets = await processBatches(result);
        setLineChartData((prevState) => ({
          ...prevState, // Keep the other properties unchanged
          labels: labels, // Update with new data values
          datasets: newDatasets,
        }));
        console.log(groupedBatches);
        setBatchStatusData(groupedBatches);
        setBatchChart((prevState) => ({
          ...prevState, // Keep the other properties unchanged
          datasets: [
            {
              ...prevState.datasets[0], // Keep the other properties of the dataset unchanged
              data: [
                groupedBatches['Ongoing'].length, 
                groupedBatches['Harvested'].length, 
                groupedBatches['Terminated'].length], // Update with new data values
            },
          ],
        }));
      } else {
        const errorData = await response.json();
        console.error('Error fetching batches:', errorData.error);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  }

  const getMeasurementsForBatch = async (batchId) => {
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
        console.log(result)
        // calculate days from first day
        const firstMeasurementDate = new Date(
          Math.min(...result.map((item) => new Date(item.measurement_date)))
        );
        // console.log(firstMeasurementDate)
        let output = {};
        result.map((item) => {
          // console.log(item.measurement_date)
          const timeDifference = new Date(item.measurement_date) - firstMeasurementDate; // Time difference in milliseconds
          const daysDifference = timeDifference / (1000 * 60 * 60 * 24); // Convert milliseconds to days
        
          // return {
          //   ...item,
          //   days_since_first_measurement: Math.round(daysDifference), // Round the result to nearest whole number
          // };
          output[Math.round(daysDifference)] = item.data.total_viable_cells
          // return [Math.round(daysDifference), item.data.total_viable_cells]
        });
        console.log(output)
        return output;
      } else {
        const errorData = await response.json();
        console.error('Error fetching measurements:', errorData.error);
      }
    } catch (error) {
      console.error('Error fetching measurements:', error);
    }
  }

  useEffect(() => {
    getBatches();
  }, []);

  return (
    <div style={{paddingLeft: '3%', paddingTop: '25px', flex: 1 }}>
      <h1 style={{ margin: '0px' }}>Trends</h1>
      <div style={{ width: '47%', backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '15px', marginTop: '30px' }}>
        <p style={{ margin: '0px', marginBottom: '20px', fontWeight: 'bold' }}>Current Batch Statistics</p>
        <Bar data={batchChart} options={options}/>
        <Line data={lineChartData} options={options2}/>
      </div>
      {/* <div style={{ border: '1px solid black', borderRadius: '5px', padding: '10px', marginTop: '10px', width: '47%' }}>
        <h3>Batch Statistics</h3>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
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
      </div> */}
    </div>
  )
}

export default Trends