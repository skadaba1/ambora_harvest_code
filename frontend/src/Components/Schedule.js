// src/GanttChart.js
import React, { useEffect, useState } from 'react';
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
  width: 60px;
  min-width : 60px;
  height: 25px;
  text-align: center;
  line-height: 25px;
  font-size: 12px;
`;

const HeaderCell = styled(Cell)`
  background-color: #f0f0f0;
  border: 0.5px solid gray;
`;

const DataCell = styled(Cell)`
  background-color: ${({ color }) => color || 'white'};
`;

const formatDate = (date) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayOfWeek = days[date.getDay()]
  return `${dayOfWeek} ${month}/${day}`
}

const batchData = [
  {
    start: 0,
    length: 15,
  },
  {
    start: 3,
    length: 11,
  },
  {
    start: 6,
    length: 11,
  },
  {
    start: 9,
    length: 11,
  },
]

const Schedule = ({ numberOfDays=30 }) => {
  const [allDates, setAllDates] = useState([]);

  const getAllDates = (startDate, totalNumberOfDays) => {
    const dates = []
    for (let i = 0; i < totalNumberOfDays; i++) {
      const nextDate = new Date(startDate)
      nextDate.setDate(startDate.getDate() + i)
      dates.push(formatDate(nextDate))
    }
    return dates
  }

  useEffect(() => {
    setAllDates(getAllDates(new Date(), numberOfDays))
  }, [numberOfDays])

  const renderHeader = () => (
    <Row>
      {Array.from({ length: numberOfDays }, (_, i) => (
        <HeaderCell key={i}> {allDates[i]} </HeaderCell>
      ))}
    </Row>
  );

  const renderRows = () => batchData.map((batch, slotIndex) => (
    <>
    <p style={{ marginTop: 6, marginBottom: 3, marginLeft: batch.start * 61, fontSize: 12, fontWeight: 'bold' }}>Batch {slotIndex + 1}</p>
    <Row key={slotIndex}>
      {Array.from({ length: 30 }, (_, dayIndex) => {
        const isInBatchRange = dayIndex >= batch.start && dayIndex < batch.start + batch.length;
        let color;

        if (isInBatchRange) {
          const dayWithinBatch = dayIndex - batch.start;
          color = dayWithinBatch === 0
            ? 'lightyellow'
            : dayWithinBatch === 1
            ? 'yellow'
            : dayWithinBatch === 2
            ? 'lightyellow'
            : dayWithinBatch === 4
            ? 'lightyellow'
            : dayWithinBatch === 8
            ? 'lightyellow'
            : dayWithinBatch === 10
            ? 'lightblue'
            : dayWithinBatch > 10
            ? 'lightgreen'
            : 'white';
        }

        return (
          <DataCell key={dayIndex} color={color} style={{ border: isInBatchRange ? '0.5px solid gray' : '0.5px solid white' }}>
            {isInBatchRange ? dayIndex - batch.start : ''}
          </DataCell>
        );
      })}
    </Row>
    </>
  ));

  return (
    <div style={{ padding: '3%', flex: 1, overflowY: 'auto' }}>
      <h1 style={{ marginBottom: '0px', marginTop: '0px', marginRight: '40px', marginBottom: '20px' }}>Batch Schedule</h1>
      {renderHeader()}
      {renderRows()}
    </div>
  );
};

export default Schedule;
