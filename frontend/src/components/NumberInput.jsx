import React from 'react';

const NumberInput = ({ value, onChange, id, label }) => {
    const handleChange = (event) => {
        const floatValue = parseFloat(event.target.value);
        onChange(isNaN(floatValue) ? "" : floatValue);
    };

    return (
        <div className="rounded-lg p-2">
        <div className="flex items-center border border-gray-300 rounded-md p-2">
            <input
                type="number"
                step="any"
                className="appearance-none border-none text-sm leading-tight rounded-md w-full"
                placeholder="Enter a number"
                value={value}
                onChange={handleChange}
            />
            <label htmlFor={id}>{label}</label>
        </div>
        </div>
    );
};

export default NumberInput