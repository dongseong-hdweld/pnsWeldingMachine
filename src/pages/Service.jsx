import React from 'react'
import PageWrap from './_PageWrap.jsx'
import Card from '../components/Card.jsx'
import { Label, Input, Button } from '../components/FormControls.jsx'


export default function Service(){
const log = (...args) => console.log('[PROTO]', ...args)
return (
<PageWrap title="수리/구매 대리점" subtitle="지역 기반 대리점/서비스센터 찾기, 지도/리스트 전환">
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
<Card>
<Label htmlFor="svc-region">지역 선택</Label>
<Input id="svc-region" placeholder="예: 서울" />
<div className="mt-3">
<Button
id="btn-locate"
onClick={() => {
const region = document.getElementById('svc-region')?.value?.trim()
log('대리점 조회', { region })
const list = document.getElementById('svc-list')
if(list) list.innerHTML = region ? `<li>예: ${region} 공인 대리점 1 – TODO</li><li>예: ${region} 서비스센터 2 – TODO</li>` : '<li>지역을 입력하세요.</li>'
}}
>
임시 조회 (Console 로그)
</Button>
</div>
</Card>
<Card title="대리점 리스트 (자리표시자)">
<ul id="svc-list" className="list-disc pl-5 text-slate-600 text-sm space-y-1">
<li>예: 현대 서비스센터 강남점 – TODO</li>
<li>예: 공인 대리점 A – TODO</li>
</ul>
</Card>
</div>
</PageWrap>
)
}