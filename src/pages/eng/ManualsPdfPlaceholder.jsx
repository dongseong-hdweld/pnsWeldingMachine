// src/pages/eng/ManualsPdfPlaceholder.jsx
import React from 'react'
import { useLocation } from 'react-router-dom'
import PageWrap from '../_PageWrap.jsx'
import Card from '../../components/Card.jsx'

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
  ko: 'Korean',
  zh: '中文',
  ja: '日本語',
  ru: 'Русский',
}

export default function ManualsPdfPlaceholder() {
  const { pathname } = useLocation()
  const base = pathname.startsWith('/en') ? '/en' : '/ko'

  const { model, lang, action } = useQuery()
  const langLabel = LANG_LABELS[lang] || lang

  return (
    <PageWrap title="PDF Notice" subtitle="PDF upload required">
      <Card>
        <div className="space-y-3 text-slate-700 dark:text-slate-200">
          <p className="text-base">
            <b>Please upload the PDF.</b>
          </p>
          <p className="text-sm">
            Requested document: <b>{model}</b> / <b>Owner’s Manual</b> / <b>{langLabel}</b> ({action})
          </p>
          <ul className="list-disc pl-5 text-sm">
            <li>
              Once the PDF for this model/language is uploaded in the admin portal, this page will be
              replaced by the actual document.
            </li>
            <li>
              The “Download” button will also start downloading the real PDF after the upload is completed.
            </li>
          </ul>

          <div className="pt-2">
            <a href={`${base}/manuals`} className="text-sm underline">
              ← Back to manuals search
            </a>
          </div>
        </div>
      </Card>
    </PageWrap>
  )
}
