'use client'
import { useState, useEffect, useRef } from 'react'
import { useLang } from '@/lib/LangContext'
import { getAllBins } from '@/lib/api'
import { MOCK_BINS, BIN_LOCATIONS } from '@/lib/data'
import type { Bin, Priority } from '@/lib/types'
import PriorityBadge from '@/components/PriorityBadge'

const PC: Record<string,string> = {CRITICAL:'#DC2626',HIGH:'#D97706',MEDIUM:'#CA8A04',LOW:'#2D7A4F'}

const BIN_COORDS: Record<string,[number,number]> = {
  BIN_001:[6.8459,80.0004], BIN_002:[6.8478,80.0038], BIN_003:[6.8502,80.0015],
  BIN_004:[6.8418,80.0052], BIN_005:[6.8441,80.0021], BIN_006:[6.8432,79.9971],
  BIN_007:[6.8488,79.9959], BIN_008:[6.8455,80.0068], BIN_009:[6.8467,79.9988],
  BIN_010:[6.8422,80.0088], BIN_011:[6.8511,80.0042], BIN_012:[6.8398,79.9995],
}
const DEPOT: [number,number] = [6.8440, 80.0030]

export default function RoutesPage() {
  const { lang } = useLang()
  const si = lang === 'si'
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInst = useRef<any>(null)
  const routeLine = useRef<any>(null)
  const truckMarker = useRef<any>(null)
  const binMarkersRef = useRef<any[]>([])
  const animRef = useRef<number>(0)

  const [bins, setBins] = useState<Bin[]>(MOCK_BINS)
  const [todayRoute, setTodayRoute] = useState<(Bin & {collected:boolean})[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [truckAtStop, setTruckAtStop] = useState(-1)

  useEffect(() => {
    getAllBins().then(b => { if (b?.length) setBins(b) }).catch(() => {})
  }, [])

  // Build today's route: only CRITICAL and HIGH bins
  useEffect(() => {
    const urgent = bins
      .filter(b => b.priority_label === 'CRITICAL' || b.priority_label === 'HIGH')
      .sort((a, b) => b.health_risk - a.health_risk)
      .map(b => ({...b, collected: false}))
    setTodayRoute(urgent)
  }, [bins])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInst.current) return
    const L = require('leaflet')
    require('leaflet/dist/leaflet.css')
    const map = L.map(mapRef.current, { center: DEPOT, zoom: 15, zoomControl: false })
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '\u00a9 OpenStreetMap', maxZoom: 19
    }).addTo(map)
    // Depot
    const depotIcon = L.divIcon({
      html: '<div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#2E86C1,#1A5276);border:3px solid white;box-shadow:0 4px 14px rgba(46,134,193,0.45);display:flex;align-items:center;justify-content:center;color:white;font-size:13px;font-weight:800">D</div>',
      className: '', iconSize: [36,36], iconAnchor: [18,18],
    })
    L.marker(DEPOT, { icon: depotIcon }).addTo(map)
    mapInst.current = map
    return () => { map.remove(); mapInst.current = null }
  }, [])

  // Draw route when todayRoute changes
  useEffect(() => {
    if (!mapInst.current || !todayRoute.length) return
    const L = require('leaflet')
    const map = mapInst.current

    // Clear old
    binMarkersRef.current.forEach(m => m.remove())
    binMarkersRef.current = []
    if (routeLine.current) routeLine.current.remove()
    if (truckMarker.current) truckMarker.current.remove()

    // Points
    const pts: [number,number][] = [DEPOT]
    todayRoute.forEach(b => { const c = BIN_COORDS[b.bin_id]; if (c) pts.push(c) })
    pts.push(DEPOT)

    // Route line - clean solid line
    routeLine.current = L.polyline(pts, {
      color: '#2E86C1', weight: 4, opacity: 0.8, smoothFactor: 1.5,
      dashArray: '12 8',
    }).addTo(map)

    // Bin markers
    todayRoute.forEach((bin, idx) => {
      const c = BIN_COORDS[bin.bin_id]
      if (!c) return
      const col = bin.collected ? '#22C55E' : PC[bin.priority_label]
      const icon = L.divIcon({
        html: '<div style="width:42px;height:42px;border-radius:50%;background:' + col + ';border:3px solid white;box-shadow:0 4px 14px ' + col + '55;display:flex;align-items:center;justify-content:center;font-family:DM Mono,monospace;font-size:12px;font-weight:700;color:white">' + (bin.collected ? '\u2713' : (idx+1)) + '</div>',
        className: '', iconSize: [42,42], iconAnchor: [21,21],
      })
      const m = L.marker(c, { icon }).addTo(map)
      m.bindPopup(
        '<div style="font-family:Plus Jakarta Sans;padding:4px;min-width:160px">' +
        '<div style="font-weight:800;font-size:14px;margin-bottom:4px">Stop ' + (idx+1) + ' — ' + bin.bin_id + '</div>' +
        '<div style="font-family:DM Mono;font-size:10px;color:#5B8FA8;margin-bottom:8px">' + (BIN_LOCATIONS[bin.bin_id]||'Homagama') + '</div>' +
        '<div style="display:flex;gap:12px">' +
        '<div><span style="font-family:DM Mono;font-size:8px;color:#5B8FA8">GAS</span><br/><b style="font-size:16px;color:' + col + '">' + bin.gas_ppm + '</b> <span style="font-size:9px;color:#5B8FA8">ppm</span></div>' +
        '<div><span style="font-family:DM Mono;font-size:8px;color:#5B8FA8">FILL</span><br/><b style="font-size:16px;color:' + col + '">' + bin.fill_level + '%</b></div>' +
        '<div><span style="font-family:DM Mono;font-size:8px;color:#5B8FA8">RISK</span><br/><b style="font-size:16px;color:' + col + '">' + bin.health_risk + '</b></div>' +
        '</div></div>'
      )
      binMarkersRef.current.push(m)
    })

    // Truck
    const truckIcon = L.divIcon({
      html: '<div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#22C55E,#166534);border:3px solid white;box-shadow:0 6px 20px rgba(34,197,94,0.5);display:flex;align-items:center;justify-content:center;font-size:18px;z-index:9999">\ud83d\ude9b</div>',
      className: '', iconSize: [40,40], iconAnchor: [20,20],
    })
    truckMarker.current = L.marker(DEPOT, { icon: truckIcon, zIndexOffset: 2000 }).addTo(map)
    map.fitBounds(L.latLngBounds(pts), { padding: [50,50] })
  }, [todayRoute])

  // Animate truck
  const dispatchTruck = () => {
    if (!mapInst.current || !truckMarker.current || isAnimating) return
    setIsAnimating(true)
    setTruckAtStop(-1)
    // Reset all to uncollected
    setTodayRoute(prev => prev.map(b => ({...b, collected: false})))

    const pts: [number,number][] = [DEPOT]
    todayRoute.forEach(b => { const c = BIN_COORDS[b.bin_id]; if (c) pts.push(c) })
    pts.push(DEPOT)

    let seg = 0, prog = 0
    const speed = 0.015

    function step() {
      if (seg >= pts.length - 1) {
        setIsAnimating(false)
        setTruckAtStop(todayRoute.length)
        return
      }
      prog += speed
      if (prog >= 1) {
        prog = 0
        seg++
        if (seg > 0 && seg <= todayRoute.length) {
          setTruckAtStop(seg - 1)
          setTodayRoute(prev => prev.map((b, i) => i < seg ? {...b, collected: true} : b))
        }
        if (seg >= pts.length - 1) { setIsAnimating(false); return }
      }
      const f = pts[seg], t = pts[seg + 1]
      const lat = f[0] + (t[0] - f[0]) * prog
      const lng = f[1] + (t[1] - f[1]) * prog
      truckMarker.current.setLatLng([lat, lng])
      animRef.current = requestAnimationFrame(step)
    }
    truckMarker.current.setLatLng(DEPOT)
    animRef.current = requestAnimationFrame(step)
  }

  const markCollected = (idx: number) => {
    setTodayRoute(prev => prev.map((b, i) => i === idx ? {...b, collected: !b.collected} : b))
  }

  const collectedCount = todayRoute.filter(b => b.collected).length

  return (
    <div className="flex flex-col gap-4">
      <style>{`
        @keyframes pulse{0%{transform:scale(0.8);opacity:0.5}100%{transform:scale(2.5);opacity:0}}
        .leaflet-control-zoom{border:none!important;box-shadow:0 4px 16px rgba(0,0,0,0.12)!important;border-radius:10px!important;overflow:hidden!important}
        .leaflet-control-zoom a{border-radius:0!important}
        .leaflet-popup-content-wrapper{border-radius:14px!important;box-shadow:0 20px 60px rgba(0,0,0,0.15)!important;border:1px solid rgba(255,255,255,0.8)!important}
        .leaflet-popup-content{margin:12px!important}
        .leaflet-popup-tip-container{display:none!important}
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F2A3D] tracking-tight">
            {si ? 'එකතු කිරීමේ මාර්ග' : 'Collection Routes'}
          </h1>
          <p className="font-mono text-[10px] text-[#5B8FA8] mt-1">
            {si ? 'අවදානම් සහ ඉහළ ප්‍රමුඛතා කූඩු පමණක් · සෞඛ්‍ය අවදානම අනුව' : 'CRITICAL + HIGH bins only · sorted by health risk · ' + todayRoute.length + ' stops today'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={dispatchTruck} disabled={isAnimating}
            className="px-5 py-2.5 rounded-xl font-semibold text-[13px] text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{background:'linear-gradient(135deg,#22C55E,#166534)',boxShadow:'0 4px 16px rgba(34,197,94,0.35)'}}>
            {isAnimating ? (si?'ගමන් කරමින්...':'Truck Moving...') : (si?'ට්‍රක් රථය යවන්න':'Dispatch Truck')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {l:si?'අද නැවතුම්':'Today\'s Stops', v:todayRoute.length, c:'#2E86C1'},
          {l:si?'එකතු කළ':'Collected', v:collectedCount + '/' + todayRoute.length, c:'#22C55E'},
          {l:si?'ඉතිරි':'Remaining', v:todayRoute.length - collectedCount, c:todayRoute.length - collectedCount > 0 ? '#DC2626' : '#22C55E'},
          {l:si?'ඇස්තමේන්තු කාලය':'Est. Time', v: Math.round(todayRoute.length * 5) + ' min', c:'#D97706'},
        ].map(s => (
          <div key={s.l} className="glass-card px-4 py-3">
            <div className="font-mono text-[9px] uppercase tracking-widest mb-1.5" style={{color:s.c+'99'}}>{s.l}</div>
            <div className="text-2xl font-extrabold" style={{color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Map + Route panel */}
      <div className="grid gap-0 rounded-2xl overflow-hidden" style={{gridTemplateColumns:'1fr 360px',height:520,border:'1px solid rgba(255,255,255,0.6)',boxShadow:'0 8px 40px rgba(15,42,61,0.08)'}}>
        <div className="relative overflow-hidden">
          <div ref={mapRef} style={{height:'100%',width:'100%'}} />
          <div className="absolute top-3.5 left-3.5 z-[1000] px-3.5 py-2 rounded-xl"
            style={{background:'rgba(255,255,255,0.92)',backdropFilter:'blur(12px)',border:'1px solid rgba(255,255,255,0.8)',boxShadow:'0 4px 16px rgba(15,42,61,0.1)'}}>
            <div className="font-bold text-[13px] text-[#0F2A3D]">{si?'සජීව මාර්ග සිතියම':'Live Route Map'}</div>
            <div className="font-mono text-[9px] text-[#5B8FA8] mt-0.5">
              {si?'ඩිපෝව → අවදානම් කූඩු → ඩිපෝව':'Depot → CRITICAL/HIGH bins → Depot'}
            </div>
          </div>
          {/* Legend */}
          <div className="absolute bottom-3.5 left-3.5 z-[1000] px-3 py-2 rounded-xl"
            style={{background:'rgba(255,255,255,0.92)',backdropFilter:'blur(12px)',border:'1px solid rgba(255,255,255,0.8)'}}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{background:'#DC2626'}}/><span className="font-mono text-[9px] text-[#5B8FA8]">Critical</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{background:'#D97706'}}/><span className="font-mono text-[9px] text-[#5B8FA8]">High</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{background:'#22C55E'}}/><span className="font-mono text-[9px] text-[#5B8FA8]">Collected</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gradient-to-r from-[#2E86C1] to-[#1A5276]"/><span className="font-mono text-[9px] text-[#5B8FA8]">Depot</span></div>
            </div>
          </div>
        </div>

        {/* Route panel */}
        <div className="flex flex-col overflow-hidden" style={{background:'rgba(255,255,255,0.55)',backdropFilter:'blur(16px)',borderLeft:'1px solid rgba(255,255,255,0.5)'}}>
          <div className="px-4 py-3 flex-shrink-0" style={{borderBottom:'1px solid rgba(46,134,193,0.1)'}}>
            <div className="font-bold text-[14px] text-[#0F2A3D]">{si?'අද එකතු කිරීමේ අනුපිළිවෙල':'Today\'s Collection Order'}</div>
            <div className="font-mono text-[9px] text-[#5B8FA8] mt-0.5">
              {si?'අවදානම් සහ ඉහළ ප්‍රමුඛතා පමණක්':'CRITICAL + HIGH priority only · tap to mark collected'}
            </div>
            {/* Progress bar */}
            <div className="mt-2.5 h-2 rounded-full overflow-hidden" style={{background:'rgba(46,134,193,0.1)'}}>
              <div className="h-full rounded-full transition-all duration-500" style={{width: todayRoute.length ? (collectedCount/todayRoute.length*100)+'%' : '0%', background:'linear-gradient(90deg,#22C55E,#166534)'}} />
            </div>
            <div className="font-mono text-[9px] text-[#5B8FA8] mt-1">{collectedCount}/{todayRoute.length} {si?'එකතු කළා':'collected'}</div>
          </div>

          {/* Depot start */}
          <div className="px-4 py-2.5 flex items-center gap-3 flex-shrink-0" style={{background:'rgba(46,134,193,0.05)',borderBottom:'1px solid rgba(46,134,193,0.08)'}}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{background:'linear-gradient(135deg,#2E86C1,#1A5276)'}}>D</div>
            <div>
              <div className="text-[12px] font-semibold text-[#0F2A3D]">{si?'එකතු කිරීමේ ඩිපෝව':'Collection Depot'}</div>
              <div className="font-mono text-[9px] text-[#5B8FA8]">{si?'හෝමාගම නාගරික කාර්යාලය':'Homagama Municipal Office'}</div>
            </div>
          </div>

          {/* Stops */}
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {todayRoute.map((bin, idx) => (
              <button key={bin.bin_id} onClick={() => markCollected(idx)}
                className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl mb-1.5 transition-all hover:-translate-x-0.5"
                style={{
                  background: bin.collected ? 'rgba(34,197,94,0.08)' : truckAtStop === idx ? PC[bin.priority_label]+'12' : 'rgba(255,255,255,0.5)',
                  border: '1px solid ' + (bin.collected ? 'rgba(34,197,94,0.25)' : truckAtStop === idx ? PC[bin.priority_label]+'33' : 'rgba(255,255,255,0.6)'),
                  borderLeft: '4px solid ' + (bin.collected ? '#22C55E' : PC[bin.priority_label]),
                  opacity: bin.collected ? 0.65 : 1,
                  textDecoration: bin.collected ? 'line-through' : 'none',
                }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
                  style={{background: bin.collected ? '#22C55E' : PC[bin.priority_label]}}>
                  {bin.collected ? '\u2713' : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-[11px] font-semibold text-[#0F2A3D]" style={{textDecoration: bin.collected?'line-through':'none'}}>{bin.bin_id}</span>
                    <PriorityBadge priority={bin.priority_label} size="sm" />
                    {(bin as any).is_real && <span className="font-mono text-[7px] font-bold px-1.5 py-0.5 rounded text-green-700" style={{background:'rgba(34,197,94,0.12)'}}>LIVE</span>}
                  </div>
                  <div className="font-mono text-[9px] text-[#5B8FA8] truncate">{BIN_LOCATIONS[bin.bin_id] || 'Homagama'}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-mono text-[9px]" style={{color:PC[bin.priority_label]}}>{bin.gas_ppm} PPM</span>
                    <span className="font-mono text-[9px]" style={{color:PC[bin.priority_label]}}>{bin.fill_level}%</span>
                    <span className="font-mono text-[9px]" style={{color:PC[bin.priority_label]}}>Risk {bin.health_risk}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all"
                  style={{
                    borderColor: bin.collected ? '#22C55E' : 'rgba(46,134,193,0.2)',
                    background: bin.collected ? '#22C55E' : 'transparent',
                    color: bin.collected ? 'white' : 'transparent',
                    fontSize: 12,
                  }}>
                  {bin.collected && '\u2713'}
                </div>
              </button>
            ))}
          </div>

          {/* Depot return */}
          <div className="px-4 py-2.5 flex items-center gap-3 flex-shrink-0" style={{background:'rgba(46,134,193,0.05)',borderTop:'1px solid rgba(46,134,193,0.08)'}}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{background:'linear-gradient(135deg,#2E86C1,#1A5276)'}}>D</div>
            <div>
              <div className="text-[12px] font-semibold text-[#0F2A3D]">{si?'ඩිපෝවට ආපසු':'Return to Depot'}</div>
              <div className="font-mono text-[9px] text-[#5B8FA8]">{si?'මාර්ගය සම්පූර්ණයි':'Route complete'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Route Intelligence */}
      <div className="glass p-5">
        <div className="font-bold text-[14px] text-[#0F2A3D] mb-3">{si?'මාර්ග බුද්ධිය':'Route Intelligence'}</div>
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-[#DC2626] mb-2">{si?'සෞඛ්‍ය-ප්‍රථම ප්‍රමුඛතාගත කිරීම':'Health-First Prioritization'}</div>
            <p className="text-[12px] text-[#2E5266] leading-relaxed">
              {si?'CRITICAL සහ HIGH කූඩු පමණක් අද එකතු කෙරේ. වායු PPM 70% බරින් යුක්තය — භෞතික පිරවීම 30% පමණි.'
                :'Only CRITICAL and HIGH bins are collected today. Gas PPM carries 70% weight — physical fill level is only 30%. Toxic air is the real threat.'}
            </p>
          </div>
          <div className="glass-card p-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-[#2E86C1] mb-2">{si?'සජීව ලුහුබැඳීම':'Live Tracking'}</div>
            <p className="text-[12px] text-[#2E5266] leading-relaxed">
              {si?'ට්‍රක් රථය යවා එක් එක් නැවතුමේ ප්‍රගතිය නිරීක්ෂණය කරන්න. එකතු කළ කූඩු ස්වයංක්‍රීයව කොළ පැහැයට හැරේ.'
                :'Dispatch the truck and track progress at each stop. Collected bins automatically turn green. Click any stop to manually mark as collected.'}
            </p>
          </div>
          <div className="glass-card p-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-[#4CAF72] mb-2">{si?'ඉන්ධන ප්‍රශස්තකරණය':'Fuel Optimization'}</div>
            <p className="text-[12px] text-[#2E5266] leading-relaxed">
              {si?'LOW සහ MEDIUM කූඩු මඟ හැරේ — ඉන්ධන 17% ක් ඉතිරි කරයි. හෙට මාර්ගය ML නැවත වර්ගීකරණය මත පදනම්ව වෙනස් විය හැක.'
                :'LOW and MEDIUM bins are skipped — saving 17% fuel. Tomorrow\'s route may change based on ML reclassification every 15 minutes.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
