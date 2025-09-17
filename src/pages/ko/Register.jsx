// src/pages/Register.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrap from '../_PageWrap.jsx';
import Card from '../../components/Card.jsx';
import { Label, Input, Textarea, Button } from '../../components/FormControls.jsx';
import COUNTRY_CODES from '../../data/countryDialCodes.js';

// ------- 전역 스토리지 키 & 유틸 --------
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

// ------- 임시 시리얼 → 제품 매핑(DB) --------
// model: SAP 코드명 / productName: 모델명
const SERIAL_DB = {
  'HYW-T270-001': { category: 'power', productName: 'SUPER T270', model: 'DC TIG(SUPER T270)' },
  'HYW-T400-002': { category: 'power', productName: 'SUPER T400', model: 'DC TIG(SUPER T400)' },
  'HYW-M350-003': { category: 'power', productName: 'SUPER M350', model: 'MAG(SUPER M350)' },
  'HYW-WF4S-004': { category: 'wire',  productName: 'SUPER WF4S',  model: 'W/FEEDER(SUPER WF4S)' },
  'HYW-COOL-005': { category: 'cool',  productName: 'SUPER COOLER', model: 'WATER COOLER(SUPER COOLER)' },
};

// ------- 분류 라벨(표시용) --------
const CATEGORY_LABELS = {
  wire: 'Wire Feeder',
  power: 'Power Source',
  cool: 'Cooling',
};

// 공통 배지 스타일(크기 고정 + 줄바꿈 방지)
const chipCls =
  'inline-flex h-6 items-center justify-center px-2 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 text-[11px] leading-none whitespace-nowrap';

// ✅ 동의/미동의 칩 스타일 (ProductLookup와 동일 톤)
const chipChoice = (ok) =>
  [
    'px-2 py-0.5 text-[11px] rounded-full border',
    ok
      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
      : 'border-rose-300 bg-rose-50 text-rose-700',
  ].join(' ');

