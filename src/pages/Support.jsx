import React, { useEffect, useMemo, useState } from 'react'
import PageWrap from './_PageWrap.jsx'
import Card from '../components/Card.jsx'
import { Label, Input, Textarea, Button } from '../components/FormControls.jsx'

/* ========= 유틸 ========= */
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

/* ========= 저장소: sessionStorage 사용 (브라우저/탭 종료 시 삭제, F5 유지) ========= */
const STORAGE_KEY = 'qa_proto_items_v2'

// (레거시) 안전한 쿠키 읽기 (있으면 1회만 가져와서 sessionStorage로 이주)
const getCookie = (name) => {
  const cookies = document.cookie ? document.cookie.split('; ') : []
  const prefix = name + '='
  for (const c of cookies) if (c.startsWith(prefix)) return c.substring(prefix.length)
  return null
}

/* ========= 목 데이터 ========= */
let nextId = 1
const makeItem = (o={}) => ({
  id: nextId++,
  status: '답변대기',          // '답변대기' | '답변완료'
  secret: false,               // 비밀글 여부
  title: '제품 사용 관련 문의',
  content: '제품 사용 중 문의드립니다.',
  answer: '',
  authorEmail: 'user@example.com',
  createdAt: Date.now(),
  ...o,
})
const seedData = () => {
  const emails = ['you@demo.com','than@demo.com','jong@demo.com','lov@demo.com','yun@demo.com','kim@demo.com','lee@demo.com','park@demo.com']
  const titles = ['12/12 등록 후 반납 문의','행사 사용/반납 일정 문의','도어 레일 부품 문의','배터리 잔량 표시 관련','케이블 추가 구매 가능 여부','영수증 재발행 문의','펌웨어 업데이트 일정','국내/해외 보증 처리 문의']
  const answers = ['안녕하세요. 해당 일정 가능하며 절차는 안내문 참고 바랍니다.','점검 결과 교체 필요할 수 있어 센터 방문 부탁드립니다.']
  const arr = []
  for(let i=0;i<30;i++){
    const done = i%3===0
    arr.push(makeItem({
      status: done? '답변완료':'답변대기',
      secret: i%5===0,
      title: titles[i%titles.length],
      content: '간단한 문의 내용입니다. (데모)',
      answer: done? answers[i%answers.length] : '',
      authorEmail: emails[i%emails.length],
      createdAt: Date.now() - i*1000*60*60*18
    }))
  }
  return arr
}
/* 저장 크기 최소화를 위한 간단 압축 */
const MINIFY = (it)=>({
  id: it.id, status: it.status, secret: !!it.secret, title: it.title,
  content: (it.content||'').slice(0,500), answer: (it.answer||'').slice(0,500),
  authorEmail: it.authorEmail, createdAt: typeof it.createdAt==='number'? it.createdAt : new Date(it.createdAt).getTime()
})

/* sessionStorage 로드/세이브 + (레거시) 쿠키 폴백 로드 */
const loadItems = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      const arr = JSON.parse(raw)
      const maxId = arr.reduce((m,x)=>Math.max(m, x.id||0), 0)
      nextId = Math.max(1, maxId+1)
      return arr
    }
  } catch {}
  // 레거시 쿠키에서 한 번만 끌어와서 이주
  try {
    const legacy = getCookie('qa_proto_items')
    if (legacy) {
      const arr = JSON.parse(decodeURIComponent(legacy))
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(arr))
      const maxId = arr.reduce((m,x)=>Math.max(m, x.id||0), 0)
      nextId = Math.max(1, maxId+1)
      return arr
    }
  } catch {}
  // 없으면 시드
  const seeded = seedData()
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
  return seeded
}
const saveItems = (items) => {
  try {
    const compact = items.map(MINIFY)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(compact))
  } catch (e) {
    console.warn('[Q&A] sessionStorage 저장 실패:', e)
  }
}

/* ========= 빨간색 비밀 배지 ========= */
const SecretBadge = () => (
  <span className="mr-2 inline-block rounded-md px-2 py-0.5 text-xs border
                   text-red-600 border-red-300 bg-red-50
                   dark:text-red-400 dark:border-red-500 dark:bg-red-950/40">
    비밀글
  </span>
)

