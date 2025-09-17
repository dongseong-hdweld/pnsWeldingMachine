// src/pages/eng/Support.jsx
import React, { useEffect, useMemo, useState } from 'react'
import PageWrap from '../_PageWrap.jsx'
import Card from '../../components/Card.jsx'
import { Label, Input, Textarea, Button } from '../../components/FormControls.jsx'

/* ========= Utils ========= */
const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email || ''
  const [id, domain] = email.split('@')
  const vis = id.slice(0, Math.min(3, id.length))
  return `${vis}${'*'.repeat(Math.max(1, id.length - vis.length))}@${domain}`
}
const fmtDate = (d) => {
  const dt = typeof d === 'number' ? new Date(d) : d
  return `${dt.getFullYear()}.${String(dt.getMonth()+1).padStart(2,'0')}.${String(dt.getDate()).padStart(2,'0')}`
}

/* ========= Storage (sessionStorage) ========= */
const STORAGE_KEY = 'qa_proto_items_v2'

// Legacy cookie (one-time migration)
const getCookie = (name) => {
  const cookies = document.cookie ? document.cookie.split('; ') : []
  const prefix = name + '='
  for (const c of cookies) if (c.startsWith(prefix)) return c.substring(prefix.length)
  return null
}

/* ========= Legacy → boolean (normalize) ========= */
// Parse legacy string status → boolean (undefined if unknown)
const parseAnswered = (status) => {
  if (!status || typeof status !== 'string') return undefined
  const s = status.trim().toLowerCase()
  if (['answered', '답변완료', '완료'].includes(s)) return true
  if (['pending', '답변대기', '대기'].includes(s)) return false
  return undefined
}

// Normalize legacy items into { answered: boolean }
const normalizeLegacy = (arr) =>
  arr.map((it) => {
    const hasAnswerText = !!(it.answer && String(it.answer).trim())
    // If already boolean, coerce to true when answer text exists
    if (typeof it.answered === 'boolean') {
      return { ...it, answered: it.answered || hasAnswerText }
    }
    // Else convert from string status; fallback to answer text presence
    const parsed = parseAnswered(it.status)
    const answered = (parsed !== undefined) ? parsed : hasAnswerText
    const { status, ...rest } = it
    return { ...rest, answered }
  })

/* ========= Seed (mock data) ========= */
let nextId = 1
const makeItem = (o={}) => ({
  id: nextId++,
  answered: false,             // ✅ boolean only
  secret: false,
  notifyOnAnswer: false,
  title: 'Question about product usage',
  content: 'I have a question while using the product.',
  answer: '',
  authorEmail: 'user@example.com',
  createdAt: Date.now(),
  ...o,
})
const seedData = () => {
  const emails = ['you@demo.com','than@demo.com','jong@demo.com','lov@demo.com','yun@demo.com','kim@demo.com','lee@demo.com','park@demo.com']
  const titles = [
    'Inquiry about return after 12/12 registration',
    'Event usage/return schedule',
    'Door rail parts question',
    'Battery level indicator',
    'Extra cable purchase availability',
    'Reissue of receipt',
    'Firmware update schedule',
    'Domestic/overseas warranty handling',
  ]
  const answers = [
    'Hello. The schedule is possible; please refer to the guide for steps.',
    'Inspection suggests a replacement may be needed. Please visit a service center.',
  ]
  const arr = []
  for (let i=0; i<30; i++) {
    const done = i%3===0
    arr.push(makeItem({
      answered: done,
      secret: i%5===0,
      notifyOnAnswer: i%4===0,
      title: titles[i%titles.length],
      content: 'Short inquiry content. (demo)',
      answer: done ? answers[i%answers.length] : '',
      authorEmail: emails[i%emails.length],
      createdAt: Date.now() - i*1000*60*60*18,
    }))
  }
  return arr
}

/* Minify for storage */
const MINIFY = (it)=>({
  id: it.id,
  answered: !!it.answered, // ✅ boolean stored only
  secret: !!it.secret,
  notifyOnAnswer: !!it.notifyOnAnswer,
  title: it.title,
  content: (it.content||'').slice(0,500),
  answer: (it.answer||'').slice(0,500),
  authorEmail: it.authorEmail,
  createdAt: typeof it.createdAt==='number'? it.createdAt : new Date(it.createdAt).getTime()
})

