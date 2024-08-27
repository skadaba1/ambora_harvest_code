import { REACT_APP_API_URL } from "../consts";
import { useState, useEffect } from 'react';
import { Bar, Line, Scatter } from 'react-chartjs-2';

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
        text: 'Process Day'
      }
    },
    y: {
      title: {
        display: true,
        text: 'TVC (Billions)'
      },
      beginAtZero: true
    }
  }
};

const models_abbr = {
  'lr': 'Linear Regression',
  'rf': 'Random Forest',
  'svr': 'Support Vector Regression',
  'pls': 'Partial Least Squares',
  'dt': 'Decision Tree',
  'pr': 'Polynomial Regression',
}

const Trends = () => {

  const [responseFeature, setResponseFeature] = useState(""); // For selected response variable
  const [xFeature, setXFeature] = useState(""); // For selected x-axis feature
  const [correlationData, setCorrelationData] = useState({ labels: [], datasets: [] }); // Data for correlation plot

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
  const [measurementData, setMeasurementData] = useState({})
  const [variableAnalysisData, setVariableAnalysisData] = useState({})
  const [variableAnalysisChart, setVariableAnalysisChart] = useState({
    labels: [], // Labels for the x-axis
    datasets: [
      {
        label: 'Batches',
        data: [], // The 3 numbers you want to display
        backgroundColor: [
          'rgba(50, 150, 255, 0.5)',
          'rgba(0, 200, 0, 0.4)',
          'rgba(200, 0, 0, 0.4)',
        ],
      },
    ],
  })

  const handleFeatureSelection = (feature, isResponse = false) => {
      if (isResponse) {
        setResponseFeature(feature);
        setXFeature(""); // Reset x-axis feature if response is changed
        fitSpaModel(feature);
      } else {
        setXFeature(feature);
        if (responseFeature && measurementData[feature] && measurementData[responseFeature]) {
          const data = {
            labels: measurementData[feature],
            datasets: [
              {
                label: `${responseFeature} vs ${feature}`,
                data: measurementData[feature].map((value, index) => ({ x: value, y: measurementData[responseFeature][index] })),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
              }
            ]
          };
          setCorrelationData(data);
        }
      }
    };
  const fetchMeasurementData = async () => {
    try {
      const response = await fetch(REACT_APP_API_URL + 'api/get-measurement-data/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setMeasurementData(data);
    } catch (error) {
      console.error('Error fetching measurement data:', error);
    }
  };

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
        const labels = Array.from({ length: 10 }, (_, i) => i + 1); // [0, 1, 2, ..., 16]

        async function processBatches(result) {
          let datasets = [];
          const lineColor = {
            'N': 'rgba(75,192,192, 0.4)',
            'E': 'rgba(0, 200, 0, 0.4)',
            'TCE': 'rgba(200, 0, 0, 0.4)',
          }
          for (const batch of result) {
            if (batch.data) {
              console.log(batch);
              try {
                const batchData = await getMeasurementsForBatch(batch.id);
                // console.log(batchData);
        
                datasets.push({
                  label: batch.lot_number + '(' + batch.data.tags[0] + ')',
                  data: labels.map(label => batchData[label - 1] !== undefined ? batchData[label - 1] : null), // Use null for missing points
                  fill: false,
                  backgroundColor: lineColor[batch.data.tags[0]],
                  borderColor: lineColor[batch.data.tags[0]],
                  spanGaps: true,
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
          output[Math.round(daysDifference)] = item.data.total_viable_cells / 1000000000
          // return [Math.round(daysDifference), item.data.total_viable_cells]
        });
        return output;
      } else {
        const errorData = await response.json();
        console.error('Error fetching measurements:', errorData.error);
      }
    } catch (error) {
      console.error('Error fetching measurements:', error);
    }
  }

  const fitSpaModel = async (responseFeature) => {
    try {
      const response = await fetch(REACT_APP_API_URL + 'api/fit-spa-model/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responseFeature: responseFeature
        }),
      });
      const data = await response.json();
      console.log(data);
      setVariableAnalysisData(data.data);
      setVariableAnalysisChart((prevState) => ({
        labels: Object.keys(data.data['feature_importance']),
        datasets: [
          {
            ...prevState.datasets[0],
            data: Object.values(data.data['feature_importance']),
          },
        ],
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const handleSPAClick = () => {
    fitSpaModel(responseFeature);
  };

  useEffect(() => {
    fetchMeasurementData()
    getBatches();
  }, []);

  const scatterOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: xFeature || 'X-axis',
        },
        min: Math.min(...(measurementData[xFeature] || [0])), // Set minimum value for x-axis
        max: Math.max(...(measurementData[xFeature] || [1])), // Set maximum value for x-axis
      },
      y: {
        title: {
          display: true,
          text: responseFeature || 'Y-axis',
        },
        min: Math.min(...(measurementData[responseFeature] || [0])), // Set minimum value for y-axis
        max: Math.max(...(measurementData[responseFeature] || [1])), // Set maximum value for y-axis
      },
    },
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  console.log(variableAnalysisChart)

  return (
    <div style={{paddingLeft: '2%', paddingRight: '2%', paddingTop: '25px', paddingBottom: '3%', flex: 1, overflowY: 'auto' }}>
      <h1 style={{ margin: '0px' }}>Trends</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '45%', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '15px', marginTop: '30px', border: '1px solid #ccc' }}>
          <p style={{ margin: '0px', marginBottom: '20px', fontWeight: 'bold' }}>Current Batch Statistics</p>
          <Bar data={batchChart} options={options} />
        </div>
        <div style={{ width: '45%', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '15px', marginTop: '30px', border: '1px solid #ccc' }}>
          <p style={{ margin: '0px', marginBottom: '20px', fontWeight: 'bold' }}>Cell Growth Trends</p>
          <Line data={lineChartData} options={options2} />
        </div>
      </div>

      <div style={{ width: '96%', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '15px', marginTop: '30px', border: '1px solid #ccc' }}>
        <p style={{ margin: '0px', marginBottom: '20px', fontWeight: 'bold' }}>Smart Process Analytics</p>
        <div style={{ display: 'flex', marginBottom: '20px', alignItems: 'center' }}>
          <div style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '8px'}}>
            <label style={{ marginRight: '10px', }}>Response Variable:</label>
            <select onChange={(e) => handleFeatureSelection(e.target.value, true)} value={responseFeature} style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}>
              <option value="">Select...</option>
              {Object.keys(measurementData).map((feature, index) => (
                <option key={index} value={feature}>{feature}</option>
              ))}
            </select>
          </div>
          {/* <button 
            onClick={handleSPAClick} 
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'background-color 0.3s ease',
              width: '100px',
              marginLeft: '10px',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            Analyze
          </button> */}
          <div style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '8px', marginLeft: 'auto'}}>
            <label style={{ marginRight: '10px'}}>X-axis Feature:</label>
            <select onChange={(e) => handleFeatureSelection(e.target.value)} value={xFeature} disabled={!responseFeature} style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}>
              <option value="">Select...</option>
              {Object.keys(measurementData).filter(feature => feature !== responseFeature).map((feature, index) => (
                <option key={index} value={feature}>{feature}</option>
              ))}
            </select>
          </div>
        </div>
        {/* {xFeature && responseFeature && ( */}
        <div style={{ display: 'flex' }}>
          <div style={{ width: '48%', paddingRight: '2%', borderRight: '1px solid black' }}>
            <div style={{ border: '1px solid #ccc', borderRadius: '5px', marginBottom: '30px', padding: '10px'}}>
              <p style={{ margin: '0px', marginBottom: '10px', fontWeight: 'bold' }}>Model: <span style={{ fontWeight: 'normal' }}>{models_abbr[variableAnalysisData['cls']] || 'Not Selected'}</span></p>
              <p style={{ margin: '0px', fontWeight: 'bold' }}>Accuracy: <span style={{ fontWeight: 'normal' }}>{variableAnalysisData['accuracy'] ? variableAnalysisData['accuracy'].toFixed(5) : 'N/A'}</span></p>
            </div>
            <Bar data={variableAnalysisChart} options={options} height={75} width={100}/>
          </div>
          <div style={{ width: '48%', paddingLeft: '2%' }}>
            <Scatter data={correlationData} options={scatterOptions} height={1} width={1}/>
          </div>
        </div>
        {/* )} */}
      </div>

    </div>
  )
}

export default Trends