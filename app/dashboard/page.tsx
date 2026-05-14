'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
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
    <div className="h-full flex items-center justify-center" style={{background:'rgba(237,245,232,0.5)'}}>
      <span style={{fontFamily:'Poppins,sans-serif',fontSize:'12px',color:'#6B8C6B'}}>Loading map...</span>
    </div>
  )
})

const PC: Record<string,string> = {CRITICAL:'#DC2626',HIGH:'#EA580C',MEDIUM:'#D97706',LOW:'#16A34A'}
const PBG: Record<string,string> = {CRITICAL:'rgba(220,38,38,.05)',HIGH:'rgba(234,88,12,.05)',MEDIUM:'rgba(217,119,6,.05)',LOW:'rgba(22,163,74,.05)'}
const PBD: Record<string,string> = {CRITICAL:'rgba(220,38,38,.15)',HIGH:'rgba(234,88,12,.15)',MEDIUM:'rgba(217,119,6,.15)',LOW:'rgba(22,163,74,.15)'}

// Schedule built dynamically from live bin data — no hardcoded values

const DEFAULT_STATS = {
  total_bins:6, by_priority:{LOW:1,MEDIUM:0,HIGH:1,CRITICAL:4},
  average_health_risk:34.2, average_fill_level:69.5,
  needs_immediate_attention:3, needs_attention_soon:4,
  critical_bins:[] as any[], high_priority_bins:[] as any[],
}