/* Load/save (+ legacy migration) */
const loadItems = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      const arr = normalizeLegacy(JSON.parse(raw))
      const maxId = arr.reduce((m,x)=>Math.max(m, x.id||0), 0)
      nextId = Math.max(1, maxId+1)
      // Save back normalized (strip legacy status)
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(arr.map(MINIFY)))
      return arr
    }
  } catch {}
  try {
    const legacy = getCookie('qa_proto_items')
    if (legacy) {
      const arr = normalizeLegacy(JSON.parse(decodeURIComponent(legacy)))
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(arr.map(MINIFY)))
      const maxId = arr.reduce((m,x)=>Math.max(m, x.id||0), 0)
      nextId = Math.max(1, maxId+1)
      return arr
    }
  } catch {}
  const seeded = seedData()
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(seeded.map(MINIFY)))
  return seeded
}
const saveItems = (items) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items.map(MINIFY)))
  } catch (e) {
    console.warn('[Q&A] sessionStorage save failed:', e)
  }
}

/* ========= Red Private badge ========= */
const SecretBadge = () => (
  <span className="mr-2 inline-block rounded-md px-2 py-0.5 text-xs border
                   text-red-600 border-red-300 bg-red-50
                   dark:text-red-400 dark:border-red-500 dark:bg-red-950/40">
    Private
  </span>
)

