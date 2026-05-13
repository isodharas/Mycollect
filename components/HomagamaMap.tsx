'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import PriorityBadge from './PriorityBadge'
import type { Priority } from '@/lib/types'
import { useLang } from '@/lib/LangContext'

const API_BASE = 'https://g7oob1ovd6.execute-api.ap-southeast-2.amazonaws.com/prod'

const BINS_DEFAULT = [
  { id: 'BIN_001', lat: 6.8459, lng: 80.0004, priority: 'CRITICAL' as Priority, gas: 650, fill: 100, risk: 61.5, loc: 'Homagama North Market, Colombo Rd', locSi: 'හෝමාගම උතුරු වෙළඳපොළ, කොළඹ පාර' },
  { id: 'BIN_002', lat: 6.8478, lng: 80.0038, priority: 'HIGH' as Priority, gas: 109, fill: 82, risk: 32.3, loc: 'Homagama Junction, High Level Rd', locSi: 'හෝමාගම සන්ධිය, උසස් මට්ටම් පාර' },
  { id: 'BIN_003', lat: 6.8502, lng: 80.0015, priority: 'MEDIUM' as Priority, gas: 250, fill: 65, risk: 34.5, loc: 'Homagama Central Bus Stop', locSi: 'හෝමාගම මධ්‍යම බස් නැවතුම' },
  { id: 'BIN_004', lat: 6.8418, lng: 80.0052, priority: 'LOW' as Priority, gas: 90, fill: 28, risk: 14.7, loc: 'Homagama Hospital Entrance', locSi: 'හෝමාගම රෝහල් දොරටුව' },
  { id: 'BIN_005', lat: 6.8217, lng: 80.0434, priority: 'LOW' as Priority, gas: 32, fill: 0, risk: 2.24, loc: 'NSBM Green University, Pitipana', locSi: 'NSBM කොළඹ සරසවිය, පිටිපන' },
  { id: 'BIN_009', lat: 6.8467, lng: 79.9988, priority: 'CRITICAL' as Priority, gas: 480, fill: 95, risk: 62.1, loc: 'Mawatha Junction, Homagama', locSi: 'මාවත සන්ධිය, හෝමාගම' },
]

const C: Record<string, string> = { CRITICAL: '#DC2626', HIGH: '#D97706', MEDIUM: '#CA8A04', LOW: '#2D7A4F' }
const BG: Record<string, string> = { CRITICAL: '#FEF2F2', HIGH: '#FFFBEB', MEDIUM: '#FEFCE8', LOW: '#F0FDF4' }
const BD: Record<string, string> = { CRITICAL: '#FECACA', HIGH: '#FDE68A', MEDIUM: '#FEF08A', LOW: '#BBF7D0' }

type BinData = typeof BINS_DEFAULT[0]

