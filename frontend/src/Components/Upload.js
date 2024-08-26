import './Upload.css'
import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import { REACT_APP_API_URL } from "../consts";
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  overflow-x: auto;
`;

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
  background-color: #f0f0f0;
  font-weight: bold;
`;

const DataCell = styled(Cell)`
  background-color: ${({ color }) => color || 'white'};
`;

const Upload = () => {
  const [dataset, setDataset] = useState([]);

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
      console.log(data.length);
      setDataset(data);
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

  const renderHeaders = () => (
    <Row>
      {Object.keys(dataset[0]['data']).map((key) => (
        <HeaderCell style={{ width: `${key.length * 8 + 20}px` }}>
          {key}
        </HeaderCell>
      ))}
    </Row>
  )

  const renderRows = () => dataset.slice(0, 100).map((row, index) => (
    <Row key={index}>
      {Object.keys(row['data']).map((key) => {
        return (
          <DataCell style={{ width: `${key.length * 8 + 20}px` }}>
            {row['data'][key]}
          </DataCell>
        );
      })}
    </Row>
  ));

  return (
    <div style={{ paddingLeft: '3%', paddingTop: '2%', flex: 1 }}>
      <div className='upload-btn' onClick={() => {}}>
        <FontAwesomeIcon icon={faCloudArrowUp} style={{  }} />
        <p style={{ margin: '0px', marginTop: '10px', fontWeight: 'bold' }}>Upload New Data</p>
        <p style={{ margin: '0px', marginTop: '10px', color: 'gray', fontSize: '12px' }}>.xlsx</p>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} style={{ position: 'absolute', top: '0', left: '0', opacity: '0', width: '100%', height: '100%', cursor: 'pointer' }} />
      </div>

      <div style={{ height: '78%', overflow: 'hidden', overflowY: 'auto', marginTop: '40px', border: '0.1px solid #ddd', borderRadius: '0px' }}>
        {renderHeaders()}
        {renderRows()}
      </div>
    </div>
  ) 
}

export default Upload;