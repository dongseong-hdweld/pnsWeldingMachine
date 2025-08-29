// src/components/Header.jsx
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import NavLinkItem from './NavLinkItem.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function Header(){
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b
                       border-slate-200 dark:bg-slate-900/80 dark:border-slate-700">
      <div className="max-w-5xl mx-auto px-4">
        {/* 상단 바: 좌측 브랜드, 우측 테마 토글 */}
        <div className="flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-400" aria-hidden />
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                <Link to="/" className="hover:underline">Welding Machine Registration System</Link>
              </h1>
              <p className="text-slate-500 text-sm dark:text-slate-400">프로토타입</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* 홈에서도 네비 표시하려면 이대로 사용 */}
        <nav aria-label="Primary" className="pb-3">
          <ul className="flex flex-wrap gap-2">
            <NavLinkItem to="/warranty" label="워런티 정책" />
            <NavLinkItem to="/register" label="제품 등록" />
            <NavLinkItem to="/support" label="고객센터" />
            <NavLinkItem to="/manuals" label="메뉴얼 검색" />
            <NavLinkItem to="/service" label="수리/대리점" />
          </ul>
        </nav>
      </div>
    </header>
  )
}
