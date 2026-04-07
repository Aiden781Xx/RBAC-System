import React from 'react';

export default function LeadCard({ lead, onBuy }) {
  return (
    <div className="lead-card">
      <h3>{lead.title}</h3>
      <p>{lead.description}</p>
      <button onClick={() => onBuy(lead.id)}>Buy</button>
    </div>
  );
}
