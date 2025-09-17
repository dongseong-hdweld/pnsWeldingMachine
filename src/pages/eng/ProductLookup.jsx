// src/pages/eng/ProductLookup.jsx
import React, { useEffect, useState } from 'react'
import PageWrap from '../_PageWrap.jsx'
import Card from '../../components/Card.jsx'
import { Input, Button } from '../../components/FormControls.jsx'

/** Local storage keys (same as Register.jsx / Manuals.jsx) */
const STORE_KEY = 'HYW_REG_PRODUCTS_BY_EMAIL'
const LAST_EMAIL_KEY = 'HYW_LAST_VERIFIED_EMAIL'

/** Category labels (same mapping as Register.jsx) */
const CATEGORY_LABELS = {
  wire: 'Wire Feeder',
  power: 'Power Source',
  cool: 'Cooling',
}

/** Build URL for the "PDF missing" placeholder page (new tab) */
const buildPlaceholderUrl = (model, lang, action) =>
  `/manuals/pdf-missing?model=${encodeURIComponent(model)}&lang=${encodeURIComponent(
    lang
  )}&action=${encodeURIComponent(action)}`

/** Simple modal */
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-[92vw] max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="mt-3 text-sm text-slate-700 dark:text-slate-200 space-y-3">{children}</div>
        <div className="mt-4 text-right">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}

