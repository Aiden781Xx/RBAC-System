import React, { useState } from 'react';

export default function QuoteForm({ leadId, onSubmit }) {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ leadId, amount });
  };

  return (
    <form onSubmit={handleSubmit} className="quote-form">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Quote amount"
      />
      <button type="submit">Submit Quote</button>
    </form>
  );
}
