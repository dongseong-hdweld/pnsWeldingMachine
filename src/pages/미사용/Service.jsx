// src/pages/Service.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import PageWrap from '../_PageWrap.jsx'
import Card from '../../components/Card.jsx'
import { Button } from '../../components/FormControls.jsx'

/** Google Maps JS API 동적 로딩 */
const GMAPS_SRC =
  'https://maps.googleapis.com/maps/api/js?key=AIzaSyDX-1CbT-hHJVGBtrbr-APdb6wMB3bcq9U&language=ko'

/** 기본 시작 좌표 : 강남구 테헤란로 507 */
const DEFAULT_POS = { lat: 37.5079, lng: 127.0554, label: '현재 위치' }

/** 국가별 기본 뷰 */
const COUNTRY_VIEW = {
  KR: { center: { lat: 36.2, lng: 127.9 }, zoom: 7 }, // KR은 실제로는 fitBounds 사용
  JP: { center: { lat: 36.2, lng: 138.25 }, zoom: 5 },
  US: { center: { lat: 39.5, lng: -98.35 }, zoom: 4 },
}

/** 대한민국 지리 경계(북한이 거의 안 보이도록 북쪽 제한) */
const SOUTH_KOREA_BOUNDS = {
  south: 33.0,
  west: 124.5,
  north: 38.6,
  east: 131.1,
}

