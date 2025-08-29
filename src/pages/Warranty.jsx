import React from 'react'
import PageWrap from './_PageWrap.jsx'
import Card from '../components/Card.jsx'


export default function Warranty(){
return (
<PageWrap title="워런티 정책" subtitle="상세 정책/약관, 적용 범위, 예외, 청구 프로세스 등">
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
<Card title="요약 (Stakeholder Summary)">
<p className="text-slate-600 text-sm">TODO: 보증기간, 커버리지, 고객 의무, 증빙 서류 요건을 5~7줄로 요약.</p>
</Card>
<Card title="세부 정책 구조">
<ul className="list-disc pl-5 text-slate-600 text-sm space-y-1">
<li>보증기간: TODO</li>
<li>커버리지: TODO</li>
<li>제외 사항: TODO</li>
<li>청구 절차: TODO</li>
<li>지역/국가별 차이: TODO</li>
</ul>
</Card>
</div>
</PageWrap>
)
}