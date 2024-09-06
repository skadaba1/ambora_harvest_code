import './Upload.css'
import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faLayerGroup, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
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
  const [selectedDataset, setSelectedDataset] = useState('Process Monitoring');

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
      // console.log(data[0].flagged_columns);
      const sortedData = data.sort((a, b) => {
        return b.flagged_columns['flagged columns'].length - a.flagged_columns['flagged columns'].length;
      });
      console.log(sortedData);
      setDataset(sortedData);
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
    <Row style={{ borderBottom: '1.5px solid gray' }}>
      <HeaderCell style={{ minWidth: '110px', fontSize: '14px', fontWeight: 'bold' }}>LOT NUMBER</HeaderCell>
      {Object.keys(dataset.length > 0 ? dataset[0]['data'] : {}).map((key) => {
        if (!inactiveColumns.includes(key)) {
          return (
            <HeaderCell key={key} style={{ minWidth: `200px`, width: `200px`, fontSize: '14px', backgroundColor: '#DEEFF5' }}>
              <p style={{ margin: '0px', display: 'inline', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', }}>{key}</p>
              {/* <div style={{ display: 'inline', float: 'right' }}>
                <Switch onChange={(event) => handleHeaderCheck(event, key)} size='medium' checked={true} />
              </div> */}
            </HeaderCell>
          );
        }
        return null; // Return null if condition is not met to avoid rendering anything
      })}
      {inactiveColumns.map((key) => (
        <HeaderCell key={key} style={{ minWidth: `200px`, width: `200px`, fontSize: '14px', backgroundColor: 'lightgray' }}>
          <p style={{ margin: '0px', display: 'inline', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', }}>{key}</p>
          {/* <div style={{ display: 'inline', float: 'right' }}>
            <Switch onChange={(event) => handleHeaderCheck(event, key)} size='medium' checked={false} />
          </div> */}
        </HeaderCell>
      ))}
    </Row>
  )

  const renderRows = () => dataset.slice(0, 100).map((row, index) => (
    <Row key={index}>
      <DataCell style={{ minWidth: '110px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {row['lot_number']}
        {row['flagged_columns']['flagged columns'].length > 0 && <FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'red', marginRight: '5px' }} />}
      </DataCell>
      {Object.keys(row['data']).map((key) => {
        if (!inactiveColumns.includes(key)) {
          return (
            <DataCell 
              style={{ 
                minWidth: `200px`, 
                width: `200px`,
                backgroundColor: row['flagged_columns']['flagged columns'].includes(key) ? 'rgba(255, 0, 0, 0.4)' : 'white',
              }}
            >
              {row['data'][key]}
            </DataCell>
          );
        }
      })}
      {inactiveColumns.map((key) => (
        <DataCell 
            style={{ 
              minWidth: `200px`,
              width: `200px`,
              backgroundColor: row['flagged_columns']['flagged columns'].includes(key) ? 'rgba(255, 0, 0, 0.4)' : 'lightgray',
            }}
          >
            {row['data'][key]}
          </DataCell>
      ))}
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
    <>
    {/* <div style={{ minWidth: '16%', borderRight: '1px solid lightgray' }}>
      <h2 style={{ margin: '0px', marginBottom: '0px', padding: '20px' }}>Datasets</h2>
      <p className={ selectedDataset === 'Process Monitoring' ? 'dataset-name-selected' : 'dataset-name'} onClick={() => setSelectedDataset('Process Monitoring')}>Process Monitoring</p>
      <p className={ selectedDataset === 'Quality Control' ? 'dataset-name-selected' : 'dataset-name'} onClick={() => setSelectedDataset('Quality Control')}>Quality Control</p>
    </div> */}
    <div style={{ minWidth: '16%', borderRight: '1px solid lightgray', height: '100%', overflow: 'auto' }}>
      <h2 style={{ margin: '0px', marginBottom: '0px', padding: '20px' }}>Active Fields</h2>
      {Object.keys(dataset.length > 0 ? dataset[0]['data'] : {}).map((key) => {
        if (!inactiveColumns.includes(key)) {
          return (
            <HeaderCell key={key} style={{ fontSize: '14px', backgroundColor: '#DEEFF5' }}>
              <p style={{ margin: '0px', display: 'inline', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', }}>{key}</p>
              <div style={{ display: 'inline', float: 'right' }}>
                <Switch onChange={(event) => handleHeaderCheck(event, key)} size='medium' checked={true} />
              </div>
            </HeaderCell>
          );
        }
        return null; // Return null if condition is not met to avoid rendering anything
      })}
      {inactiveColumns.map((key) => (
        <HeaderCell key={key} style={{ fontSize: '14px', backgroundColor: 'lightgray' }}>
          <p style={{ margin: '0px', display: 'inline', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', }}>{key}</p>
          <div style={{ display: 'inline', float: 'right' }}>
            <Switch onChange={(event) => handleHeaderCheck(event, key)} size='medium' checked={false} />
          </div>
        </HeaderCell>
      ))}
    </div>
    <div style={{ paddingLeft: '2%', paddingTop: '2%', width: '65%' }}>
      <div style={{ display: 'flex', paddingRight: '3%' }}>
        <h1 style={{ margin: '0px' }}>Batch Raw Data</h1>
        
        {changesMade && (
          <div className="save-btn" style={{ marginLeft: '40px' }} onClick={() => onSaveClick()}>
            <p style={{ margin: '0px', fontWeight: 'bold' }}>Save</p>
          </div>
        )}

        <div className="upload-btn" style={{ position: 'relative', marginLeft: 'auto' }}>
          <FontAwesomeIcon icon={faCloudArrowUp} />
          <p style={{ margin: '0px', marginLeft: '10px', fontWeight: 'bold' }}>Upload New File</p>
          <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} style={{ position: 'absolute', top: '0', left: '0', opacity: '0', width: '100%', height: '100%', cursor: 'pointer' }} />
        </div>
      </div>

      <div style={{ height: '90%', width: '100%', overflow: 'hidden', marginTop: '20px', border: '0.1px solid #ddd', borderRadius: '0px' }}>
        {/* Scrollable area for both headers and rows */}
        <div style={{ width: '100%', overflowX: 'auto', overflowY: 'auto', height: '100%' }}>
          {/* Container to hold headers and rows */}
          <div style={{ minWidth: 'max-content' }}>
            {/* Header Row */}
            <div style={{ display: 'flex', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
              {renderHeaders()}
            </div>

            {/* Rows */}
            <div>
              {renderRows()}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  ) 
}

export default Upload;