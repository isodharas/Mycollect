'use client'
import dynamic from 'next/dynamic'
import { useLang } from '@/lib/LangContext'
const L=()=><div style={{height:'100%',borderRadius:10,background:'rgba(237,247,241,0.5)',animation:'pulse 2s infinite'}}/>
const HT=dynamic(()=>import('./charts/HealthTrendChart'),{ssr:false,loading:()=><L/>})
const PD=dynamic(()=>import('./charts/PriorityDonutChart'),{ssr:false,loading:()=><L/>})
const GC=dynamic(()=>import('./charts/GasAndFillCharts').then(m=>({default:m.GasChart})),{ssr:false,loading:()=><L/>})
const cardStyle={
  background:'rgba(255,255,255,0.65)',
  backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',
  border:'1px solid rgba(255,255,255,0.82)',
  borderRadius:16,padding:'18px 20px',
  boxShadow:'0 4px 20px rgba(26,51,40,0.06)',
}
export default function DashboardCharts() {
  const { lang } = useLang()
  const si = lang === 'si'
  const charts = [
    {
      t: si ? 'සෞඛ්‍ය අවදානම් ප්‍රවණතාව' : 'Health Risk Trend',
      s: si ? 'දින 7 පෙරළෙන සාමාන්‍යය · සියලු කූඩු' : '7-day rolling average · all bins',
      C: HT
    },
    {
      t: si ? 'ප්‍රමුඛතා බෙදාහැරීම' : 'Priority Distribution',
      s: si ? 'වත්මන් සැණරුව' : 'Current snapshot',
      C: PD
    },
    {
      t: si ? 'වායු PPM · BIN_002' : 'Gas PPM · BIN_002',
      s: si ? 'පැය 24 · MQ-135' : 'Last 24 hours · MQ-135',
      C: GC
    },
  ]
  return (
    <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:14}}>
      {charts.map(({t,s,C})=>(
        <div key={t} style={cardStyle}>
          <div style={{fontWeight:700,fontSize:13.5,color:'var(--g700)',marginBottom:3}}>{t}</div>
          <div style={{fontFamily:'var(--mono)',fontSize:9.5,color:'var(--g400)',marginBottom:14}}>{s}</div>
          <div style={{height:152}}><C/></div>
        </div>
      ))}
    </div>
  )
}
