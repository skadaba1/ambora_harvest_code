// src/GanttChart.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { REACT_APP_API_URL } from "../consts";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import './Schedule.css';

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
  border: 0.5px solid #ddd;
  font-size: 14px;
`;

const DataCell = styled(Cell)`
  background-color: ${({ color }) => color || 'white'};
`;

const formatDate = (date) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayOfWeek = days[date.getDay()]
  return `${dayOfWeek} ${day}`
}

const Schedule = ({}) => {
  const [allDates, setAllDates] = useState([]);
  const [batchData, setBatchData] = useState({});
  const [sortedMonths, setSortedMonths] = useState([]);
  const [monthIndex, setMonthIndex] = useState(0);
  const [numberOfDays, setNumberOfDays] = useState(0);

  const getAllDates = (startDate) => {
    console.log(startDate)
    // Convert timeKey back to a Date object
    const monthStartDate = new Date(startDate);
    console.log(monthStartDate)
    // Get the year and month from the Date object
    const year = monthStartDate.getFullYear();
    const month = monthStartDate.getMonth();
    console.log(year, month)
    // Create a Date object for the first day of the next month
    const nextMonthStartDate = new Date(year, month + 1, 1);
    console.log(nextMonthStartDate)
    // Subtract one day to get the last day of the current month
    const lastDayOfMonth = new Date(nextMonthStartDate - 1);
    // Get the day number, which is the number of days in the month
    const daysInMonth = lastDayOfMonth.getDate();
    console.log(daysInMonth)
    setNumberOfDays(daysInMonth)

    const dates = []
    for (let i = 0; i < daysInMonth; i++) {
      const nextDate = new Date(monthStartDate);
      nextDate.setDate(monthStartDate.getDate() + i)
      dates.push(formatDate(nextDate))
    }
    console.log(dates)
    return dates
  }

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
        console.log(result);
        const startDates = result.map(batch => {
          return new Date(batch.batch_start_date);
        });
        console.log(startDates)
        const months = [];

        const groupedDates = startDates.reduce((acc, date) => {
          // Create a Date object that's 10 days after the current date
          const endDate = new Date(date);
          endDate.setDate(date.getDate() + 10);
          // Create a Date object for the first day of the month
          const monthKey = new Date(date.getFullYear(), date.getMonth(), 1);
          const endMonthKey = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
          // Convert the Date object to its time value for consistent key comparison
          const timeKey = monthKey.getTime();
          const endTimeKey = endMonthKey.getTime();
          // If the key doesn't exist in the accumulator, create an empty array
          if (!acc[timeKey]) {
            acc[timeKey] = [];
            months.push(timeKey);
          }
          // Push the current date into the appropriate array
          acc[timeKey].push([date.getDate(), date.getDate() + 11, 0]);

          if (timeKey !== endTimeKey) {
            console.log("RAN")
            // If the key doesn't exist in the accumulator, create an empty array
            if (!acc[endTimeKey]) {
              acc[endTimeKey] = [];
              months.push(endTimeKey);
            }
            // Push the current date into the appropriate array
            acc[endTimeKey].push([1, endDate.getDate() + 1, 11 - endDate.getDate()]);
          }
          return acc;
        }, {});
        months.sort()
        console.log(groupedDates)

        console.log(months)

        setSortedMonths(months);
        setBatchData(groupedDates);
        setAllDates(getAllDates(months[0]))
      } else {
        const errorData = await response.json();
        console.error('Error fetching batches:', errorData.error);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  }

  useEffect(() => {
    getBatches()
  }, []);

  const onNextMonthClick = () => {
    const newMonthIndex = Math.min(monthIndex + 1, sortedMonths.length - 1)
    setAllDates(getAllDates(sortedMonths[newMonthIndex]))
    setMonthIndex(newMonthIndex)
  }

  const onPrevMonthClick = () => {
    const newMonthIndex = Math.max(monthIndex - 1, 0)
    setAllDates(getAllDates(sortedMonths[newMonthIndex]))
    setMonthIndex(newMonthIndex)
  }

  const renderHeader = () => (
    <Row>
      {Array.from({ length: numberOfDays }, (_, i) => (
        <HeaderCell key={i}> {allDates[i]} </HeaderCell>
      ))}
    </Row>
  );

  const renderRows = () => (Object.keys(batchData).length > 0 && batchData[sortedMonths[monthIndex]].sort((a, b) => a[0] - b[0]) || []).map((batch, slotIndex) => (
    <>
    <p style={{ whiteSpace: 'nowrap', marginTop: 6, marginBottom: 3, marginLeft: (batch[0] - 1) * 61, fontSize: 12, fontWeight: 'bold' }}>Batch {slotIndex + 1}</p>
    <Row key={slotIndex}>
      {Array.from({ length: numberOfDays }, (_, dayIndex) => {
        const isInBatchRange = dayIndex + 1 >= batch[0] && dayIndex + 1 < batch[1];
        let color;

        if (isInBatchRange) {
          let dayWithinBatch = dayIndex + 1 - batch[0] + batch[2];
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
          <DataCell key={dayIndex + 1} color={color} style={{ border: isInBatchRange ? '0.5px solid gray' : '0.5px solid lightgray' }}>
            {isInBatchRange ? dayIndex + 1 - batch[0] + batch[2] : ''}
          </DataCell>
        );
      })}
    </Row>
    </>
  ));

  return (
    <div style={{ padding: '3%', flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        {/* <h1 style={{ marginBottom: '0px', marginTop: '0px', marginRight: '40px' }}>Batch Schedule</h1> */}
        <div className='month-arrow' onClick={() => onPrevMonthClick()} style={{ marginRight: '5px' }}>
          <FontAwesomeIcon icon={faAngleLeft} size='md' color='gray'/>
        </div>
        <div className='month-arrow' onClick={() => onNextMonthClick()} style={{ marginRight: '15px' }}>
          <FontAwesomeIcon icon={faAngleRight} size='md' color='gray'/>
        </div>
        <h2 style={{ color: 'gray', fontWeight: 'normal' }}>{new Date(sortedMonths[monthIndex]).toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
      </div>
      <div style={{ overflowX: 'auto', paddingBottom: '20px' }}>
        {renderHeader()}
        {renderRows()}
      </div>
    </div>
  );
};

export default Schedule;
