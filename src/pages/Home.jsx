// src/pages/Home.jsx
import React from 'react';
import Footer from '../components/Footer.jsx';
import Card from '../components/Card.jsx';

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8"> {/* 가로 폭: 5xl → 6xl, 상하 여백 증가 */}
      <Card>
        {/* 카드 내부 세로 공간을 크게 */}
        <div className="py-10 md:py-14 lg:py-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-200">
            현대 PNS 용접기 제품 등록 시스템 프로토타입
          </h2>
        </div>
      </Card>

      <Footer />
    </main>
  );
}
