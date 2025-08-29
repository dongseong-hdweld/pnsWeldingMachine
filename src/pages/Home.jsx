// src/pages/Home.jsx
import React from 'react';
import Footer from '../components/Footer.jsx';

export default function Home() {
  return (
    // ⬇️ max-w-6xl → max-w-5xl, px-4 → px-3 (md 이상은 px-4)
    <main className="max-w-5xl mx-auto px-3 md:px-4 py-8">
      <section className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm
                          dark:border-slate-700 dark:bg-slate-900">
        {/* ⬇️ px-6 → px-4 md:px-6 (작은 화면에서 더 좁게) */}
        <div className="px-4 md:px-6 py-10 md:py-14 lg:py-16 flex flex-col items-center justify-center gap-3">
          <h2 className="text-center text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-200">
            현대 PNS 용접기 제품 등록 시스템 프로토타입
          </h2>
          <p className="text-center text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
            <br /> 본 사이트는 완성본이 아니며, <br />
            내부 검토 및 이해관계자 커뮤니케이션을 위한 프로토타입입니다. <br />
            실제 서비스, 정책, 문구, 화면 구성 등은 추후 변경될 수 있습니다.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
