// src/pages/eng/Home.jsx
import React from 'react';
import Footer from '../../components/Footer.jsx';

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto px-3 md:px-4 py-8">
      <section className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm
                          dark:border-slate-700 dark:bg-slate-900">
        <div className="px-4 md:px-6 py-10 md:py-14 lg:py-16 flex flex-col items-center justify-center gap-3">
          <h2 className="text-center text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-200">
            Welding Machine Registration System — Prototype
          </h2>

          <div className="text-center text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl space-y-2">
            <p><strong>This site is not for production use.</strong></p>
            <p>
              This prototype is for internal review and stakeholder feature validation.
              Design, copy, and layout are subject to change at any time.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
