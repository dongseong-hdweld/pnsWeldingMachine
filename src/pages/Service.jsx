// src/pages/Service.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import PageWrap from './_PageWrap.jsx'
import Card from '../components/Card.jsx'
import { Button } from '../components/FormControls.jsx'

/** Google Maps JS API 동적 로딩 */
const GMAPS_SRC =
  'https://maps.googleapis.com/maps/api/js?key=AIzaSyDX-1CbT-hHJVGBtrbr-APdb6wMB3bcq9U&language=ko'

/** 기본 현재 위치(수동): 강남구 테헤란로 507 인근 */
const DEFAULT_POS = { lat: 37.5079, lng: 127.0554, label: '기준점(강남구 테헤란로 507)' }

/** 국가별 기본 뷰 */
const COUNTRY_VIEW = {
  KR: { center: { lat: 36.5, lng: 127.8 }, zoom: 6 },
  JP: { center: { lat: 36.2, lng: 138.25 }, zoom: 5 },
  US: { center: { lat: 39.5, lng: -98.35 }, zoom: 4 },
}

/** 국가별 대리점(데모 데이터: 각 3개) */
const DEALERS = [
  // KR
  { id: 'kr-r1', country: 'KR', type: 'repair', name: '서울 강남 서비스센터', lat: 37.498, lng: 127.0276, addr: '서울 강남' },
  { id: 'kr-r2', country: 'KR', type: 'repair', name: '부산 서비스센터', lat: 35.1796, lng: 129.0756, addr: '부산' },
  { id: 'kr-r3', country: 'KR', type: 'repair', name: '인천 서비스센터', lat: 37.4563, lng: 126.7052, addr: '인천' },
  { id: 'kr-s1', country: 'KR', type: 'sales', name: '서울 종로 대리점', lat: 37.572, lng: 126.9794, addr: '서울 종로' },
  { id: 'kr-s2', country: 'KR', type: 'sales', name: '대전 대리점', lat: 36.3504, lng: 127.3845, addr: '대전' },
  { id: 'kr-s3', country: 'KR', type: 'sales', name: '광주 대리점', lat: 35.1595, lng: 126.8526, addr: '광주' },

  // US
  { id: 'us-r1', country: 'US', type: 'repair', name: 'LA Service Center', lat: 34.0522, lng: -118.2437, addr: 'Los Angeles' },
  { id: 'us-r2', country: 'US', type: 'repair', name: 'Chicago Service', lat: 41.8781, lng: -87.6298, addr: 'Chicago' },
  { id: 'us-r3', country: 'US', type: 'repair', name: 'NYC Service', lat: 40.7128, lng: -74.006, addr: 'New York' },
  { id: 'us-s1', country: 'US', type: 'sales', name: 'Dallas Dealer', lat: 32.7767, lng: -96.797, addr: 'Dallas' },
  { id: 'us-s2', country: 'US', type: 'sales', name: 'Atlanta Dealer', lat: 33.749, lng: -84.388, addr: 'Atlanta' },
  { id: 'us-s3', country: 'US', type: 'sales', name: 'Seattle Dealer', lat: 47.6062, lng: -122.3321, addr: 'Seattle' },

  // JP
  { id: 'jp-r1', country: 'JP', type: 'repair', name: 'Tokyo Service', lat: 35.6762, lng: 139.6503, addr: 'Tokyo' },
  { id: 'jp-r2', country: 'JP', type: 'repair', name: 'Osaka Service', lat: 34.6937, lng: 135.5023, addr: 'Osaka' },
  { id: 'jp-r3', country: 'JP', type: 'repair', name: 'Fukuoka Service', lat: 33.5904, lng: 130.4017, addr: 'Fukuoka' },
  { id: 'jp-s1', country: 'JP', type: 'sales', name: 'Yokohama Dealer', lat: 35.4437, lng: 139.638, addr: 'Yokohama' },
  { id: 'jp-s2', country: 'JP', type: 'sales', name: 'Nagoya Dealer', lat: 35.1815, lng: 136.9066, addr: 'Nagoya' },
  { id: 'jp-s3', country: 'JP', type: 'sales', name: 'Sapporo Dealer', lat: 43.0618, lng: 141.3545, addr: 'Sapporo' },
]

/** 거리(km) */
function distanceKm(a, b) {
  const toRad = (x) => (x * Math.PI) / 180
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Google Maps 스크립트 로더 */
function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) return resolve(window.google)
    let script = document.querySelector('script[data-gmaps-loader]')
    if (!script) {
      script = document.createElement('script')
      script.src = GMAPS_SRC
      script.async = true
      script.defer = true
      script.setAttribute('data-gmaps-loader', '1')
      script.onerror = () => reject(new Error('Google Maps 스크립트 로드 실패'))
      document.head.appendChild(script)
    }
    const started = Date.now()
    const tick = () => {
      if (window.google?.maps) return resolve(window.google)
      if (Date.now() - started > 15000) return reject(new Error('Google Maps 로딩 타임아웃'))
      setTimeout(tick, 50)
    }
    tick()
  })
}