function normalizeStats(raw:any) {
  if (!raw) return DEFAULT_STATS
  if (raw.stats) raw = raw.stats
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

const poppins = {fontFamily:'Poppins,sans-serif'}

export default function DashboardPage() {
  const router = useRouter()
  const { lang } = useLang()
  const si = lang==='si'
  const [bins, setBins] = useState<Bin[]>(MOCK_BINS)
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [loading, setLoading] = useState(true)

  const [toast, setToast] = useState<{bin_id:string, gas:number, risk:number} | null>(null)
  const prevCriticalIds = useRef<Set<string>>(new Set())

  useEffect(()=>{
    async function fetchData() {
      try {
        const [b,s] = await Promise.all([getAllBins(), getDashboardStats()])
        if (b?.length) {
          setBins(b)
          const currentCritical = b.filter((bin:any) => bin.priority_label === 'CRITICAL')
          const newCritical = currentCritical.filter((bin:any) => !prevCriticalIds.current.has(bin.bin_id))
          if (newCritical.length > 0) {
            setToast({ bin_id: newCritical[0].bin_id, gas: newCritical[0].gas_ppm, risk: newCritical[0].health_risk })
            setTimeout(() => setToast(null), 6000)
          }
          prevCriticalIds.current = new Set(currentCritical.map((bin:any) => bin.bin_id))
        }
        if (s) setStats(normalizeStats(s))
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

  const statCards = [
    {
      label: si?'මුළු බදුන්':'Total Bins',
      value: stats.total_bins,
      sub: si?'හෝමාගම කලාපය':'Homagama zone',
      accent: '#4A8C28',
      valColor: '#2D5A1B',
    },
    {
      label: si?'අවදානම්':'Critical',
      value: stats.by_priority.CRITICAL,
      sub: si?'ක්ෂණික ක්‍රියාමාර්ගය':'Immediate action needed',
      accent: '#DC2626',
      valColor: '#DC2626',
    },
    {
      label: si?'ඉහළ ප්‍රමුඛතා':'High Priority',
      value: stats.by_priority.HIGH,
      sub: si?'පැය 2 ඇතුළත':'Within 2 hours',
      accent: '#EA580C',
      valColor: '#EA580C',
    },
    {
      label: si?'සාමාන්‍ය අවදානම':'Avg Health Risk',
      value: `${stats.average_health_risk}`,
      sub: si?'100 න්':'out of 100',
      accent: '#4A8C28',
      valColor: '#2D5A1B',
    },
  ]

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
      {/* CRITICAL TOAST NOTIFICATION */}
      {toast && (
        <div style={{
          position:'fixed', top:'20px', right:'20px', zIndex:9999,
          background:'#DC2626', color:'#fff', borderRadius:'14px',
          padding:'14px 18px', boxShadow:'0 8px 32px rgba(220,38,38,0.4)',
          display:'flex', alignItems:'center', gap:'12px', maxWidth:'320px',
          animation:'slideIn 0.3s ease',
        }}>
          <span style={{fontSize:'20px'}}>🚨</span>
          <div>
            <div style={{fontWeight:700, fontSize:'13px', fontFamily:'Poppins,sans-serif'}}>
              {si ? 'අවදානම් ඇඟවීම!' : 'CRITICAL Alert!'} {toast.bin_id}
            </div>
            <div style={{fontSize:'11px', opacity:0.9, fontFamily:'Poppins,sans-serif', marginTop:'2px'}}>
              {si ? `වායු ${toast.gas} PPM · අවදානම් ලකුණු ${toast.risk}` : `Gas ${toast.gas} PPM · Risk Score ${toast.risk}`}
            </div>
          </div>
          <button onClick={()=>setToast(null)} style={{background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', borderRadius:'8px', width:'24px', height:'24px', cursor:'pointer', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center'}}>×</button>
        </div>
      )}

      {/* Stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px'}}>
        {statCards.map(({label,value,sub,accent,valColor})=>(
          <div key={label} style={{
            background:'rgba(255,255,255,0.70)',
            backdropFilter:'blur(20px)',
            border:'1px solid rgba(255,255,255,0.80)',
            borderRadius:'14px',
            padding:'20px 22px',
            position:'relative',
            overflow:'hidden',
            boxShadow:'0 4px 20px rgba(45,90,27,0.07)',
          }}>
            {/* Top accent line */}
            <div style={{
              position:'absolute',top:0,left:0,right:0,height:'3px',
              borderRadius:'14px 14px 0 0',
              background:`linear-gradient(90deg,${accent},${accent}44,transparent)`,
            }}/>
            <div style={{...poppins,fontSize:'11px',fontWeight:600,color:'#6B8C6B',marginBottom:'10px',textTransform:'uppercase',letterSpacing:'0.06em'}}>
              {label}
            </div>
            <div style={{...poppins,fontSize:'38px',fontWeight:800,color:valColor,lineHeight:1,marginBottom:'6px'}}>
              {value}
            </div>
            <div style={{...poppins,fontSize:'11px',color:'#6B8C6B'}}>
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* Map + Feed */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'1fr 300px',
        borderRadius:'16px',
        overflow:'hidden',
        height:'auto',minHeight:'460px',
        border:'1px solid rgba(255,255,255,0.72)',
        boxShadow:'0 4px 24px rgba(45,90,27,0.08)',
      }}>
        {/* Map */}
        <div style={{position:'relative',overflow:'hidden'}}>
          <Map />
          <div style={{
            position:'absolute',top:'14px',left:'14px',zIndex:1000,
            padding:'10px 14px',borderRadius:'10px',
            background:'rgba(255,255,255,0.92)',
            backdropFilter:'blur(12px)',
            border:'1px solid rgba(255,255,255,0.85)',
            boxShadow:'0 4px 16px rgba(45,90,27,0.10)',
          }}>
            <div style={{...poppins,fontWeight:600,fontSize:'13px',color:'#1A2E1A'}}>
              {si?'හෝමාගම කලාපය':'Homagama Zone'}
            </div>
            <div style={{...poppins,fontSize:'11px',color:'#6B8C6B',marginTop:'2px'}}>
              {bins.length} {si?'බදුන්':'bins'}
            </div>
          </div>
        </div>

        {/* Right feed panel */}
        <div style={{
          display:'flex',flexDirection:'column',overflow:'visible',
          background:'rgba(255,255,255,0.65)',
          backdropFilter:'blur(16px)',
          borderLeft:'1px solid rgba(255,255,255,0.60)',
        }}>
          {/* Critical / High quick counts */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',flexShrink:0,borderBottom:'1px solid rgba(74,140,40,0.08)'}}>
            <button
              onClick={()=>router.push('/bins?filter=CRITICAL')}
              style={{
                padding:'16px',textAlign:'left',cursor:'pointer',
                background:'rgba(254,242,242,0.80)',
                borderRight:'1px solid rgba(74,140,40,0.06)',
                border:'none',transition:'all 0.15s',
              }}
            >
              <div style={{...poppins,fontSize:'10px',fontWeight:600,color:'#DC2626',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'4px'}}>
                {si?'අවදානම්':'Critical'}
              </div>
              <div style={{...poppins,fontSize:'32px',fontWeight:800,color:'#DC2626',lineHeight:1}}>
                {stats.by_priority.CRITICAL}
              </div>
            </button>
            <button
              onClick={()=>router.push('/bins?filter=HIGH')}
              style={{
                padding:'16px',textAlign:'left',cursor:'pointer',
                background:'rgba(255,247,237,0.80)',
                border:'none',transition:'all 0.15s',
              }}
            >
              <div style={{...poppins,fontSize:'10px',fontWeight:600,color:'#EA580C',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'4px'}}>
                {si?'ඉහළ':'High'}
              </div>
              <div style={{...poppins,fontSize:'32px',fontWeight:800,color:'#EA580C',lineHeight:1}}>
                {stats.by_priority.HIGH}
              </div>
            </button>
          </div>

          {/* CRITICAL + HIGH bin status */}
          <div style={{
            padding:'12px',flex:1,overflowY:'auto',
            background:'rgba(255,255,255,0.35)',
            backdropFilter:'blur(12px)',
          }}>
            <div style={{...poppins,fontWeight:700,fontSize:'12px',color:'#1A2E1A',marginBottom:'10px'}}>
              {si?'අවදානම් බදුන්':'Critical & High Bins'}
            </div>
            {bins.filter(b=>b.priority_label==='CRITICAL'||b.priority_label==='HIGH').length===0 ? (
              <div style={{...poppins,fontSize:'11px',color:'#6B8C6B',textAlign:'center',padding:'12px 0'}}>
                {si?'අවදානම් බදුන් නැත':'No critical or high bins ✓'}
              </div>
            ) : bins.filter(b=>b.priority_label==='CRITICAL'||b.priority_label==='HIGH')
              .sort((a,b)=>b.health_risk-a.health_risk)
              .map(b=>(
              <div key={b.bin_id} style={{
                padding:'12px 14px',borderRadius:'12px',marginBottom:'8px',
                background:'rgba(255,255,255,0.75)',
                backdropFilter:'blur(8px)',
                border:'1px solid rgba(255,255,255,0.85)',
                boxShadow:'0 2px 8px rgba(45,90,27,0.06)',
                borderLeft:`4px solid ${PC[b.priority_label]}`,
              }}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'6px'}}>
                  <span style={{...poppins,fontSize:'12px',fontWeight:700,color:'#1A2E1A'}}>{b.bin_id}</span>
                  <PriorityBadge priority={b.priority_label} size="sm"/>
                </div>
                <div style={{display:'flex',gap:'10px',marginBottom:'6px'}}>
                  <span style={{...poppins,fontSize:'11px',color:PC[b.priority_label],fontWeight:600}}>{b.gas_ppm} PPM</span>
                  <span style={{...poppins,fontSize:'11px',color:'#6B8C6B'}}>{b.fill_level}% {si?'පිරවීම':'fill'}</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                  <div style={{flex:1,height:'6px',borderRadius:'3px',background:'rgba(0,0,0,0.06)'}}>
                    <div style={{height:'100%',borderRadius:'3px',width:`${Math.min(b.health_risk,100)}%`,background:PC[b.priority_label]}}/>
                  </div>
                  <span style={{...poppins,fontSize:'10px',fontWeight:600,color:PC[b.priority_label]}}>{si?'අවදානම':'Risk'} {b.health_risk}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <DashboardCharts />

      {/* Bins Table */}
      <div style={{
        background:'rgba(255,255,255,0.70)',
        backdropFilter:'blur(20px)',
        border:'1px solid rgba(255,255,255,0.80)',
        borderRadius:'14px',
        padding:'20px 22px',
        boxShadow:'0 4px 20px rgba(45,90,27,0.07)',
      }}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
          <div>
            <div style={{...poppins,fontWeight:700,fontSize:'14px',color:'#1A2E1A'}}>
              {si?'සියලු බදුන්':'All Bins'}
            </div>
            <div style={{...poppins,fontSize:'11px',color:'#6B8C6B',marginTop:'2px'}}>
              {loading ? (si?'AWS වෙතින් ලබාගනිමින්...':'Fetching from AWS...') : `${bins.length} ${si?'බදුන්':'bins'}`}
            </div>
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <button
              onClick={()=>router.push('/bins')}
              style={{
                ...poppins,fontSize:'12px',fontWeight:500,
                color:'#4A8C28',padding:'7px 16px',borderRadius:'8px',cursor:'pointer',
                background:'rgba(74,140,40,0.08)',border:'1px solid rgba(74,140,40,0.18)',
              }}
            >
              {si?'සියල්ල':'View All'}
            </button>
            <button style={{
              ...poppins,fontSize:'12px',fontWeight:500,
              color:'#6B8C6B',padding:'7px 16px',borderRadius:'8px',cursor:'pointer',
              background:'rgba(107,140,107,0.08)',border:'1px solid rgba(107,140,107,0.18)',
            }}>
              {si?'CSV':'Export CSV'}
            </button>
          </div>
        </div>
        <BinTable bins={bins.slice(0,8)}/>
      </div>

    </div>
  )
}