/* ========= Main ========= */
export default function Support(){
  const [items, setItems] = useState(loadItems)
  useEffect(()=>{ saveItems(items) }, [items])

  // paging
  const PAGE_SIZE = 20
  const [page, setPage] = useState(1)
  const sorted = useMemo(()=>[...items].sort((a,b)=>b.createdAt-a.createdAt), [items])
  const totalPages = Math.max(1, Math.ceil(sorted.length/PAGE_SIZE))
  const pageItems = useMemo(()=>{
    const s=(page-1)*PAGE_SIZE
    return sorted.slice(s,s+PAGE_SIZE)
  },[sorted,page])

  // modals
  const [detail, setDetail] = useState(null)
  const [showWrite, setShowWrite] = useState(false)
  const [showMy, setShowMy] = useState(false)

  const addItem = ({title,content,email,secret,notify})=>{
    setItems(prev=>[
      makeItem({
        answered:false, // new posts start as pending
        title,
        content,
        authorEmail:email,
        secret:!!secret,
        notifyOnAnswer: !!notify,
        createdAt:Date.now()
      }),
      ...prev
    ])
    setShowWrite(false)
    setPage(1)
    alert('Submitted. (Demo)')
  }

  return (
    <PageWrap
      title="Support"
      subtitle="Support center for the Welding Machine Registration System."
    >
      {/* Top notice / actions */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-slate-600 dark:text-slate-300">
            Please leave your inquiry on the Q&amp;A board below.
            <br/>Contact:
            <span className="ml-2 font-semibold">(+82-54) 260-0651</span>
            <span className="mx-2"><br/>Email:</span>
            <a href="mailto:support@example.com" className="font-semibold underline">support@example.com</a>
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={()=>setShowMy(true)}>View My Q&amp;A</Button>
            <Button onClick={()=>setShowWrite(true)}>Create Q&amp;A</Button>
          </div>
        </div>
      </Card>

      {/* List */}
      <Card title="Q&A Board">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-slate-500 border-b">
                <th className="text-left py-2 pl-2 w-28">Status</th>
                <th className="text-left py-2">Title</th>
                <th className="text-left py-2 w-40">Author</th>
                <th className="text-left py-2 w-28">Date</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(row=>(
                <tr key={row.id}
                    className="border-b hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    onClick={()=>setDetail(row)}
                    title="Open details">
                  <td className="py-3 pl-2 font-semibold">
                    {(() => {
                      const isAnswered = (typeof row.answered === 'boolean')
                        ? (row.answered || !!(row.answer && String(row.answer).trim()))
                        : !!(row.answer && String(row.answer).trim())
                      return (
                        <span className={isAnswered ? 'text-emerald-600' : 'text-amber-600'}>
                          {isAnswered ? 'Answered' : 'Pending'}
                        </span>
                      )
                    })()}
                  </td>
                  <td className="py-3">
                    {row.secret && <SecretBadge/>}
                    {row.title}
                  </td>
                  <td className="py-3 text-slate-600">{maskEmail(row.authorEmail)}</td>
                  <td className="py-3 text-slate-600">{fmtDate(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination (KO와 동일 스타일) */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="secondary" disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</Button>
          {Array.from({length: totalPages}).map((_,i)=>{
            const n=i+1
            const cls='px-3 py-2 rounded-md border '
              + (n===page
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-600')
            return <button key={n} className={cls} onClick={()=>setPage(n)}>{n}</button>
          })}
          <Button variant="secondary" disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</Button>
        </div>
      </Card>

      {/* Modals */}
      {detail && <DetailModal item={detail} onClose={()=>setDetail(null)} />}
      {showWrite && <WriteModal onClose={()=>setShowWrite(false)} onSubmit={addItem} />}
      {showMy && <MyModal items={items} onClose={()=>setShowMy(false)} onOpenDetail={(row)=>{ setShowMy(false); setDetail(row) }} />}
    </PageWrap>
  )
}

/* ========= Detail modal ========= */
function DetailModal({ item, onClose }){
  const [email,setEmail]=useState('')
  const [code,setCode]=useState('')
  const [sentCode,setSentCode]=useState('')
  const [verified,setVerified]=useState(false)

  const isPublic = !item.secret
  const canView = isPublic || (verified && email.toLowerCase()===item.authorEmail.toLowerCase())

  const sendCode=()=>{
    if(!email) return alert('Please enter your email.')
    const c = Math.floor(100000+Math.random()*900000).toString()
    setSentCode(c); setVerified(false)
    alert(`Demo verification code: ${c}\n(In production, this would be emailed)`)
  }
  const verify=()=>{
    if(email.toLowerCase()!==item.authorEmail.toLowerCase()) return alert('Email does not match the author.')
    if(code && code===sentCode) setVerified(true)
    else { setVerified(false); alert('Invalid verification code.') }
  }

  return (
    <div className="fixed inset-0 z:[60]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(96vw,800px)]">
        <Card>
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold">
              {item.secret && <SecretBadge/>}
              {item.title}
            </h3>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {(() => {
              const isAnswered = (typeof item.answered === 'boolean')
                ? (item.answered || !!(item.answer && String(item.answer).trim()))
                : !!(item.answer && String(item.answer).trim())
              return (
                <>
                  Status:{' '}
                  <span className={isAnswered ? 'text-emerald-600' : 'text-amber-600'}>
                    {isAnswered ? 'Answered' : 'Pending'}
                  </span>
                </>
              )
            })()}
            <span className="mx-2">•</span>Author: {maskEmail(item.authorEmail)}
            <span className="mx-2">•</span>Date: {fmtDate(item.createdAt)}
          </div>

          {!canView && (
            <div className="mt-4">
              <div className="text-slate-600 dark:text-slate-300 text-sm mb-2">
                This is a private post. Verify using the author’s email to view the content.
              </div>
              <div className="grid md:grid-cols-[1fr_auto_auto] gap-2 items-end max-w-xl">
                <Input placeholder="Author email" value={email} onChange={(e)=>setEmail(e.target.value)} />
                <Button type="button" variant="secondary" onClick={sendCode}>Send Code</Button>
                <div className="flex items-end gap-2">
                  <Input placeholder="Verification code" value={code} onChange={(e)=>setCode(e.target.value)} />
                  <Button type="button" variant="secondary" onClick={verify}>Verify</Button>
                </div>
              </div>
              {sentCode && <div className="text-slate-500 text-xs mt-1">Code sent. (shown for demo: {sentCode})</div>}
            </div>
          )}

          {canView && (
            <div className="mt-5 space-y-4">
              <section>
                <div className="font-semibold mb-1">Question</div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 whitespace-pre-wrap">
                  {item.content || 'No content.'}
                </div>
              </section>
              <section>
                <div className="font-semibold mb-1">Answer</div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 whitespace-pre-wrap">
                  {item.answer ? item.answer : 'No answer has been posted yet.'}
                </div>
              </section>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

/* ========= Create modal ========= */
function WriteModal({ onClose, onSubmit }){
  const MAX_CONTENT = 10000

  const [title,setTitle]=useState('')
  const [content,setContent]=useState('')
  const [email,setEmail]=useState('')
  const [secret,setSecret]=useState(false)
  const [notify,setNotify]=useState(true)

  const [code,setCode]=useState('')
  const [sentCode,setSentCode]=useState('')
  const [verified,setVerified]=useState(false)

  const sendCode=()=>{
    if(!email) return alert('Please enter your email.')
    const c = Math.floor(100000+Math.random()*900000).toString()
    setSentCode(c); setVerified(false)
    alert(`Demo verification code: ${c}\n(In production, this would be emailed)`)
  }
  const verify=()=>{
    if(code && code===sentCode) setVerified(true)
    else { setVerified(false); alert('Invalid verification code.') }
  }

  const canSubmit = title && content && content.length <= MAX_CONTENT && email && verified
  const onChangeContent = (e) => {
    const v = e.target.value
    setContent(v.length > MAX_CONTENT ? v.slice(0, MAX_CONTENT) : v)
  }

  return (
    <div className="fixed inset-0 z-[50]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w:[min(96vw,800px)]">
        <Card title="Create Q&A">
          <div className="grid gap-3">
            <div>
              <Label htmlFor="w-title">Title</Label>
              <Input id="w-title" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Enter a title" />
            </div>
            <div>
              <Label htmlFor="w-content">Content</Label>
              <Textarea
                id="w-content"
                rows={6}
                value={content}
                onChange={onChangeContent}
                placeholder="Enter your question"
                maxLength={MAX_CONTENT}
                aria-describedby="w-content-help"
              />
              <div id="w-content-help" className="text-xs text-slate-500 mt-1">
                {content.length.toLocaleString()} / {MAX_CONTENT.toLocaleString()} chars
              </div>
            </div>

            {/* Private + email notify */}
            <div className="flex flex-wrap items-center gap-4">
              <label htmlFor="w-secret" className="inline-flex items-center gap-2 cursor-pointer">
                <input id="w-secret" type="checkbox" className="w-4 h-4" checked={secret} onChange={e=>setSecret(e.target.checked)} />
                <span>Private</span>
              </label>

              <label htmlFor="w-notify" className="inline-flex items-center gap-2 cursor-pointer">
                <input id="w-notify" type="checkbox" className="w-4 h-4" checked={notify} onChange={e=>setNotify(e.target.checked)} />
                <span>Email me when answered</span>
              </label>
            </div>

            <div className="grid md:grid-cols-[1fr_auto_auto] gap-2 items-end">
              <div>
                <Label htmlFor="w-email">Email</Label>
                <Input id="w-email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="your@email.com" />
              </div>
              <Button type="button" variant="secondary" onClick={sendCode}>Send Code</Button>
              <div className="flex items-end gap-2">
                <Input placeholder="Verification code" value={code} onChange={(e)=>setCode(e.target.value)} />
                <Button type="button" variant="secondary" onClick={verify}>Verify</Button>
              </div>
            </div>
            {verified ? (
              <div className="text-emerald-600 text-sm">Verified</div>
            ) : (
              sentCode && <div className="text-slate-500 text-xs">Code sent. (shown for demo: {sentCode})</div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button disabled={!canSubmit} onClick={()=>onSubmit({title,content,email,secret,notify})}>Submit</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ========= My Q&A modal ========= */
function MyModal({ items, onClose, onOpenDetail }){
  const [email,setEmail]=useState('')
  const [results,setResults]=useState([])
  const search=(e)=>{ e.preventDefault(); setResults(items.filter(x=>x.authorEmail.toLowerCase()===email.toLowerCase())) }

  return (
    <div className="fixed inset-0 z-[50]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(96vw,900px)]">
        <Card title="View My Q&A">
          <form onSubmit={search} className="flex gap-2 items-end mb-3">
            <div className="min-w-[280px]">
              <Label htmlFor="q-email">Email</Label>
              <Input id="q-email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <Button type="submit">Search</Button>
            <Button variant="secondary" type="button" onClick={onClose}>Close</Button>
          </form>

          <div className="text-slate-500 text-sm mb-2">
            Results: <span className="font-semibold">{results.length}</span> (click a row to open details)
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b">
                  <th className="text-left py-2 pl-2 w-28">Status</th>
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2 w-40">Author</th>
                  <th className="text-left py-2 w-28">Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map(row=>(
                  <tr key={row.id}
                      className="border-b hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                      onClick={()=>onOpenDetail(row)}
                  >
                    <td className="py-3 pl-2 font-semibold">
                      {(() => {
                        const isAnswered = (typeof row.answered === 'boolean')
                          ? (row.answered || !!(row.answer && String(row.answer).trim()))
                          : !!(row.answer && String(row.answer).trim())
                        return (
                          <span className={isAnswered ? 'text-emerald-600' : 'text-amber-600'}>
                            {isAnswered ? 'Answered' : 'Pending'}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="py-3">
                      {row.secret && <SecretBadge/>}
                      {row.title}
                    </td>
                    <td className="py-3 text-slate-600">{maskEmail(row.authorEmail)}</td>
                    <td className="py-3 text-slate-600">{fmtDate(row.createdAt)}</td>
                  </tr>
                ))}
                {results.length===0 && (
                  <tr><td colSpan="4" className="py-6 text-center text-slate-500">No Q&amp;A found for that email.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
