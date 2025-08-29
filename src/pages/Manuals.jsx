import React from 'react'
import PageWrap from './_PageWrap.jsx'
import Card from '../components/Card.jsx'
import { Label, Input, Button } from '../components/FormControls.jsx'


export default function Manuals(){
const log = (...args) => console.log('[PROTO]', ...args)
return (
<PageWrap title="메뉴얼 검색" subtitle="제품별 사용설명서/인증서/자료 다운로드 검색">
<Card>
<Label htmlFor="manual-q">검색어</Label>
<Input id="manual-q" placeholder="모델명, 키워드 등" />
<div className="mt-3">
<Button
id="btn-search"
onClick={() => {
const q = document.getElementById('manual-q')?.value?.trim()
log('메뉴얼 검색', { q })
const box = document.getElementById('manual-results')
if(box) box.textContent = q ? `"${q}" 검색 결과 (자리표시자)` : '검색어를 입력하세요.'
}}
>
임시 검색 (Console 로그)
</Button>
</div>
<p id="manual-results" className="text-slate-500 text-sm mt-3">검색 결과 영역 (TODO: 리스트/카드뷰)</p>
</Card>
</PageWrap>
)
}