/** Byte format */
function formatSize(size) {
  if (typeof size !== 'number') return '-'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 102.4) / 10} KB`
  return `${Math.round(size / 104857.6) / 10} MB`
}

export default function ProductLookup() {
  // Current verified email (top bar)
  const [email, setEmail] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)

  // Email change/verify UI (top bar)
  const [emailInput, setEmailInput] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [emailCode, setEmailCode] = useState('')
  const [emailMsg, setEmailMsg] = useState('')
  const [emailErr, setEmailErr] = useState('')

  // Registered products (page list)
  const [products, setProducts] = useState([])

  // --- Registered product manuals modal state/logic ---
  const [manOpen, setManOpen] = useState(false)
  const [manEmail, setManEmail] = useState('')
  const [manList, setManList] = useState([]) // products for the email
  const [manSelected, setManSelected] = useState(null) // selected item

  const [manAuthMode, setManAuthMode] = useState(false)
  const [manEmailInput, setManEmailInput] = useState('')
  const [manEmailSent, setManEmailSent] = useState(false)
  const [manEmailCode, setManEmailCode] = useState('')
  const [manEmailVerified, setManEmailVerified] = useState(false)
  const [manEmailMsg, setManEmailMsg] = useState('')
  const [manEmailErr, setManEmailErr] = useState('')

  // Initial load: last verified email -> load products
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

  // Enable/disable rules for verify buttons (top bar)
  const isSameAsCurrent =
    emailInput.trim().toLowerCase() === (email || '').trim().toLowerCase()
  const canSend = !!emailInput.trim() && !(emailVerified && isSameAsCurrent)
  const canVerify = !!emailSent && !(emailVerified && isSameAsCurrent)

  const handleSendCode = () => {
    const val = emailInput.trim()
    if (!val) {
      setEmailMsg('')
      setEmailErr('Please enter your email.')
      return
    }
    setEmailSent(true)
    setEmailVerified(false)
    setEmailErr('')
    setEmailMsg('Verification code sent. (Hint: ABCDE)')
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
      setEmailMsg('Email verification completed.')
      loadProducts(val)
    } else {
      setEmailMsg('')
      setEmailErr('Invalid code. (Hint: ABCDE)')
      setEmailVerified(false)
    }
  }

  // --- Modal store loader ---
  const loadFromStore = () => {
    try {
      const store = JSON.parse(localStorage.getItem(STORE_KEY) || '{}')
      const lastEmail = localStorage.getItem(LAST_EMAIL_KEY) || ''
      return { store, lastEmail }
    } catch {
      return { store: {}, lastEmail: '' }
    }
  }

  const loadMyProductsByEmail = (targetEmail) => {
    const { store } = loadFromStore()
    const list = targetEmail && store[targetEmail] ? store[targetEmail] : []
    setManEmail(targetEmail)
    setManList(Array.isArray(list) ? list : [])
    setManSelected(null)
  }

  const openMyManuals = () => {
    const { lastEmail } = loadFromStore()
    setManOpen(true)
    setManAuthMode(false)
    setManEmailMsg('')
    setManEmailErr('')
    setManEmailSent(false)
    setManEmailCode('')
    setManEmailVerified(!!lastEmail)
    setManEmailInput(lastEmail || '')
    loadMyProductsByEmail(lastEmail || '')
  }

  // Modal enable/disable rules
  const manIsSameAsCurrent =
    manEmailInput.trim().toLowerCase() === (manEmail || '').trim().toLowerCase()
  const manCanSend = !!manEmailInput.trim() && !(manEmailVerified && manIsSameAsCurrent)
  const manCanVerify = !!manEmailSent && !(manEmailVerified && manIsSameAsCurrent)

  const handleSendEmailCodeManual = () => {
    const val = manEmailInput.trim()
    if (!val) {
      setManEmailMsg('')
      setManEmailErr('Please enter your email.')
      return
    }
    setManEmailSent(true)
    setManEmailVerified(false)
    setManEmailErr('')
    setManEmailMsg('Verification code sent. (Hint: ABCDE)')
  }

  const handleVerifyEmailCodeManual = () => {
    if (manEmailCode.trim().toUpperCase() === 'ABCDE') {
      const val = manEmailInput.trim()
      setManEmailVerified(true)
      setManEmailErr('')
      setManEmailMsg('Email verification completed.')
      try {
        localStorage.setItem(LAST_EMAIL_KEY, val)
      } catch {}
      loadMyProductsByEmail(val)
      setManAuthMode(false)
    } else {
      setManEmailVerified(false)
      setManEmailMsg('')
      setManEmailErr('Invalid code. (Hint: ABCDE)')
    }
  }

  return (
    <PageWrap title="Product Lookup" subtitle="View products registered with your verified email">
      {/* Notice + email change/verify bar */}
      <Card className="mb-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-base font-semibold">
                Current email:{' '}
                <span className="font-mono">{email || 'none'}</span>
                <span
                  className={[
                    'ml-2 align-middle px-2 py-0.5 text-[11px] rounded-full border',
                    email
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-rose-300 bg-rose-50 text-rose-700',
                  ].join(' ')}
                >
                  {email ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                This page lists all products <b>registered with your verified email</b>.
              </p>
            </div>

            {/* [Changed] View registered product manuals button */}
            <div className="mt-2 md:mt-0">
              <Button onClick={openMyManuals} title="See manuals for your registered products">
                View Registered Product Manuals
              </Button>
            </div>
          </div>

          {/* Email change/verify UI */}
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
              Request code
            </Button>
            <div className="flex items-center gap-2">
              <Input
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                placeholder="Enter code (Hint: ABCDE)"
                disabled={!emailSent || (emailVerified && isSameAsCurrent)}
              />
              <Button
                onClick={handleVerify}
                disabled={!canVerify}
                className={!canVerify ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Verify
              </Button>
            </div>
          </div>

          {emailMsg && <p className="text-emerald-600 text-xs mt-1">{emailMsg}</p>}
          {emailErr && <p className="text-rose-600 text-xs mt-1">{emailErr}</p>}
          {!emailVerified && !emailMsg && !emailErr && (
            <p className="text-slate-500 text-xs mt-1">
              * Test verification code: <b>ABCDE</b>
            </p>
          )}
        </div>
      </Card>

      {/* Product card list */}
      {products.length === 0 ? (
        <Card>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            {email ? 'No products registered.' : 'Please verify your email first.'}
          </p>
          <div className="mt-2 text-sm">
            <a className="underline" href="/register">
              → Go to Register
            </a>{' '}
            <span className="text-slate-500 dark:text-slate-400">or</span>{' '}
            <a className="underline" href="/manuals">
              → Go to Manuals
            </a>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {products.map((d, idx) => {
            const p = d.product || {}
            const c = d.customer || {}
            const priv = d.privacy || {}

            const title = p.productName || p.model || 'Registered product'
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
                    Registered at:{' '}
                    {d.createdAt?.replace('T', ' ').replace('Z', ' UTC') || '-'}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3">
                  {/* Product info */}
                  <section className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                    <h4 className="font-medium flex items-center gap-2">
                      <span>📦</span> Product info
                    </h4>
                    <dl className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1 text-sm">
                      <dt className="text-slate-500 dark:text-slate-400">Category</dt>
                      <dd className="col-span-2">
                        {CATEGORY_LABELS[p.category] || p.category || '-'}
                      </dd>

                      <dt className="text-slate-500 dark:text-slate-400">SAP code</dt>
                      <dd className="col-span-2">{model}</dd>

                      <dt className="text-slate-500 dark:text-slate-400">Product name</dt>
                      <dd className="col-span-2">{p.productName || model}</dd>

                      <dt className="text-slate-500 dark:text-slate-400">Serial</dt>
                      <dd className="col-span-2">{serial}</dd>

                      <dt className="text-slate-500 dark:text-slate-400">Purchase date</dt>
                      <dd className="col-span-2">{purchase}</dd>

                      <dt className="text-slate-500 dark:text-slate-400">Vendor</dt>
                      <dd className="col-span-2">{p.vendor || '-'}</dd>
                    </dl>
                  </section>

                  {/* Customer info */}
                  <section className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                    <h4 className="font-medium flex items-center gap-2">
                      <span>🙍</span> Customer info
                    </h4>
                    <dl className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1 text-sm">
                      <dt className="text-slate-500 dark:text-slate-400">Name</dt>
                      <dd className="col-span-2">
                        {c.firstName || '-'} {c.surName || ''}
                      </dd>

                      <dt className="text-slate-500 dark:text-slate-400">Phone</dt>
                      <dd className="col-span-2">{c.phone || '-'}</dd>

                      <dt className="text-slate-500 dark:text-slate-400">Email</dt>
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
                          {c.emailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </dd>

                      <dt className="text-slate-500 dark:text-slate-400">ZIP</dt>
                      <dd className="col-span-2">{c.zip || '-'}</dd>

                      <dt className="text-slate-500 dark:text-slate-400">Address</dt>
                      <dd className="col-span-2 break-words">{c.address || '-'}</dd>
                    </dl>
                  </section>

                  {/* Privacy consents */}
                  <section className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                    <h4 className="font-medium flex items-center gap-2">
                      <span>🔒</span> Privacy consents
                    </h4>
                    <ul className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                        <span>Process for warranty service</span>
                        <span
                          className={[
                            'px-2 py-0.5 text-[11px] rounded-full border',
                            priv.consentService
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-rose-300 bg-rose-50 text-rose-700',
                          ].join(' ')}
                        >
                          {priv.consentService ? 'Consented' : 'Not consented'}
                        </span>
                      </li>

                      <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                        <span>Cross-border transfer notice acknowledged</span>
                        <span
                          className={[
                            'px-2 py-0.5 text-[11px] rounded-full border',
                            priv.consentXBorder
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-rose-300 bg-rose-50 text-rose-700',
                          ].join(' ')}
                        >
                          {priv.consentXBorder ? 'Acknowledged' : 'Not acknowledged'}
                        </span>
                      </li>

                      <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                        <span>Product notices / marketing</span>
                        <span
                          className={[
                            'px-2 py-0.5 text-[11px] rounded-full border',
                            priv.consentMarketing
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-rose-300 bg-rose-50 text-rose-700',
                          ].join(' ')}
                        >
                          {priv.consentMarketing ? 'Consented' : 'Not consented'}
                        </span>
                      </li>

                      {/* Channel-level consent */}
                      <li className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                        <span>Receive promotional emails</span>
                        <span
                          className={[
                            'px-2 py-0.5 text-[11px] rounded-full border',
                            priv.promoEmail
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-rose-300 bg-rose-50 text-rose-700',
                          ].join(' ')}
                        >
                          {priv.promoEmail ? 'Consented' : 'Not consented'}
                        </span>
                      </li>
                    </ul>
                  </section>

                  {/* Attached invoices */}
                  <section className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                    <h4 className="font-medium flex items-center gap-2">
                      <span>🧾</span> Attached invoices
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
                              Preview/download will be available after upload integration.
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        No invoices attached.
                      </p>
                    )}
                  </section>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Registered product manuals modal (single manual: EN) */}
      {manOpen && (
        <Modal title="Registered Product Manuals" onClose={() => setManOpen(false)}>
          {/* Current email + change button */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-slate-600 dark:text-slate-300">
              Current email: <b>{manEmail || 'none'}</b>{' '}
              <span
                className={[
                  'ml-1 px-2 py-0.5 text-[11px] rounded-full border',
                  manEmail
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-rose-300 bg-rose-50 text-rose-700',
                ].join(' ')}
              >
                {manEmail ? 'Verified' : 'Unverified'}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <a className="text-sm underline" href="/register" title="Register a new product">
                Go to registration
              </a>
              <Button
                variant="secondary"
                onClick={() => {
                  setManAuthMode((s) => !s)
                  setManEmailMsg('')
                  setManEmailErr('')
                  setManEmailSent(false)
                  setManEmailCode('')
                  setManEmailInput(manEmail || '')
                }}
              >
                {manAuthMode ? 'Close' : 'Change/Verify email'}
              </Button>
            </div>
          </div>

          {/* Email change/verify section */}
          {manAuthMode && (
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  type="email"
                  value={manEmailInput}
                  onChange={(e) => setManEmailInput(e.target.value)}
                  placeholder="name@example.com"
                />
                <Button
                  onClick={handleSendEmailCodeManual}
                  disabled={!manCanSend}
                  className={!manCanSend ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  Request code
                </Button>
                <div className="flex items-center gap-2">
                  <Input
                    value={manEmailCode}
                    onChange={(e) => setManEmailCode(e.target.value)}
                    placeholder="Enter code (Hint: ABCDE)"
                    disabled={!manEmailSent || (manEmailVerified && manIsSameAsCurrent)}
                  />
                  <Button
                    onClick={handleVerifyEmailCodeManual}
                    disabled={!manCanVerify}
                    className={!manCanVerify ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    Verify
                  </Button>
                </div>
              </div>
              {manEmailMsg && <p className="text-emerald-600 text-xs mt-1">{manEmailMsg}</p>}
              {manEmailErr && <p className="text-rose-600 text-xs mt-1">{manEmailErr}</p>}
              {!manEmailVerified && !manEmailMsg && !manEmailErr && (
                <p className="text-slate-500 text-xs mt-1">
                  * Test verification code: <b>ABCDE</b>
                </p>
              )}
            </div>
          )}

          {/* Product list / detail + single manual actions */}
          {manList.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-300">
              No products are registered with this email. Please register a product first.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {manList.map((it, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setManSelected(it)}
                    className={[
                      'text-left rounded-lg border px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
                      manSelected === it
                        ? 'border-slate-400 dark:border-slate-500'
                        : 'border-slate-200 dark:border-slate-700',
                    ].join(' ')}
                  >
                    <div className="font-medium">
                      {it.product?.productName || it.product?.model || '-'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      S/N: {it.product?.serial || '-'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Purchased: {it.product?.purchaseDate || '-'}
                    </div>
                  </button>
                ))}
              </div>

              {manSelected && (
                <div className="mt-4 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  <div className="font-semibold mb-1">Details</div>
                  <dl className="grid grid-cols-3 gap-x-3 gap-y-1 text-sm">
                    <dt className="text-slate-500 dark:text-slate-400">Model</dt>
                    <dd className="col-span-2">
                      {manSelected.product?.productName ||
                        manSelected.product?.model ||
                        '-'}
                    </dd>
                    <dt className="text-slate-500 dark:text-slate-400">Serial</dt>
                    <dd className="col-span-2">{manSelected.product?.serial || '-'}</dd>
                    <dt className="text-slate-500 dark:text-slate-400">Vendor</dt>
                    <dd className="col-span-2">{manSelected.product?.vendor || '-'}</dd>
                    <dt className="text-slate-500 dark:text-slate-400">Registered at</dt>
                    <dd className="col-span-2">
                      {manSelected.createdAt?.replace('T', ' ').replace('Z', ' UTC') || '-'}
                    </dd>
                  </dl>

                  <div className="mt-3 font-medium">Owner’s Manual (EN)</div>
                  <div className="mt-2 flex items-center gap-2">
                    <a
                      className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-transparent transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 dark:border-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600"
                      href={buildPlaceholderUrl(
                        manSelected.product?.productName ||
                          manSelected.product?.model ||
                          '-',
                        'en',
                        'view'
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in new tab
                    </a>
                    <a
                      className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-transparent transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 dark:border-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600"
                      href={buildPlaceholderUrl(
                        manSelected.product?.productName ||
                          manSelected.product?.model ||
                          '-',
                        'en',
                        'download'
                      )}
                      target="_blank"
                      rel="noreferrer"
                      download
                    >
                      Download
                    </a>
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
