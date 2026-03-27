'use client'
import { useEffect, useRef, useState } from 'react'
import PriorityBadge from './PriorityBadge'
import type { Priority } from '@/lib/types'

const BINS = [
  { id:'BIN_001', lat:6.8459, lng:80.0004, priority:'CRITICAL' as Priority, gas:650, fill:100, risk:61.5, loc:'Homagama North Market, Colombo Rd' },
  { id:'BIN_005', lat:6.8441, lng:80.0021, priority:'CRITICAL' as Priority, gas:520, fill:98,  risk:57.6, loc:'Homagama Bus Stand, Station Rd' },
  { id:'BIN_009', lat:6.8467, lng:79.9988, priority:'CRITICAL' as Priority, gas:480, fill:95,  risk:52.5, loc:'Mawatha Junction, Homagama' },
  { id:'BIN_002', lat:6.8478, lng:80.0038, priority:'HIGH'     as Priority, gas:109, fill:82,  risk:32.3, loc:'Homagama Junction, High Level Rd' },
  { id:'BIN_006', lat:6.8432, lng:79.9971, priority:'HIGH'     as Priority, gas:134, fill:78,  risk:32.8, loc:'Galawila Junction, Homagama' },
  { id:'BIN_008', lat:6.8455, lng:80.0068, priority:'HIGH'     as Priority, gas:128, fill:75,  risk:31.9, loc:'Homagama South, Level Rd' },
  { id:'BIN_003', lat:6.8502, lng:80.0015, priority:'MEDIUM'   as Priority, gas:250, fill:65,  risk:34.5, loc:'Homagama Town Center, Main St' },
  { id:'BIN_007', lat:6.8488, lng:79.9959, priority:'MEDIUM'   as Priority, gas:200, fill:55,  risk:28.0, loc:'Courts Road Junction, Homagama' },
  { id:'BIN_010', lat:6.8422, lng:80.0088, priority:'LOW'      as Priority, gas:45,  fill:28,  risk:7.2,  loc:'Homagama East, AA004' },
  { id:'BIN_011', lat:6.8511, lng:80.0042, priority:'LOW'      as Priority, gas:38,  fill:22,  risk:6.1,  loc:'Wiimana Junction, Homagama' },
  { id:'BIN_004', lat:6.8418, lng:80.0052, priority:'MEDIUM'   as Priority, gas:180, fill:60,  risk:30.5, loc:'Homagama Hospital Entrance' },
  { id:'BIN_012', lat:6.8398, lng:79.9995, priority:'LOW'      as Priority, gas:40,  fill:25,  risk:7.8,  loc:'Hospital Junction, Homagama' },
]

const C: Record<string,string> = { CRITICAL:'#DC2626', HIGH:'#D97706', MEDIUM:'#CA8A04', LOW:'#2D7A4F' }
const BG: Record<string,string> = { CRITICAL:'#FEF2F2', HIGH:'#FFFBEB', MEDIUM:'#FEFCE8', LOW:'#F0FDF4' }
const BD: Record<string,string> = { CRITICAL:'#FECACA', HIGH:'#FDE68A', MEDIUM:'#FEF08A', LOW:'#BBF7D0' }

