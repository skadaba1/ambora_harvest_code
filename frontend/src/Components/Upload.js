import './Upload.css'
import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faInfo } from '@fortawesome/free-solid-svg-icons';
import { REACT_APP_API_URL } from "../consts";
import styled from 'styled-components';
import Switch from '@mui/material/Switch';

const Row = styled.div`
  display: flex;
  white-space : nowrap;
`;

const Cell = styled.div`
  min-width : 80px;
  height: 30px;
  border: 0.5px solid #ddd;
  line-height: 30px;
  padding-left: 10px;
`;

const HeaderCell = styled(Cell)`
  min-width : 80px;
  min-height : 38px;
  display: flex;
  align-items: center;  // Aligns items vertically in the center
  justify-content: space-between;
`;

const DataCell = styled(Cell)`
  background-color: ${({ color }) => color || 'white'};
  font-size: 14px;
`;

const Upload = () => {
  const [dataset, setDataset] = useState([]);
  const [inactiveColumns, setInactiveColumns] = useState([]);
  const [changesMade, setChangesMade] = useState(false);

  useEffect(() => {
    getAllMeasurements();
  }, []);

  const getAllMeasurements = async () => {
    try {
      const response = await fetch(REACT_APP_API_URL + 'api/get-measurements/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log(data);
      setDataset(data);
      const inactiveColumns = await fetch(REACT_APP_API_URL + 'api/get-inactive-columns/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const inactiveColumnsData = await inactiveColumns.json();
      let newInactiveColumns = []
      Object.keys(inactiveColumnsData).map((key) => {
        newInactiveColumns.push(inactiveColumnsData[key]['name'])
      })
      console.log(newInactiveColumns);
      setInactiveColumns(newInactiveColumns);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const handleHeaderCheck = (event, key) => {
    setChangesMade(true);
    if (event.target.checked) {
      setInactiveColumns(inactiveColumns.filter((column) => column !== key));
    } else {
      setInactiveColumns([...inactiveColumns, key]);
    }
  }

  const renderHeaders = () => (
    <Row>
      <HeaderCell style={{ minWidth: '110px', fontSize: '14px', fontWeight: 'bold' }}>LOT NUMBER</HeaderCell>
      {Object.keys(dataset.length > 0 ? dataset[0]['data'] : {}).map((key) => (
        <HeaderCell style={{ minWidth: `${(key.length * 8) + 90}px`, fontSize: '14px', backgroundColor: inactiveColumns.includes(key) ? 'lightgray' : '#DEEFF5' }}>
          <p style={{ margin: '0px', display: 'inline' }}>{key}</p>
          <div style={{ display: 'inline', float: 'right' }}>
            <Switch onChange={(event) => handleHeaderCheck(event, key)} size='medium' checked={!inactiveColumns.includes(key)} />
          </div>
        </HeaderCell>
      ))}
    </Row>
  )

  const renderRows = () => dataset.slice(0, 100).map((row, index) => (
    <Row key={index}>
      <DataCell style={{ minWidth: '110px', fontWeight: 'bold' }}>{row['lot_number']}</DataCell>
      {Object.keys(row['data']).map((key) => {
        return (
          <DataCell style={{ minWidth: `${key.length * 8 + 90}px`, backgroundColor: inactiveColumns.includes(key) ? 'lightgray' : 'white' }}>
            {row['data'][key]}
          </DataCell>
        );
      })}
    </Row>
  ));

  const onSaveClick = async () => {
    try {
      const response = await fetch(REACT_APP_API_URL + 'api/update-inactive-columns/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: inactiveColumns
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChangesMade(false);
      } else {
        console.error('File upload failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }

  return (
    <div style={{ paddingLeft: '3%', paddingTop: '2%', width: '77%' }}>
      <div style={{ display: 'flex', paddingRight: '3%' }}>
        <h1 style={{ margin: '0px' }}>My Dataset</h1>
        
        {changesMade && (
          <div className="save-btn" style={{ marginLeft: '40px' }} onClick={() => onSaveClick()}>
            <p style={{ margin: '0px', fontWeight: 'bold' }}>Save</p>
          </div>
        )}

        <div className="upload-btn" style={{ position: 'relative', marginLeft: 'auto' }}>
          <FontAwesomeIcon icon={faCloudArrowUp} />
          <p style={{ margin: '0px', marginLeft: '10px', fontWeight: 'bold' }}>Upload File</p>
          <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} style={{ position: 'absolute', top: '0', left: '0', opacity: '0', width: '100%', height: '100%', cursor: 'pointer' }} />
        </div>
      </div>

      <div style={{ height: '90%', width: '100%', overflowY: 'auto', overflowX: 'auto', marginTop: '30px', border: '0.1px solid #ddd', borderRadius: '0px' }}>
        {renderHeaders()}
        {renderRows()}
      </div>
    </div>
  ) 
}

export default Upload;