/** 데모 대리점 (상세정보 포함) */
const DEALERS = [
  // KR
  { id: 'kr-r1', country: 'KR', type: 'repair', name: '서울 강남 서비스센터', lat: 37.498,  lng: 127.0276, addr: '서울 강남구 테헤란로 일대', phone: '02-000-1000', hours: '평일 09:00-18:00' },
  { id: 'kr-r2', country: 'KR', type: 'repair', name: '부산 서비스센터',     lat: 35.1796, lng: 129.0756, addr: '부산광역시 중구',           phone: '051-000-2000', hours: '평일 09:00-18:00' },
  { id: 'kr-r3', country: 'KR', type: 'repair', name: '인천 서비스센터',     lat: 37.4563, lng: 126.7052, addr: '인천광역시 미추홀구',       phone: '032-000-3000', hours: '평일 09:00-18:00' },
  { id: 'kr-s1', country: 'KR', type: 'sales',  name: '서울 종로 대리점',   lat: 37.572,  lng: 126.9794, addr: '서울 종로구 세종대로 일대', phone: '02-111-4000', hours: '평일 09:00-18:00' },
  { id: 'kr-s2', country: 'KR', type: 'sales',  name: '대전 대리점',       lat: 36.3504, lng: 127.3845, addr: '대전광역시 서구',           phone: '042-111-5000', hours: '평일 09:00-18:00' },
  { id: 'kr-s3', country: 'KR', type: 'sales',  name: '광주 대리점',       lat: 35.1595, lng: 126.8526, addr: '광주광역시 서구',           phone: '062-111-6000', hours: '평일 09:00-18:00' },

  // US
  { id: 'us-r1', country: 'US', type: 'repair', name: 'LA Service Center', lat: 34.0522, lng: -118.2437, addr: 'Los Angeles, CA', phone: '(213) 000-1000', hours: 'Mon–Fri 9am–6pm' },
  { id: 'us-r2', country: 'US', type: 'repair', name: 'Chicago Service',   lat: 41.8781, lng: -87.6298,  addr: 'Chicago, IL',      phone: '(312) 000-2000', hours: 'Mon–Fri 9am–6pm' },
  { id: 'us-r3', country: 'US', type: 'repair', name: 'NYC Service',       lat: 40.7128, lng: -74.006,   addr: 'New York, NY',     phone: '(212) 000-3000', hours: 'Mon–Fri 9am–6pm' },
  { id: 'us-s1', country: 'US', type: 'sales',  name: 'Dallas Dealer',     lat: 32.7767, lng: -96.797,   addr: 'Dallas, TX',       phone: '(214) 111-4000', hours: 'Mon–Fri 9am–6pm' },
  { id: 'us-s2', country: 'US', type: 'sales',  name: 'Atlanta Dealer',    lat: 33.749,  lng: -84.388,   addr: 'Atlanta, GA',      phone: '(404) 111-5000', hours: 'Mon–Fri 9am–6pm' },
  { id: 'us-s3', country: 'US', type: 'sales',  name: 'Seattle Dealer',    lat: 47.6062, lng: -122.3321, addr: 'Seattle, WA',      phone: '(206) 111-6000', hours: 'Mon–Fri 9am–6pm' },

  // JP
  { id: 'jp-r1', country: 'JP', type: 'repair', name: 'Tokyo Service',   lat: 35.6762, lng: 139.6503, addr: 'Chiyoda, Tokyo', phone: '03-0000-1000', hours: '平日 09:00-18:00' },
  { id: 'jp-r2', country: 'JP', type: 'repair', name: 'Osaka Service',   lat: 34.6937, lng: 135.5023, addr: 'Kita, Osaka',    phone: '06-0000-2000', hours: '平日 09:00-18:00' },
  { id: 'jp-r3', country: 'JP', type: 'repair', name: 'Fukuoka Service', lat: 33.5904, lng: 130.4017, addr: 'Hakata, Fukuoka', phone: '092-000-3000', hours: '平日 09:00-18:00' },
  { id: 'jp-s1', country: 'JP', type: 'sales',  name: 'Yokohama Dealer', lat: 35.4437, lng: 139.638,  addr: 'Nishi, Yokohama', phone: '045-111-4000', hours: '平日 09:00-18:00' },
  { id: 'jp-s2', country: 'JP', type: 'sales',  name: 'Nagoya Dealer',   lat: 35.1815, lng: 136.9066, addr: 'Naka, Nagoya',   phone: '052-111-5000', hours: '平日 09:00-18:00' },
  { id: 'jp-s3', country: 'JP', type: 'sales',  name: 'Sapporo Dealer',  lat: 43.0618, lng: 141.3545, addr: 'Chuo, Sapporo',  phone: '011-111-6000', hours: '平日 09:00-18:00' },
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
    const script = document.createElement('script')
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

/** ===== 핀(물방울) 마커 아이콘 ===== */
function pinIcon(google, { fill = '#ef4444', stroke = '#b91c1c', scale = 1.6 } = {}) {
  // 24x32 기준의 클래식 핀 path
  const path = 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'
  return {
    path,
    fillColor: fill,
    fillOpacity: 1,
    strokeColor: stroke,
    strokeWeight: 1.5,
    scale,
    anchor: new google.maps.Point(12, 28),     // 끝점
    labelOrigin: new google.maps.Point(12, 11) // 핀 속 라벨 중심
  }
}

export default function Service() {
  const mapRef = useRef(null)
  const map = useRef(null)
  const infoWin = useRef(null)
  const markersById = useRef(new Map())
  const googleRef = useRef(null)
  const initialKRFitDoneRef = useRef(false) // KR 첫 진입 보정

  const lastActionRef = useRef(null)
  const lastLocatedPosRef = useRef(null)

  // 기본: 대한민국 + 수리 대리점
  const [country, setCountry] = useState('KR')
  const [typeFilter, setTypeFilter] = useState('repair')
  const [currentPos, setCurrentPos] = useState(DEFAULT_POS)
  const [mapReady, setMapReady] = useState(false)

  const countryDealers = useMemo(() => DEALERS.filter((d) => d.country === country), [country])

  const sortedDealers = useMemo(() => {
    return countryDealers
      .filter((d) => d.type === typeFilter)
      .map((d) => ({ ...d, dist: distanceKm(currentPos, d) }))
      .sort((a, b) => a.dist - b.dist)
      .map((d, idx) => ({ ...d, rank: idx + 1 }))
  }, [countryDealers, typeFilter, currentPos])

  /** 초기 지도 생성 */
  useEffect(() => {
    let cancelled = false
    loadGoogleMaps()
      .then((google) => {
        if (cancelled) return
        googleRef.current = google
        map.current = new google.maps.Map(mapRef.current, {
          center: COUNTRY_VIEW.KR.center,
          zoom: COUNTRY_VIEW.KR.zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        })
        infoWin.current = new google.maps.InfoWindow()
        setMapReady(true)

        // 컨테이너/타일 준비가 끝났을 때 1회 KR 맞춤
        google.maps.event.addListenerOnce(map.current, 'tilesloaded', () => {
          if (country === 'KR' && !initialKRFitDoneRef.current) {
            fitKoreaBounds()
            initialKRFitDoneRef.current = true
          }
        })

        // 레이아웃 직후 사이즈 재계산 보정
        setTimeout(() => {
          if (!map.current) return
          google.maps.event.trigger(map.current, 'resize')
        }, 0)
      })
      .catch(console.error)
    return () => { cancelled = true }
  }, [])

  /** KR 디폴트 진입 안전망: mapReady 직후 1회 더 보정 */
  useEffect(() => {
    if (!mapReady || !map.current || !googleRef.current) return
    if (country !== 'KR' || initialKRFitDoneRef.current) return
    const google = googleRef.current
    const doFit = () => { fitKoreaBounds(); initialKRFitDoneRef.current = true }
    if (map.current.getBounds()) doFit()
    else google.maps.event.addListenerOnce(map.current, 'tilesloaded', doFit)
  }, [mapReady, country])

  /** 국가 변경 */
  useEffect(() => {
    if (!map.current) return
    if (country === 'KR') {
      fitKoreaBounds()
    } else {
      map.current.setCenter(COUNTRY_VIEW[country].center)
      map.current.setZoom(COUNTRY_VIEW[country].zoom)
    }

    // 내 위치에서 넘어온 전환이면 최종적으로 내 위치로 확대
    if (lastActionRef.current === 'locate' && lastLocatedPosRef.current) {
      const p = lastLocatedPosRef.current
      map.current.panTo(p)
      map.current.setZoom(15)
      lastActionRef.current = null
    }
  }, [country])

  /** 마커 갱신 */
  useEffect(() => {
    const google = googleRef.current
    if (!google || !map.current || !mapReady) return

    // 초기화
    markersById.current.forEach((m) => m.setMap(null))
    markersById.current.clear()

    // 현재 위치: 파란 핀 (하단 텍스트 없음)
    const you = new google.maps.Marker({
      position: { lat: currentPos.lat, lng: currentPos.lng },
      map: map.current,
      title: currentPos.label || '현재 위치',
      icon: pinIcon(google, { fill: '#2563eb', stroke: '#1d4ed8', scale: 1.6 }),
      zIndex: 1000,
    })
    markersById.current.set('you', you)

    // 대리점: 빨간 핀 + 번호 라벨 (하단 텍스트 없음)
    sortedDealers.forEach((d) => {
      const m = new google.maps.Marker({
        position: { lat: d.lat, lng: d.lng },
        map: map.current,
        title: `${d.name} (${d.addr})`,
        icon: pinIcon(google, { fill: '#ef4444', stroke: '#b91c1c', scale: 1.6 }),
        label: {
          text: String(d.rank),
          color: '#ffffff',
          fontWeight: '700',
          fontSize: '12px',
        },
        zIndex: 600 - d.rank,
      })
      m.addListener('click', () => {
        infoWin.current.setContent(
          `<div style="font-size:12px;line-height:1.4">
             <div style="font-weight:700;margin-bottom:2px">#${d.rank} ${d.name}</div>
             <div>${d.addr}</div>
             <div>📞 ${d.phone || '-'}</div>
             <div>🕘 ${d.hours || '-'}</div>
             <div style="color:#6b7280;margin-top:4px">${d.type === 'repair' ? '제품 수리 대리점' : '구매 가능 대리점'}</div>
           </div>`
        )
        infoWin.current.open(map.current, m)
      })
      markersById.current.set(d.id, m)
    })
  }, [sortedDealers, currentPos, mapReady])

  /** 대한민국 영역으로 맞춤 */
  const fitKoreaBounds = () => {
    const google = googleRef.current
    if (!google || !map.current) return
    const b = new google.maps.LatLngBounds(
      new google.maps.LatLng(SOUTH_KOREA_BOUNDS.south, SOUTH_KOREA_BOUNDS.west),
      new google.maps.LatLng(SOUTH_KOREA_BOUNDS.north, SOUTH_KOREA_BOUNDS.east),
    )
    map.current.fitBounds(b, 20)
    const z = map.current.getZoom()
    if (z && z < 7) map.current.setZoom(7) // 최소 줌 보정
  }

  // 이동/확대
  const flyTo = (lat, lng, zoom = 15) => {
    if (!map.current) return
    map.current.panTo({ lat, lng })
    map.current.setZoom(zoom)
  }

  // 리스트 클릭 시 포커스
  const focusDealer = (dealer) => {
    const m = markersById.current.get(dealer.id)
    flyTo(dealer.lat, dealer.lng)
    if (m) {
      infoWin.current?.setContent(
        `<div style="font-size:12px;line-height:1.4">
           <div style="font-weight:700;margin-bottom:2px">#${dealer.rank} ${dealer.name}</div>
           <div>${dealer.addr}</div>
           <div>📞 ${dealer.phone || '-'}</div>
           <div>🕘 ${dealer.hours || '-'}</div>
           <div style="color:#6b7280;margin-top:4px">${dealer.type === 'repair' ? '제품 수리 대리점' : '구매 가능 대리점'}</div>
         </div>`
      )
      infoWin.current?.open(map.current, m)
    }
  }

  // 내 위치
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setCurrentPos(DEFAULT_POS)
      if (country !== 'KR') setCountry('KR')
      flyTo(DEFAULT_POS.lat, DEFAULT_POS.lng, 15)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const me = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: '현재 위치' }
        setCurrentPos(me)
        lastActionRef.current = 'locate'
        lastLocatedPosRef.current = { lat: me.lat, lng: me.lng }
        const detected = detectCountry(me.lat, me.lng)
        if (detected !== country) setCountry(detected)
        else { flyTo(me.lat, me.lng, 15); lastActionRef.current = null }
      },
      () => {
        setCurrentPos(DEFAULT_POS)
        if (country !== 'KR') setCountry('KR')
        flyTo(DEFAULT_POS.lat, DEFAULT_POS.lng, 15)
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 8000 }
    )
  }

  const chipClass = (active, color) => {
    if (color === 'blue') {
      return active
        ? '!bg-blue-600 !text-white !border-blue-600 dark:!bg-blue-500 dark:!border-blue-400'
        : '!bg-white !text-blue-700 !border-blue-600 hover:!bg-blue-50 ' +
          'dark:!bg-slate-800 dark:!text-blue-300 dark:!border-blue-400 dark:hover:!bg-slate-700'
    }
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
            <div className="ml-auto">
              <Button type="button" onClick={handleLocateMe} className="!bg-slate-900 !text-white dark:!bg-slate-700">
                내 위치
              </Button>
            </div>
          </div>

          {/* 타입 필터 (전체 제거) */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { key: 'repair', label: '제품 수리 대리점' },
              { key: 'sales',  label: '구매 가능 대리점' },
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

          {/* 가까운 순 리스트 */}
          <div className="mt-4" />
          <DealerList
            title={`${typeFilter === 'repair' ? '제품 수리 대리점' : '구매 가능 대리점'} (가까운 순)`}
            items={sortedDealers}
            onPick={focusDealer}
          />
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

/** 리스트(번호/주소/연락처/영업시간 포함) */
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
                       dark:border-slate-600 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100"
            title={`${d.name} — ${d.addr}`}
          >
            <div className="flex items-start gap-2">
              <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs font-bold bg-emerald-600 text-white dark:bg-emerald-500">
                {d.rank}
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold">{d.name}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{d.addr}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">📞 {d.phone || '-'}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">🕘 {d.hours || '-'}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{d.dist.toFixed(1)} km</div>
              </div>
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
