// src/pages/Register.en.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrap from '../_PageWrap.jsx';
import Card from '../../components/Card.jsx';
import { Label, Input, Textarea, Button } from '../../components/FormControls.jsx';
import COUNTRY_CODES from '../../data/countryDialCodes.js';

// ------- Storage Keys & Utils --------
const STORE_KEY = 'HYW_REG_PRODUCTS_BY_EMAIL';
const LAST_EMAIL_KEY = 'HYW_LAST_VERIFIED_EMAIL';
const loadStore = () => {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
  } catch {
    return {};
  }
};
const saveStore = (obj) => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(obj));
  } catch {}
};

// ------- Temp Serial → Product Mapping (mock DB) --------
// model: SAP code name / productName: display model
const SERIAL_DB = {
  'HYW-T270-001': { category: 'power', productName: 'SUPER T270', model: 'DC TIG(SUPER T270)' },
  'HYW-T400-002': { category: 'power', productName: 'SUPER T400', model: 'DC TIG(SUPER T400)' },
  'HYW-M350-003': { category: 'power', productName: 'SUPER M350', model: 'MAG(SUPER M350)' },
  'HYW-WF4S-004': { category: 'wire',  productName: 'SUPER WF4S',  model: 'W/FEEDER(SUPER WF4S)' },
  'HYW-COOL-005': { category: 'cool',  productName: 'SUPER COOLER', model: 'WATER COOLER(SUPER COOLER)' },
};

// ------- Category Labels (for display) --------
const CATEGORY_LABELS = {
  wire: 'Wire Feeder',
  power: 'Power Source',
  cool: 'Cooling',
};

// Common chip (fixed height, no wrap)
const chipCls =
  'inline-flex h-6 items-center justify-center px-2 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 text-[11px] leading-none whitespace-nowrap';

// ✅ Consent chip style (same tone as ProductLookup)
const chipChoice = (ok) =>
  [
    'px-2 py-0.5 text-[11px] rounded-full border',
    ok
      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
      : 'border-rose-300 bg-rose-50 text-rose-700',
  ].join(' ');

