// src/pages/ko/Manuals.jsx
import React from 'react'
import PageWrap from '../_PageWrap.jsx'
import Card from '../../components/Card.jsx'

/** 워런티 컨텐츠(한국어 고정) – 이미지 제거, 문서 링크만 */
const WARRANTY_CONTENT = {
  ko: {
    title: '워런티 정책',
    bullets: [
      '본 제품은 제조상 하자에 대해 제한 보증이 제공됩니다.',
      '보증 기간: 구매일로부터 3년(별도 표기 시 그에 따름).',
      '정상 사용 범위 내에서 적용되며 소모품·오남용·임의 개조는 제외됩니다.',
      '시리얼 번호와 구매 증빙을 보관해 주세요. 서비스 접수 시 필요합니다.',
      '서비스는 공인 대리점 또는 고객센터를 통해 접수해 주세요.',
    ],
    docLabel: '워런티 서류 (KO)',
    docUrl: 'https://example.com/warranty/ko.pdf',
  },
}

export default function Manuals() {
  const wt = WARRANTY_CONTENT.ko

  return (
    <PageWrap title="워런티" subtitle="">
      {/* ====== 워런티만 표시 ====== */}
      <Card className="mb-4" title="워런티 정책">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card title={wt.title}>
            <ul className="list-disc pl-5 text-slate-800 dark:text-slate-200 text-sm space-y-1">
              {wt.bullets.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </Card>

          <Card title="Warranty Documents">
            <p className="text-slate-600 dark:text-slate-200 text-sm mb-2">KO — {wt.docLabel}</p>
            <div className="flex flex-wrap gap-2">
              <a
                href={wt.docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-white text-sm font-semibold hover:opacity-90 dark:border-slate-700 dark:bg-slate-800"
              >
                새 탭으로 열기
              </a>
              <a
                href={wt.docUrl}
                download="warranty-ko.pdf"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                title="PDF 다운로드"
              >
                PDF 다운로드
              </a>
            </div>
            <p className="text-slate-500 dark:text-slate-300 text-xs mt-2">* 워런티 문서 제공 필요</p>
          </Card>
        </div>
      </Card>
    </PageWrap>
  )
}
