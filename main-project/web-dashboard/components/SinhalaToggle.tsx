'use client'
import { useLang } from '@/lib/LangContext'

export default function SinhalaToggle() {
  const { lang, setLang } = useLang()
  const isSi = lang === 'si'

  return (
    <div style={{display:'flex',alignItems:'center',gap:0,borderRadius:9,overflow:'hidden',border:'1px solid rgba(45,122,79,0.2)'}}>
      <button
        onClick={()=>setLang('en')}
        style={{
          padding:'6px 13px',cursor:'pointer',border:'none',
          background:!isSi?'#1A3328':'rgba(255,255,255,0.6)',
          color:!isSi?'#fff':'var(--g500)',
          fontFamily:'var(--sans)',fontSize:11.5,fontWeight:700,
          transition:'all .2s',whiteSpace:'nowrap',
          borderRight:'1px solid rgba(45,122,79,0.15)',
        }}>
        English
      </button>
      <button
        onClick={()=>setLang('si')}
        style={{
          padding:'6px 13px',cursor:'pointer',border:'none',
          background:isSi?'#1A3328':'rgba(255,255,255,0.6)',
          color:isSi?'#fff':'var(--g500)',
          fontFamily:'var(--sans)',fontSize:11.5,fontWeight:700,
          transition:'all .2s',whiteSpace:'nowrap',
        }}>
        සිංහල
      </button>
    </div>
  )
}
