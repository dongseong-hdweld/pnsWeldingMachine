// src/components/Footer.jsx
import React from 'react';

export default function Footer({
  text = 'Welding Machine Registration System • Prototype',
  year,
  className = 'text-slate-500 dark:text-slate-400 text-sm mt-6',
}) {
  const y = year ?? new Date().getFullYear();
  return <footer className={className}>© {y} {text}</footer>;
}
