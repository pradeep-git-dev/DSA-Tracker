import React from "react";

export default function Select({ name, options, placeholder }) {
  return (
    <select name={name} required>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
