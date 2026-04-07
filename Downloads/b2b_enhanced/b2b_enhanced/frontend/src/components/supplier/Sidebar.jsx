import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <ul>
        <li><Link to="/supplier/dashboard">Dashboard</Link></li>
        <li><Link to="/supplier/leads">Leads</Link></li>
        <li><Link to="/supplier/myLeads">My Leads</Link></li>
        <li><Link to="/supplier/quotes">Quotes</Link></li>
        <li><Link to="/supplier/performance">Performance</Link></li>
        <li><Link to="/supplier/profile">Profile</Link></li>
      </ul>
    </nav>
  );
}
