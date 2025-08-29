// src/App.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import Warranty from './pages/Warranty.jsx'
import Register from './pages/Register.jsx'
import Support from './pages/Support.jsx'
import Manuals from './pages/Manuals.jsx'
import Service from './pages/Service.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App(){
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-200">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/warranty" element={<Warranty />} />
        <Route path="/register" element={<Register />} />
        <Route path="/support" element={<Support />} />
        <Route path="/manuals" element={<Manuals />} />
        <Route path="/service" element={<Service />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