export default function HomagamaMap() {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [bins, setBins] = useState<BinData[]>(BINS_DEFAULT)
  const [selected, setSelected] = useState<BinData | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const { lang } = useLang()
  const si = lang === 'si'

  const fetchAllBins = useCallback(async () => {
    try {
      const res = await fetch('/api/proxy/catchall?path=bin', { cache:'no-store' })
      const data = await res.json()
      const awsBins: any[] = Array.isArray(data) ? data : (data.bins || data.items || [])
      if (!awsBins.length) { setLastUpdated(new Date().toLocaleTimeString()); return }
      setBins(prev => prev.map(b => {
        const live = awsBins.find((a: any) => a.bin_id === b.id || a.bin_id === b.id.replace('_',''))
        if (!live) return b
        return {
          ...b,
          priority: live.priority_label as Priority,
          gas: Number(live.gas_ppm),
          fill: Number(live.fill_level),
          risk: Number(live.health_risk),
        }
      }))
      setLastUpdated(new Date().toLocaleTimeString())
    } catch { setBins(BINS_DEFAULT); setLastUpdated(new Date().toLocaleTimeString()) }
  }, [])

  useEffect(() => {
    fetchAllBins()
    const interval = setInterval(fetchAllBins, 30000)
    return () => clearInterval(interval)
  }, [fetchAllBins])

  // Rebuild markers whenever bins data updates
  useEffect(() => {
    if (!mapRef.current) return
    const L = (window as any)._L
    if (!L) return
    markersRef.current.forEach(m => { try { m.remove() } catch { } })
    markersRef.current = []
    bins.forEach(bin => {
      const col = C[bin.priority]
      const icon = L.divIcon({
        html: `<div style="position:relative;width:44px;height:44px">
          ${bin.priority === 'CRITICAL' || bin.priority === 'HIGH' ? `<div style="position:absolute;inset:-8px;border-radius:50%;background:${col};opacity:.18;animation:mapPulse 2s ease-out infinite"></div>` : ''}
          <div style="width:44px;height:44px;border-radius:50%;background:${col};border:3px solid white;box-shadow:0 3px 14px ${col}66;display:flex;align-items:center;justify-content:center;flex-direction:column;cursor:pointer;position:relative;z-index:2">
            <div style="font-size:8.5px;font-weight:700;color:white;font-family:DM Mono,monospace;line-height:1">${bin.fill}%</div>
            <div style="font-size:7px;color:rgba(255,255,255,.8);font-family:DM Mono,monospace;line-height:1;margin-top:1px">${bin.id.replace('BIN_', '')}</div>
          </div>
        </div>`,
        className: '', iconSize: [44, 44], iconAnchor: [22, 22],
      })
      const marker = L.marker([bin.lat, bin.lng], { icon }).addTo(mapRef.current)
      marker.on('click', () => {
        setSelected(bin)
        if (bin.id !== 'BIN_005') mapRef.current.panTo([bin.lat, bin.lng])
      })
      markersRef.current.push(marker)
    })
  }, [bins])

  useEffect(() => {
    if (!ref.current || mapRef.current) return
    const L = require('leaflet')
    require('leaflet/dist/leaflet.css')
      ; (window as any)._L = L

    const map = L.map(ref.current, { center: [6.8460, 80.0010], zoom: 15, zoomControl: false })
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>', maxZoom: 19
    }).addTo(map)
    mapRef.current = map
    return () => { try { map.remove() } catch { }; mapRef.current = null }
  }, [])

  const labels = {
    gasLevel: si ? 'වායු මට්ටම' : 'Gas Level',
    fillLevel: si ? 'පිරවීමේ මට්ටම' : 'Fill Level',
    healthRisk: si ? 'සෞඛ්‍ය අවදානම' : 'Health Risk',
    status: si ? 'තත්ත්වය' : 'Status',
    riskScore: si ? 'අවදානම් ලකුණු' : 'Health Risk Score',
    viewDetails: si ? 'සම්පූර්ණ විස්තර' : 'View Full Details',
    close: si ? 'වසන්න' : 'Close',
    liveLabel: si ? 'සජීව දත්ත' : 'Live Data',
  }

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <style>{`
        @keyframes mapPulse{0%{transform:scale(.8);opacity:.5}100%{transform:scale(2.2);opacity:0}}
        .leaflet-control-zoom{border:none!important;box-shadow:0 4px 16px rgba(0,0,0,.12)!important}
        .leaflet-control-zoom a{font-family:Plus Jakarta Sans,sans-serif!important;font-weight:700!important;border-radius:8px!important;color:#2D7A4F!important}
        .leaflet-control-attribution{font-size:9px!important;background:rgba(255,255,255,.7)!important}
      `}</style>
      <div ref={ref} style={{ height: '100%', width: '100%', borderRadius: 'inherit' }} />

      {lastUpdated && (
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, background: 'rgba(255,255,255,0.92)', borderRadius: 6, padding: '4px 10px', fontSize: 10, fontFamily: 'monospace', color: '#2D7A4F', border: '1px solid rgba(45,122,79,0.2)' }}>
          🟢 {labels.liveLabel} · {lastUpdated}
        </div>
      )}

      {selected && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000,
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderTop: `3px solid ${C[selected.priority]}`,
          padding: '16px 18px',
          animation: 'slideUp .25s cubic-bezier(.16,1,.3,1)',
          boxShadow: '0 -8px 32px rgba(26,51,40,.15)',
        }}>
          <style>{`@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 600, color: '#1A3328' }}>{selected.id}</span>
                <PriorityBadge priority={selected.priority} />
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#6B8C6B' }}>{si ? selected.locSi : selected.loc}</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(237,247,241,0.9)', border: '1px solid rgba(45,122,79,.15)', cursor: 'pointer', fontSize: 16, color: '#4A8C28', flexShrink: 0 }}>×</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
            {[
              { l: labels.gasLevel, v: `${selected.gas}`, u: 'ppm', c: C[selected.priority] },
              { l: labels.fillLevel, v: `${selected.fill}`, u: '%', c: C[selected.priority] },
              { l: labels.healthRisk, v: `${selected.risk}`, u: '/100', c: C[selected.priority] },
              { l: labels.status, v: selected.priority, u: '', c: C[selected.priority] },
            ].map(x => (
              <div key={x.l} style={{ background: BG[selected.priority], borderRadius: 8, padding: '10px 12px', border: `1px solid ${BD[selected.priority]}` }}>
                <div style={{ fontFamily: 'monospace', fontSize: 8, color: '#6B8C6B', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>{x.l}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: x.c, lineHeight: 1 }}>{x.v}<span style={{ fontSize: 10, fontWeight: 400, color: '#6B8C6B' }}>{x.u}</span></div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#6B8C6B' }}>{labels.riskScore}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 9, color: C[selected.priority], fontWeight: 600 }}>{selected.risk}/100</span>
            </div>
            <div style={{ height: 5, background: 'rgba(45,122,79,.1)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${selected.risk}%`, height: '100%', background: C[selected.priority], borderRadius: 3, transition: 'width .6s' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href="/bins" style={{ flex: 1, padding: '9px', borderRadius: 9, background: `linear-gradient(135deg,${C[selected.priority]},${C[selected.priority]}cc)`, color: 'white', fontWeight: 700, fontSize: 12, textDecoration: 'none', textAlign: 'center' }}>
              {labels.viewDetails}
            </a>
            <button onClick={() => setSelected(null)} style={{ padding: '9px 16px', borderRadius: 9, background: 'rgba(237,247,241,.9)', border: '1px solid rgba(45,122,79,.15)', color: '#4A8C28', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {labels.close}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}