export default function Service() {
  const mapRef = useRef(null)
  const map = useRef(null)
  const infoWin = useRef(null)
  const markersById = useRef(new Map()) // dealerId -> Marker

  const [country, setCountry] = useState('KR')          // KR | JP | US
  const [typeFilter, setTypeFilter] = useState('all')   // all | repair | sales
  const [currentPos, setCurrentPos] = useState(DEFAULT_POS)

  // 국가별 대리점
  const countryDealers = useMemo(
    () => DEALERS.filter((d) => d.country === country),
    [country]
  )

  // 필터 적용된 목록
  const filteredDealers = useMemo(
    () => countryDealers.filter((d) => (typeFilter === 'all' ? true : d.type === typeFilter)),
    [countryDealers, typeFilter]
  )

  // 거리순 상위 3개 (필터별)
  const topRepair = useMemo(
    () =>
      countryDealers
        .filter((d) => d.type === 'repair')
        .map((d) => ({ ...d, dist: distanceKm(currentPos, d) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 3),
    [countryDealers, currentPos]
  )
  const topSales = useMemo(
    () =>
      countryDealers
        .filter((d) => d.type === 'sales')
        .map((d) => ({ ...d, dist: distanceKm(currentPos, d) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 3),
    [countryDealers, currentPos]
  )

  // 지도 초기화 + 마커 갱신
  useEffect(() => {
    let cancelled = false
    async function initAndDraw() {
      const google = await loadGoogleMaps().catch((err) => {
        console.error(err)
        return null
      })
      if (!google || cancelled) return

      if (!map.current) {
        map.current = new google.maps.Map(mapRef.current, {
          center: COUNTRY_VIEW[country].center,
          zoom: COUNTRY_VIEW[country].zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        })
        infoWin.current = new google.maps.InfoWindow()
      } else {
        map.current.setCenter(COUNTRY_VIEW[country].center)
        map.current.setZoom(COUNTRY_VIEW[country].zoom)
      }

      // 기존 마커 정리
      markersById.current.forEach((m) => m.setMap(null))
      markersById.current.clear()

      // 현재 위치 마커
      const you = new google.maps.Marker({
        position: { lat: currentPos.lat, lng: currentPos.lng },
        map: map.current,
        title: currentPos.label,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeColor: '#1d4ed8',
          strokeWeight: 2,
        },
      })
      markersById.current.set('you', you)

      // 대리점 마커
      filteredDealers.forEach((d) => {
        const icon =
          d.type === 'repair'
            ? {
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                scale: 5,
                fillColor: '#dc2626',
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: '#991b1b',
              }
            : {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 5,
                fillColor: '#059669',
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: '#047857',
              }
        const m = new google.maps.Marker({
          position: { lat: d.lat, lng: d.lng },
          map: map.current,
          title: `${d.name} (${d.addr})`,
          icon,
        })
        m.addListener('click', () => {
          infoWin.current.setContent(
            `<div style="font-size:12px"><b>${d.name}</b><br/>${d.addr}<br/><span style="color:#6b7280">${d.type === 'repair' ? '수리' : '구매'} 대리점</span></div>`
          )
          infoWin.current.open(map.current, m)
        })
        markersById.current.set(d.id, m)
      })
    }
    initAndDraw()
    return () => {
      cancelled = true
    }
  }, [country, typeFilter, filteredDealers, currentPos])

  // 특정 좌표로 보기 좋게 이동(+줌 인)
  const flyTo = (lat, lng, zoom = 15) => {
    if (!map.current) return
    map.current.panTo({ lat, lng })
    map.current.setZoom(zoom)
  }

  // 리스트 버튼 클릭: 해당 마커로 이동 + 인포윈도우
  const focusDealer = (dealer) => {
    const m = markersById.current.get(dealer.id)
    if (!m) {
      // 필터로 숨겨져 있을 수 있으니, 일단 지도만 이동
      flyTo(dealer.lat, dealer.lng)
      return
    }
    flyTo(dealer.lat, dealer.lng)
    infoWin.current?.setContent(
      `<div style="font-size:12px"><b>${dealer.name}</b><br/>${dealer.addr}<br/><span style="color:#6b7280">${dealer.type === 'repair' ? '수리' : '구매'} 대리점</span></div>`
    )
    infoWin.current?.open(map.current, m)
  }

  // 내 위치 버튼
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 기능을 사용할 수 없습니다.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const me = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: '현재 위치(브라우저)',
        }
        setCurrentPos(me)
        flyTo(me.lat, me.lng, 15)
      },
      (err) => {
        console.warn('Geolocation 실패/거부:', err)
        alert('위치 접근이 거부되었거나 실패했습니다. 기본 위치를 사용합니다.')
        setCurrentPos(DEFAULT_POS)
        flyTo(DEFAULT_POS.lat, DEFAULT_POS.lng, 14)
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 8000 }
    )
  }

  // 기준점(강남) 버튼
  const handleDefaultPoint = () => {
    setCurrentPos(DEFAULT_POS)
    flyTo(DEFAULT_POS.lat, DEFAULT_POS.lng, 14)
  }

  // 리스트 섹션(필터별로 그리기)
  const renderTopLists = () => {
    // 전체면 양쪽(수리/구매) 각각 3개, 특정 필터면 해당 타입만 3개
    if (typeFilter === 'all') {
      return (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <DealerList title="제품 수리 대리점 (가까운 순)" items={topRepair} onPick={focusDealer} />
          <DealerList title="구매 가능 대리점 (가까운 순)" items={topSales} onPick={focusDealer} />
        </div>
      )
    }
    const items = typeFilter === 'repair' ? topRepair : topSales
    const title = typeFilter === 'repair' ? '제품 수리 대리점 (가까운 순)' : '구매 가능 대리점 (가까운 순)'
    return (
      <div className="mt-4">
        <DealerList title={title} items={items} onPick={focusDealer} />
      </div>
    )
  }

  return (
    <PageWrap title="수리/구매 대리점" subtitle="지역 기반 대리점/서비스센터 찾기, 지도/리스트 전환">
      {/* 안내 문구 */}
      <Card>
        <p className="text-sm text-slate-700 dark:text-slate-200">
          가까운 수리 대리점과 구매 가능 대리점을 찾을 수 있습니다. 기본 기준점은
          <b> “강남구 테헤란로 507”</b>이며, <em>내 위치</em> 버튼을 누르면 브라우저가 허용하는 범위에서 현재 위치를 사용합니다.
        </p>
      </Card>

      {/* 좌: 국가/필터/리스트, 우: 지도 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card title="국가 선택 / 필터">
          {/* 국가 버튼 (파랑 계열, 비활성도 가시성 유지) */}
          <div className="flex flex-wrap gap-2">
            {[
              { code: 'KR', label: '대한민국' },
              { code: 'JP', label: '일본' },
              { code: 'US', label: '미국' },
            ].map((c) => (
              <Button
                key={c.code}
                type="button"
                onClick={() => setCountry(c.code)}
                className={
                  country === c.code
                    ? 'bg-blue-600 text-white border border-blue-600'
                    : 'bg-white text-blue-700 border border-blue-600 hover:bg-blue-50 dark:bg-slate-800 dark:text-blue-300 dark:border-blue-400 dark:hover:bg-slate-700'
                }
              >
                {c.label}
              </Button>
            ))}

            {/* 내 위치 / 기준점 버튼 */}
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                onClick={handleLocateMe}
                className="bg-slate-900 text-white hover:opacity-90 dark:bg-slate-700"
              >
                내 위치
              </Button>
              <Button
                type="button"
                onClick={handleDefaultPoint}
                className="bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700"
              >
                기준점(테헤란로 507)
              </Button>
            </div>
          </div>

          {/* 대리점 타입 필터 (초록 계열, 비활성도 가시성 유지) */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { key: 'all', label: '전체' },
              { key: 'repair', label: '제품 수리 대리점' },
              { key: 'sales', label: '구매 가능 대리점' },
            ].map((f) => (
              <Button
                key={f.key}
                type="button"
                onClick={() => setTypeFilter(f.key)}
                className={
                  typeFilter === f.key
                    ? 'bg-emerald-600 text-white border border-emerald-600'
                    : 'bg-white text-emerald-700 border border-emerald-600 hover:bg-emerald-50 dark:bg-slate-800 dark:text-emerald-300 dark:border-emerald-400 dark:hover:bg-slate-700'
                }
              >
                {f.label}
              </Button>
            ))}
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            국가를 바꾸면 해당 국가 중심으로 지도가 이동합니다.
          </p>

          {/* 거리순 리스트(동적 생성 + 클릭 시 해당 마커로 이동/줌인) */}
          {renderTopLists()}
        </Card>

        <Card title="지도">
          <div className="relative">
            <div
              ref={mapRef}
              className="rounded-xl border border-slate-200 dark:border-slate-700"
              style={{ height: 520, width: '100%' }}
            />
            <div className="absolute top-2 left-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-2 py-1 rounded-lg shadow text-xs text-slate-700 dark:text-slate-200">
              현재 기준점: {currentPos.label}
            </div>
          </div>
        </Card>
      </div>
    </PageWrap>
  )
}

/** 하단 리스트 공통 컴포넌트: 버튼 3개(가까운 순) */
function DealerList({ title, items, onPick }) {
  return (
    <div>
      <div className="font-medium text-slate-800 dark:text-slate-100 mb-2">{title}</div>
      <div className="flex flex-col gap-2">
        {items.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => onPick(d)}
            className="text-left px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50
                       dark:border-slate-600 dark:hover:bg-slate-700
                       text-slate-800 dark:text-slate-100"
            title={`${d.name} — ${d.addr}`}
          >
            <div className="text-sm font-semibold">{d.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{d.addr} · {d.dist.toFixed(1)} km</div>
          </button>
        ))}
        {items.length === 0 && (
          <div className="text-xs text-slate-500 dark:text-slate-400">표시할 대리점이 없습니다.</div>
        )}
      </div>
    </div>
  )
}
