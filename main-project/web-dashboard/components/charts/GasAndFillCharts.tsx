'use client'
import { BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,AreaChart,Area } from 'recharts'
import { GAS_24H,FILL_24H } from '@/lib/data'
const TT=({active,payload,label,unit}:any)=>{
  if(!active||!payload?.length) return null
  return <div style={{background:'rgba(255,255,255,.95)',border:'1px solid rgba(45,122,79,.15)',borderRadius:10,padding:'8px 12px',boxShadow:'0 8px 24px rgba(26,51,40,.12)'}}>
    <p style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--g400)'}}>{label}</p>
    <p style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--g600)',fontWeight:500,marginTop:2}}>{payload[0].value}{unit}</p>
  </div>
}
export function GasChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={GAS_24H} margin={{top:4,right:4,bottom:0,left:-20}}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,122,79,0.08)"/>
        <XAxis dataKey="h" tick={{fill:'#7CC49A',fontSize:9,fontFamily:'DM Mono'}} axisLine={false} tickLine={false} interval={3}/>
        <YAxis tick={{fill:'#7CC49A',fontSize:9,fontFamily:'DM Mono'}} axisLine={false} tickLine={false}/>
        <Tooltip content={<TT unit=" ppm"/>}/>
        <Bar dataKey="ppm" radius={[3,3,0,0]} fill="#D97706" opacity={.75}/>
      </BarChart>
    </ResponsiveContainer>
  )
}
export function FillChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={FILL_24H} margin={{top:4,right:4,bottom:0,left:-20}}>
        <defs>
          <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2D7A4F" stopOpacity={.12}/>
            <stop offset="95%" stopColor="#2D7A4F" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,122,79,0.08)"/>
        <XAxis dataKey="h" tick={{fill:'#7CC49A',fontSize:9,fontFamily:'DM Mono'}} axisLine={false} tickLine={false} interval={3}/>
        <YAxis domain={[0,100]} tick={{fill:'#7CC49A',fontSize:9,fontFamily:'DM Mono'}} axisLine={false} tickLine={false}/>
        <Tooltip content={<TT unit="%"/>}/>
        <Area type="monotone" dataKey="pct" stroke="#2D7A4F" strokeWidth={2} fill="url(#fg)" dot={false}/>
      </AreaChart>
    </ResponsiveContainer>
  )
}
