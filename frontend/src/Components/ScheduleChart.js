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
  width: 80px;
  min-width : 80px;
  height: 30px;
  border: 1px solid #ddd;
  text-align: center;
  line-height: 30px;
`;

const HeaderCell = styled(Cell)`
  width: 80px;
  min-width : 80px;
  background-color: #f0f0f0;
`;

const DataCell = styled(Cell)`
  background-color: ${({ color }) => color || 'white'};
`;

const ScheduleChart = ({ numberOfDays, allDates, lotLength, batchSchedule, data }) => {

  const renderHeader = () => (
    <Row>
      <HeaderCell>Slot</HeaderCell>
      {Array.from({ length: numberOfDays }, (_, i) => (
        <HeaderCell key={i}> {allDates[i]} </HeaderCell>
      ))}
    </Row>
  );

  const renderRows = () => data.map((batch, slotIndex) => (
    <Row key={slotIndex}>
      <Cell>Batch {slotIndex + 1}</Cell>
      {Array.from({ length: numberOfDays }, (_, dayIndex) => {
        const isInBatchRange = dayIndex >= batch.start && dayIndex < batch.start + lotLength;
        let color;
        let numCTSs;

        if (isInBatchRange) {
          const dayWithinBatch = dayIndex - batch.start;
          color = dayWithinBatch === 0
            ? 'lightgreen'
            : dayWithinBatch === 1
            ? 'green'
            : dayWithinBatch === 2
            ? 'lightgreen'
            : dayWithinBatch === 4
            ? 'lightgreen'
            : dayWithinBatch === 8
            ? 'lightgreen'
            : dayWithinBatch === 10
            ? 'green'
            : 'white';
          numCTSs = batchSchedule[dayWithinBatch] || 0;
        }

        return (
          <DataCell key={dayIndex} color={color}>
            {isInBatchRange ? numCTSs : ''}
          </DataCell>
        );
      })}
    </Row>
  ));

  // useEffect(() => {
  //   setScheduleData(scheduleData);
  // }, [numberOfDays, data, lotLength, setScheduleData, scheduleData]);

  return (
    <Container>
      {renderHeader()}
      {renderRows()}
    </Container>
  );
};

export default ScheduleChart;
