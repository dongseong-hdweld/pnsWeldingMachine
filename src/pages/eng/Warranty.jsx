// src/pages/eng/Warranty.jsx
import React from 'react'
import PageWrap from '../_PageWrap.jsx'
import Card from '../../components/Card.jsx'

/** Warranty content (English only) — links only, no images */
const WARRANTY_CONTENT = {
  en: {
    title: 'Warranty Policy',
    bullets: [
      'This product is covered by a limited warranty against manufacturing defects.',
      'Warranty period: 3 years from the date of purchase (unless otherwise specified).',
      'The warranty applies to normal use; consumables, misuse/abuse, and unauthorized modifications are excluded.',
      'Keep the serial number and proof of purchase; they are required when requesting service.',
      'Service requests should be submitted via an authorized dealer or our customer support center.',
    ],
    docLabel: 'Warranty Document (EN)',
    docUrl: 'https://example.com/warranty/en.pdf',
  },
}

export default function Warranty() {
  const wt = WARRANTY_CONTENT.en

  return (
    <PageWrap title="Warranty" subtitle="">
      {/* ====== Warranty only ====== */}
      <Card className="mb-4" title="Warranty Policy">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card title={wt.title}>
            <ul className="list-disc pl-5 text-slate-800 dark:text-slate-200 text-sm space-y-1">
              {wt.bullets.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </Card>

          <Card title="Warranty Documents">
            <p className="text-slate-600 dark:text-slate-200 text-sm mb-2">EN — {wt.docLabel}</p>
            <div className="flex flex-wrap gap-2">
              <a
                href={wt.docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-white text-sm font-semibold hover:opacity-90 dark:border-slate-700 dark:bg-slate-800"
              >
                Open in new tab
              </a>
              <a
                href={wt.docUrl}
                download="warranty-en.pdf"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                title="Download PDF"
              >
                Download PDF
              </a>
            </div>
            <p className="text-slate-500 dark:text-slate-300 text-xs mt-2">* Actual warranty PDF to be provided.</p>
          </Card>
        </div>
      </Card>
    </PageWrap>
  )
}