export default function HomagamaMap() {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [selected, setSelected] = useState<typeof BINS[0] | null>(null)

  useEffect(() => {
    if (!ref.current || mapRef.current) return
    const L = require('leaflet')
    require('leaflet/dist/leaflet.css')

    const map = L.map(ref.current, { center:[6.8460,80.0010], zoom:15, zoomControl:false })
    L.control.zoom({ position:'bottomright' }).addTo(map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:'© <a href="https://openstreetmap.org">OpenStreetMap</a>', maxZoom:19
    }).addTo(map)

    BINS.forEach(bin => {
      const col = C[bin.priority]
      const icon = L.divIcon({
        html:`<div style="position:relative;width:44px;height:44px">
          ${bin.priority==='CRITICAL'||bin.priority==='HIGH'?`<div style="position:absolute;inset:-8px;border-radius:50%;background:${col};opacity:.18;animation:mapPulse 2s ease-out infinite"></div>`:''}
          <div style="width:44px;height:44px;border-radius:50%;background:${col};border:3px solid white;box-shadow:0 3px 14px ${col}66;display:flex;align-items:center;justify-content:center;flex-direction:column;cursor:pointer;position:relative;z-index:2">
            <div style="font-size:8.5px;font-weight:700;color:white;font-family:DM Mono,monospace;line-height:1">${bin.fill}%</div>
            <div style="font-size:7px;color:rgba(255,255,255,.8);font-family:DM Mono,monospace;line-height:1;margin-top:1px">${bin.id.replace('BIN_','')}</div>
          </div>
        </div>`,
        className:'', iconSize:[44,44], iconAnchor:[22,22],
      })
      const marker = L.marker([bin.lat,bin.lng],{icon}).addTo(map)
      marker.on('click', () => {
        setSelected(bin)
        map.panTo([bin.lat, bin.lng])
      })
    })

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  return (
    <div style={{position:'relative',height:'100%',width:'100%'}}>
      <style>{`
        @keyframes mapPulse{0%{transform:scale(.8);opacity:.5}100%{transform:scale(2.2);opacity:0}}
        .leaflet-control-zoom{border:none!important;box-shadow:0 4px 16px rgba(0,0,0,.12)!important}
        .leaflet-control-zoom a{font-family:Plus Jakarta Sans,sans-serif!important;font-weight:700!important;border-radius:8px!important;color:var(--g700)!important}
        .leaflet-control-attribution{font-size:9px!important;background:rgba(255,255,255,.7)!important}
      `}</style>
      <div ref={ref} style={{height:'100%',width:'100%',borderRadius:'inherit'}}/>

      {/* Inline bin detail panel — slides up from bottom of map */}
      {selected && (
        <div style={{
          position:'absolute',bottom:0,left:0,right:0,zIndex:1000,
          background:'rgba(255,255,255,0.96)',
          backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',
          borderTop:`3px solid ${C[selected.priority]}`,
          padding:'16px 18px',
          animation:'slideUp .25s cubic-bezier(.16,1,.3,1)',
          boxShadow:'0 -8px 32px rgba(26,51,40,.15)',
        }}>
          <style>{`@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                <span style={{fontFamily:'var(--mono)',fontSize:14,fontWeight:600,color:'var(--g700)'}}>{selected.id}</span>
                <PriorityBadge priority={selected.priority}/>
              </div>
              <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--g400)'}}>{selected.loc}</div>
            </div>
            <button onClick={()=>setSelected(null)} style={{width:28,height:28,borderRadius:7,background:'rgba(237,247,241,0.9)',border:'1px solid rgba(45,122,79,.15)',cursor:'pointer',fontSize:16,color:'var(--g500)',flexShrink:0}}>×</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>
            {[
              {l:'Gas Level',v:`${selected.gas}`,u:'ppm',c:C[selected.priority]},
              {l:'Fill Level',v:`${selected.fill}`,u:'%',c:C[selected.priority]},
              {l:'Health Risk',v:`${selected.risk}`,u:'/100',c:C[selected.priority]},
              {l:'Status',v:selected.priority,u:'',c:C[selected.priority]},
            ].map(x=>(
              <div key={x.l} style={{background:BG[selected.priority],borderRadius:8,padding:'10px 12px',border:`1px solid ${BD[selected.priority]}`}}>
                <div style={{fontFamily:'var(--mono)',fontSize:8,color:'var(--g400)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:3}}>{x.l}</div>
                <div style={{fontFamily:'var(--sans)',fontSize:18,fontWeight:800,color:x.c,lineHeight:1}}>{x.v}<span style={{fontSize:10,fontWeight:400,color:'var(--g400)'}}>{x.u}</span></div>
              </div>
            ))}
          </div>
          <div style={{marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--g400)'}}>Health Risk Score</span>
              <span style={{fontFamily:'var(--mono)',fontSize:9,color:C[selected.priority],fontWeight:600}}>{selected.risk}/100</span>
            </div>
            <div style={{height:5,background:'rgba(45,122,79,.1)',borderRadius:3,overflow:'hidden'}}>
              <div style={{width:`${selected.risk}%`,height:'100%',background:C[selected.priority],borderRadius:3,transition:'width .6s'}}/>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <a href="/bins" style={{flex:1,padding:'9px',borderRadius:9,background:`linear-gradient(135deg,${C[selected.priority]},${C[selected.priority]}cc)`,color:'white',fontWeight:700,fontSize:12,textDecoration:'none',textAlign:'center',fontFamily:'var(--sans)'}}>
              View Full Details
            </a>
            <button onClick={()=>setSelected(null)} style={{padding:'9px 16px',borderRadius:9,background:'rgba(237,247,241,.9)',border:'1px solid rgba(45,122,79,.15)',color:'var(--g500)',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'var(--sans)'}}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
