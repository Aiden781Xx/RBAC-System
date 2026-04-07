import React from 'react';

export default function CertificationUpload({ onUpload }) {
  return (
    <div className="certification-upload">
      <input type="file" onChange={(e) => onUpload(e.target.files[0])} />
    </div>
  );
}
