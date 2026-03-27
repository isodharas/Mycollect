'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getAllBins, getDashboardStats } from '@/lib/api'
import { MOCK_BINS, MOCK_STATS } from '@/lib/data'
import type { Bin } from '@/lib/types'
import { useLang } from '@/lib/LangContext'
import PriorityBadge from '@/components/PriorityBadge'
import DashboardCharts from '@/components/DashboardCharts'
import BinTable from '@/components/BinTable'

const Map = dynamic(() => import('@/components/HomagamaMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-sky-50/50">
      <span className="font-mono text-[11px] text-sky-400 tracking-widest">Loading map...</span>
    </div>
  )
})

const PC: Record<string,string> = {CRITICAL:'#DC2626',HIGH:'#D97706',MEDIUM:'#CA8A04',LOW:'#2D7A4F'}
const PBG: Record<string,string> = {CRITICAL:'rgba(220,38,38,.06)',HIGH:'rgba(217,119,6,.06)',MEDIUM:'rgba(202,138,4,.06)',LOW:'rgba(45,122,79,.06)'}
const PBD: Record<string,string> = {CRITICAL:'rgba(220,38,38,.18)',HIGH:'rgba(217,119,6,.18)',MEDIUM:'rgba(202,138,4,.18)',LOW:'rgba(45,122,79,.18)'}

const SCHED = [
  {t:'09:00',bins:'BIN_001 + BIN_005',zone:'North Zone · Truck 4',zSi:'උතුරු කලාපය · ට්‍රක් 4',p:'CRITICAL' as const},
  {t:'11:30',bins:'BIN_002 + BIN_006',zone:'East Zone · Truck 2',zSi:'නැගෙනහිර · ට්‍රක් 2',p:'HIGH' as const},
  {t:'14:00',bins:'BIN_003 + BIN_004',zone:'Central · Truck 1',zSi:'මධ්‍යම · ට්‍රක් 1',p:'MEDIUM' as const},
]

const DEFAULT_STATS = {
  total_bins:12, by_priority:{LOW:2,MEDIUM:3,HIGH:4,CRITICAL:3},
  average_health_risk:34.2, average_fill_level:69.5,
  needs_immediate_attention:3, needs_attention_soon:4,
  critical_bins:[] as any[], high_priority_bins:[] as any[],
}

