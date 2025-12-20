'use client';

import React from 'react';

export function PrintButton() {
  const handleClick = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <button type="button" className="print-button" onClick={handleClick}>
      چاپ بولتن
    </button>
  );
}
