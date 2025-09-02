// src/pages/Manuals.jsx
import React, { useMemo, useState } from 'react'
import PageWrap from './_PageWrap.jsx'
import Card from '../components/Card.jsx'
import { Label, Input, Button } from '../components/FormControls.jsx'

/** 전역 공유 스토리지 키 (Register.jsx와 동일 값 사용) */
const STORE_KEY = 'HYW_REG_PRODUCTS_BY_EMAIL'
const LAST_EMAIL_KEY = 'HYW_LAST_VERIFIED_EMAIL'

/** 제품 목록(이름만 유지) */
const PRODUCT_NAMES = [
  'W/FEEDER(SUPER WF4S W)',
  'W/FEEDER(SUPER WF4S)',
  'W/FEEDER(SUPER WF4 W)',
  'W/FEEDER(SUPER WF4)',
  'DC TIG(SUPER T400)',
  'DC TIG(SUPER T270)',
  'MMA(SUPER S400)',
  'MMA(SUPER S270)',
  'MAG(SUPER M500)',
  'MAG(SUPER M450)',
  'MAG(SUPER M350)',
  'MAG(SUPER C350)',
  'MAG(SUPER C300)',
  'WATER COOLER(SUPER COOLER L)',
  'WATER COOLER(SUPER COOLER)',
]

/** 오너스 매뉴얼 지원 언어 5종 */
const LANGS = [
  { code: 'en', label: "English" },
  { code: 'ko', label: "한국어" },
  { code: 'zh', label: "中文" },
  { code: 'ja', label: "日本語" },
  { code: 'ru', label: "Русский" },
]

/** PDF 안내용 새 페이지로 이동할 URL 생성 (새 탭) */
const buildPlaceholderUrl = (model, lang, action) =>
  `/manuals/pdf-missing?model=${encodeURIComponent(model)}&lang=${encodeURIComponent(lang)}&action=${encodeURIComponent(action)}`

/** 간단 모달 */
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-[92vw] max-w-3xl rounded-2xl border
                      border-slate-200 bg-white p-5 shadow-xl
                      dark:border-slate-700 dark:bg-slate-900">
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
  )
}

