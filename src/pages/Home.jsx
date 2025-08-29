import React from 'react'
export default function Home(){
return (
<main className="max-w-5xl mx-auto px-4 py-6">
<div className="border border-slate-200 rounded-2xl p-6 bg-white">
<h2 className="text-xl font-bold">현대 PNS 용접기 제품 등록 시스템 프로토타입</h2>
</div>
<footer className="text-slate-500 text-sm mt-6">© {new Date().getFullYear()} Eco Design • Prototype</footer>
</main>
)
}