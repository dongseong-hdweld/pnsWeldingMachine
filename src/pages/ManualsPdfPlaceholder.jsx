// src/pages/ManualsPdfPlaceholder.jsx
import React from 'react'
import PageWrap from './_PageWrap.jsx'
import Card from '../components/Card.jsx'

function useQuery() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  return {
    model: params.get('model') || '-',
    lang: params.get('lang') || '-',
    action: params.get('action') || '-',
  }
}

const LANG_LABELS = {
  en: 'English',
  ko: '한국어',
  zh: '中文',
  ja: '日本語',
  ru: 'Русский',
}

export default function ManualsPdfPlaceholder() {
  const { model, lang, action } = useQuery()
  const langLabel = LANG_LABELS[lang] || lang

  return (
    <PageWrap title="PDF 안내" subtitle="PDF 등록 필요">
      <Card>
        <div className="space-y-3 text-slate-700">
          <p className="text-base">
            <b>PDF를 등록해 주세요.</b>
          </p>
          <p className="text-sm">
            요청하신 문서: <b>{model}</b> / <b>Owner’s Manual</b> / <b>{langLabel}</b> ({action})
          </p>
          <ul className="list-disc pl-5 text-sm">
            <li>관리자 페이지에서 해당 모델/언어의 PDF를 업로드하면 이 페이지 대신 실제 문서가 열립니다.</li>
            <li>다운로드 버튼 또한 업로드 완료 시 실제 PDF 파일을 내려받도록 연결됩니다.</li>
          </ul>

          <div className="pt-2">
            <a href="/manuals" className="text-sm underline">← 메뉴얼 검색으로 돌아가기</a>
          </div>
        </div>
      </Card>
    </PageWrap>
  )
}
