import React, { useState } from 'react';
import { REACT_APP_API_URL } from "../consts";

function Inputs() {
  const [rows, setRows] = useState([{ value1: '', value2: '' }]);
  const [harvestDays, setHarvestDays] = useState(-1);

  const handleAddRow = () => {
    setRows([...rows, { value1: '', value2: '' }]);
  };

  const handleChange = (index, event) => {
    setHarvestDays(-1);
    const { name, value } = event.target;
    const newRows = rows.map((row, i) =>
      i === index ? { ...row, [name]: value } : row
    );
    setRows(newRows);
  };

  const onPredHarvest = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');      
      const response = await fetch(REACT_APP_API_URL + 'pred-harvest/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          data: rows,
        }),
      });

      if (response.status === 201) {
        const result = await response.json();
        console.log(result);
        setHarvestDays(result)
      } else {
        const errorData = await response.json();
        console.error('Error uploading URL:', errorData.error);
      }
    } catch (error) {
      console.error('Error uploading URL:', error);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontWeight: 'bold', marginBottom: '20px', fontSize: '20px' }}>Input Data</h1>
      {rows.map((row, index) => (
        <div key={index} style={{ display: 'flex', marginBottom: '10px' }}>
          <input
            type="text"
            name="value1"
            value={row.value1}
            onChange={(e) => handleChange(index, e)}
            placeholder="Value 1"
            style={{ marginRight: '10px', border: '0.5px solid gray', borderRadius: '5px', padding: '5px' }}
          />
          <input
            type="text"
            name="value2"
            value={row.value2}
            onChange={(e) => handleChange(index, e)}
            placeholder="Value 2"
            style={{ border: '0.5px solid gray', borderRadius: '5px', padding: '5px' }}

          />
        </div>
      ))}
      <button onClick={handleAddRow} style={{ border: '0.5px solid gray', padding: '10px', borderRadius: '5px', marginRight: '10px' }}>Add Row</button>
      <button onClick={onPredHarvest} style={{ backgroundColor: 'black', color: 'white', padding: '10px', borderRadius: '5px'}}>Predict Harvest</button>
      {harvestDays > -1 && (
        <h1 style={{ marginTop: '20px', fontSize: '20px' }}>Predicted Harvest: Day {harvestDays}</h1>
      )}
    </div>
  );
}

export default Inputs;
