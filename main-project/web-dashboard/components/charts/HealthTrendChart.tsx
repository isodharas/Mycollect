'use client'
import { AreaChart,Area,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer } from 'recharts'
import { HEALTH_TREND } from '@/lib/data'
const TT=({active,payload,label}:any)=>{
  if(!active||!payload?.length) return null
  return <div style={{background:'rgba(255,255,255,.95)',border:'1px solid rgba(45,122,79,.15)',borderRadius:10,padding:'8px 12px',boxShadow:'0 8px 24px rgba(26,51,40,.12)'}}>
    <p style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--g400)',marginBottom:4}}>{label}</p>
    <p style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--g600)',fontWeight:500}}>Risk: {payload[0].value}</p>
  </div>
}
export default function HealthTrendChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={HEALTH_TREND} margin={{top:4,right:4,bottom:0,left:-20}}>
        <defs>
          <linearGradient id="htg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2D7A4F" stopOpacity={.15}/>
            <stop offset="95%" stopColor="#2D7A4F" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,122,79,0.08)"/>
        <XAxis dataKey="day" tick={{fill:'#7CC49A',fontSize:10,fontFamily:'DM Mono'}} axisLine={false} tickLine={false}/>
        <YAxis tick={{fill:'#7CC49A',fontSize:10,fontFamily:'DM Mono'}} axisLine={false} tickLine={false}/>
        <Tooltip content={<TT/>}/>
        <Area type="monotone" dataKey="risk" stroke="#2D7A4F" strokeWidth={2.5} fill="url(#htg)" dot={{r:3,fill:'#2D7A4F',strokeWidth:0}} activeDot={{r:5,fill:'#1E5C38'}}/>
      </AreaChart>
    </ResponsiveContainer>
  )
}
