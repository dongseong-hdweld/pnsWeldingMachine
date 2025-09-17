// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.jsx';

// Home / 404
import HomeKO from './pages/ko/Home.jsx';
import HomeEN from './pages/eng/Home.jsx';
import NotFound from './pages/NotFound.jsx';

// KO pages
import RegisterKO from './pages/ko/Register.jsx';
import SupportKO from './pages/ko/Support.jsx';
import WarrantyKO from './pages/ko/Warranty.jsx';
import ManualsPdfPlaceholderKO from './pages/ko/ManualsPdfPlaceholder.jsx';
import ProductLookupKO from './pages/ko/ProductLookup.jsx';

// EN pages
import RegisterEN from './pages/eng/Register.jsx';
import SupportEN from './pages/eng/Support.jsx';
import WarrantyEN from './pages/eng/Warranty.jsx';
import ManualsPdfPlaceholderEN from './pages/eng/ManualsPdfPlaceholder.jsx';
import ProductLookupEN from './pages/eng/ProductLookup.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-200">
      <Header />
      <Routes>
        {/* Default → Korean */}
        <Route path="/" element={<Navigate to="/ko" replace />} />

        {/* KO routes */}
        <Route path="/ko" element={<HomeKO />} />
        <Route path="/ko/register" element={<RegisterKO />} />
        <Route path="/ko/support" element={<SupportKO />} />
        <Route path="/ko/manuals" element={<WarrantyKO />} />
        <Route path="/ko/manuals/pdf-missing" element={<ManualsPdfPlaceholderKO />} />
        <Route path="/ko/products" element={<ProductLookupKO />} />

        {/* EN routes */}
        <Route path="/en" element={<HomeEN />} />
        <Route path="/en/register" element={<RegisterEN />} />
        <Route path="/en/support" element={<SupportEN />} />
        <Route path="/en/manuals" element={<WarrantyEN />} />
        <Route path="/en/manuals/pdf-missing" element={<ManualsPdfPlaceholderEN />} />
        <Route path="/en/products" element={<ProductLookupEN />} />

        {/* Legacy single-language paths → redirect to KO */}
        <Route path="/register" element={<Navigate to="/ko/register" replace />} />
        <Route path="/support" element={<Navigate to="/ko/support" replace />} />
        <Route path="/manuals" element={<Navigate to="/ko/manuals" replace />} />
        <Route path="/manuals/pdf-missing" element={<Navigate to="/ko/manuals/pdf-missing" replace />} />
        <Route path="/products" element={<Navigate to="/ko/products" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
