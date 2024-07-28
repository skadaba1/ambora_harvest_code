import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import ScheduleChart from './ScheduleChart';
import React, { useState, useRef, useEffect } from 'react';

Chart.register(...registerables);

const batchSchedule = [3, 4, 3, 0, 2, 0, 0, 0, 2, 0, 4]
const batchScheduleDay = [1, 2, 1, 0, 1, 0, 0, 0, 1, 0, 2]

const Simulation = () => {
  const [numberOfDays, setNumberOfDays] = useState(30);
  const [scheduleData, setScheduleData] = useState({});
  const [dayToNumCTSAvailable, setDayToNumCTSAvailable] = useState({0 : 5, 1 : 5, 2 : 11, 3 : 11, 4 : 11, 5 : 6, 6 : 6})
  const [chartData, setChartData] = useState([]);
  const numberOfDaysRef = useRef(null);
  
  const startDateRef = useRef(new Date())
  const sunRef = useRef(null)
  const monRef = useRef(null)
  const tueRef = useRef(null)
  const wedRef = useRef(null)
  const thurRef = useRef(null)
  const friRef = useRef(null)
  const satRef = useRef(null) 
  
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const formatDate = (date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dayOfWeek = days[date.getDay()]
    return `${dayOfWeek} ${month}/${day}`
  }

  const getAllDates = (startDate, totalNumberOfDays) => {
    const dates = []
    for (let i = 0; i < totalNumberOfDays; i++) {
      const nextDate = new Date(startDate)
      nextDate.setDate(startDate.getDate() + i)
      dates.push(formatDate(nextDate))
    }
    return dates
  }

  const [allDates, setAllDates] = useState(getAllDates(new Date(), numberOfDays))

  const [lotLength, setLotLength] = useState(11)
  const lotLengthRef = useRef(null)
  
  const getNumCTSAvailableEachDay = (startDate, totalNumberOfDays) => {
    const date = new Date(startDate)
    const startDay = date.getDay()
    const CTSAvailable = []
    for (let i = 0; i < totalNumberOfDays; i++) {
      CTSAvailable.push(dayToNumCTSAvailable[(startDay + i) % 7])
    }
    return CTSAvailable
  }

  const [data, setData] = useState({
    labels: allDates,
    datasets: [
      {
        label: 'CTSs Needed per Day',
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(75,192,192,0.4)',
        hoverBorderColor: 'rgba(75,192,192,1)',
        data: Object.values(scheduleData),
      },
      {
        label : "CTSs Available per Day",
        data : getNumCTSAvailableEachDay(new Date(), numberOfDays),
      },
    ],
  });

  useEffect(() => {
    sunRef.current.value = 5;
    monRef.current.value = 5;
    tueRef.current.value = 11;
    wedRef.current.value = 11;
    thurRef.current.value = 11;
    friRef.current.value = 6;
    satRef.current.value = 6;
    numberOfDaysRef.current.value = 30;

    changeChartsInfo({
      0: sunRef.current.value, 
      1: monRef.current.value, 
      2: tueRef.current.value, 
      3: wedRef.current.value, 
      4: thurRef.current.value, 
      5: friRef.current.value, 
      6: satRef.current.value
    })
  }, []);

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  const onRunPress = () => {
    const startDateRefVal = new Date(startDateRef.current.value + 'T00:00:00') // not sure why you need this but GPT said so

    setNumberOfDays(numberOfDaysRef.current.value);

    // setLotLength(lotLengthRef.current.value);
    setLotLength(11);
    
    setAllDates(getAllDates(startDateRefVal, numberOfDaysRef.current.value))

    console.log(sunRef.current.value)
    setDayToNumCTSAvailable({
      0: sunRef.current.value, 
      1: monRef.current.value, 
      2: tueRef.current.value, 
      3: wedRef.current.value, 
      4: thurRef.current.value, 
      5: friRef.current.value, 
      6: satRef.current.value
    })

    changeChartsInfo({
      0: sunRef.current.value, 
      1: monRef.current.value, 
      2: tueRef.current.value, 
      3: wedRef.current.value, 
      4: thurRef.current.value, 
      5: friRef.current.value, 
      6: satRef.current.value
    })
  };

  const changeChartsInfo = (dayToNumCTSAvailable) => {
    const date = new Date()
    const startDay = date.getDay()
    const CTSAvailable = []
    for (let i = 0; i < numberOfDays; i++) {
      CTSAvailable.push(parseInt(dayToNumCTSAvailable[(startDay + i) % 7], 10))
    }

    let newScheduleData = {};
    let newScheduleDays = {};
    let data = [];

    for (let i = 0; i < numberOfDays; i++) {
      newScheduleData[i] = 0;
      newScheduleDays[i] = 0;
    }

    let i = 0;
    while (i < numberOfDays) {
      let batchFits = true;
      for (let j = 0; j < batchSchedule.length && i + j < numberOfDays; j++) {
        if (newScheduleData[i + j] + batchSchedule[j] > CTSAvailable[i + j]) {
          if ((newScheduleDays[i + j] + batchScheduleDay[j] < 2 && CTSAvailable[i + j] < 8) || (newScheduleDays[i + j] + batchScheduleDay[j] < 4 && CTSAvailable[i + j] >= 8)) {
            continue;
          }
          batchFits = false;
          i++;
          break;
        }
      }

      if (batchFits) {
        data.push({ start: i });
        for (let j = 0; j < batchSchedule.length && i + j < numberOfDays; j++) {
          newScheduleData[i + j] += batchSchedule[j];
          newScheduleDays[i + j] += batchScheduleDay[j];
        }
        console.log(newScheduleData)
      }
    }

    console.log(data)
    console.log(newScheduleData)

    setData((prevData) => ({
      ...prevData,
      labels: allDates,
      datasets: [
        {
          ...prevData.datasets[0],
          data: Object.values(newScheduleData),
        },
        {
          ...prevData.datasets[1],
          data: CTSAvailable,
        }
      ],
    }));

    setChartData(data);
    setScheduleData(newScheduleData);
  }

  return (
    <>
      <div style={{ padding: '30px', width: '55%', overflowY: 'auto' }}>
        <h1 style={{ marginBottom: '20px', marginTop: '0px' }}>Manufacturing Schedule</h1>
        <ScheduleChart numberOfDays={numberOfDays} allDates={allDates} lotLength={lotLength} batchSchedule={batchSchedule} data={chartData} />
        <h1 style={{ marginBottom: '0px', marginTop: '40px' }}>CTS Distribution</h1>
        <Bar data={data} options={options} style={{width: '80%' }}/>
      </div>
      <div style={{ background: 'lightgray', padding: '20px', flex: '1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: '0px' }}>Variables</h2>
          <button className='run-button' onClick={onRunPress}>Run</button>
        </div>
        <div style={{ marginTop: '30px' }}>
          <label style={{ fontWeight: 'bold' }}>Start Date</label>
          <input className='setting-input' type="date" ref={startDateRef} />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label style={{ fontWeight: 'bold' }}>Number of Days</label>
          <input className='setting-input' type="number" ref={numberOfDaysRef}/>
        </div>
        <div style={{ marginTop: '10px' }}>
          <label style={{ fontWeight: 'bold' }}>Buffer</label>
          <input className='setting-input' type="number" />
        </div>
        <div style={{ marginTop: "20px" }}>
          <label style={{ fontWeight: 'bold' }}> CTSs Available per Day </label>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <label style={{ marginRight: '10px' }}>Sunday</label>
            <input className = "day-input" type="number" ref={sunRef} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '10px' }}>Monday</label>
            <input className = "day-input" type="number" ref={monRef} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '10px' }}>Tuesday</label>
            <input className = "day-input" type="number" ref={tueRef} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '10px' }}>Wednesday</label>
            <input className = "day-input" type="number" ref={wedRef} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '10px' }}>Thursday</label>
            <input className = "day-input" type="number" ref={thurRef} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '10px' }}>Friday</label>
            <input className = "day-input" type="number" ref={friRef} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '10px' }}>Saturday</label>
            <input className = "day-input" type="number" ref={satRef} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Simulation;