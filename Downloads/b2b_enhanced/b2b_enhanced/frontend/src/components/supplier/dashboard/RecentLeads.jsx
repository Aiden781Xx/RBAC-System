import React from 'react';

export default function RecentLeads({ leads }) {
  return (
    <div className="recent-leads">
      {leads.map((lead) => (
        <div key={lead.id} className="lead-item">
          {lead.title}
        </div>
      ))}
    </div>
  );
}
