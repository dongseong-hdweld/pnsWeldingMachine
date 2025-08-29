import React from 'react'
export default function Card({ title, children }){
return (
<section className="border border-slate-200 rounded-2xl p-4 bg-white">
{title && <h3 className="font-semibold mb-2">{title}</h3>}
{children}
</section>
)
}