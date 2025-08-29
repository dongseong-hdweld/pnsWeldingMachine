import React from 'react'
import { Link } from 'react-router-dom'


export default function NotFound(){
return (
<main className="max-w-5xl mx-auto px-4 py-6">
<div className="border border-rose-200 bg-rose-50 rounded-2xl p-6">
<h2 className="text-lg font-semibold">페이지를 찾을 수 없습니다</h2>
<p className="text-slate-600 text-sm mt-1">주소를 확인하거나 상단 제목을 눌러 홈으로 이동하세요.</p>
<div className="mt-3">
<Link to="/" className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">홈으로</Link>
</div>
</div>
<footer className="text-slate-500 text-sm mt-6">© {new Date().getFullYear()} Eco Design • Prototype</footer>
</main>
)
}