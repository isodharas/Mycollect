'use client'
import type { Bin } from '@/lib/types'
import { BIN_LOCATIONS } from '@/lib/data'
import PriorityBadge from './PriorityBadge'
import FillBar from './FillBar'
const C: Record<string,string> = {CRITICAL:'#C03030',HIGH:'#C86020',MEDIUM:'#A07800',LOW:'#2D5A3D'}
export default function BinCard({bin}:{bin:Bin}) {
  const c = C[bin.priority_label]
  return (
    <div className="glass2 card-lift relative overflow-hidden p-5">
      <div className="absolute top-0 inset-x-0 h-[3px] rounded-t-[18px]" style={{background:c}} />
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="serif font-bold text-[15px]" style={{color:'var(--t0)'}}>{bin.bin_id}</div>
          <div className="mono text-[9.5px] mt-0.5" style={{color:'var(--t4)'}}>📍 {BIN_LOCATIONS[bin.bin_id]}</div>
        </div>
        <PriorityBadge priority={bin.priority_label} />
      </div>
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="p-3 rounded-xl" style={{background:'rgba(255,255,255,.5)',border:'1px solid rgba(184,212,232,.3)'}}>
          <div className="mono text-[9px] uppercase tracking-[.12em] mb-1.5" style={{color:'var(--t4)'}}>Gas Level</div>
          <div className="serif font-bold text-[26px] leading-none" style={{color:c}}>
            {bin.gas_ppm}<span className="text-[11px] font-sans font-light ml-1" style={{color:'var(--t4)'}}>ppm</span>
          </div>
        </div>
        <div className="p-3 rounded-xl" style={{background:'rgba(255,255,255,.5)',border:'1px solid rgba(184,212,232,.3)'}}>
          <div className="mono text-[9px] uppercase tracking-[.12em] mb-1.5" style={{color:'var(--t4)'}}>Health Risk</div>
          <div className="serif font-bold text-[26px] leading-none" style={{color:c}}>
            {bin.health_risk}<span className="text-[11px] font-sans font-light" style={{color:'var(--t4)'}}>/100</span>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between mb-1.5">
          <span className="mono text-[9px] uppercase tracking-[.1em]" style={{color:'var(--t4)'}}>Fill Level</span>
          <span className="mono text-[9.5px]" style={{color:'var(--t3)'}}>{bin.fill_level}%</span>
        </div>
        <FillBar value={bin.fill_level} priority={bin.priority_label} label={false} />
      </div>
      <div className="flex items-center justify-between pt-3" style={{borderTop:'1px solid rgba(184,212,232,.25)'}}>
        <span className="mono text-[9.5px]" style={{color:'var(--t4)'}}>{bin.temperature}°C · {bin.humidity}% RH</span>
        <span className="mono text-[10px] font-medium" style={{color:'var(--tk)'}}>Details →</span>
      </div>
    </div>
  )
}
