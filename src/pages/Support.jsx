import React from 'react'
import PageWrap from './_PageWrap.jsx'
import Card from '../components/Card.jsx'
import { Label, Input, Textarea, Button } from '../components/FormControls.jsx'


export default function Support(){
const log = (...args) => console.log('[PROTO]', ...args)
const get = (id) => document.getElementById(id)?.value
return (
<PageWrap title="고객센터" subtitle="문의 채널, RMA 발급, 진행상태 조회 등">
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
<Card title="빠른 문의">
<Label htmlFor="sup-topic">주제</Label>
<Input id="sup-topic" placeholder="예: 워런티 청구" />
<Label htmlFor="sup-msg" className="mt-2">내용</Label>
<Textarea id="sup-msg" rows={4} placeholder="문의 내용을 입력하세요" />
<div className="mt-3">
<Button
id="btn-support"
onClick={() => {
log('고객센터 문의', { topic: get('sup-topic'), message: get('sup-msg') })
alert('임시 전송 로그가 콘솔에 기록되었습니다.')
}}
>
임시 전송 (Console 로그)
</Button>
</div>
</Card>
<Card title="FAQ (자리표시자)">
<ul className="list-disc pl-5 text-slate-600 text-sm space-y-1">
<li>Q1. 보증 청구 조건은? – TODO</li>
<li>Q2. 수리 기간은? – TODO</li>
<li>Q3. 해외 보증 처리? – TODO</li>
</ul>
</Card>
</div>
</PageWrap>
)
}