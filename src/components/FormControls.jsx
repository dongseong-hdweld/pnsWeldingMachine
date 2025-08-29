// src/components/FormControls.jsx
import React from 'react'

export function Label({ htmlFor, children, className='' }){
  return <label htmlFor={htmlFor} className={'block font-semibold mb-1 ' + className}>{children}</label>
}

const baseInput = 'w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2';
export function Input({ className='', ...props }){
  return (
    <input
      {...props}
      className={[
        baseInput,
        'border-slate-200 bg-white text-slate-900 focus:ring-blue-300',
        'placeholder-slate-400',
        'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-blue-500',
        className
      ].join(' ')}
    />
  )
}

export function Textarea({ className='', ...props }){
  return (
    <textarea
      {...props}
      className={[
        baseInput,
        'border-slate-200 bg-white text-slate-900 focus:ring-blue-300',
        'placeholder-slate-400',
        'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-blue-500',
        className
      ].join(' ')}
    />
  )
}

export function Button({ children, className='', ...props }){
  return (
    <button
      {...props}
      className={[
        'inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold',
        'border-slate-200 bg-slate-900 text-white hover:opacity-90',
        'dark:border-slate-700 dark:bg-slate-800',
        className
      ].join(' ')}
    >
      {children}
    </button>
  )
}
