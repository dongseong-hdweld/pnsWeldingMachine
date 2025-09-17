// src/components/Header.jsx
import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import NavLinkItem from './NavLinkItem.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function Header(){
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()

  // 현재 언어는 경로 프리픽스(/ko | /en)로 판단
  const isEN = pathname.startsWith('/en')
  const lang = isEN ? 'en' : 'ko'
  const base = isEN ? '/en' : '/ko'
  const isHome = pathname === '/ko' || pathname === '/en'

  // 라벨(영/한) 사전
  const L = isEN
    ? {
        brandTitle: 'Welding Machine Registration System',
        brandCaption: 'Prototype',
        manuals: 'Warranty',          // 변경: "Manuals & Warranty" → "Warranty"
        register: 'Register Product',
        products: 'Product Lookup',
        support: 'Support',
        toggleTitle: 'Switch language',
        currentLang: 'English',
        nextLang: '한국어',
      }
    : {
        brandTitle: '용접기 등록 시스템',
        brandCaption: '프로토타입',
        manuals: '워런티',            // 변경: "매뉴얼 & 워런티" → "워런티"
        register: '제품 등록',
        products: '제품 조회',
        support: '고객센터',
        toggleTitle: '언어 전환',
        currentLang: '한국어',
        nextLang: 'English',
      }

  // 언어 스위치: /ko/... ↔ /en/...
  const switchLang = () => {
    const toLang = isEN ? 'ko' : 'en'
    // 현재 경로에서 언어 프리픽스 제거 후 새 프리픽스 부착
    const stripped = pathname.replace(/^\/(ko|en)(?=\/|$)/, '')
    const nextPath = `/${toLang}${stripped || ''}` || `/${toLang}`
    navigate(nextPath + (search || '') + (hash || ''), { replace: false })
  }

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border
                       border-slate-200 dark:bg-slate-900/80 dark:border-slate-700">
      <div className="max-w-5xl mx-auto px-4">
        {/* 상단 바: 좌측 브랜드, 우측 토글들 */}
        <div className="flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-400" aria-hidden />
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                <Link to={base} className="hover:underline">{L.brandTitle}</Link>
              </h1>
              <p className="text-slate-500 text-sm dark:text-slate-400">{L.brandCaption}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 언어 토글 (한 파일 내 영/한 전환) */}
            <button
              type="button"
              onClick={switchLang}
              title={L.toggleTitle}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm
                         border-slate-300 bg-white hover:bg-slate-50
                         dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              <span className="font-medium">{L.currentLang}</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-500">{L.nextLang}</span>
            </button>

            <ThemeToggle />
          </div>
        </div>

        {/* 홈에서도 네비 표시 */}
        <nav aria-label="Primary" className="pb-3">
          <ul className="flex flex-wrap gap-2">
            <NavLinkItem to={`${base}/manuals`} label={L.manuals} />
            <NavLinkItem to={`${base}/register`} label={L.register} />
            <NavLinkItem to={`${base}/products`} label={L.products} />
            <NavLinkItem to={`${base}/support`} label={L.support} />
          </ul>
        </nav>
      </div>
    </header>
  )
}
