// src/pages/ProductLookup.jsx
import React, { useEffect, useState } from 'react'
import PageWrap from './_PageWrap.jsx'
import Card from '../components/Card.jsx'
import { Input, Button } from '../components/FormControls.jsx'

/** 로컬 스토리지 키 (Register.jsx / Manuals.jsx와 동일) */
const STORE_KEY = 'HYW_REG_PRODUCTS_BY_EMAIL'
const LAST_EMAIL_KEY = 'HYW_LAST_VERIFIED_EMAIL'

/** 분류 라벨 매핑 (Register.jsx와 동일하게) */
const CATEGORY_LABELS = {
  wire: 'Wire Feeder',
  power: 'Power Source',
  cool: 'Cooling',
}

/** 바이트 포맷 */
function formatSize(size) {
  if (typeof size !== 'number') return '-'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 102.4) / 10} KB`
  return `${Math.round(size / 104857.6) / 10} MB`
}

export default function ProductLookup() {
  // 현재 인증 이메일
  const [email, setEmail] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)

  // 이메일 변경/인증 UI
  const [emailInput, setEmailInput] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [emailCode, setEmailCode] = useState('')
  const [emailMsg, setEmailMsg] = useState('')
  const [emailErr, setEmailErr] = useState('')

  // 등록 데이터
  const [products, setProducts] = useState([])

  // 초기 로드: 최근 인증 이메일 -> 제품 로드
  useEffect(() => {
    try {
      const last = localStorage.getItem(LAST_EMAIL_KEY) || ''
      setEmail(last)
      setEmailVerified(!!last)
      setEmailInput(last)
      loadProducts(last)
    } catch {
      // ignore
    }
  }, [])

  function loadProducts(targetEmail) {
    try {
      const store = JSON.parse(localStorage.getItem(STORE_KEY) || '{}')
      const list = targetEmail && store[targetEmail] ? store[targetEmail] : []
      setProducts(Array.isArray(list) ? list : [])
    } catch {
      setProducts([])
    }
  }

  // 인증버튼 활성화 규칙: "현재 이메일과 동일하면 비활성화"
  const isSameAsCurrent =
    emailInput.trim().toLowerCase() === (email || '').trim().toLowerCase()
  const canSend = !!emailInput.trim() && !(emailVerified && isSameAsCurrent)
  const canVerify = !!emailSent && !(emailVerified && isSameAsCurrent)

  const handleSendCode = () => {
    const val = emailInput.trim()
    if (!val) {
      setEmailMsg('')
      setEmailErr('이메일을 입력하세요.')
      return
    }
    setEmailSent(true)
    setEmailVerified(false)
    setEmailErr('')
    setEmailMsg('인증번호가 전송되었습니다. (힌트: ABCDE)')
  }

  const handleVerify = () => {
    if (emailCode.trim().toUpperCase() === 'ABCDE') {
      const val = emailInput.trim()
      try {
        localStorage.setItem(LAST_EMAIL_KEY, val)
      } catch {}
      setEmail(val)
      setEmailVerified(true)
      setEmailErr('')
      setEmailMsg('이메일 인증이 완료되었습니다.')
      loadProducts(val)
    } else {
      setEmailMsg('')
      setEmailErr('인증코드가 올바르지 않습니다. (힌트: ABCDE)')
      setEmailVerified(false)
    }
  }

  return (
    <PageWrap title="제품 조회" subtitle="인증된 이메일로 등록한 제품을 확인">
      {/* 안내 + 이메일 변경/인증 바 */}
      <Card className="mb-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-base font-semibold">
                현재 이메일:{' '}
                <span className="font-mono">{email || '없음'}</span>
                <span
                  className={[
                    'ml-2 align-middle px-2 py-0.5 text-[11px] rounded-full border',
                    email
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-rose-300 bg-rose-50 text-rose-700',
                  ].join(' ')}
                >
                  {email ? '인증됨' : '미인증'}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                이 페이지는 <b>인증된 이메일</b>에 등록된 제품을 카드 형태로 모두 보여줍니다.
              </p>
            </div>
          </div>

          {/* 이메일 변경/인증 UI */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="name@example.com"
            />
            <Button
              onClick={handleSendCode}
              disabled={!canSend}
              className={!canSend ? 'opacity-50 cursor-not-allowed' : ''}
            >
              인증번호 요청
            </Button>
            <div className="flex items-center gap-2">
              <Input
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                placeholder="인증코드 입력 (힌트: ABCDE)"
                disabled={!emailSent || (emailVerified && isSameAsCurrent)}
              />
              <Button
                onClick={handleVerify}
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
            <p className="text-slate-500 text-xs mt-1">
              * 테스트용 인증코드: <b>ABCDE</b>
            </p>
          )}
        </div>
      </Card>

      {/* 제품 카드 리스트 (1열, 상단 카드들과 양옆 정렬) */}
      {products.length === 0 ? (
        <Card>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            {email ? '등록된 제품이 없습니다.' : '먼저 이메일을 인증하세요.'}
          </p>
          <div className="mt-2 text-sm">
            <a className="underline" href="/register">
              → 제품 등록 페이지로 이동
            </a>{' '}
            <span className="text-slate-500 dark:text-slate-400">또는</span>{' '}
            <a className="underline" href="/manuals">
              → 메뉴얼 검색으로 이동
            </a>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {products.map((d, idx) => {
            const p = d.product || {}
            const c = d.customer || {}
            const priv = d.privacy || {}

            const title = p.productName || p.model || '등록된 제품'
            const model = p.model || '-'
            const serial = p.serial || '-'
            const purchase = p.purchaseDate || '-'

            return (
              <Card
                key={idx}
                className="w-full rounded-2xl border border-slate-200 shadow-sm dark:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">{title}</h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    등록일시:{' '}
                    {d.createdAt?.replace('T', ' ').replace('Z', ' UTC') || '-'}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3">
                  {/* 제품정보 */}
                  <section className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                    <h4 className="font-medium flex items-center gap-2">
                      <span>📦</span> 제품정보
                    </h4>
                    <dl className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1 text-sm">
                      <dt className="text-slate-500 dark:text-slate-400">분류</dt>
                      <dd className="col-span-2">
                        {CATEGORY_LABELS[p.category] || p.category || '-'}
                      </dd>

                      <dt className="text-slate-500 dark:text-slate-400">SAP 코드명</dt>
                      <dd className="col-span-2">{model}</dd>

                      <dt className="text-slate-500 dark:text-slate-400">제품명</dt>
                      <dd className="col-span-2">{p.productName || model}</dd>

                      <dt className="text-slate-500 dark:text-slate-400">시리얼</dt>
                      <dd className="col-span-2">{serial}</dd>

                      <dt className="text-slate-500 dark:text-slate-400">구매일자</dt>
                      <dd className="col-span-2">{purchase}</dd>

                      <dt className="text-slate-500 dark:text-slate-400">구매처</dt>
                      <dd className="col-span-2">{p.vendor || '-'}</dd>
                    </dl>
                  </section>

                  {/* 고객정보 */}
                  <section className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                    <h4 className="font-medium flex items-center gap-2">
                      <span>🙍</span> 고객정보
                    </h4>
                    <dl className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1 text-sm">
                      <dt className="text-slate-500 dark:text-slate-400">이름</dt>
                      <dd className="col-span-2">
                        {c.firstName || '-'} {c.surName || ''}
                      </dd>

                      <dt className="text-slate-500 dark:text-slate-400">전화</dt>
                      <dd className="col-span-2">{c.phone || '-'}</dd>

                      <dt className="text-slate-500 dark:text-slate-400">이메일</dt>
                      <dd className="col-span-2">
                        {c.email || '-'}{' '}
                        <span
                          className={[
                            'ml-1 px-2 py-0.5 text-[11px] rounded-full border',
                            c.emailVerified
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-rose-300 bg-rose-50 text-rose-700',
                          ].join(' ')}
                        >
                          {c.emailVerified ? '인증 완료' : '미인증'}
                        </span>
                      </dd>

                      <dt className="text-slate-500 dark:text-slate-400">ZIP</dt>
                      <dd className="col-span-2">{c.zip || '-'}</dd>

                      <dt className="text-slate-500 dark:text-slate-400">주소</dt>
                      <dd className="col-span-2 break-words">{c.address || '-'}</dd>
                    </dl>
                  </section>

                  {/* 개인정보 동의 */}
                  <section className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                    <h4 className="font-medium flex items-center gap-2">
                      <span>🔒</span> 개인정보 동의
                    </h4>
                    <ul className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                        <span>보증 서비스 목적 처리</span>
                        <span
                          className={[
                            'px-2 py-0.5 text-[11px] rounded-full border',
                            priv.consentService
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-rose-300 bg-rose-50 text-rose-700',
                          ].join(' ')}
                        >
                          {priv.consentService ? '동의' : '미동의'}
                        </span>
                      </li>

                      <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                        <span>국외 이전 안내 확인</span>
                        <span
                          className={[
                            'px-2 py-0.5 text-[11px] rounded-full border',
                            priv.consentXBorder
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-rose-300 bg-rose-50 text-rose-700',
                          ].join(' ')}
                        >
                          {priv.consentXBorder ? '확인' : '미확인'}
                        </span>
                      </li>

                      <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                        <span>제품 공지/마케팅 수신</span>
                        <span
                          className={[
                            'px-2 py-0.5 text-[11px] rounded-full border',
                            priv.consentMarketing
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-rose-300 bg-rose-50 text-rose-700',
                          ].join(' ')}
                        >
                          {priv.consentMarketing ? '동의' : '미동의'}
                        </span>
                      </li>

                      {/* 채널별 동의 표시 */}
                      <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                        <span>홍보 이메일 수신</span>
                        <span
                          className={[
                            'px-2 py-0.5 text-[11px] rounded-full border',
                            priv.promoEmail
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-rose-300 bg-rose-50 text-rose-700',
                          ].join(' ')}
                        >
                          {priv.promoEmail ? '동의' : '미동의'}
                        </span>
                      </li>

                      <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                        <span>홍보 문자(SMS) 수신</span>
                        <span
                          className={[
                            'px-2 py-0.5 text-[11px] rounded-full border',
                            priv.promoSms
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-rose-300 bg-rose-50 text-rose-700',
                          ].join(' ')}
                        >
                          {priv.promoSms ? '동의' : '미동의'}
                        </span>
                      </li>
                    </ul>
                  </section>

                  {/* 첨부 인보이스 */}
                  <section className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                    <h4 className="font-medium flex items-center gap-2">
                      <span>🧾</span> 첨부 인보이스
                    </h4>
                    {Array.isArray(p.invoiceFiles) && p.invoiceFiles.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-sm">
                        {p.invoiceFiles.map((f, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
                          >
                            <div className="truncate">
                              <div className="font-medium truncate">{f.name || '-'}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {f.type || '-'} · {formatSize(f.size)}
                              </div>
                            </div>
                            <span className="text-xs text-slate-400">
                              미리보기/다운로드는 업로드 연동 후 제공
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        첨부된 인보이스가 없습니다.
                      </p>
                    )}
                  </section>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </PageWrap>
  )
}
