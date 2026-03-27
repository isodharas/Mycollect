'use client'
type V = 'green'|'red'|'orange'|'amber'|'default'
const VC: Record<V,{accent:string;label:string;val:string;glow:string}> = {
  green:   {accent:'#22C55E', label:'rgba(34,197,94,0.7)',   val:'#166534', glow:'rgba(34,197,94,0.12)'},
  red:     {accent:'#EF4444', label:'rgba(239,68,68,0.7)',    val:'#DC2626', glow:'rgba(220,38,38,0.1)'},
  orange:  {accent:'#F59E0B', label:'rgba(245,158,11,0.7)',   val:'#D97706', glow:'rgba(217,119,6,0.1)'},
  amber:   {accent:'#EAB308', label:'rgba(234,179,8,0.7)',    val:'#CA8A04', glow:'rgba(202,138,4,0.1)'},
  default: {accent:'#4CAF72', label:'rgba(76,175,114,0.7)',   val:'#1A3328', glow:'rgba(45,122,79,0.08)'},
}
export default function StatCard({label,value,sub,variant='default'}:{label:string;value:string|number;sub?:string;variant?:V}) {
  const v = VC[variant]
  return (
    <div className="stat-card" style={{background:`rgba(255,255,255,0.32)`}}>
      {/* Top accent line */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${v.accent},${v.accent}88,transparent)`,borderRadius:'16px 16px 0 0'}}/>
      {/* Glow blob */}
      <div style={{position:'absolute',top:-20,right:-20,width:80,height:80,borderRadius:'50%',background:v.glow,filter:'blur(20px)',pointerEvents:'none'}}/>
      <div style={{fontFamily:'var(--mono)',fontSize:9.5,letterSpacing:'.12em',textTransform:'uppercase',color:v.label,marginBottom:12,display:'flex',alignItems:'center',gap:8,position:'relative'}}>
        <span style={{width:20,height:'1px',background:v.label,display:'inline-block'}}/>
        {label}
      </div>
      <div style={{fontFamily:'var(--sans)',fontSize:42,fontWeight:800,color:v.val,lineHeight:1,letterSpacing:'-.025em',marginBottom:6,position:'relative'}}>{value}</div>
      {sub && <div style={{fontFamily:'var(--mono)',fontSize:10,color:v.label,position:'relative'}}>{sub}</div>}
    </div>
  )
}
