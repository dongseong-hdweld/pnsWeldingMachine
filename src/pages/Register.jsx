import React from 'react'
import PageWrap from './_PageWrap.jsx'
import Card from '../components/Card.jsx'
import { Label, Input, Button } from '../components/FormControls.jsx'


export default function Register(){
const log = (...args) => console.log('[PROTO]', ...args)
const get = (id) => document.getElementById(id)?.value
return (
<PageWrap title="제품 등록" subtitle="구매자/설치자 정보, 제품 정보(시리얼, 모델), 구매 증빙 업로드 등">
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
<Card>
<Label htmlFor="reg-serial">시리얼 번호</Label>
<Input id="reg-serial" placeholder="예: HYW-ABC123456" />
<p className="text-slate-500 text-sm mt-1">TODO: 시리얼 규칙/유효성 메시지</p>
</Card>
<Card>
<Label htmlFor="reg-model">모델</Label>
<Input id="reg-model" placeholder="예: HiBallast NF" />
<p className="text-slate-500 text-sm mt-1">TODO: 자동완성/드롭다운 연결</p>
</Card>
<Card>
<Label htmlFor="reg-buyer">구매자 이름</Label>
<Input id="reg-buyer" placeholder="홍길동" />
</Card>
<Card>
<Label htmlFor="reg-date">구매일자</Label>
<Input id="reg-date" type="date" />
</Card>
</div>
<div className="mt-3">
<Button
id="btn-register"
onClick={() => {
log('등록 시도', {
serial: get('reg-serial'),
model: get('reg-model'),
buyer: get('reg-buyer'),
date: get('reg-date'),
})
alert('임시 등록 로그가 콘솔에 기록되었습니다.')
}}
>
임시 등록 (Console 로그)
</Button>
</div>
</PageWrap>
)
}