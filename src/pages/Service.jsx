// src/pages/Service.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import PageWrap from './_PageWrap.jsx'
import Card from '../components/Card.jsx'
import { Button } from '../components/FormControls.jsx'

/** Google Maps JS API 동적 로딩 */
const GMAPS_SRC =
  'https://maps.googleapis.com/maps/api/js?key=AIzaSyDX-1CbT-hHJVGBtrbr-APdb6wMB3bcq9U&language=ko'

/** 내부 기본 시작 좌표(표시는 안함) : 강남구 테헤란로 507 */
const DEFAULT_POS = { lat: 37.5079, lng: 127.0554, label: '현재 위치' }

/** 국가별 기본 뷰 */
const COUNTRY_VIEW = {
  KR: { center: { lat: 36.5, lng: 127.8 }, zoom: 6 },
  JP: { center: { lat: 36.2, lng: 138.25 }, zoom: 5 },
  US: { center: { lat: 39.5, lng: -98.35 }, zoom: 4 },
}

/** 대리점 데모 */
const DEALERS = [
  // KR
  { id: 'kr-r1', country: 'KR', type: 'repair', name: '서울 강남 서비스센터', lat: 37.498, lng: 127.0276, addr: '서울 강남' },
  { id: 'kr-r2', country: 'KR', type: 'repair', name: '부산 서비스센터', lat: 35.1796, lng: 129.0756, addr: '부산' },
  { id: 'kr-r3', country: 'KR', type: 'repair', name: '인천 서비스센터', lat: 37.4563, lng: 126.7052, addr: '인천' },
  { id: 'kr-s1', country: 'KR', type: 'sales',  name: '서울 종로 대리점',   lat: 37.572,  lng: 126.9794, addr: '서울 종로' },
  { id: 'kr-s2', country: 'KR', type: 'sales',  name: '대전 대리점',       lat: 36.3504, lng: 127.3845, addr: '대전' },
  { id: 'kr-s3', country: 'KR', type: 'sales',  name: '광주 대리점',       lat: 35.1595, lng: 126.8526, addr: '광주' },

  // US
  { id: 'us-r1', country: 'US', type: 'repair', name: 'LA Service Center', lat: 34.0522, lng: -118.2437, addr: 'Los Angeles' },
  { id: 'us-r2', country: 'US', type: 'repair', name: 'Chicago Service',   lat: 41.8781, lng: -87.6298,  addr: 'Chicago' },
  { id: 'us-r3', country: 'US', type: 'repair', name: 'NYC Service',       lat: 40.7128, lng: -74.006,   addr: 'New York' },
  { id: 'us-s1', country: 'US', type: 'sales',  name: 'Dallas Dealer',     lat: 32.7767, lng: -96.797,   addr: 'Dallas' },
  { id: 'us-s2', country: 'US', type: 'sales',  name: 'Atlanta Dealer',    lat: 33.749,  lng: -84.388,   addr: 'Atlanta' },
  { id: 'us-s3', country: 'US', type: 'sales',  name: 'Seattle Dealer',    lat: 47.6062, lng: -122.3321, addr: 'Seattle' },

  // JP
  { id: 'jp-r1', country: 'JP', type: 'repair', name: 'Tokyo Service',   lat: 35.6762, lng: 139.6503, addr: 'Tokyo' },
  { id: 'jp-r2', country: 'JP', type: 'repair', name: 'Osaka Service',   lat: 34.6937, lng: 135.5023, addr: 'Osaka' },
  { id: 'jp-r3', country: 'JP', type: 'repair', name: 'Fukuoka Service', lat: 33.5904, lng: 130.4017, addr: 'Fukuoka' },
  { id: 'jp-s1', country: 'JP', type: 'sales',  name: 'Yokohama Dealer', lat: 35.4437, lng: 139.638,  addr: 'Yokohama' },
  { id: 'jp-s2', country: 'JP', type: 'sales',  name: 'Nagoya Dealer',   lat: 35.1815, lng: 136.9066, addr: 'Nagoya' },
  { id: 'jp-s3', country: 'JP', type: 'sales',  name: 'Sapporo Dealer',  lat: 43.0618, lng: 141.3545, addr: 'Sapporo' },
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

/** 내 위치로 국가 추정 */
function detectCountry(lat, lng) {
  if (lat >= 33 && lat <= 39.6 && lng >= 124 && lng <= 132.5) return 'KR'
  if (lat >= 24 && lat <= 46.5 && lng >= 123 && lng <= 146.5) return 'JP'
  if (lat >= 24 && lat <= 49.5 && lng >= -125 && lng <= -66) return 'US'
  return 'KR'
}

/** Google Maps 로더 */
function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) return resolve(window.google)
    let script = document.createElement('script')
    script.src = GMAPS_SRC
    script.async = true
    script.defer = true
    script.setAttribute('data-gmaps-loader', '1')
    script.onerror = () => reject(new Error('Google Maps 스크립트 로드 실패'))
    document.head.appendChild(script)

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
  const markersById = useRef(new Map())
  const googleRef = useRef(null)

  // 최근 동작 추적(국가버튼/내위치)
  const lastActionRef = useRef(null)          // 'country' | 'locate' | null
  const lastLocatedPosRef = useRef(null)      // {lat,lng}

  // ✅ 기본값: 대한민국 + 전체
  const [country, setCountry] = useState('KR')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPos, setCurrentPos] = useState(DEFAULT_POS)

  // 초기 지도 준비 여부 (마커가 안 나오는 이슈 방지)
  const [mapReady, setMapReady] = useState(false)

  // 국가 내 대리점
  const countryDealers = useMemo(
    () => DEALERS.filter((d) => d.country === country),
    [country]
  )

  // 필터 적용
  const filteredDealers = useMemo(
    () => countryDealers.filter((d) => (typeFilter === 'all' ? true : d.type === typeFilter)),
    [countryDealers, typeFilter]
  )

  // 가까운 순 Top3
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

  /** 초기 지도 생성(한 번만) */
  useEffect(() => {
    let cancelled = false
    loadGoogleMaps()
      .then((google) => {
        if (cancelled) return
        googleRef.current = google
        map.current = new google.maps.Map(mapRef.current, {
          center: COUNTRY_VIEW.KR.center, // 기본 KR
          zoom: COUNTRY_VIEW.KR.zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        })
        infoWin.current = new google.maps.InfoWindow()
        setMapReady(true) // ✅ 마커 렌더 트리거
      })
      .catch(console.error)
    return () => {
      cancelled = true
    }
  }, [])

  /** 국가가 바뀔 때만 국가 중심으로 이동 */
  useEffect(() => {
    if (!map.current) return
    map.current.setCenter(COUNTRY_VIEW[country].center)
    map.current.setZoom(COUNTRY_VIEW[country].zoom)

    // 방금 "내 위치"로 국가가 바뀐 경우 → 최종적으로 내 위치로 확대
    if (lastActionRef.current === 'locate' && lastLocatedPosRef.current) {
      const p = lastLocatedPosRef.current
      map.current.panTo(p)
      map.current.setZoom(15)
      lastActionRef.current = null
    }
  }, [country])

  /** 마커 갱신(센터 변경 없음) — 초기 mapReady를 포함해야 첫 진입에도 보임 */
  useEffect(() => {
    const google = googleRef.current
    if (!google || !map.current || !mapReady) return

    // 기존 마커 제거
    markersById.current.forEach((m) => m.setMap(null))
    markersById.current.clear()

    // 현재 위치 마커(파랑) + 라벨
    const you = new google.maps.Marker({
      position: { lat: currentPos.lat, lng: currentPos.lng },
      map: map.current,
      title: currentPos.label || '현재 위치',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: '#2563eb',
        fillOpacity: 1,
        strokeColor: '#1d4ed8',
        strokeWeight: 2,
      },
      label: { text: '현재 위치', color: '#1d4ed8', fontWeight: '700', fontSize: '12px' },
    })
    markersById.current.set('you', you)

    // 대리점 마커(이름 라벨 고정)
    filteredDealers.forEach((d) => {
      const icon =
        d.type === 'repair'
          ? { path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, scale: 5, fillColor: '#dc2626', fillOpacity: 1, strokeWeight: 1, strokeColor: '#991b1b' }
          : { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,  scale: 5, fillColor: '#059669', fillOpacity: 1, strokeWeight: 1, strokeColor: '#047857' }
      const m = new google.maps.Marker({
        position: { lat: d.lat, lng: d.lng },
        map: map.current,
        title: `${d.name} (${d.addr})`,
        icon,
        label: { text: d.name, color: '#111827', fontWeight: '600', fontSize: '12px' },
      })
      m.addListener('click', () => {
        infoWin.current.setContent(
          `<div style="font-size:12px"><b>${d.name}</b><br/>${d.addr}<br/><span style="color:#6b7280">${d.type === 'repair' ? '수리' : '구매'} 대리점</span></div>`
        )
        infoWin.current.open(map.current, m)
      })
      markersById.current.set(d.id, m)
    })
  }, [filteredDealers, currentPos, mapReady])

  // 부드럽게 이동/확대
  const flyTo = (lat, lng, zoom = 15) => {
    if (!map.current) return
    map.current.panTo({ lat, lng })
    map.current.setZoom(zoom)
  }

  // 리스트 클릭: 동일 동작(확대)
  const focusDealer = (dealer) => {
    const m = markersById.current.get(dealer.id)
    flyTo(dealer.lat, dealer.lng)
    if (m) {
      infoWin.current?.setContent(
        `<div style="font-size:12px"><b>${dealer.name}</b><br/>${dealer.addr}<br/><span style="color:#6b7280">${
          dealer.type === 'repair' ? '수리' : '구매'
        } 대리점</span></div>`
      )
      infoWin.current?.open(map.current, m)
    }
  }

  // ✅ 내 위치: 허용 시 위치로 확대 / 거부·실패 시 테헤란로 507로 확대
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      // 브라우저가 지원 안하면 기본 위치로
      setCurrentPos(DEFAULT_POS)
      if (country !== 'KR') setCountry('KR')
      flyTo(DEFAULT_POS.lat, DEFAULT_POS.lng, 15)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const me = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: '현재 위치' }
        setCurrentPos(me)

        // 국가 전환이 발생해도 최종 확대가 유지되도록 플래그 저장
        lastActionRef.current = 'locate'
        lastLocatedPosRef.current = { lat: me.lat, lng: me.lng }

        const detected = detectCountry(me.lat, me.lng)
        if (detected !== country) {
          setCountry(detected)          // 국가가 바뀌면 country-effect가 끝에 flyTo를 다시 호출
        } else {
          flyTo(me.lat, me.lng, 15)     // 국가가 안 바뀌면 즉시 확대
          lastActionRef.current = null
        }
      },
      () => {
        // ❗동의 안 했거나 실패 → 기본 위치로 세팅/확대
        setCurrentPos(DEFAULT_POS)
        if (country !== 'KR') setCountry('KR')
        flyTo(DEFAULT_POS.lat, DEFAULT_POS.lng, 15)
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 8000 }
    )
  }

  // 버튼 스타일(선택/비선택) — Light/Dark 가독성
  const chipClass = (active, color) => {
    if (color === 'blue') {
      return active
        ? '!bg-blue-600 !text-white !border-blue-600 dark:!bg-blue-500 dark:!border-blue-400'
        : '!bg-white !text-blue-700 !border-blue-600 hover:!bg-blue-50 ' +
          'dark:!bg-slate-800 dark:!text-blue-300 dark:!border-blue-400 dark:hover:!bg-slate-700'
    }
    // emerald
    return active
      ? '!bg-emerald-600 !text-white !border-emerald-600 dark:!bg-emerald-500 dark:!border-emerald-400'
      : '!bg-white !text-emerald-700 !border-emerald-600 hover:!bg-emerald-50 ' +
        'dark:!bg-slate-800 dark:!text-emerald-300 dark:!border-emerald-400 dark:hover:!bg-slate-700'
  }

  return (
    <PageWrap title="수리/구매 대리점" subtitle="지역 기반 대리점/서비스센터 찾기">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card title="국가 선택 / 필터">
          {/* 국가 선택 */}
          <div className="flex flex-wrap gap-2">
            {[
              { code: 'KR', label: '대한민국' },
              { code: 'JP', label: '일본' },
              { code: 'US', label: '미국' },
            ].map((c) => (
              <Button
                key={c.code}
                type="button"
                onClick={() => { lastActionRef.current = 'country'; setCountry(c.code) }}
                className={chipClass(country === c.code, 'blue')}
              >
                {c.label}
              </Button>
            ))}

            {/* 내 위치 */}
            <div className="ml-auto">
              <Button type="button" onClick={handleLocateMe} className="!bg-slate-900 !text-white dark:!bg-slate-700">
                내 위치
              </Button>
            </div>
          </div>

          {/* 타입 필터 */}
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
                className={chipClass(typeFilter === f.key, 'emerald')}
              >
                {f.label}
              </Button>
            ))}
          </div>

          {/* 거리순 리스트 */}
          <div className="mt-4" />
          {typeFilter === 'all' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DealerList title="제품 수리 대리점 (가까운 순)" items={topRepair} onPick={focusDealer} />
              <DealerList title="구매 가능 대리점 (가까운 순)" items={topSales} onPick={focusDealer} />
            </div>
          ) : (
            <DealerList
              title={typeFilter === 'repair' ? '제품 수리 대리점 (가까운 순)' : '구매 가능 대리점 (가까운 순)'}
              items={typeFilter === 'repair' ? topRepair : topSales}
              onPick={focusDealer}
            />
          )}
        </Card>

        <Card title="지도">
          <div
            ref={mapRef}
            className="rounded-xl border border-slate-200 dark:border-slate-700"
            style={{ height: 520, width: '100%' }}
          />
        </Card>
      </div>
    </PageWrap>
  )
}

/** 공통 리스트 */
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
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {d.addr} · {d.dist.toFixed(1)} km
            </div>
          </button>
        ))}
        {items.length === 0 && (
          <div className="text-xs text-slate-500 dark:text-slate-400">표시할 대리점이 없습니다.</div>
        )}
      </div>
    </div>
  )
}
