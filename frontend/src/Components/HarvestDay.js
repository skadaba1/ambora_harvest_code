import React, { useState, useEffect} from 'react';
import { REACT_APP_API_URL } from "../consts";
import './HarvestDay.css';

const HarvestDay = ({predictions}) => {
    const [harvestCriteria, setHarvestCriteria] = useState(1000000000); // State for the input
    const [predictedHarvestDay, setPredictedHarvestDay] = useState('N/A');


    // Function to handle input change
    const handleInputChange = (e) => {
        setHarvestCriteria(parseInt(e.target.value, 10));  // Ensure the value is an integer
    };

    useEffect(() => {
        console.log(harvestCriteria);
        sendHarvestCriteria();
    }, [harvestCriteria]);

    // Function to send data to the backend and get predicted harvest day
    const sendHarvestCriteria = async () => {
        console.log(predictions.datasets[0])
        try {
            const response = await fetch(REACT_APP_API_URL + 'api/predict-harvest-day/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ harvest_criteria: harvestCriteria, predictions: predictions.datasets[0].data }),
            });
            if (!response.ok) {
                throw new Error('Error fetching the harvest prediction');
            }

            const data = await response.json();
            setPredictedHarvestDay(data.harvest_day);  // Assuming the backend returns this field
        } catch (err) {
            console.log(err);
        } finally {
            console.log('Predicted harvest day:', predictedHarvestDay);
        }
    };

    return (
        <div className="harvest-container" style={{ display: 'flex' }}>
            <div>
            <div className='harvest-title'>Harvest criteria</div>
            <input
                type="number"
                value={harvestCriteria}
                onChange={handleInputChange}
                className="harvest-input"
                placeholder="Enter harvest criteria"
            />
            </div>
            <div className="harvest-day">{predictedHarvestDay}</div>
        </div>
    );
}

export default HarvestDay;
