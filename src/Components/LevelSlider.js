import React from 'react'
import { useState } from 'react'

function LevelSlider({ min, max, step, initialValue, onChange }) {

    const [sliderValue, setSliderValue] = useState(initialValue)
    const tanSlope = 0.17
    
    const handleSliderChange = (event) => {
        setSliderValue(event.target.value); // Update internal slider value
    };


    // Only send the value on button click to prevent performance issues
    const handleButtonClick = () => {
        onChange(Number(sliderValue) / tanSlope); // Send value to parent on button click
    };

    return (
        <div style={{ padding: '10px', textAlign: 'center' }}>
            <label htmlFor="buffer-slider">Water Level (meters): </label>
            <input
                id="buffer-slider"
                type="range"
                min={min}
                max={max}
                step={step}
                value={sliderValue}
                onChange={handleSliderChange}
            />
            <span>{sliderValue}m</span>
            <span>{'\t'}</span>
            <button onClick={handleButtonClick}>Apply Water Level Change</button>
        </div>
    )
}

LevelSlider.defaultProps = {
    min: 0,
    max: 1000,
    step: 10,
    initialValue: 10
}

export default LevelSlider