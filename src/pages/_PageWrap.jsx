// src/pages/_PageWrap.jsx
import React from 'react';
import Footer from '../components/Footer.jsx';

export default function PageWrap({ title, subtitle, children }) {
  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <h2 className="text-xl font-bold">{title}</h2>
      {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      <div className="h-2" />
      {children}
      <Footer />
    </main>
  );
}
