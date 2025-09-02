// src/pages/Register.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrap from './_PageWrap.jsx';
import Card from '../components/Card.jsx';
import { Label, Input, Textarea, Button } from '../components/FormControls.jsx';

// ------- 전역(페이지간 공유) 스토리지 키 & 유틸 --------
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

// ------- 제품 분류 / 모델 옵션 --------
const CATEGORY_OPTIONS = [
  { value: 'wire', label: 'Wire Feeder' },
  { value: 'power', label: 'Power Source' },
  { value: 'cool', label: 'Cooling' },
];
const MODEL_MAP = {
  wire: ['W/FEEDER(SUPER WF4S W)', 'W/FEEDER(SUPER WF4S)', 'W/FEEDER(SUPER WF4 W)', 'W/FEEDER(SUPER WF4)'],
  power: [
    'DC TIG(SUPER T400)',
    'DC TIG(SUPER T270)',
    'MMA(SUPER S400)',
    'MMA(SUPER S270)',
    'MAG(SUPER M500)',
    'MAG(SUPER M450)',
    'MAG(SUPER M350)',
    'MAG(SUPER C350)',
    'MAG(SUPER C300)',
  ],
  cool: ['WATER COOLER(SUPER COOLER L)', 'WATER COOLER(SUPER COOLER)'],
};

// ------- 보조 유틸 --------
const phoneCodes = ['+82', '+81', '+86', '+1', '+44', '+49'];

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

