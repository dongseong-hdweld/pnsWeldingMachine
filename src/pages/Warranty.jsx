// src/pages/Warranty.jsx
import React, { useState } from 'react'
import PageWrap from './_PageWrap.jsx'
import Card from '../components/Card.jsx'

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  // 동유럽 예시: 러시아어 (원하시면 PL 등으로 바꿔드려요)
  { code: 'ru', label: 'Русский' },
]

const CONTENT = {
  en: {
    title: 'Warranty Policy',
    bullets: [
      'This product includes a limited warranty against manufacturing defects.',
      'Coverage period: 3 years from the date of purchase (unless otherwise specified).',
      'Applies to normal use; excludes wear items, misuse, and unauthorized modifications.',
      'Keep the serial number and proof of purchase; required for service.',
      'For service, contact authorized dealers or submit a request via Support.',
    ],
    imageAlt: 'Warranty illustration',
    docLabel: 'Warranty Document (EN)',
    docUrl: 'https://example.com/warranty/en.pdf',
  },
  ko: {
    title: '워런티 정책',
    bullets: [
      '본 제품은 제조상 하자에 대해 제한 보증이 제공됩니다.',
      '보증 기간: 구매일로부터 3년(별도 표기 시 그에 따름).',
      '정상 사용 범위 내에서 적용되며 소모품·오남용·임의 개조는 제외됩니다.',
      '시리얼 번호와 구매 증빙을 보관해 주세요. 서비스 접수 시 필요합니다.',
      '서비스는 공인 대리점 또는 고객센터를 통해 접수해 주세요.',
    ],
    imageAlt: '워런티 관련 이미지',
    docLabel: '워런티 서류 (KO)',
    docUrl: 'https://example.com/warranty/ko.pdf',
  },
  zh: {
    title: '保修政策',
    bullets: [
      '本产品提供针对制造缺陷的有限保修。',
      '保修期：自购买之日起3年（如有另行说明，以说明为准）。',
      '保修适用于正常使用；耗材、误用、擅自改装不在保修范围内。',
      '请妥善保存序列号和购买凭证，售后需要提供。',
      '维修请联系授权服务中心或通过客服提交。',
    ],
    imageAlt: '保修相关示意图',
    docLabel: '保修文件 (ZH)',
    docUrl: 'https://example.com/warranty/zh.pdf',
  },
  ja: {
    title: '保証ポリシー',
    bullets: [
      '本製品には製造上の欠陥に対する限定保証が適用されます。',
      '保証期間：購入日から3年間（別途記載がある場合はその期間）。',
      '通常使用に限り適用。消耗品・誤用・無断改造は対象外です。',
      'シリアル番号と購入証明を保管してください（受付時に必要）。',
      'サービスは認定代理店またはサポート窓口へご依頼ください。',
    ],
    imageAlt: '保証に関するイメージ',
    docLabel: '保証書 (JA)',
    docUrl: 'https://example.com/warranty/ja.pdf',
  },
  ru: {
    title: 'Гарантийная политика',
    bullets: [
      'На изделие предоставляется ограниченная гарантия от производственных дефектов.',
      'Срок гарантии: 3 года с даты покупки (если не указано иное).',
      'Гарантия действует при нормальной эксплуатации; расходники, неправильное использование и модификации не покрываются.',
      'Сохраняйте серийный номер и чек о покупке — они необходимы для сервиса.',
      'По вопросам сервиса обращайтесь к авторизованным дилерам или в службу поддержки.',
    ],
    imageAlt: 'Иллюстрация к гарантии',
    docLabel: 'Гарантийный документ (RU)',
    docUrl: 'https://example.com/warranty/ru.pdf',
  },
}

export default function Warranty(){
  const [lang, setLang] = useState('ko')
  const t = CONTENT[lang]

  return (
    <PageWrap
      title="워런티 정책"
      subtitle="언어 전환 버튼 / 상단 정책 문구 / 하단 이미지-문서 2열 레이아웃"
    >
      {/* 언어 선택 */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-2">
          {LANGS.map(({ code, label }) => {
            const active = code === lang
            return (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={active}
                className={[
                  'inline-flex items-center rounded-xl border px-3 py-2 text-sm font-semibold',
                  active
                    ? 'border-slate-300 bg-slate-100 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100',
                ].join(' ')}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 1) 최상단: 워런티 정책(보편 문구) */}
      <Card title={t.title}>
        <ul className="list-disc pl-5 text-slate-700 text-sm space-y-1">
          {t.bullets.map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>
      </Card>

      {/* 2) 하단 2열: (왼쪽) 이미지 / (오른쪽) PDF 문서 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        {/* 왼쪽: 이미지 */}
        <Card title="Image">
          <img
            src="https://placehold.co/800x400?text=Warranty+Image"
            alt={t.imageAlt}
            className="w-full h-56 md:h-64 object-cover rounded-xl border border-slate-200"
          />
          <p className="text-slate-500 text-xs mt-2">
            * Placeholder image. Replace with your actual warranty graphic.
          </p>
        </Card>

        {/* 오른쪽: 문서(새탭 열기 + 다운로드) */}
        <Card title="Warranty Documents">
          <p className="text-slate-600 text-sm mb-2">
            {lang.toUpperCase()} — {t.docLabel}
          </p>

          <div className="flex flex-wrap gap-2">
            <a
              href={t.docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-white text-sm font-semibold hover:opacity-90"
            >
              새 탭으로 열기
            </a>
            <a
              href={t.docUrl}
              download={`warranty-${lang}.pdf`}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              title="PDF 다운로드"
            >
              PDF 다운로드
            </a>
          </div>

          <p className="text-slate-500 text-xs mt-2">
            * URL은 추후 실제 파일로 교체하세요. (일부 외부 도메인은 브라우저 정책에 따라 강제 다운로드가 제한될 수 있습니다)
          </p>
        </Card>
      </div>
    </PageWrap>
  )
}
