'use client'
import dynamic from 'next/dynamic'
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
  return (
    <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:14}}>
      {[
        {t:'Health Risk Trend',s:'7-day rolling average · all bins',C:HT},
        {t:'Priority Distribution',s:'Current snapshot',C:PD},
        {t:'Gas PPM · BIN_002',s:'Last 24 hours · MQ-135',C:GC},
      ].map(({t,s,C})=>(
        <div key={t} style={cardStyle}>
          <div style={{fontWeight:700,fontSize:13.5,color:'var(--g700)',marginBottom:3}}>{t}</div>
          <div style={{fontFamily:'var(--mono)',fontSize:9.5,color:'var(--g400)',marginBottom:14}}>{s}</div>
          <div style={{height:152}}><C/></div>
        </div>
      ))}
    </div>
  )
}