/* ========= 메인 ========= */
export default function Support(){
  const [items, setItems] = useState(loadItems)
  useEffect(()=>{ saveItems(items) }, [items])

  // 페이징
  const PAGE_SIZE = 20
  const [page, setPage] = useState(1)
  const sorted = useMemo(()=>[...items].sort((a,b)=>b.createdAt-a.createdAt), [items])
  const totalPages = Math.max(1, Math.ceil(sorted.length/PAGE_SIZE))
  const pageItems = useMemo(()=>{
    const s=(page-1)*PAGE_SIZE
    return sorted.slice(s,s+PAGE_SIZE)
  },[sorted,page])

  // 모달 상태
  const [detail, setDetail] = useState(null)         // 상세
  const [showWrite, setShowWrite] = useState(false)  // 작성
  const [showMy, setShowMy] = useState(false)        // 나의 Q&A

  const addItem = ({title,content,email,secret})=>{
    setItems(prev=>[makeItem({status:'답변대기',title,content,authorEmail:email,secret:!!secret,createdAt:Date.now()}), ...prev])
    setShowWrite(false)
    setPage(1)
    alert('등록되었습니다. (데모)')
  }

  return (
    <PageWrap
      title="고객센터"
      subtitle="용접기 등록 시스템 고객센터입니다. (브라우저 종료 시 데이터가 삭제됩니다)"
    >
      {/* 상단 안내/버튼 */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-slate-600 dark:text-slate-300">
            문의는 아래 Q&amp;A 게시판에 남겨주세요.
            <br/>담당자 연락처:
            <span className="ml-2 font-semibold">(+82-54) 260-0651</span>
            <span className="mx-2"><br/>담당자 이메일:</span>
            <a href="mailto:support@example.com" className="font-semibold underline">support@example.com</a>
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={()=>setShowMy(true)}>나의 Q&amp;A 조회하기</Button>
            <Button onClick={()=>setShowWrite(true)}>Q&amp;A 작성하기</Button>
          </div>
        </div>
      </Card>

      {/* 리스트 */}
      <Card title="Q&A 게시판">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-slate-500 border-b">
                <th className="text-left py-2 pl-2 w-28">답변상태</th>
                <th className="text-left py-2">제목</th>
                <th className="text-left py-2 w-40">작성자</th>
                <th className="text-left py-2 w-28">작성일</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(row=>(
                <tr key={row.id}
                    className="border-b hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    onClick={()=>setDetail(row)}
                    title="상세 보기">
                  <td className="py-3 pl-2 font-semibold">
                    <span className={row.status==='답변완료'?'text-emerald-600':'text-amber-600'}>{row.status}</span>
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

        {/* 페이징 */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="secondary" disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>이전</Button>
          {Array.from({length: totalPages}).map((_,i)=>{
            const n=i+1
            const cls='px-3 py-2 rounded-md border '+(n===page?'border-slate-900 bg-slate-900 text-white':'border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-600')
            return <button key={n} className={cls} onClick={()=>setPage(n)}>{n}</button>
          })}
          <Button variant="secondary" disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>다음</Button>
        </div>
      </Card>

      {/* 모달들 */}
      {detail && <DetailModal item={detail} onClose={()=>setDetail(null)} />}
      {showWrite && <WriteModal onClose={()=>setShowWrite(false)} onSubmit={addItem} />}
      {showMy && <MyModal items={items} onClose={()=>setShowMy(false)} onOpenDetail={(row)=>{ setShowMy(false); setDetail(row) }} />}
    </PageWrap>
  )
}

/* ========= 상세 모달(비밀글 인증) ========= */
function DetailModal({ item, onClose }){
  const [email,setEmail]=useState('')
  const [code,setCode]=useState('')
  const [sentCode,setSentCode]=useState('')
  const [verified,setVerified]=useState(false)

  const isPublic = !item.secret
  const canView = isPublic || (verified && email.toLowerCase()===item.authorEmail.toLowerCase())

  const sendCode=()=>{
    if(!email) return alert('이메일을 입력하세요.')
    const c = Math.floor(100000+Math.random()*900000).toString()
    setSentCode(c); setVerified(false)
    alert(`데모용 인증코드: ${c}\n(실서비스에서는 이메일로 발송됩니다)`)
  }
  const verify=()=>{
    if(email.toLowerCase()!==item.authorEmail.toLowerCase()) return alert('작성자 이메일과 일치하지 않습니다.')
    if(code && code===sentCode) setVerified(true)
    else { setVerified(false); alert('인증코드가 올바르지 않습니다.') }
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(96vw,800px)]">
        <Card>
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold">
              {item.secret && <SecretBadge/>}
              {item.title}
            </h3>
            <Button variant="secondary" onClick={onClose}>닫기</Button>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            상태: <span className={item.status==='답변완료'?'text-emerald-600':'text-amber-600'}>{item.status}</span>
            <span className="mx-2">•</span>작성자: {maskEmail(item.authorEmail)}
            <span className="mx-2">•</span>작성일: {fmtDate(item.createdAt)}
          </div>

          {(!canView) && (
            <div className="mt-4">
              <div className="text-slate-600 dark:text-slate-300 text-sm mb-2">
                비밀글입니다. 작성자 이메일과 인증을 완료하면 내용을 볼 수 있습니다.
              </div>
              <div className="grid md:grid-cols-[1fr_auto_auto] gap-2 items-end max-w-xl">
                <Input placeholder="작성자 이메일" value={email} onChange={(e)=>setEmail(e.target.value)} />
                <Button type="button" variant="secondary" onClick={sendCode}>인증코드 발송</Button>
                <div className="flex items-end gap-2">
                  <Input placeholder="인증코드" value={code} onChange={(e)=>setCode(e.target.value)} />
                  <Button type="button" variant="secondary" onClick={verify}>확인</Button>
                </div>
              </div>
              {sentCode && <div className="text-slate-500 text-xs mt-1">코드가 발송되었습니다. (데모 표시: {sentCode})</div>}
            </div>
          )}

          {canView && (
            <div className="mt-5 space-y-4">
              <section>
                <div className="font-semibold mb-1">문의 내용</div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 whitespace-pre-wrap">
                  {item.content || '내용이 없습니다.'}
                </div>
              </section>
              <section>
                <div className="font-semibold mb-1">답변</div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 whitespace-pre-wrap">
                  {item.answer ? item.answer : '아직 답변이 등록되지 않았습니다.'}
                </div>
              </section>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

/* ========= 작성 모달 ========= */
function WriteModal({ onClose, onSubmit }){
  const [title,setTitle]=useState('')
  const [content,setContent]=useState('')
  const [email,setEmail]=useState('')
  const [secret,setSecret]=useState(false)

  const [code,setCode]=useState('')
  const [sentCode,setSentCode]=useState('')
  const [verified,setVerified]=useState(false)

  const sendCode=()=>{
    if(!email) return alert('이메일을 입력하세요.')
    const c = Math.floor(100000+Math.random()*900000).toString()
    setSentCode(c); setVerified(false)
    alert(`데모용 인증코드: ${c}\n(실서비스에서는 이메일로 발송됩니다)`)
  }
  const verify=()=>{
    if(code && code===sentCode) setVerified(true)
    else { setVerified(false); alert('인증코드가 올바르지 않습니다.') }
  }
  const canSubmit = title && content && email && verified

  return (
    <div className="fixed inset-0 z-[50]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(96vw,800px)]">
        <Card title="Q&A 작성하기">
          <div className="grid gap-3">
            <div>
              <Label htmlFor="w-title">제목</Label>
              <Input id="w-title" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="제목을 입력하세요" />
            </div>
            <div>
              <Label htmlFor="w-content">내용</Label>
              <Textarea id="w-content" rows={6} value={content} onChange={(e)=>setContent(e.target.value)} placeholder="문의 내용을 입력하세요" />
            </div>
            <div className="flex items-center gap-2">
              <input id="w-secret" type="checkbox" className="w-4 h-4" checked={secret} onChange={e=>setSecret(e.target.checked)} />
              <Label htmlFor="w-secret">비밀글</Label>
            </div>
            <div className="grid md:grid-cols-[1fr_auto_auto] gap-2 items-end">
              <div>
                <Label htmlFor="w-email">이메일</Label>
                <Input id="w-email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="your@email.com" />
              </div>
              <Button type="button" variant="secondary" onClick={sendCode}>인증코드 발송</Button>
              <div className="flex items-end gap-2">
                <Input placeholder="인증코드" value={code} onChange={(e)=>setCode(e.target.value)} />
                <Button type="button" variant="secondary" onClick={verify}>확인</Button>
              </div>
            </div>
            {verified ? (
              <div className="text-emerald-600 text-sm">인증 완료</div>
            ) : (
              sentCode && <div className="text-slate-500 text-xs">코드가 발송되었습니다. (데모 표시: {sentCode})</div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={onClose}>취소</Button>
              <Button disabled={!canSubmit} onClick={()=>onSubmit({title,content,email,secret})}>등록</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ========= 나의 Q&A 모달 ========= */
function MyModal({ items, onClose, onOpenDetail }){
  const [email,setEmail]=useState('')
  const [results,setResults]=useState([])
  const search=(e)=>{ e.preventDefault(); setResults(items.filter(x=>x.authorEmail.toLowerCase()===email.toLowerCase())) }

  return (
    <div className="fixed inset-0 z-[50]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(96vw,900px)]">
        <Card title="나의 Q&A 조회">
          <form onSubmit={search} className="flex gap-2 items-end mb-3">
            <div className="min-w-[280px]">
              <Label htmlFor="q-email">이메일</Label>
              <Input id="q-email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <Button type="submit">조회하기</Button>
            <Button variant="secondary" type="button" onClick={onClose}>닫기</Button>
          </form>

          <div className="text-slate-500 text-sm mb-2">결과: <span className="font-semibold">{results.length}</span>건 (행 클릭 시 상세 보기)</div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b">
                  <th className="text-left py-2 pl-2 w-28">답변상태</th>
                  <th className="text-left py-2">제목</th>
                  <th className="text-left py-2 w-40">작성자</th>
                  <th className="text-left py-2 w-28">작성일</th>
                </tr>
              </thead>
              <tbody>
                {results.map(row=>(
                  <tr key={row.id}
                      className="border-b hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                      onClick={()=>onOpenDetail(row)}
                  >
                    <td className="py-3 pl-2 font-semibold">
                      <span className={row.status==='답변완료'?'text-emerald-600':'text-amber-600'}>{row.status}</span>
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
                  <tr><td colSpan="4" className="py-6 text-center text-slate-500">해당 이메일로 작성된 Q&amp;A가 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
