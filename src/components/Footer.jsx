// src/components/Footer.jsx
import React from 'react';

export default function Footer({
  text = 'Welding Machine Registration System • Prototype',
  year,
  className = 'text-slate-500 dark:text-slate-400 text-sm mt-6 text-center',
}) {
  const y = year ?? new Date().getFullYear();
  return (
    <footer className={className}>
      <div>© {y} {text}</div>
      <div className="mt-1">Created by Hyundai Welding IT Department</div>
    </footer>
  );
}
