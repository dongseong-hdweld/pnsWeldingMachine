import React from 'react'


export function Label({ htmlFor, children, className='' }){
return <label htmlFor={htmlFor} className={'block font-semibold mb-1 ' + className}>{children}</label>
}


export function Input({ className='', ...props }){
return <input {...props} className={'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 ' + className} />
}


export function Textarea({ className='', ...props }){
return <textarea {...props} className={'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 ' + className} />
}


export function Button({ children, className='', ...props }){
return <button {...props} className={'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-300 ' + className}>{children}</button>
}