function normalizeStats(raw:any) {
  if (!raw) return DEFAULT_STATS
  return {
    total_bins: raw.total_bins??raw.totalBins??12,
    by_priority: {
      CRITICAL: raw.by_priority?.CRITICAL??raw.byPriority?.CRITICAL??raw.critical??3,
      HIGH:     raw.by_priority?.HIGH??raw.byPriority?.HIGH??raw.high??4,
      MEDIUM:   raw.by_priority?.MEDIUM??raw.byPriority?.MEDIUM??raw.medium??3,
      LOW:      raw.by_priority?.LOW??raw.byPriority?.LOW??raw.low??2,
    },
    average_health_risk: raw.average_health_risk??raw.avgHealthRisk??34.2,
    average_fill_level:  raw.average_fill_level??raw.avgFillLevel??69.5,
    needs_immediate_attention: raw.needs_immediate_attention??3,
    needs_attention_soon: raw.needs_attention_soon??4,
    critical_bins: raw.critical_bins??[],
    high_priority_bins: raw.high_priority_bins??[],
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { lang } = useLang()
  const si = lang==='si'
  const [bins, setBins] = useState<Bin[]>(MOCK_BINS)
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState('')

  useEffect(()=>{
    async function fetchData() {
      try {
        const [b,s] = await Promise.all([getAllBins(), getDashboardStats()])
        if (b?.length) setBins(b)
        if (s) setStats(normalizeStats(s))
        setLastUpdate(new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'}))
      } catch { console.log('mock data') }
      finally { setLoading(false) }
    }
    fetchData()
    const timer = setInterval(fetchData, 15000)
    return ()=>clearInterval(timer)
  },[])

  const alerts = [...bins]
    .filter(b=>b.priority_label==='CRITICAL'||b.priority_label==='HIGH')
    .sort((a,b)=>b.health_risk-a.health_risk)
    .slice(0,6)

  return (
    <div className="flex flex-col gap-4">

      {/* Status bar */}
      <div className="glass-sm flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-green-400 anim-blink flex-shrink-0"/>
          <span className="font-mono text-[11px] text-green-700 uppercase tracking-wider">
            {si?'AWS සම්බන්ධිත':'AWS Connected'}
          </span>
          {lastUpdate && (
            <span className="font-mono text-[11px] text-sky-400 ml-2">
              {si?'යාවත්කාලීන ':'Updated '}{lastUpdate}
            </span>
          )}
        </div>
        <div className="flex gap-5">
          {[['Lambda','ap-southeast-2'],[si?'ආකෘතිය':'Model','95.94% acc'],[si?'ප්‍රමාදය':'Latency','446ms']].map(([k,v])=>(
            <div key={k} className="text-right">
              <div className="font-mono text-[8px] text-sky-300 uppercase tracking-widest">{k}</div>
              <div className="font-mono text-[10px] text-ink-400 font-medium">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3.5">
        {[
          {label:si?'මුළු කූඩු':'Total Bins', value:stats.total_bins, sub:si?'හෝමාගම කලාපය':'Homagama zone · all active', accent:'#4CAF72', glow:'rgba(76,175,114,0.12)', val:'#1A3328'},
          {label:si?'අවදානම්':'Critical', value:stats.by_priority.CRITICAL, sub:si?'ක්ෂණික ක්‍රියාමාර්ගය':'Immediate action needed', accent:'#EF4444', glow:'rgba(220,38,38,0.1)', val:'#DC2626'},
          {label:si?'ඉහළ ප්‍රමුඛතා':'High Priority', value:stats.by_priority.HIGH, sub:si?'පැය 2 ඇතුළත':'Collect within 2 hours', accent:'#F59E0B', glow:'rgba(217,119,6,0.1)', val:'#D97706'},
          {label:si?'සාමාන්‍ය අවදානම':'Avg Health Risk', value:`${stats.average_health_risk}/100`, sub:si?'ඊයේට වඩා 8 අඩු':'Down 8 pts from yesterday', accent:'#22C55E', glow:'rgba(34,197,94,0.1)', val:'#166534'},
        ].map(({label,value,sub,accent,glow,val})=>(
          <div key={label} className="stat-card">
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{background:`linear-gradient(90deg,${accent},${accent}66,transparent)`}}/>
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none" style={{background:glow,filter:'blur(20px)',transform:'translate(30%,-30%)'}}/>
            <div className="font-mono text-[9.5px] uppercase tracking-widest mb-3 flex items-center gap-2" style={{color:`${accent}aa`}}>
              <span className="w-5 h-px inline-block" style={{background:`${accent}88`}}/>
              {label}
            </div>
            <div className="font-sans text-[42px] font-extrabold leading-none tracking-tight mb-1.5" style={{color:val}}>{value}</div>
            <div className="font-mono text-[10px]" style={{color:`${accent}99`}}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Map + Feed */}
      <div className="grid gap-0 rounded-2xl overflow-hidden" style={{gridTemplateColumns:'1fr 320px',height:480,border:'1px solid rgba(255,255,255,0.6)',boxShadow:'0 8px 40px rgba(15,42,61,0.08)'}}>
        {/* Map */}
        <div className="relative overflow-hidden">
          <Map />
          <div className="absolute top-3.5 left-3.5 z-[1000] px-3.5 py-2 rounded-xl"
            style={{background:'rgba(255,255,255,0.9)',backdropFilter:'blur(12px)',border:'1px solid rgba(255,255,255,0.8)',boxShadow:'0 4px 16px rgba(15,42,61,0.1)'}}>
            <div className="font-semibold text-[13px] text-ink-400">{si?'හෝමාගම කලාපය':'Homagama Zone'}</div>
            <div className="font-mono text-[9px] text-sky-400 mt-0.5">{bins.length} {si?'කූඩු · කදම්භය':'bins · tap a pin'}</div>
          </div>
        </div>

        {/* Feed */}
        <div className="flex flex-col overflow-hidden" style={{background:'rgba(255,255,255,0.55)',backdropFilter:'blur(16px)',borderLeft:'1px solid rgba(255,255,255,0.5)'}}>
          {/* Critical/High counts */}
          <div className="grid grid-cols-2 flex-shrink-0" style={{borderBottom:'1px solid rgba(46,134,193,0.1)'}}>
            <button onClick={()=>router.push('/bins?filter=CRITICAL')}
              className="p-4 text-left transition-all hover:brightness-95"
              style={{background:'rgba(254,242,242,0.85)',borderRight:'1px solid rgba(46,134,193,0.08)'}}>
              <div className="font-mono text-[8px] text-red-300 uppercase tracking-widest mb-1">{si?'අවදානම්':'Critical'}</div>
              <div className="font-extrabold text-[34px] leading-none text-red-600 tracking-tight">{stats.by_priority.CRITICAL}</div>
              <div className="font-mono text-[8px] text-red-300 mt-1">{si?'පෙරහන් කිරීමට':'tap to filter'}</div>
            </button>
            <button onClick={()=>router.push('/bins?filter=HIGH')}
              className="p-4 text-left transition-all hover:brightness-95"
              style={{background:'rgba(255,251,235,0.85)'}}>
              <div className="font-mono text-[8px] text-amber-300 uppercase tracking-widest mb-1">{si?'ඉහළ':'High'}</div>
              <div className="font-extrabold text-[34px] leading-none text-amber-600 tracking-tight">{stats.by_priority.HIGH}</div>
              <div className="font-mono text-[8px] text-amber-300 mt-1">{si?'පෙරහන් කිරීමට':'tap to filter'}</div>
            </button>
          </div>

          {/* Alerts header */}
          <div className="px-3.5 pt-2.5 pb-1.5 flex-shrink-0" style={{borderBottom:'1px solid rgba(46,134,193,0.06)'}}>
            <div className="font-bold text-[13px] text-ink-400">{si?'සජීව අනතුරු':'Live Alerts'}</div>
            <div className="font-mono text-[9px] text-sky-400 mt-0.5">{si?'සෞඛ්‍ය අවදානම අනුව':'Sorted by health risk'}</div>
          </div>

          {/* Alert list */}
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
            {alerts.map(a=>(
              <button key={a.bin_id} onClick={()=>router.push('/bins')}
                className="w-full text-left px-2.5 py-2 rounded-xl mb-1.5 transition-all hover:translate-x-0.5"
                style={{background:PBG[a.priority_label],border:`1px solid ${PBD[a.priority_label]}`,borderLeft:`3px solid ${PC[a.priority_label]}`}}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[11px] font-medium text-ink-400">{a.bin_id}</span>
                  <PriorityBadge priority={a.priority_label} size="sm"/>
                  {(a as any).is_real && <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded text-green-700" style={{background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.25)'}}>LIVE</span>}
                  <span className="font-mono text-[9px] text-sky-400 ml-auto">{si?'සජීව':'live'}</span>
                </div>
                <div className="font-mono text-[9px] text-sky-400">{a.gas_ppm} PPM · {a.fill_level}% {si?'පිරවීම':'fill'}</div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{background:'rgba(0,0,0,0.06)'}}>
                    <div className="h-full rounded-full" style={{width:`${Math.min(a.health_risk,100)}%`,background:PC[a.priority_label]}}/>
                  </div>
                  <span className="font-mono text-[8px]" style={{color:PC[a.priority_label]}}>{si?'අවදානම':'Risk'} {a.health_risk}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Schedule */}
          <div className="p-2.5 flex-shrink-0" style={{borderTop:'1px solid rgba(46,134,193,0.1)',background:'rgba(255,255,255,0.3)'}}>
            <div className="font-bold text-[12px] text-ink-400 mb-2">{si?'අද කාලසටහන':"Today's Schedule"}</div>
            {SCHED.map(s=>(
              <div key={s.t} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg mb-1 transition-all hover:bg-white/50"
                style={{background:'rgba(255,255,255,0.55)',border:'1px solid rgba(46,134,193,0.08)'}}>
                <span className="font-mono text-[10px] font-medium text-green-600 w-10 flex-shrink-0">{s.t}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-ink-400 truncate">{s.bins}</div>
                  <div className="font-mono text-[8px] text-sky-400 mt-0.5">{si?s.zSi:s.zone}</div>
                </div>
                <PriorityBadge priority={s.p} size="sm"/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <DashboardCharts />

      {/* Table */}
      <div className="glass p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-bold text-[14px] text-ink-400">{si?'සියලු කූඩු — සජීව':'All Bins — Live Status'}</div>
            <div className="font-mono text-[9.5px] text-sky-400 mt-0.5">
              {loading?'Fetching from AWS...':`${bins.length} ${si?'කූඩු · සෑම 15s':'bins · auto-refresh 15s'}`}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>router.push('/bins')}
              className="font-mono text-[10px] text-green-600 px-3.5 py-1.5 rounded-lg transition-all hover:bg-green-50"
              style={{background:'rgba(45,122,79,0.08)',border:'1px solid rgba(45,122,79,0.2)'}}>
              {si?'සියල්ල':'View All'}
            </button>
            <button className="font-mono text-[10px] text-sky-400 px-3.5 py-1.5 rounded-lg transition-all hover:bg-sky-50"
              style={{background:'rgba(46,134,193,0.06)',border:'1px solid rgba(46,134,193,0.15)'}}>
              {si?'CSV':'Export CSV'}
            </button>
          </div>
        </div>
        <BinTable bins={bins.slice(0,8)}/>
      </div>

    </div>
  )
}
