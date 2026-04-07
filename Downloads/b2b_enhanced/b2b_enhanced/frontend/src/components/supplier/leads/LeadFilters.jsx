import React from 'react';

export default function LeadFilters({ onChange }) {
  // simple example filter input to avoid unused prop warning
  const handleInput = (e) => {
    if (onChange) onChange(e.target.value);
  };

  return (
    <div className="lead-filters">
      <input
        type="text"
        placeholder="Search leads"
        onChange={handleInput}
        className="border p-2 rounded"
      />
    </div>
  );
}
