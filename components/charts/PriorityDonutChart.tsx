'use client'
import { PieChart,Pie,Cell,Tooltip,ResponsiveContainer } from 'recharts'
const DATA=[{name:'CRITICAL',value:3,color:'#DC2626'},{name:'HIGH',value:4,color:'#D97706'},{name:'MEDIUM',value:3,color:'#CA8A04'},{name:'LOW',value:2,color:'#2D7A4F'}]
const TT=({active,payload}:any)=>{
  if(!active||!payload?.length) return null
  return <div style={{background:'rgba(255,255,255,.95)',border:'1px solid rgba(45,122,79,.15)',borderRadius:10,padding:'8px 12px',boxShadow:'0 8px 24px rgba(26,51,40,.12)'}}>
    <span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--g600)'}}>{payload[0].name}: {payload[0].value}</span>
  </div>
}
export default function PriorityDonutChart() {
  return (
    <div style={{display:'flex',alignItems:'center',gap:16,height:'100%'}}>
      <ResponsiveContainer width="55%" height="100%">
        <PieChart>
          <Pie data={DATA} cx="50%" cy="50%" innerRadius="52%" outerRadius="82%" dataKey="value" strokeWidth={0}>
            {DATA.map(d=><Cell key={d.name} fill={d.color} opacity={.88}/>)}
          </Pie>
          <Tooltip content={<TT/>}/>
        </PieChart>
      </ResponsiveContainer>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {DATA.map(d=>(
          <div key={d.name} style={{display:'flex',alignItems:'center',gap:7}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:d.color,flexShrink:0,display:'inline-block'}}/>
            <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--g500)'}}>{d.name}</span>
            <span style={{fontFamily:'var(--mono)',fontSize:10,color:d.color,marginLeft:'auto',paddingLeft:8,fontWeight:500}}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