// ------- Helpers / small components --------
function StepChip({ index, current, setCurrent, label, locked }) {
  const isActive = current === index;
  const canGo = !locked;
  return (
    <button
      type="button"
      onClick={() => canGo && setCurrent(index)}
      aria-disabled={locked}
      className={[
        'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold',
        isActive
          ? 'border-slate-300 bg-slate-100 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
          : canGo
          ? 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
          : 'border-slate-200 bg-white/60 text-slate-400 pointer-events-none dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-600',
      ].join(' ')}
      title={locked ? 'Complete the previous step first' : ''}
    >
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border mr-1 border-slate-300 dark:border-slate-600">
        {index}
      </span>
      {label}
    </button>
  );
}
function scrollToRefWithHeaderOffset(ref) {
  const el = ref?.current;
  if (!el) return;
  const header = document.querySelector('header');
  const headerH = header?.getBoundingClientRect().height ?? 0;
  const offset = headerH + 12;
  const y = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: y, behavior: 'smooth' });
}
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-[92vw] max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200" onClick={onClose}>✕</button>
        </div>
        <div className="mt-3 text-sm text-slate-700 dark:text-slate-200 space-y-3">{children}</div>
        <div className="mt-4 text-right">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();

  // ----- Steps & Scroll -----
  // 1: Customer → 2: Product (Serial) → 3: Privacy Consent → 4: Review
  const [step, setStep] = useState(1);
  const s1Ref = useRef(null);
  const s2Ref = useRef(null);
  const s3Ref = useRef(null);
  const s4Ref = useRef(null);
  const didInit = useRef(false);

  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      scrollToRefWithHeaderOffset(s1Ref);
      return;
    }
    const refs = { 1: s1Ref, 2: s2Ref, 3: s3Ref, 4: s4Ref };
    scrollToRefWithHeaderOffset(refs[step]);
  }, [step]);

  // ----- 1) Customer info -----
  const [firstName, setFirstName] = useState('');
  const [surName, setSurName] = useState('');
  const [phoneCode, setPhoneCode] = useState(''); // set on selection
  const [phoneLocal, setPhoneLocal] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null); // {name, code}
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState('');
  const [address, setAddress] = useState('');
  const [optInEmail, setOptInEmail] = useState(false);

  // ✅ Country picker modal
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState('');
  const filteredCountries = useMemo(() => {
    const k = countryQuery.trim().toLowerCase();
    if (!k) return COUNTRY_CODES;
    return COUNTRY_CODES.filter((c) => c.name.toLowerCase().includes(k));
  }, [countryQuery]);

  // Email verification state (+ last verified email)
  const [lastVerifiedEmail, setLastVerifiedEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');
  const [emailErr, setEmailErr] = useState('');

  // On mount: load last verified email; if same, mark as verified
  useEffect(() => {
    try {
      const last = localStorage.getItem(LAST_EMAIL_KEY) || '';
      setLastVerifiedEmail(last);
      if (last) {
        setEmail(last);
        setEmailVerified(true);
      }
    } catch {}
  }, []);

  // If email changes, reset verification (keep progress messages)
  useEffect(() => {
    const same = (email || '').trim().toLowerCase() === (lastVerifiedEmail || '').trim().toLowerCase();
    if (!same && emailVerified) {
      setEmailVerified(false);
      setEmailSent(false);
      setEmailCode('');
      setEmailMsg('');
      setEmailErr('');
    }
  }, [email, lastVerifiedEmail, emailVerified]);

  const canSendEmailCode = !!email.trim() && !emailVerified;
  const canVerify = !!emailSent && !emailVerified;

  const handleSendEmailCode = () => {
    if (!email.trim()) {
      setEmailMsg('');
      setEmailErr('Please enter your email first.');
      return;
    }
    setEmailSent(true);
    setEmailVerified(false);
    setEmailErr('');
    setEmailMsg('Verification code sent. (Hint: ABCDE)');
  };
  const handleVerifyEmailCode = () => {
    if (emailCode.trim().toUpperCase() === 'ABCDE') {
      setEmailVerified(true);
      setEmailErr('');
      setEmailMsg('');
      try {
        localStorage.setItem(LAST_EMAIL_KEY, email.trim());
        setLastVerifiedEmail(email.trim());
      } catch {}
    } else {
      setEmailVerified(false);
      setEmailMsg('');
      setEmailErr('Invalid code. (Hint: ABCDE)');
    }
  };

  // ----- 2) Product registration (serial + purchase date + vendor) -----
  const [serialInput, setSerialInput] = useState('');
  const [purchaseDateInput, setPurchaseDateInput] = useState('');
  const [vendorInput, setVendorInput] = useState('');
  const [addedProducts, setAddedProducts] = useState([]); // [{serial, productName, model, category, purchaseDate, vendor}]
  const [serialMsg, setSerialMsg] = useState('');

  const resolved = useMemo(() => {
    const key = (serialInput || '').trim().toUpperCase();
    return key ? SERIAL_DB[key] : null;
  }, [serialInput]);

  const canAddSerial = useMemo(() => {
    const key = (serialInput || '').trim().toUpperCase();
    if (!key || !resolved) return false;
    if (!purchaseDateInput || !vendorInput) return false;
    return !addedProducts.some((p) => (p.serial || '').toUpperCase() === key);
  }, [serialInput, resolved, purchaseDateInput, vendorInput, addedProducts]);

  const addSerial = () => {
    const key = (serialInput || '').trim().toUpperCase();
    if (!key) {
      setSerialMsg('Enter a serial number.');
      return;
    }
    const info = SERIAL_DB[key];
    if (!info) {
      setSerialMsg('Serial not found.');
      return;
    }
    if (!purchaseDateInput) {
      setSerialMsg('Enter the purchase date.');
      return;
    }
    if (!vendorInput.trim()) {
      setSerialMsg('Enter the vendor.');
      return;
    }
    if (addedProducts.some((p) => (p.serial || '').toUpperCase() === key)) {
      setSerialMsg('This serial is already added.');
      return;
    }
    setAddedProducts((prev) => [
      ...prev,
      {
        serial: key,
        productName: info.productName,
        model: info.model,
        category: info.category,
        purchaseDate: purchaseDateInput,
        vendor: vendorInput.trim(),
      },
    ]);
    setSerialInput(''); // Keep date/vendor for the next item
    setSerialMsg('Added.');
    setTimeout(() => setSerialMsg(''), 1200);
  };
  const removeSerial = (serial) => {
    setAddedProducts((prev) => prev.filter((p) => p.serial !== serial));
  };

  // ----- 3) Privacy consent -----
  const [consentService, setConsentService] = useState(false);
  const [consentXBorder, setConsentXBorder] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);

  // Modals
  const [showPolicy, setShowPolicy] = useState(false);
  const [showXBorder, setShowXBorder] = useState(false);

  // ----- Validation / Emphasis -----
  const [attempt1, setAttempt1] = useState(false);
  const [attempt2, setAttempt2] = useState(false);
  const [attempt3, setAttempt3] = useState(false);

  const validStep1 =
    firstName.trim() &&
    surName.trim() &&
    phoneLocal.trim() &&
    email.trim() &&
    address.trim() &&
    emailVerified &&
    !!selectedCountry;

  const reasons1 = useMemo(() => {
    const r = [];
    if (!firstName.trim()) r.push('Enter your First Name.');
    if (!surName.trim()) r.push('Enter your Surname.');
    if (!selectedCountry) r.push('Select your country/dialing code.');
    if (!phoneLocal.trim()) r.push('Enter your phone number.');
    if (!email.trim()) r.push('Enter your email.');
    if (!emailVerified) r.push('Email verification is required.');
    if (!address.trim()) r.push('Enter your address.');
    return r;
  }, [firstName, surName, phoneLocal, email, emailVerified, address, selectedCountry]);

  const validStep2 = addedProducts.length > 0;
  const reasons2 = useMemo(() => {
    const r = [];
    if (addedProducts.length === 0) r.push('No products added. Please add a serial.');
    const key = (serialInput || '').trim().toUpperCase();
    if (key && !SERIAL_DB[key]) r.push('The entered serial does not exist in the database.');
    if (key && SERIAL_DB[key] && (!purchaseDateInput || !vendorInput)) {
      r.push('Before adding, enter both Purchase Date and Vendor.');
    }
    return r;
  }, [addedProducts.length, serialInput, purchaseDateInput, vendorInput]);

  const validStep3 = consentService && consentXBorder && consentMarketing;
  const reasons3 = useMemo(() => {
    const r = [];
    if (!consentService) r.push('You must agree to data processing for warranty service.');
    if (!consentXBorder) r.push('You must confirm the cross-border transfer notice.');
    if (!consentMarketing) r.push('You must agree to receive product notices/marketing (overall).');
    return r;
  }, [consentService, consentXBorder, consentMarketing]);

  const locked2 = !validStep1;
  const locked3 = !(validStep1 && validStep2);
  const locked4 = !(validStep1 && validStep2 && validStep3);

  const errorCls = 'border-rose-400 focus-visible:ring-rose-300';

  // ----- Submit -----
  const resetAll = () => {
    setStep(1);
    setFirstName('');
    setSurName('');
    setPhoneCode('');
    setPhoneLocal('');
    setEmail('');
    setZip('');
    setAddress('');
    setOptInEmail(false);
    setCountryQuery('');
    setSelectedCountry(null);
    setLastVerifiedEmail('');
    setEmailSent(false);
    setEmailCode('');
    setEmailVerified(false);
    setEmailMsg('');
    setEmailErr('');
    setSerialInput('');
    setPurchaseDateInput('');
    setVendorInput('');
    setAddedProducts([]);
    setSerialMsg('');
    setConsentService(false);
    setConsentXBorder(false);
    setConsentMarketing(false);
    setAttempt1(false);
    setAttempt2(false);
    setAttempt3(false);
  };

  const handleSubmit = () => {
    try {
      const store = loadStore();
      const key = (email || '').trim();
      if (key) {
        const arr = Array.isArray(store[key]) ? store[key] : [];
        const now = new Date().toISOString();
        addedProducts.forEach((prod) => {
          const data = {
            product: {
              category: prod.category,
              model: prod.model,            // SAP code
              productName: prod.productName,// display model
              serial: prod.serial,
              purchaseDate: prod.purchaseDate,
              vendor: prod.vendor,
              invoiceFiles: [],
            },
            customer: {
              firstName,
              surName,
              phone: `${selectedCountry?.code || ''} ${phoneLocal}`,
              email,
              zip,
              address,
              emailVerified: true,
              country: selectedCountry?.name || '',
              dialCode: selectedCountry?.code || '',
            },
            privacy: {
              consentService,
              consentXBorder,
              consentMarketing,
              promoEmail: optInEmail, // optional: email promotions
              promoSms: false,
            },
            createdAt: now,
          };
          arr.push(data);
        });
        store[key] = arr;
        saveStore(store);
        localStorage.setItem(LAST_EMAIL_KEY, key);
      }
    } catch (e) {
      console.warn('Failed to save registration:', e);
    }
    alert('Registration completed.');
    resetAll();
    navigate('/');
  };

  // Sample serials
  const sampleSerials = useMemo(() => Object.entries(SERIAL_DB), []);

  return (
    <PageWrap title="Product Registration" subtitle="">
      {/* Step Nav */}
      <div className="mb-4 flex flex-wrap gap-2">
        <StepChip index={1} current={step} setCurrent={setStep} label="Customer Info" locked={false} />
        <StepChip index={2} current={step} setCurrent={setStep} label="Product (Serial)" locked={locked2} />
        <StepChip index={3} current={step} setCurrent={setStep} label="Privacy Consent" locked={locked3} />
        <StepChip index={4} current={step} setCurrent={setStep} label="Review" locked={locked4} />
      </div>

      {/* 1) Customer Info */}
      <div ref={s1Ref} className="h-0 scroll-mt-[84px]" />
      <Card title="1. Customer Info">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="first">First Name</Label>
              <Input
                id="first"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={attempt1 && !firstName.trim() ? errorCls : ''}
                placeholder="e.g., Gil-dong"
              />
            </div>
            <div>
              <Label htmlFor="sur">Surname</Label>
              <Input
                id="sur"
                value={surName}
                onChange={(e) => setSurName(e.target.value)}
                className={attempt1 && !surName.trim() ? errorCls : ''}
                placeholder="e.g., Hong"
              />
            </div>

            {/* ✅ Country / Dial code: force selection through modal */}
            <div className="md:col-span-2">
              <Label>Country / Dialing Code (Required)</Label>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                <div
                  className={[
                    'rounded-lg border px-3 text-xs h-8 flex items-center',
                    attempt1 && !selectedCountry ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700',
                    // Dark mode: darker tone; Light mode: default
                    'bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200',
                  ].join(' ')}
                >
                  {selectedCountry ? (
                    <span>{selectedCountry.name} ({selectedCountry.code})</span>
                  ) : (
                    <span className="text-slate-400">Select your country</span>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setCountryQuery('');
                    setCountryModalOpen(true);
                  }}
                >
                  Select Country
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Click the button to search and choose your country.</p>
              {selectedCountry && (
                <p className="text-xs text-slate-500 mt-1">
                  Selected dial code: <b>{selectedCountry.code}</b>
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="phone"
                  value={phoneLocal}
                  onChange={(e) => setPhoneLocal(e.target.value)}
                  className={attempt1 && !phoneLocal.trim() ? errorCls : ''}
                  placeholder="e.g., 10-1234-5678"
                />
                <span className="text-sm text-slate-500">
                  {selectedCountry ? selectedCountry.code : '(no dial code)'}
                </span>
              </div>
            </div>

            {/* Email + verification */}
            <div className="md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={attempt1 && !email.trim() ? errorCls : ''}
                  placeholder="name@example.com"
                />
                <Button
                  onClick={handleSendEmailCode}
                  disabled={!canSendEmailCode}
                  className={!canSendEmailCode ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  Send Code
                </Button>
                <div className="flex items-center gap-2">
                  <Input
                    id="emailCode"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder="Enter code (Hint: ABCDE)"
                    disabled={!canVerify}
                    className={attempt1 && !emailVerified ? errorCls : ''}
                  />
                  <Button
                    onClick={handleVerifyEmailCode}
                    disabled={!canVerify}
                    className={!canVerify ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    Verify
                  </Button>
                </div>
              </div>

              {/* Messages */}
              {emailVerified && (
                <p className="text-sky-600 text-xs mt-1">Email verification completed.</p>
              )}
              {!emailVerified && emailMsg && <p className="text-emerald-600 text-xs mt-1">{emailMsg}</p>}
              {emailErr && <p className="text-rose-600 text-xs mt-1">{emailErr}</p>}
              {!emailVerified && !emailMsg && !emailErr && (
                <p className="text-slate-500 dark:text-slate-300 text-xs mt-1">
                  * Test code: <strong>ABCDE</strong>
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="zip">ZIP Code</Label>
              <Input id="zip" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="e.g., 06236" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="addr">Address (where the product is used)</Label>
              <Textarea
                id="addr"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={attempt1 && !address.trim() ? errorCls : ''}
                placeholder="Street, unit, city, country, etc."
              />
            </div>

            {/* (Optional) Marketing opt-in */}
            <div className="md:col-span-2">
              <Label>Marketing / Announcements Opt-in (Optional)</Label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={optInEmail}
                  onChange={(e) => setOptInEmail(e.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-slate-700 dark:text-slate-200">Email promotions opt-in</span>
              </label>
            </div>
          </div>

          <div className="mt-4">
            <Button
              onClick={() => {
                if (validStep1) setStep(2);
                else setAttempt1(true);
              }}
              aria-disabled={!validStep1}
              className={!validStep1 ? 'opacity-60' : ''}
            >
              Next (Product)
            </Button>
            {!validStep1 && attempt1 && reasons1.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-xs text-rose-600">
                {reasons1.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>

      {/* 2) Product Registration */}
      <div ref={s2Ref} className="h-0 scroll-mt-[84px]" />
      <Card title="2. Product Registration (Serial No.)">
        <div className={step < 2 ? 'pointer-events-none opacity-60' : ''}>
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                id="serialInput"
                value={serialInput}
                maxLength={15}
                onChange={(e) => setSerialInput((e.target.value || '').toUpperCase().slice(0, 15))}
                placeholder="Enter serial (e.g., HYW-T270-001)"
                className={
                  (attempt2 && addedProducts.length === 0) ||
                  (serialInput && !resolved)
                    ? errorCls
                    : ''
                }
              />
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDateInput}
                onChange={(e) => setPurchaseDateInput(e.target.value)}
                className={!purchaseDateInput && serialInput ? errorCls : ''}
                placeholder="Purchase date"
              />
              <Input
                id="vendor"
                value={vendorInput}
                onChange={(e) => setVendorInput(e.target.value)}
                className={!vendorInput.trim() && serialInput ? errorCls : ''}
                placeholder="Vendor (e.g., Hyundai PNS Dealer)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-2">
              <div className="flex items-center gap-2">
                <Button onClick={addSerial} disabled={!canAddSerial} className={!canAddSerial ? 'opacity-50 cursor-not-allowed' : ''}>
                  Add Serial
                </Button>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                {resolved ? (
                  <span>
                    Model: <b>{resolved.productName}</b> / SAP: <b>{resolved.model}</b>
                  </span>
                ) : serialInput ? (
                  <span className="text-rose-600">Serial not found.</span>
                ) : (
                  <span className="text-slate-400">Enter a serial to auto-fill Model/SAP.</span>
                )}
              </div>
            </div>

            {serialMsg && (
              <p
                className={`text-xs ${
                  serialMsg.includes('Added') || serialMsg === 'Added.' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {serialMsg}
              </p>
            )}
            <p className="text-xs text-slate-500">
              * The first product’s <b>Purchase Date/Vendor</b> will be kept as defaults for subsequent items.
            </p>
          </div>

          {/* ✅ Sample Serials (prototype info) */}
          <div className="mt-3 rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700">
            <div className="text-sm font-medium mb-2">Sample Serials (for prototype)</div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {sampleSerials.map(([sn, info]) => (
                <li key={sn} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                  <div className="font-mono text-[13px]">{sn}</div>
                  <div className="text-xs text-slate-500">
                    Model: {info.productName} · SAP: {info.model}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Added products */}
          <div className="mt-3">
            {addedProducts.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">No products yet. Enter a serial to add.</p>
            ) : (
              <ul className="space-y-2">
                {addedProducts.map((p) => (
                  <li
                    key={p.serial}
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
                  >
                    <div className="truncate">
                      <div className="font-medium">
                        {p.productName} <span className="text-slate-500">({CATEGORY_LABELS[p.category]})</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        SAP: {p.model} · S/N: {p.serial} · Purchase: {p.purchaseDate || '-'} · Vendor: {p.vendor || '-'}
                      </div>
                    </div>
                    <Button variant="secondary" onClick={() => removeSerial(p.serial)}>
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={() => setStep(1)}>Back (Customer)</Button>
            <Button
              onClick={() => {
                if (validStep2) setStep(3);
                else setAttempt2(true);
              }}
              aria-disabled={!validStep2}
              className={!validStep2 ? 'opacity-60' : ''}
            >
              Next (Privacy)
            </Button>
          </div>
          {!validStep2 && attempt2 && reasons2.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-xs text-rose-600">
              {reasons2.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      {/* 3) Privacy Consent */}
      <div ref={s3Ref} className="h-0 scroll-mt-[84px]" />
      <Card title="3. Privacy Consent">
        <div className={step < 3 ? 'pointer-events-none opacity-60' : ''}>
          <div className="space-y-3 text-sm">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={consentService}
                onChange={(e) => setConsentService(e.target.checked)}
                className="mt-1"
              />
              <span className={attempt3 && !consentService ? 'text-rose-600' : 'text-slate-700 dark:text-slate-200'}>
                <strong className="font-semibold">[Required]</strong> I agree to the processing of my personal data to provide warranty services.
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={consentXBorder}
                onChange={(e) => setConsentXBorder(e.target.checked)}
                className="mt-1"
              />
              <span className={attempt3 && !consentXBorder ? 'text-rose-600' : 'text-slate-700 dark:text-slate-200'}>
                <strong className="font-semibold">[Required]</strong> I confirm that I have read the notice on possible cross-border data transfers.
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={consentMarketing}
                onChange={(e) => setConsentMarketing(e.target.checked)}
                className="mt-1"
              />
              <span className={attempt3 && !consentMarketing ? 'text-rose-600' : 'text-slate-700 dark:text-slate-200'}>
                <strong className="font-semibold">[Required]</strong> I agree to receive product notices/marketing (overall).
              </span>
            </label>

            <p className="text-slate-500 dark:text-slate-300 text-xs">
              For details, see the{' '}
              <button type="button" className="underline" onClick={() => setShowPolicy(true)}>
                Privacy Policy
              </button>{' '}
              and{' '}
              <button type="button" className="underline" onClick={() => setShowXBorder(true)}>
                Cross-border Transfer Notice
              </button>
              .
            </p>
          </div>

          <div className="mt-4">
            <Button onClick={() => setStep(2)}>Back (Product)</Button>
            <Button
              onClick={() => {
                if (validStep3) setStep(4);
                else setAttempt3(true);
              }}
              aria-disabled={!validStep3}
              className={!validStep3 ? 'opacity-60' : ''}
            >
              Next (Review)
            </Button>
            {!validStep3 && attempt3 && reasons3.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-xs text-rose-600">
                {reasons3.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>

      {/* 4) Review */}
      <div ref={s4Ref} className="h-0 scroll-mt-[84px]" />
      <Card title="4. Review Your Entries">
        <div className={step < 4 ? 'pointer-events-none opacity-60' : ''}>
          {/* Customer summary */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h4 className="font-semibold flex items-center gap-2"><span>🙍</span> Customer</h4>
            <dl className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
              <dt className="text-slate-500 dark:text-slate-300">Name</dt>
              <dd className="col-span-2">{firstName} {surName}</dd>
              <dt className="text-slate-500 dark:text-slate-300">Phone</dt>
              <dd className="col-span-2">{selectedCountry?.code || ''} {phoneLocal}</dd>
              <dt className="text-slate-500 dark:text-slate-300">Country</dt>
              <dd className="col-span-2">{selectedCountry?.name || '-'}</dd>
              <dt className="text-slate-500 dark:text-slate-300">Email</dt>
              <dd className="col-span-2">
                {email}{' '}
                <span className={chipCls}>Verified</span>
              </dd>
              <dt className="text-slate-500 dark:text-slate-300">ZIP</dt>
              <dd className="col-span-2">{zip || '-'}</dd>
              <dt className="text-slate-500 dark:text-slate-300">Address</dt>
              <dd className="col-span-2 break-words">{address}</dd>
              <dt className="text-slate-500 dark:text-slate-300">Email Promotions</dt>
              <dd className="col-span-2">{optInEmail ? 'Opt-in' : 'Not opted-in'}</dd>
            </dl>
          </section>

          {/* Product summary */}
          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h4 className="font-semibold flex items-center gap-2"><span>📦</span> Registered Products</h4>
            {addedProducts.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">No products.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {addedProducts.map((p) => (
                  <li key={p.serial} className="rounded-2xl border border-slate-200 p-3 text-sm dark:border-slate-700">
                    <div className="font-medium">
                      {p.productName} <span className="text-slate-500">({CATEGORY_LABELS[p.category]})</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      SAP: {p.model} · S/N: {p.serial} · Purchase: {p.purchaseDate || '-'} · Vendor: {p.vendor || '-'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Privacy consent summary (ProductLookup style) */}
          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h4 className="font-semibold flex items-center gap-2"><span>🔒</span> Privacy Consent</h4>
            <ul className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                <span>Processing for warranty service</span>
                <span className={chipChoice(consentService)}>{consentService ? 'Agreed' : 'Not agreed'}</span>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                <span>Cross-border transfer notice</span>
                <span className={chipChoice(consentXBorder)}>{consentXBorder ? 'Confirmed' : 'Not confirmed'}</span>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                <span>Product notices / marketing</span>
                <span className={chipChoice(consentMarketing)}>{consentMarketing ? 'Agreed' : 'Not agreed'}</span>
              </li>
              {/* Channel-specific */}
              <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                <span>Email promotions</span>
                <span className={chipChoice(optInEmail)}>{optInEmail ? 'Opt-in' : 'Not opted-in'}</span>
              </li>
            </ul>

            <div className="mt-5 flex items-center justify-between">
              <Button onClick={() => setStep(3)}>Back (Privacy)</Button>
              <Button onClick={handleSubmit} disabled={addedProducts.length === 0}>
                Submit
              </Button>
            </div>
            {addedProducts.length === 0 && (
              <p className="mt-2 text-xs text-rose-600">Please register at least one product.</p>
            )}
          </section>
        </div>
      </Card>

      {/* Country modal */}
      {countryModalOpen && (
        <Modal title="Select Country / Dialing Code" onClose={() => setCountryModalOpen(false)}>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
            <Input
              value={countryQuery}
              onChange={(e) => setCountryQuery(e.target.value)}
              placeholder="Search (e.g., Korea, Japan, United...)"
              autoFocus
            />
            <Button
              variant="secondary"
              onClick={() => {
                setCountryQuery('');
              }}
              title="Clear search"
            >
              Clear
            </Button>
          </div>
          <div className="max-h-72 overflow-auto rounded-lg border border-slate-200 dark:border-slate-700 mt-2">
            {filteredCountries.length === 0 ? (
              <p className="p-3 text-sm text-slate-500">No results.</p>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredCountries.map((c) => (
                  <li key={`${c.name}-${c.code}`}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => {
                        setSelectedCountry(c);
                        setPhoneCode(c.code);
                        setCountryModalOpen(false);
                      }}
                    >
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.code}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Modal>
      )}

      {/* Other modals */}
      {showPolicy && (
        <Modal title="Privacy Policy (Summary)" onClose={() => setShowPolicy(false)}>
          <p>Data collected: name, phone number, email, address, product info (model/serial), attachments.</p>
          <p>Purpose: warranty registration & service, customer support, safety/updates, legal compliance.</p>
          <p>Retention: stored for the duration required by law or service relationship, then destroyed.</p>
          <p>Third parties / processors: authorized dealers/repair centers/cloud providers (limited to necessity).</p>
          <p>Rights: access, rectification, deletion, restriction, opt-out, etc.</p>
          <p>Contact: privacy@example.com</p>
        </Modal>
      )}
      {showXBorder && (
        <Modal title="Cross-border Transfer Notice (Summary)" onClose={() => setShowXBorder(false)}>
          <p>Recipients: overseas HQ/service centers and cloud infrastructure.</p>
          <p>Purpose: warranty, technical support, quality improvement.</p>
          <p>Safeguards: SCCs, encryption, access controls, data minimization.</p>
          <p>Retention: destroyed upon fulfillment of purpose or after statutory period.</p>
          <p>Contact: privacy@example.com</p>
        </Modal>
      )}
    </PageWrap>
  );
}