export default function Manuals() {
  const [q, setQ] = useState('')

  // 등록 제품 모달 상태
  const [mineOpen, setMineOpen] = useState(false)
  const [mineEmail, setMineEmail] = useState('')
  const [mineList, setMineList] = useState([])   // 해당 이메일의 등록 제품 목록
  const [selected, setSelected] = useState(null) // 목록에서 클릭한 상세 아이템

  // 모달 내 이메일 인증 변경 UI 상태
  const [authMode, setAuthMode] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [emailCode, setEmailCode] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [emailMsg, setEmailMsg] = useState('')
  const [emailErr, setEmailErr] = useState('')

  /** 로컬스토리지 로드 */
  const loadFromStore = () => {
    try {
      const store = JSON.parse(localStorage.getItem(STORE_KEY) || '{}')
      const lastEmail = localStorage.getItem(LAST_EMAIL_KEY) || ''
      return { store, lastEmail }
    } catch {
      return { store: {}, lastEmail: '' }
    }
  }

  /** 특정 이메일의 제품 로드 */
  const loadMyProductsByEmail = (email) => {
    const { store } = loadFromStore()
    const list = email && store[email] ? store[email] : []
    setMineEmail(email)
    setMineList(Array.isArray(list) ? list : [])
    setSelected(null)
  }

  /** 모달 열기 */
  const openMyProducts = () => {
    const { lastEmail } = loadFromStore()
    // 모달 초기 상태 세팅
    setMineOpen(true)
    setAuthMode(false)
    setEmailMsg('')
    setEmailErr('')
    setEmailSent(false)
    setEmailCode('')
    setEmailVerified(!!lastEmail)
    setEmailInput(lastEmail || '')
    // 데이터 로딩
    loadMyProductsByEmail(lastEmail || '')
  }

  /** "현재와 동일한 이메일" 여부 */
  const isSameAsCurrent = emailInput.trim().toLowerCase() === (mineEmail || '').trim().toLowerCase()

  /** 버튼 활성화 규칙 (해결안 #2) */
  const canSend = !!emailInput.trim() && !(emailVerified && isSameAsCurrent)
  const canVerify = !!emailSent && !(emailVerified && isSameAsCurrent)

  /** 인증번호 요청 */
  const handleSendEmailCode = () => {
    const val = emailInput.trim()
    if (!val) {
      setEmailMsg('')
      setEmailErr('이메일을 입력하세요.')
      return
    }
    setEmailSent(true)
    setEmailVerified(false) // 새 메일 인증 흐름 시작
    setEmailErr('')
    setEmailMsg('인증번호가 전송되었습니다. (힌트: ABCDE)')
  }

  /** 인증 확인 */
  const handleVerifyEmailCode = () => {
    if (emailCode.trim().toUpperCase() === 'ABCDE') {
      const val = emailInput.trim()
      setEmailVerified(true)
      setEmailErr('')
      setEmailMsg('이메일 인증이 완료되었습니다.')
      try {
        localStorage.setItem(LAST_EMAIL_KEY, val)
      } catch {}
      // 제품 목록 갱신
      loadMyProductsByEmail(val)
      // 인증 UI 닫기
      setAuthMode(false)
    } else {
      setEmailVerified(false)
      setEmailMsg('')
      setEmailErr('인증코드가 올바르지 않습니다. (힌트: ABCDE)')
    }
  }

  /** 제품명 검색 필터 */
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase()
    const arr = PRODUCT_NAMES.map(name => ({ name }))
    if (!k) return arr
    return arr.filter(x => x.name.toLowerCase().includes(k))
  }, [q])

  return (
    <PageWrap title="매뉴얼 검색" subtitle="">
      {/* 안내 문구 - 다크모드 색상 개선 */}
      <Card className="mb-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700
                        dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          지원 언어: <b>English / 한국어 / 中文 / 日本語 / Русский</b>.
          <div className="mt-2 text-slate-600 dark:text-slate-300">
            각 언어의 <b>“새 탭에서 보기”</b>, <b>“다운로드”</b> 버튼은 현재 PDF가 없을 경우
            <b>“PDF를 등록해 주세요”</b> 안내 페이지로 이동합니다.
          </div>

          {/* 내 등록 제품 버튼 */}
          <div className="mt-3">
            <Button onClick={openMyProducts} title="Register 페이지에서 이메일 인증 후 등록한 제품을 모아봅니다.">
              내 등록 제품 보기
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <Label htmlFor="manual-q">제품명으로 검색</Label>
        <Input
          id="manual-q"
          placeholder="모델명, 키워드 등 (예: SUPER M350)"
          value={q}
          onChange={e => setQ(e.target.value)}
        />

        <div className="mt-4 space-y-4">
          {filtered.length === 0 && (
            <p className="text-slate-500 text-sm dark:text-slate-400">검색 결과가 없습니다.</p>
          )}

          {filtered.map(({ name }) => (
            <div key={name} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div className="font-semibold">{name}</div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                {LANGS.map(lang => (
                  <div key={lang.code} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                    <div className="text-sm">
                      <span className="font-medium">Owner’s Manual</span>{' '}
                      <span className="text-slate-500 dark:text-slate-400">({lang.label})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm
                                   bg-transparent transition-colors
                                   hover:bg-slate-100 dark:hover:bg-slate-800
                                   dark:border-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600"
                        href={buildPlaceholderUrl(name, lang.code, 'view')}
                        target="_blank"
                        rel="noreferrer"
                      >
                        새 탭에서 보기
                      </a>
                      <a
                        className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm
                                   bg-transparent transition-colors
                                   hover:bg-slate-100 dark:hover:bg-slate-800
                                   dark:border-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600"
                        href={buildPlaceholderUrl(name, lang.code, 'download')}
                        target="_blank"
                        rel="noreferrer"
                        download
                        title="PDF가 준비되면 실제 파일로 교체합니다."
                      >
                        다운로드
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 내 등록 제품 모달 (원래 구조 유지: 목록 + 간단 상세 + 5개 언어 액션) */}
      {mineOpen && (
        <Modal title="내 등록 제품" onClose={() => setMineOpen(false)}>
          {/* 현재 이메일 상태 + 변경 버튼 */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-slate-600 dark:text-slate-300">
              현재 이메일: <b>{mineEmail || '없음'}</b>{' '}
              <span className={[
                'ml-1 px-2 py-0.5 text-[11px] rounded-full border',
                mineEmail
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-rose-300 bg-rose-50 text-rose-700'
              ].join(' ')}>
                {mineEmail ? '인증됨' : '미인증'}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <a className="text-sm underline" href="/register" title="새 제품 등록">등록 페이지로 이동</a>
              <Button
                variant="secondary"
                onClick={() => {
                  setAuthMode(s => !s)
                  setEmailMsg('')
                  setEmailErr('')
                  setEmailSent(false)
                  setEmailCode('')
                  // emailVerified 유지 (해결2 정책: 동일 이메일이면 버튼 막음, 다르면 활성)
                  setEmailInput(mineEmail || '')
                }}
              >
                {authMode ? '닫기' : '이메일 변경/인증'}
              </Button>
            </div>
          </div>

          {/* 이메일 변경/인증 섹션 */}
          {authMode && (
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                />
                <Button
                  onClick={handleSendEmailCode}
                  disabled={!canSend}
                  className={!canSend ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  인증번호 요청
                </Button>
                <div className="flex items-center gap-2">
                  <Input
                    value={emailCode}
                    onChange={e => setEmailCode(e.target.value)}
                    placeholder="인증코드 입력 (힌트: ABCDE)"
                    disabled={!emailSent || (emailVerified && isSameAsCurrent)}
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
              {emailMsg && <p className="text-emerald-600 text-xs mt-1">{emailMsg}</p>}
              {emailErr && <p className="text-rose-600 text-xs mt-1">{emailErr}</p>}
              {!emailVerified && !emailMsg && !emailErr && (
                <p className="text-slate-500 text-xs mt-1">* 테스트용 인증코드: <b>ABCDE</b></p>
              )}
            </div>
          )}

          {/* 제품 목록 / 간단 상세 */}
          {mineList.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-300">
              이 이메일로 등록된 제품이 없습니다. 먼저 제품 등록을 완료하세요.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {mineList.map((it, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelected(it)}
                    className={[
                      "text-left rounded-lg border px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
                      selected === it ? "border-slate-400 dark:border-slate-500" : "border-slate-200 dark:border-slate-700"
                    ].join(' ')}
                  >
                    <div className="font-medium">{it.product?.productName || it.product?.model || '-'}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">S/N: {it.product?.serial || '-'}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">구매일: {it.product?.purchaseDate || '-'}</div>
                  </button>
                ))}
              </div>

              {selected && (
                <div className="mt-4 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  <div className="font-semibold mb-1">상세 정보</div>
                  <dl className="grid grid-cols-3 gap-x-3 gap-y-1 text-sm">
                    <dt className="text-slate-500 dark:text-slate-400">모델</dt>
                    <dd className="col-span-2">{selected.product?.productName || selected.product?.model || '-'}</dd>
                    <dt className="text-slate-500 dark:text-slate-400">시리얼</dt>
                    <dd className="col-span-2">{selected.product?.serial || '-'}</dd>
                    <dt className="text-slate-500 dark:text-slate-400">구매처</dt>
                    <dd className="col-span-2">{selected.product?.vendor || '-'}</dd>
                    <dt className="text-slate-500 dark:text-slate-400">등록일시</dt>
                    <dd className="col-span-2">{selected.createdAt?.replace('T',' ').replace('Z',' UTC') || '-'}</dd>
                  </dl>

                  <div className="mt-3 font-medium">Owner’s Manual (5개 언어)</div>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {LANGS.map(lang => (
                      <div key={lang.code} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                        <div className="text-sm">
                          {lang.label}
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm
                                       bg-transparent transition-colors
                                       hover:bg-slate-100 dark:hover:bg-slate-800
                                       dark:border-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600"
                            href={buildPlaceholderUrl(selected.product?.productName || selected.product?.model || '-', lang.code, 'view')}
                            target="_blank"
                            rel="noreferrer"
                          >
                            새 탭에서 보기
                          </a>
                          <a
                            className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm
                                       bg-transparent transition-colors
                                       hover:bg-slate-100 dark:hover:bg-slate-800
                                       dark:border-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600"
                            href={buildPlaceholderUrl(selected.product?.productName || selected.product?.model || '-', lang.code, 'download')}
                            target="_blank"
                            rel="noreferrer"
                            download
                          >
                            다운로드
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </Modal>
      )}
    </PageWrap>
  )
}