// ------- 보조 컴포넌트/유틸 --------
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
      title={locked ? '이전 칸을 먼저 완료하세요' : ''}
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
          <Button onClick={onClose}>닫기</Button>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();

  // ----- 스텝 & 스크롤 -----
  // 1: 고객정보 → 2: 제품 등록(시리얼만) → 3: 개인정보 동의 → 4: 확인
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

  // ----- 1) 고객정보 -----
  const [firstName, setFirstName] = useState('');
  const [surName, setSurName] = useState('');
  const [phoneCode, setPhoneCode] = useState(''); // 선택 시 설정
  const [phoneLocal, setPhoneLocal] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null); // {name, code}
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState('');
  const [address, setAddress] = useState('');
  const [optInEmail, setOptInEmail] = useState(false);

  // ✅ 국가 선택 모달
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState('');
  const filteredCountries = useMemo(() => {
    const k = countryQuery.trim().toLowerCase();
    if (!k) return COUNTRY_CODES;
    return COUNTRY_CODES.filter((c) => c.name.toLowerCase().includes(k));
  }, [countryQuery]);

  // 이메일 인증 상태 (+ 마지막 인증 이메일)
  const [lastVerifiedEmail, setLastVerifiedEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');
  const [emailErr, setEmailErr] = useState('');

  // mount 시 최근 인증 이메일 불러와서 동일하면 바로 인증 표시
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

  // 이메일이 바뀌면 인증 상태 초기화(진행 메시지만 유지)
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
      setEmailErr('이메일을 먼저 입력하세요.');
      return;
    }
    setEmailSent(true);
    setEmailVerified(false);
    setEmailErr('');
    setEmailMsg('인증번호가 전송되었습니다. (힌트: ABCDE)');
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
      setEmailErr('인증코드가 올바르지 않습니다. (힌트: ABCDE)');
    }
  };

  // ----- 2) 제품등록(시리얼 + 구매일자 + 구매처) -----
  const [serialInput, setSerialInput] = useState('');
  const [purchaseDateInput, setPurchaseDateInput] = useState(''); // 유지하여 다음 제품에 기본값 사용
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
      setSerialMsg('시리얼을 입력하세요.');
      return;
    }
    const info = SERIAL_DB[key];
    if (!info) {
      setSerialMsg('해당 시리얼이 없습니다.');
      return;
    }
    if (!purchaseDateInput) {
      setSerialMsg('구매일자를 입력하세요.');
      return;
    }
    if (!vendorInput.trim()) {
      setSerialMsg('구매처를 입력하세요.');
      return;
    }
    if (addedProducts.some((p) => (p.serial || '').toUpperCase() === key)) {
      setSerialMsg('이미 추가된 시리얼입니다.');
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
    setSerialInput(''); // 다음 추가를 위해 시리얼만 초기화, 구매일자/구매처는 유지(디폴트)
    setSerialMsg('추가되었습니다.');
    setTimeout(() => setSerialMsg(''), 1200);
  };
  const removeSerial = (serial) => {
    setAddedProducts((prev) => prev.filter((p) => p.serial !== serial));
  };

  // ----- 3) 개인정보 동의 -----
  const [consentService, setConsentService] = useState(false);
  const [consentXBorder, setConsentXBorder] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);

  // 모달
  const [showPolicy, setShowPolicy] = useState(false);
  const [showXBorder, setShowXBorder] = useState(false);

  // ----- 유효성 / 빨간 강조 -----
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
    !!selectedCountry; // ✅ 국가 선택 강제

  const reasons1 = useMemo(() => {
    const r = [];
    if (!firstName.trim()) r.push('First Name을 입력하세요.');
    if (!surName.trim()) r.push('Sur Name을 입력하세요.');
    if (!selectedCountry) r.push('국가/국가번호를 선택하세요.');
    if (!phoneLocal.trim()) r.push('전화번호를 입력하세요.');
    if (!email.trim()) r.push('이메일을 입력하세요.');
    if (!emailVerified) r.push('이메일 인증이 필요합니다.');
    if (!address.trim()) r.push('주소를 입력하세요.');
    return r;
  }, [firstName, surName, phoneLocal, email, emailVerified, address, selectedCountry]);

  const validStep2 = addedProducts.length > 0;
  const reasons2 = useMemo(() => {
    const r = [];
    if (addedProducts.length === 0) r.push('등록된 제품이 없습니다. 시리얼을 추가하세요.');
    const key = (serialInput || '').trim().toUpperCase();
    if (key && !SERIAL_DB[key]) r.push('입력한 시리얼이 데이터베이스에 없습니다.');
    if (key && SERIAL_DB[key] && (!purchaseDateInput || !vendorInput)) {
      r.push('시리얼 추가 전, 구매일자와 구매처를 입력하세요.');
    }
    return r;
  }, [addedProducts.length, serialInput, purchaseDateInput, vendorInput]);

  const validStep3 = consentService && consentXBorder && consentMarketing;
  const reasons3 = useMemo(() => {
    const r = [];
    if (!consentService) r.push('보증 서비스 목적 처리에 동의해야 합니다.');
    if (!consentXBorder) r.push('국외 이전 안내 확인에 동의해야 합니다.');
    if (!consentMarketing) r.push('제품 공지/마케팅 수신(전체)에 동의해야 합니다.');
    return r;
  }, [consentService, consentXBorder, consentMarketing]);

  const locked2 = !validStep1;
  const locked3 = !(validStep1 && validStep2);
  const locked4 = !(validStep1 && validStep2 && validStep3);

  const errorCls = 'border-rose-400 focus-visible:ring-rose-300';

  // ----- 제출 -----
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
              model: prod.model,            // SAP 코드명
              productName: prod.productName,// 모델명
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
              promoEmail: optInEmail, // 선택: 홍보 이메일 수신
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
      console.warn('등록 데이터 저장 실패:', e);
    }
    alert('등록이 완료되었습니다.');
    resetAll();
    navigate('/');
  };

  // 샘플 시리얼 목록
  const sampleSerials = useMemo(() => Object.entries(SERIAL_DB), []);

  return (
    <PageWrap title="제품 등록" subtitle="">
      {/* 스텝 네비 */}
      <div className="mb-4 flex flex-wrap gap-2">
        <StepChip index={1} current={step} setCurrent={setStep} label="고객정보" locked={false} />
        <StepChip index={2} current={step} setCurrent={setStep} label="제품 등록(시리얼)" locked={locked2} />
        <StepChip index={3} current={step} setCurrent={setStep} label="개인정보 동의" locked={locked3} />
        <StepChip index={4} current={step} setCurrent={setStep} label="확인" locked={locked4} />
      </div>

      {/* 1) 고객정보 */}
      <div ref={s1Ref} className="h-0 scroll-mt-[84px]" />
      <Card title="1. 고객정보">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="first">First Name</Label>
              <Input
                id="first"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={attempt1 && !firstName.trim() ? errorCls : ''}
                placeholder="예: Gil-dong"
              />
            </div>
            <div>
              <Label htmlFor="sur">Sur Name</Label>
              <Input
                id="sur"
                value={surName}
                onChange={(e) => setSurName(e.target.value)}
                className={attempt1 && !surName.trim() ? errorCls : ''}
                placeholder="예: Hong"
              />
            </div>

            {/* ✅ 국가/국가번호: 모달로 강제 선택 */}
            <div className="md:col-span-2">
              <Label>국가/국가번호 (필수)</Label>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                <div
                  className={[
                    'rounded-lg border px-3 text-xs h-8 flex items-center',
                    attempt1 && !selectedCountry ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700',
                    // ⬇️ 다크모드 어둡게, 라이트모드 기본
                    'bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200',
                  ].join(' ')}
                >
                  {selectedCountry ? (
                    <span>{selectedCountry.name} ({selectedCountry.code})</span>
                  ) : (
                    <span className="text-slate-400">국가를 선택하세요</span>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setCountryQuery('');
                    setCountryModalOpen(true);
                  }}
                >
                  국가 선택
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-1">버튼을 눌러 검색 후 국가를 선택하세요.</p>
              {selectedCountry && (
                <p className="text-xs text-slate-500 mt-1">
                  선택된 국가번호: <b>{selectedCountry.code}</b>
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">전화번호</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="phone"
                  value={phoneLocal}
                  onChange={(e) => setPhoneLocal(e.target.value)}
                  className={attempt1 && !phoneLocal.trim() ? errorCls : ''}
                  placeholder="예: 10-1234-5678"
                />
                <span className="text-sm text-slate-500">
                  {selectedCountry ? selectedCountry.code : '(국가번호 미선택)'}
                </span>
              </div>
            </div>

            {/* 이메일 + 인증 */}
            <div className="md:col-span-2">
              <Label htmlFor="email">이메일</Label>
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
                  인증번호 요청
                </Button>
                <div className="flex items-center gap-2">
                  <Input
                    id="emailCode"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder="인증코드 입력 (힌트: ABCDE)"
                    disabled={!canVerify}
                    className={attempt1 && !emailVerified ? errorCls : ''}
                  />
                  <Button
                    onClick={handleVerifyEmailCode}
                    disabled={!canVerify}
                    className={!canVerify ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    인증하기
                  </Button>
                </div>
              </div>

              {/* 안내/상태 메시지 */}
              {emailVerified && (
                <p className="text-sky-600 text-xs mt-1">이메일 인증이 완료되었습니다.</p>
              )}
              {!emailVerified && emailMsg && <p className="text-emerald-600 text-xs mt-1">{emailMsg}</p>}
              {emailErr && <p className="text-rose-600 text-xs mt-1">{emailErr}</p>}
              {!emailVerified && !emailMsg && !emailErr && (
                <p className="text-slate-500 dark:text-slate-300 text-xs mt-1">
                  * 테스트용 인증코드: <strong>ABCDE</strong>
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="zip">ZIP Code</Label>
              <Input id="zip" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="예: 06236" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="addr">주소(물건 사용 장소)</Label>
              <Textarea
                id="addr"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={attempt1 && !address.trim() ? errorCls : ''}
                placeholder="도로명, 동/호수, 도시, 국가 등"
              />
            </div>

            {/* (선택) 홍보 수신 동의 */}
            <div className="md:col-span-2">
              <Label>홍보/공지 수신 동의 (선택)</Label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={optInEmail}
                  onChange={(e) => setOptInEmail(e.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-slate-700 dark:text-slate-200">이메일 수신 동의</span>
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
              다음(제품 등록)
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

      {/* 2) 제품등록(시리얼 + 구매일자 + 구매처) */}
      <div ref={s2Ref} className="h-0 scroll-mt-[84px]" />
      <Card title="2. 제품 등록 (시리얼 번호)">
        <div className={step < 2 ? 'pointer-events-none opacity-60' : ''}>
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                id="serialInput"
                value={serialInput}
                maxLength={15}
                onChange={(e) => setSerialInput((e.target.value || '').toUpperCase().slice(0, 15))}
                placeholder="시리얼 입력 (예: HYW-T270-001)"
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
                placeholder="구매일자"
              />
              <Input
                id="vendor"
                value={vendorInput}
                onChange={(e) => setVendorInput(e.target.value)}
                className={!vendorInput.trim() && serialInput ? errorCls : ''}
                placeholder="구매처 (예: 현대 PNS 대리점)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-2">
              <div className="flex items-center gap-2">
                <Button onClick={addSerial} disabled={!canAddSerial} className={!canAddSerial ? 'opacity-50 cursor-not-allowed' : ''}>
                  시리얼 추가
                </Button>
                <a className="text-sm underline" href="/manuals" title="모델 매뉴얼 검색으로 이동">
                  매뉴얼 검색
                </a>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                {resolved ? (
                  <span>
                    모델: <b>{resolved.productName}</b> / SAP: <b>{resolved.model}</b>
                  </span>
                ) : serialInput ? (
                  <span className="text-rose-600">해당 시리얼이 없습니다.</span>
                ) : (
                  <span className="text-slate-400">시리얼을 입력하면 자동으로 모델/SAP가 표시됩니다.</span>
                )}
              </div>
            </div>

            {serialMsg && (
              <p
                className={`text-xs ${
                  serialMsg.includes('추가') ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {serialMsg}
              </p>
            )}
            <p className="text-xs text-slate-500">
              * 첫 제품 등록 시 입력한 <b>구매일자/구매처</b>는 다음 제품을 추가할 때 기본값으로 유지됩니다.
            </p>
          </div>

          {/* ✅ 샘플 시리얼(프로토타입 안내) */}
          <div className="mt-3 rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700">
            <div className="text-sm font-medium mb-2">샘플 시리얼 (프로토타입 테스트용)</div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {sampleSerials.map(([sn, info]) => (
                <li key={sn} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                  <div className="font-mono text-[13px]">{sn}</div>
                  <div className="text-xs text-slate-500">
                    모델: {info.productName} · SAP: {info.model}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* 추가된 제품 목록 */}
          <div className="mt-3">
            {addedProducts.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">아직 추가된 제품이 없습니다. 시리얼을 입력해 추가하세요.</p>
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
                        SAP: {p.model} · S/N: {p.serial} · 구매일자: {p.purchaseDate || '-'} · 구매처: {p.vendor || '-'}
                      </div>
                    </div>
                    <Button variant="secondary" onClick={() => removeSerial(p.serial)}>
                      제거
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={() => setStep(1)}>이전(고객정보)</Button>
            <Button
              onClick={() => {
                if (validStep2) setStep(3);
                else setAttempt2(true);
              }}
              aria-disabled={!validStep2}
              className={!validStep2 ? 'opacity-60' : ''}
            >
              다음(개인정보 동의)
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

      {/* 3) 개인정보 동의 */}
      <div ref={s3Ref} className="h-0 scroll-mt-[84px]" />
      <Card title="3. 개인정보 처리 동의">
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
                <strong className="font-semibold">[필수]</strong> 보증 서비스 이행을 위한 개인정보 처리에 동의합니다.
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
                <strong className="font-semibold">[필수]</strong> 서비스 제공을 위한 국외 이전 가능성에 대한 안내를 확인했습니다.
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
                <strong className="font-semibold">[필수]</strong> 제품 공지/마케팅 수신(전체)에 동의합니다.
              </span>
            </label>

            <p className="text-slate-500 dark:text-slate-300 text-xs">
              세부 내용은{' '}
              <button type="button" className="underline" onClick={() => setShowPolicy(true)}>
                개인정보 처리방침
              </button>{' '}
              및{' '}
              <button type="button" className="underline" onClick={() => setShowXBorder(true)}>
                국외이전 고지
              </button>{' '}
              를 참고하세요.
            </p>
          </div>

          <div className="mt-4">
            <Button onClick={() => setStep(2)}>이전(제품 등록)</Button>
            <Button
              onClick={() => {
                if (validStep3) setStep(4);
                else setAttempt3(true);
              }}
              aria-disabled={!validStep3}
              className={!validStep3 ? 'opacity-60' : ''}
            >
              다음(확인)
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

      {/* 4) 확인 */}
      <div ref={s4Ref} className="h-0 scroll-mt-[84px]" />
      <Card title="4. 입력 내용 확인">
        <div className={step < 4 ? 'pointer-events-none opacity-60' : ''}>
          {/* 고객 요약 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h4 className="font-semibold flex items-center gap-2"><span>🙍</span> 고객정보</h4>
            <dl className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
              <dt className="text-slate-500 dark:text-slate-300">이름</dt>
              <dd className="col-span-2">{firstName} {surName}</dd>
              <dt className="text-slate-500 dark:text-slate-300">전화</dt>
              <dd className="col-span-2">{selectedCountry?.code || ''} {phoneLocal}</dd>
              <dt className="text-slate-500 dark:text-slate-300">국가</dt>
              <dd className="col-span-2">{selectedCountry?.name || '-'}</dd>
              <dt className="text-slate-500 dark:text-slate-300">이메일</dt>
              <dd className="col-span-2">
                {email}{' '}
                <span className={chipCls}>인증 완료</span>
              </dd>
              <dt className="text-slate-500 dark:text-slate-300">ZIP</dt>
              <dd className="col-span-2">{zip || '-'}</dd>
              <dt className="text-slate-500 dark:text-slate-300">주소</dt>
              <dd className="col-span-2 break-words">{address}</dd>
              <dt className="text-slate-500 dark:text-slate-300">홍보 이메일</dt>
              <dd className="col-span-2">{optInEmail ? '동의' : '미동의'}</dd>
            </dl>
          </section>

          {/* 제품 요약 */}
          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h4 className="font-semibold flex items-center gap-2"><span>📦</span> 등록 제품</h4>
            {addedProducts.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">등록된 제품이 없습니다.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {addedProducts.map((p) => (
                  <li key={p.serial} className="rounded-2xl border border-slate-200 p-3 text-sm dark:border-slate-700">
                    <div className="font-medium">
                      {p.productName} <span className="text-slate-500">({CATEGORY_LABELS[p.category]})</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      SAP: {p.model} · S/N: {p.serial} · 구매일자: {p.purchaseDate || '-'} · 구매처: {p.vendor || '-'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 개인정보 동의 요약 (ProductLookup 스타일 적용) */}
          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h4 className="font-semibold flex items-center gap-2"><span>🔒</span> 개인정보 동의</h4>
            <ul className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                <span>보증 서비스 목적 처리</span>
                <span className={chipChoice(consentService)}>{consentService ? '동의' : '미동의'}</span>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                <span>국외 이전 안내 확인</span>
                <span className={chipChoice(consentXBorder)}>{consentXBorder ? '확인' : '미확인'}</span>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                <span>제품 공지/마케팅 수신</span>
                <span className={chipChoice(consentMarketing)}>{consentMarketing ? '동의' : '미동의'}</span>
              </li>
              {/* 채널별 동의 표시 */}
              <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                <span>홍보 이메일 수신</span>
                <span className={chipChoice(optInEmail)}>{optInEmail ? '동의' : '미동의'}</span>
              </li>
            </ul>

            <div className="mt-5 flex items-center justify-between">
              <Button onClick={() => setStep(3)}>이전(개인정보 동의)</Button>
              <Button onClick={handleSubmit} disabled={addedProducts.length === 0}>
                등록 완료
              </Button>
            </div>
            {addedProducts.length === 0 && (
              <p className="mt-2 text-xs text-rose-600">최소 1개 이상의 제품을 등록해야 합니다.</p>
            )}
          </section>
        </div>
      </Card>

      {/* 국가 선택 모달 */}
      {countryModalOpen && (
        <Modal title="국가/국가번호 선택" onClose={() => setCountryModalOpen(false)}>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
            <Input
              value={countryQuery}
              onChange={(e) => setCountryQuery(e.target.value)}
              placeholder="검색 (예: Korea, Japan, United...)"
              autoFocus
            />
            <Button
              variant="secondary"
              onClick={() => {
                setCountryQuery('');
              }}
              title="검색어 지우기"
            >
              지우기
            </Button>
          </div>
          <div className="max-h-72 overflow-auto rounded-lg border border-slate-200 dark:border-slate-700 mt-2">
            {filteredCountries.length === 0 ? (
              <p className="p-3 text-sm text-slate-500">검색 결과가 없습니다.</p>
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

      {/* 기타 모달들 */}
      {showPolicy && (
        <Modal title="개인정보 처리방침 (요약)" onClose={() => setShowPolicy(false)}>
          <p>수집항목: 이름, 전화번호, 이메일, 주소, 제품정보(모델/시리얼), 첨부문서.</p>
          <p>수집/이용 목적: 보증 등록 및 서비스 제공, 고객지원, 안전/업데이트 공지, 법적 의무 준수.</p>
          <p>보관기간: 관련 법령 또는 서비스 관계 유지 기간 동안 보관 후 파기.</p>
          <p>제3자 제공/처리위탁: 공식 대리점/수리센터/클라우드 제공사 등 (필요 범위 내).</p>
          <p>권리: 열람, 정정, 삭제, 처리정지, 수신거부 등 요청 가능.</p>
          <p>문의: privacy@example.com</p>
        </Modal>
      )}
      {showXBorder && (
        <Modal title="개인정보 국외 이전 고지 (요약)" onClose={() => setShowXBorder(false)}>
          <p>이전 대상: 해외 본사/서비스센터 및 클라우드 인프라.</p>
          <p>이전 목적: 보증 이행, 기술지원 및 품질 개선.</p>
          <p>보호조치: 표준계약조항(SCC), 암호화, 접근통제, 최소수집.</p>
          <p>보관기간: 목적 달성 시 또는 법정 보관기간 경과 시 파기.</p>
          <p>문의: privacy@example.com</p>
        </Modal>
      )}
    </PageWrap>
  );
}
