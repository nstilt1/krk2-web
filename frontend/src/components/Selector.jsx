import React, { useState } from 'react';

const Selector = ({ options, selectedOption, onChange, label }) => {
  
    const handleChange = (event) => {
      event.preventDefault();
      event.stopPropagation();
      onChange(event.target.value);
    };
  
    return (
      <div className="w-full rounded-lg p-2">
        <div className="mb-3">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dropdown">
            {label}
          </label>
          <div className="relative">
            <select
              id="dropdown"
              value={selectedOption}
              onChange={handleChange}
              className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="" disabled>Select an option</option>
              {options.map((option, index) => (
                <option key={index} value={option.value}>{option.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
};
  
export default Selector