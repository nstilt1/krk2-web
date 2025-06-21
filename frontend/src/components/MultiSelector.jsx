import React, { useState } from "react";

const MultiSelect = ({ options, selectedOptions, setSelectedOptions, label }) => {
  return (
    <div className="flex flex-col">
      {label && (
        <label className="mb-2 font-semibold text-gray-700">{label}</label>
      )}

      {options.map((option) => (
        <button
          key={option}
          className={`${
            selectedOptions.includes(option)
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-black"
          } p-2 m-1 rounded`}
          onClick={(event) => {
            event.preventDefault();
            setSelectedOptions(option);
          }
        }
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default MultiSelect