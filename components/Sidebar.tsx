'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useLang } from '@/lib/LangContext'
import { motion } from 'framer-motion'

const NAV = [
  { href:'/dashboard', key:'overview',   icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href:'/bins',      key:'live_bins',  icon:'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', alert:3 },
  { href:'/routes',    key:'routes',     icon:'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { href:'/analytics', key:'analytics',  icon:'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { href:'/alerts',    key:'alerts',     icon:'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', alert:2 },
  { href:'/reports',   key:'reports',    icon:'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
]

export default function Sidebar() {
  const path = usePathname()
  const { data: session } = useSession()
  const { lang, setLang, t } = useLang()
  const name = session?.user?.name || 'User'
  const initials = name.split(' ').map((n:string)=>n[0]).join('').slice(0,2).toUpperCase()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white flex-shrink-0"
            style={{background:'linear-gradient(135deg,#4CAF72,#1A3328)',boxShadow:'0 4px 12px rgba(45,122,79,0.35)'}}>
            MC
          </div>
          <div>
            <div className="font-extrabold text-sm text-green-500 tracking-tight">MyCollect</div>
            <div className="font-mono text-[9px] text-sky-400 uppercase tracking-widest mt-0.5">{t('waste_intelligence')}</div>
          </div>
        </div>
      </div>

      {/* Live pill */}
      <div className="mx-3 my-2.5 px-3 py-2 rounded-xl flex items-center gap-2"
        style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)'}}>
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 anim-blink"/>
        <span className="font-mono text-[10px] uppercase tracking-wider text-green-600">{t('system_live')}</span>
        <span className="font-mono text-[9px] text-green-400 ml-auto">12s</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-1 overflow-y-auto scrollbar-thin">
        <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-sky-300 px-2 py-2 flex items-center gap-2">
          <span className="w-4 h-px bg-sky-200 inline-block"/>Navigation
        </div>
        {NAV.map(item => {
          const active = path===item.href||(item.href!=='/dashboard'&&path.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} className={`nav-item${active?' active':''}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d={item.icon}/>
              </svg>
              <span className="flex-1 text-[13.5px]">{t(item.key)}</span>
              {item.alert && (
                <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                  style={{background:'#DC2626',lineHeight:'14px'}}>
                  {item.alert}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Lang toggle */}
      <div className="px-3 pb-2">
        <div className="flex rounded-xl overflow-hidden" style={{border:'1px solid rgba(46,134,193,0.2)'}}>
          <button onClick={()=>setLang('en')} className={`flex-1 py-1.5 text-[11px] font-bold transition-all ${lang==='en'?'text-white':'text-sky-400 bg-transparent'}`}
            style={{background:lang==='en'?'linear-gradient(135deg,#2D7A4F,#1A3328)':'transparent'}}>
            EN
          </button>
          <button onClick={()=>setLang('si')} className={`flex-1 py-1.5 text-[11px] font-bold transition-all ${lang==='si'?'text-white':'text-sky-400 bg-transparent'}`}
            style={{background:lang==='si'?'linear-gradient(135deg,#2D7A4F,#1A3328)':'transparent'}}>
            සිං
          </button>
        </div>
      </div>

      {/* User */}
      <div className="p-3 border-t border-white/40">
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl mb-2"
          style={{background:'rgba(255,255,255,0.5)',border:'1px solid rgba(255,255,255,0.6)'}}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
            style={{background:'linear-gradient(135deg,#2D7A4F,#1A3328)'}}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold text-ink-400 truncate">{name}</div>
            <div className="font-mono text-[9px] text-sky-400 mt-0.5">{t('municipal_operator')}</div>
          </div>
        </div>
        <button onClick={()=>signOut({callbackUrl:'/login'})}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-sky-400 transition-all hover:text-red-500 hover:bg-red-50/50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          {t('sign_out')}
        </button>
      </div>
    </aside>
  )
}
