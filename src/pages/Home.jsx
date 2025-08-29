// src/pages/Home.jsx
import React from 'react';
import Footer from '../components/Footer.jsx';

export default function Home() {
  return (
    <main className="max-w-5xl mx_auto px-4 py-6">
      <div className="border border-slate-200 rounded-2xl p-6 bg-white">
        <h2 className="text-xl font-bold">현대 PNS 용접기 제품 등록 시스템 프로토타입</h2>
      </div>
      <Footer />
    </main>
  );
}