/** 헤더 높이를 고려해서 부드럽게 스크롤 */
function scrollToRefWithHeaderOffset(ref) {
  const el = ref?.current;
  if (!el) return;
  const header = document.querySelector('header');
  const headerH = header?.getBoundingClientRect().height ?? 0;
  const offset = headerH + 12; // 헤더 + 여백
  const y = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

/** 간단 모달 */
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-[92vw] max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="text-sm text-slate-700 dark:text-slate-200 space-y-2">{children}</div>
        <div className="mt-4 text-right">
          <Button onClick={onClose}>확인</Button>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();

  // ----- 스텝 상태 -----
  const [step, setStep] = useState(0); // 0(안내) → 1..4
  const s0Ref = useRef(null);
  const s1Ref = useRef(null);
  const s2Ref = useRef(null);
  const s3Ref = useRef(null);
  const s4Ref = useRef(null);
  const didInit = useRef(false);

  useEffect(() => {
    // 최초엔 s0로 고정
    if (!didInit.current) {
      didInit.current = true;
      scrollToRefWithHeaderOffset(s0Ref);
      return;
    }
    const refs = { 0: s0Ref, 1: s1Ref, 2: s2Ref, 3: s3Ref, 4: s4Ref };
    scrollToRefWithHeaderOffset(refs[step]);
  }, [step]);

  // ----- 1) 제품정보 -----
  const [category, setCategory] = useState('');
  const models = useMemo(() => (category ? MODEL_MAP[category] : []), [category]);
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [vendor, setVendor] = useState('');
  const [invoiceFiles, setInvoiceFiles] = useState([]);

  useEffect(() => {
    setModel('');
  }, [category]); // 카테고리 바뀌면 2차 모델 초기화

  const productName = model;

  // ----- 2) 고객정보 -----
  const [firstName, setFirstName] = useState('');
  const [surName, setSurName] = useState('');
  const [phoneCode, setPhoneCode] = useState('+82');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState('');
  const [address, setAddress] = useState('');

  // ✅ 홍보 수신 동의(선택) - 이메일/문자
  const [optInEmail, setOptInEmail] = useState(false);
  const [optInSms, setOptInSms] = useState(false);

  // 이메일 인증 상태
  const [emailSent, setEmailSent] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');
  const [emailErr, setEmailErr] = useState('');

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
      setEmailMsg('이메일 인증이 완료되었습니다.');
      // ✅ 최근 인증 이메일 저장 (Manuals.jsx에서 사용)
      try {
        localStorage.setItem(LAST_EMAIL_KEY, email.trim());
      } catch {}
    } else {
      setEmailVerified(false);
      setEmailMsg('');
      setEmailErr('인증코드가 올바르지 않습니다. (힌트: ABCDE)');
    }
  };

  // ----- 3) 개인정보 동의 -----
  const [consentService, setConsentService] = useState(false); // 필수
  const [consentXBorder, setConsentXBorder] = useState(false); // 필수
  const [consentMarketing, setConsentMarketing] = useState(false); // 필수(요구사항에 따라 변경됨)

  // 모달 상태
  const [showPolicy, setShowPolicy] = useState(false);
  const [showXBorder, setShowXBorder] = useState(false);

  // ----- 유효성 / 이동 제한 -----
  const validStep1 =
    !!category && !!model && serial.trim().length > 0 && purchaseDate.trim().length > 0;
  const validStep2Base =
    firstName.trim() && surName.trim() && phoneLocal.trim() && email.trim() && address.trim();
  const validStep2 = validStep2Base && emailVerified; // 이메일 인증 필수
  // ★ 3개 모두 체크해야 다음으로 이동
  const validStep3 = consentService && consentXBorder && consentMarketing;

  const locked2 = !validStep1;
  const locked3 = !(validStep1 && validStep2);
  const locked4 = !(validStep1 && validStep2 && validStep3);

  // ----- 제출 (스텝4) -----
  const resetAll = () => {
    setStep(0);
    setCategory('');
    setModel('');
    setSerial('');
    setPurchaseDate('');
    setVendor('');
    setInvoiceFiles([]);
    setFirstName('');
    setSurName('');
    setPhoneCode('+82');
    setPhoneLocal('');
    setEmail('');
    setZip('');
    setAddress('');
    setEmailSent(false);
    setEmailCode('');
    setEmailVerified(false);
    setEmailMsg('');
    setEmailErr('');
    setConsentService(false);
    setConsentXBorder(false);
    setConsentMarketing(false);
    // ✅ 추가 초기화
    setOptInEmail(false);
    setOptInSms(false);
  };

  const handleSubmit = () => {
    // 콘솔 기록(프로토타입)
    const data = {
      product: {
        category,
        model,
        productName,
        serial,
        purchaseDate,
        vendor,
        invoiceFiles: invoiceFiles.map((f) => ({ name: f.name, type: f.type, size: f.size })),
      },
      customer: {
        firstName,
        surName,
        phone: `${phoneCode} ${phoneLocal}`, // ✅ 템플릿 문자열
        email,
        zip,
        address,
        emailVerified,
      },
      privacy: {
        consentService,
        consentXBorder,
        consentMarketing,
        // ✅ 선택 동의(채널별)
        promoEmail: optInEmail,
        promoSms: optInSms,
      },
      createdAt: new Date().toISOString(),
    };
    console.log('[REGISTER SUBMIT]', data);

    // ✅ 이메일별 등록 제품 저장
    try {
      const store = loadStore();
      const key = (email || '').trim();
      if (key) {
        const arr = Array.isArray(store[key]) ? store[key] : [];
        arr.push(data);
        store[key] = arr;
        saveStore(store);
        // 최근 인증 이메일도 업데이트 (안전용)
        localStorage.setItem(LAST_EMAIL_KEY, key);
      }
    } catch (e) {
      console.warn('등록 데이터 저장 실패:', e);
    }

    alert('등록이 완료되었습니다.');
    resetAll();
    navigate('/'); // 필요시 '/manuals'로 변경 가능
  };

  return (
    <PageWrap title="제품 등록" subtitle="">
      {/* 상단 스텝 네비 (1~4만 노출) */}
      <div className="mb-4 flex flex-wrap gap-2">
        <StepChip index={1} current={step} setCurrent={setStep} label="제품정보" locked={false} />
        <StepChip index={2} current={step} setCurrent={setStep} label="고객정보" locked={locked2} />
        <StepChip index={3} current={step} setCurrent={setStep} label="개인정보 동의" locked={locked3} />
        <StepChip index={4} current={step} setCurrent={setStep} label="확인" locked={locked4} />
      </div>

      {/* 0) 안내 블록 */}
      <div ref={s0Ref} className="h-0 scroll-mt-[84px]" />
      <Card title="안내">
        <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
          <p>다음 순서로 등록을 진행합니다:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>제품정보 입력 (분류/모델, 시리얼, 구매일자/구매처, 인보이스)</li>
            <li>고객정보 입력 (이름, 연락처, <strong>이메일 인증</strong>, 주소)</li>
            <li>개인정보 처리 동의</li>
            <li>입력 내용 확인 및 제출</li>
          </ol>
        </div>
        <div className="mt-4">
          <Button onClick={() => setStep(1)}>제품정보로 시작</Button>
        </div>
      </Card>

      {/* 1) 제품정보 */}
      <div ref={s1Ref} className="h-0 scroll-mt-[84px]" />
      <Card title="1. 제품정보">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="cat">모델</Label>
            <select
              id="cat"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">선택</option>
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="model">SAP 코드명</Label>
            <select
              id="model"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={!category}
            >
              <option value="">{category ? '선택' : '1차 분류 먼저 선택'}</option>
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="productName">제품명</Label>
            <Input id="productName" value={productName} readOnly placeholder="2차 모델 선택 시 자동 표시" />
          </div>
          <div>
            <Label htmlFor="serial">제품 시리얼번호(확인 로직 추가 필요)</Label>
            <Input
              id="serial"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="예: HYW-ABC123456"
            />
          </div>
          <div>
            <Label htmlFor="date">구매일자</Label>
            <Input id="date" type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="vendor">구매처</Label>
            <Input
              id="vendor"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="예: 현대 PNS 대리점"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="invoice">인보이스 업로드 (PDF, Excel, JPG/PNG)</Label>
            <input
              id="invoice"
              type="file"
              multiple
              accept=".pdf,.xls,.xlsx,.jpg,.jpeg,.png"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 file:mr-3 file:rounded-lg file:border file:px-3 file:py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              onChange={(e) => setInvoiceFiles(Array.from(e.target.files || []))}
            />
            {invoiceFiles.length > 0 && (
              <p className="text-slate-500 dark:text-slate-300 text-xs mt-1">
                업로드된 파일: {invoiceFiles.map((f) => f.name).join(', ')}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => setStep(2)} disabled={!validStep1} className={validStep1 ? '' : 'opacity-50 cursor-not-allowed'}>
            다음(고객정보)
          </Button>
        </div>
      </Card>

      {/* 2) 고객정보 */}
      <div ref={s2Ref} className="h-0 scroll-mt-[84px]" />
      <Card title="2. 고객정보">
        <div className={step < 2 ? 'pointer-events-none opacity-60' : ''}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="first">First Name</Label>
              <Input id="first" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="예: Gil-dong" />
            </div>
            <div>
              <Label htmlFor="sur">Sur Name</Label>
              <Input id="sur" value={surName} onChange={(e) => setSurName(e.target.value)} placeholder="예: Hong" />
            </div>
            <div>
              <Label htmlFor="code">국가번호</Label>
              <select
                id="code"
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {phoneCodes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="phone">전화번호</Label>
              <Input id="phone" value={phoneLocal} onChange={(e) => setPhoneLocal(e.target.value)} placeholder="예: 10-1234-5678" />
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
                  placeholder="name@example.com"
                />
                <Button
                  onClick={handleSendEmailCode}
                  className={emailVerified ? 'opacity-50 cursor-not-allowed' : ''}
                  disabled={emailVerified}
                >
                  인증번호 요청
                </Button>
                <div className="flex items-center gap-2">
                  <Input
                    id="emailCode"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder="인증코드 입력 (힌트: ABCDE)"
                    disabled={!emailSent || emailVerified}
                  />
                  <Button
                    onClick={handleVerifyEmailCode}
                    className={!emailSent || emailVerified ? 'opacity-50 cursor-not-allowed' : ''}
                    disabled={!emailSent || emailVerified}
                  >
                    인증하기
                  </Button>
                </div>
              </div>
              {/* 인증 메시지 */}
              {emailMsg && <p className="text-emerald-500 text-xs mt-1">{emailMsg}</p>}
              {emailErr && <p className="text-rose-500 text-xs mt-1">{emailErr}</p>}
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
                placeholder="도로명, 동/호수, 도시, 국가 등"
              />
            </div>

            {/* ✅ 홍보 수신 동의 (선택) */}
            <div className="md:col-span-2">
              <Label>홍보/공지 수신 동의 (선택)</Label>
              <div className="flex flex-col md:flex-row gap-4 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={optInEmail}
                    onChange={(e) => setOptInEmail(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-slate-700 dark:text-slate-200">이메일 수신 동의</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={optInSms}
                    onChange={(e) => setOptInSms(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-slate-700 dark:text-slate-200">문자(SMS) 수신 동의</span>
                </label>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                * 제품 업데이트/안전 공지/프로모션 등 정보 수신에 동의하며, 언제든지 수신거부 가능합니다.
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={() => setStep(1)}>이전(제품정보)</Button>
            <Button onClick={() => setStep(3)} disabled={!validStep2} className={validStep2 ? '' : 'opacity-50 cursor-not-allowed'}>
              다음(개인정보 동의)
            </Button>
          </div>
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
              <span className="text-slate-700 dark:text-slate-200">
                <strong className="font-semibold">[필수]</strong> 보증 서비스 이행을 위한 개인정보 처리에 동의합니다. (서비스 제공을 위한 고객
                식별, 구매내역 확인, A/S 일정 안내 및 처리)
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={consentXBorder}
                onChange={(e) => setConsentXBorder(e.target.checked)}
                className="mt-1"
              />
              <span className="text-slate-700 dark:text-slate-200">
                <strong className="font-semibold">[필수]</strong> 서비스 제공을 위한 국외 이전 가능성에 대한 안내를 확인했습니다. (해외
                본사/서비스센터로의 데이터 전송 시 표준계약조항 등 적정 보호조치 적용)
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={consentMarketing}
                onChange={(e) => setConsentMarketing(e.target.checked)}
                className="mt-1"
              />
              <span className="text-slate-700 dark:text-slate-200">
                <strong className="font-semibold">[필수]</strong> 제품 업데이트/안전 공지 등 정보 수신에 동의합니다. (선택적 프로모션 포함 가능,
                언제든지 수신거부 가능)
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

          <div className="mt-4 flex gap-2">
            <Button onClick={() => setStep(2)}>이전(고객정보)</Button>
            <Button onClick={() => setStep(4)} disabled={!validStep3} className={validStep3 ? '' : 'opacity-50 cursor-not-allowed'}>
              다음(확인)
            </Button>
          </div>
        </div>
      </Card>

      {/* 4) 확인 */}
      <div ref={s4Ref} className="h-0 scroll-mt-[84px]" />
      <Card title="4. 입력 내용 확인">
        <div className={step < 4 ? 'pointer-events-none opacity-60' : ''}>
          {/* 상단 요약 칩 */}
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="px-2 py-1 text-xs rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              모델: {CATEGORY_OPTIONS.find((c) => c.value === category)?.label || '-'}
            </span>
            <span className="px-2 py-1 text-xs rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              SAP 코드명: {model || '-'}
            </span>
            <span className="px-2 py-1 text-xs rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              시리얼: {serial || '-'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 제품정보 */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h4 className="font-semibold flex items-center gap-2">
                <span>📦</span> 제품정보
              </h4>
              <dl className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
                <dt className="text-slate-500 dark:text-slate-300">모델</dt>
                <dd className="col-span-2 font-medium">
                  {CATEGORY_OPTIONS.find((c) => c.value === category)?.label || '-'}
                </dd>
                <dt className="text-slate-500 dark:text-slate-300">SAP 코드명</dt>
                <dd className="col-span-2 font-medium">{model || '-'}</dd>
                <dt className="text-slate-500 dark:text-slate-300">제품명</dt>
                <dd className="col-span-2">{productName || '-'}</dd>
                <dt className="text-slate-500 dark:text-slate-300">시리얼</dt>
                <dd className="col-span-2">{serial || '-'}</dd>
                <dt className="text-slate-500 dark:text-slate-300">구매일자</dt>
                <dd className="col-span-2">{purchaseDate || '-'}</dd>
                <dt className="text-slate-500 dark:text-slate-300">구매처</dt>
                <dd className="col-span-2">{vendor || '-'}</dd>
                <dt className="text-slate-500 dark:text-slate-300">인보이스</dt>
                <dd className="col-span-2">{invoiceFiles.length ? invoiceFiles.map((f) => f.name).join(', ') : '-'}</dd>
              </dl>
            </section>

            {/* 고객정보 */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h4 className="font-semibold flex items-center gap-2">
                <span>🙍</span> 고객정보
              </h4>
              <dl className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
                <dt className="text-slate-500 dark:text-slate-300">이름</dt>
                <dd className="col-span-2">
                  {firstName} {surName}
                </dd>
                <dt className="text-slate-500 dark:text-slate-300">전화</dt>
                <dd className="col-span-2">
                  {phoneCode} {phoneLocal}
                </dd>
                <dt className="text-slate-500 dark:text-slate-300">이메일</dt>
                <dd className="col-span-2">
                  {email}{' '}
                  <span
                    className={[
                      'ml-1 px-2 py-0.5 text-[11px] rounded-full border',
                      emailVerified
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                        : 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300',
                    ].join(' ')}
                  >
                    {emailVerified ? '인증 완료' : '미인증'}
                  </span>
                </dd>
                <dt className="text-slate-500 dark:text-slate-300">ZIP</dt>
                <dd className="col-span-2">{zip || '-'}</dd>
                <dt className="text-slate-500 dark:text-slate-300">주소</dt>
                <dd className="col-span-2 break-words">{address}</dd>
              </dl>
            </section>

            {/* 개인정보 동의 */}
            <section className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h4 className="font-semibold flex items-center gap-2">
                <span>🔒</span> 개인정보 동의
              </h4>

              <ul className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                  <span>보증 서비스 목적 처리</span>
                  <span
                    className={[
                      'px-2 py-0.5 text-[11px] rounded-full border',
                      consentService
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                        : 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300',
                    ].join(' ')}
                  >
                    {consentService ? '동의' : '미동의'}
                  </span>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                  <span>국외 이전 안내 확인</span>
                  <span
                    className={[
                      'px-2 py-0.5 text-[11px] rounded-full border',
                      consentXBorder
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                        : 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300',
                    ].join(' ')}
                  >
                    {consentXBorder ? '확인' : '미확인'}
                  </span>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                  <span>제품 공지/마케팅 수신(전체)</span>
                  <span
                    className={[
                      'px-2 py-0.5 text-[11px] rounded-full border',
                      consentMarketing
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                        : 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300',
                    ].join(' ')}
                  >
                    {consentMarketing ? '동의' : '미동의'}
                  </span>
                </li>

                {/* ✅ 채널별 동의 */}
                <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                  <span>홍보 이메일 수신</span>
                  <span
                    className={[
                      'px-2 py-0.5 text-[11px] rounded-full border',
                      optInEmail
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                        : 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300',
                    ].join(' ')}
                  >
                    {optInEmail ? '동의' : '미동의'}
                  </span>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                  <span>홍보 문자(SMS) 수신</span>
                  <span
                    className={[
                      'px-2 py-0.5 text-[11px] rounded-full border',
                      optInSms
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                        : 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300',
                    ].join(' ')}
                  >
                    {optInSms ? '동의' : '미동의'}
                  </span>
                </li>
              </ul>

              {/* 액션 버튼 */}
              <div className="mt-5 flex items-center justify-between">
                <Button onClick={() => setStep(3)}>이전(개인정보 동의)</Button>
                <Button onClick={handleSubmit}>등록 완료</Button>
              </div>
            </section>
          </div>
        </div>
      </Card>

      {/* 모달들 */}
      {showPolicy && (
        <Modal title="개인정보 처리방침 (요약)" onClose={() => setShowPolicy(false)}>
          <p>수집항목: 이름, 전화번호, 이메일, 주소, 제품정보(모델/시리얼), 구매내역, 첨부문서(인보이스).</p>
          <p>수집/이용 목적: 보증 등록 및 서비스 제공, 고객지원, 안전/업데이트 공지, 법적 의무 준수.</p>
          <p>보관기간: 관련 법령 또는 서비스 관계 유지 기간 동안 보관 후 파기.</p>
          <p>제3자 제공/처리위탁: 공식 대리점/수리센터/클라우드 제공사 등 (필요 범위 내).</p>
          <p>권리: 열람, 정정, 삭제, 처리정지, 수신거부 등 요청 가능.</p>
          <p>문의: privacy@example.com</p>
        </Modal>
      )}
      {showXBorder && (
        <Modal title="개인정보 국외 이전 고지 (요약)" onClose={() => setShowXBorder(false)}>
          <p>이전 대상: 해외 본사/서비스센터 및 클라우드 인프라(예: 리전 내 안전한 서버).</p>
          <p>이전 목적: 보증 이행, 기술지원 및 품질 개선.</p>
          <p>보호조치: 표준계약조항(SCC), 암호화, 접근통제, 최소수집.</p>
          <p>보관기간: 목적 달성 시 또는 법정 보관기간 경과 시 파기.</p>
          <p>문의: privacy@example.com</p>
        </Modal>
      )}
    </PageWrap>
  );
}
