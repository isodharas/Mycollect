'use client'
import { useState, useEffect } from 'react'
import type { Bin } from '@/lib/types'
import { BIN_LOCATIONS, BIN_LOCATIONS_SI } from '@/lib/data'
import PriorityBadge from './PriorityBadge'
import FillBar from './FillBar'
import { useLang } from '@/lib/LangContext'

const C: Record<string,string> = {CRITICAL:'#DC2626',HIGH:'#D97706',MEDIUM:'#CA8A04',LOW:'#2D7A4F'}

function TimeAgo({ iso }: { iso: string }) {
  const [label, setLabel] = useState('live')
  useEffect(() => {
    function calc() {
      try {
        const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
        if (s < 60) setLabel(`${s}s ago`)
        else if (s < 3600) setLabel(`${Math.floor(s/60)}m ago`)
        else setLabel(`${Math.floor(s/3600)}h ago`)
      } catch { setLabel('live') }
    }
    calc()
    const timer = setInterval(calc, 10000)
    return () => clearInterval(timer)
  }, [iso])
  return <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--g400)'}}>{label}</span>
}

export default function BinTable({ bins }: { bins: Bin[] }) {
  const { lang } = useLang()
  const si = lang === 'si'

  const headers = si
    ? ['කූඩු හැඳුනුම','ස්ථානය','ප්‍රමුඛතාව','පිරවීමේ මට්ටම','වායු PPM','සෞඛ්‍ය අවදානම','උෂ්ණත්වය','යාවත්කාලීන']
    : ['Bin ID','Location','Priority','Fill Level','Gas PPM','Health Risk','Temp','Updated']

  return (
    <div style={{overflowX:'auto'}}>
      <table className="data-table">
        <thead>
          <tr>{headers.map(h=><th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {bins.map(b=>(
            <tr key={b.bin_id}>
              <td>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontFamily:'var(--mono)',fontSize:12,fontWeight:500,color:'var(--g700)'}}>{b.bin_id}</span>
                  {(b as any).is_real && <span style={{fontFamily:'var(--mono)',fontSize:8,fontWeight:700,padding:'2px 6px',borderRadius:4,background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.3)',color:'#166534',letterSpacing:'.06em'}}>LIVE</span>}
                </div>
              </td>
              <td><span style={{fontSize:12.5,color:'var(--g500)'}}>{si ? (BIN_LOCATIONS_SI[b.bin_id]||BIN_LOCATIONS[b.bin_id]||'හෝමාගම') : (BIN_LOCATIONS[b.bin_id]||'Homagama')}</span></td>
              <td><PriorityBadge priority={b.priority_label} size="sm"/></td>
              <td style={{minWidth:140}}><FillBar value={b.fill_level} priority={b.priority_label}/></td>
              <td><span style={{fontFamily:'var(--mono)',fontSize:12,fontWeight:500,color:C[b.priority_label]}}>{b.gas_ppm}</span></td>
              <td>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:44,height:3,background:'rgba(45,122,79,0.12)',borderRadius:2,overflow:'hidden'}}>
                    <div style={{width:`${Math.min(b.health_risk,100)}%`,height:'100%',background:C[b.priority_label],borderRadius:2}}/>
                  </div>
                  <span style={{fontFamily:'var(--mono)',fontSize:11,color:C[b.priority_label],fontWeight:500}}>{b.health_risk}</span>
                </div>
              </td>
              <td><span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--g500)'}}>{b.temperature}°C</span></td>
              <td><TimeAgo iso={b.last_updated}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
