import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import '../Styles/Form.css';

function Form({ onClose, handleUpload, submitForm, inputs, setInputs, }) {
  const handleInputChange = (index, event) => {
    const values = [...inputs];
    values[index] = event.target.value;
    setInputs(values);
  };

  const handleAddInput = () => {
    setInputs([...inputs, '']);
  };

  const handleRemoveInput = (index) => {
    const values = [...inputs];
    values.splice(index, 1);
    setInputs(values);
  };

  return (
    <div className="overlay">
      <div className="overlay-content">
        <button onClick={onClose} className="close-btn">
          <FontAwesomeIcon size="lg" icon={faXmark} />
        </button>
        <form style={{marginTop: "20px"}}>
          <div style={{display: "flex", flexDirection: "row"}}>
            <button type="button" onClick={handleAddInput} className="icon-btn">
                <FontAwesomeIcon style={{ marginRight: '5px', marginBottom: '5px'}} icon={faPlus} />
            </button>
            <div style={{color: "black", marginLeft: "10px", marginBottom: "10px"}}>Add Questions</div>
          </div>
          {inputs.map((input, index) => (
            <div key={index} className="input-group">
              <input
                type="text"
                placeholder="Enter questions here"
                value={input}
                onChange={(event) => handleInputChange(index, event)}
                style={{color: "black"}}
              />
              <button type="button" onClick={() => handleRemoveInput(index)} className="icon-btn">
                <FontAwesomeIcon icon={faTrash} />
              </button> 
            </div>
          ))}
            <label style={{ background: "white", color: "Red" }}>
                  <strong>Submit </strong>
              <button
                  onClick={submitForm}
              />
          </label>
          <label style={{ background: "white", color: "black" }}>
                  <strong>or/and Upload a Template</strong>
              <input
                  type="file"
                  multiple
                  onChange={(event) => handleUpload(event, 1)}
                  style={{ display: 'none' }}
              />
          </label>
        </form>
      </div>
    </div>
  );
}

export default Form;
