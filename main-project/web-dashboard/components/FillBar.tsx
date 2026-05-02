import type { Priority } from '@/lib/types'
const C: Record<Priority,string> = {CRITICAL:'#DC2626',HIGH:'#D97706',MEDIUM:'#CA8A04',LOW:'#2D7A4F'}
export default function FillBar({value,priority,label=true}:{value:number;priority:Priority;label?:boolean}) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <div className="fill-track" style={{flex:1}}>
        <div className="fill-bar" style={{width:`${value}%`,background:C[priority]}}/>
      </div>
      {label && <span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--g400)',minWidth:28,textAlign:'right'}}>{value}%</span>}
    </div>
  )
}
