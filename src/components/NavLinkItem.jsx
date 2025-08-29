// src/components/NavLinkItem.jsx
import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function NavLinkItem({ to, label }){
  const { pathname } = useLocation()
  const active = pathname === to
  return (
    <li>
      <Link
        to={to}
        className={[
          'inline-flex items-center rounded-xl border px-3 py-2 text-sm font-semibold',
          active
            ? 'border-slate-300 bg-slate-100 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        ].join(' ')}
      >
        {label}
      </Link>
    </li>
  )
}
