'use client'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useLang } from '@/lib/LangContext'
import SinhalaToggle from './SinhalaToggle'

const PAGES: Record<string,[string,string,string,string]> = {
  '/dashboard': ['overview',  'Overview',  'live_monitoring','Live monitoring · Homagama Zone'],
  '/bins':      ['live_bins', 'Live Bins', 'bins_sub',       '12 bins · real-time sensor data'],
  '/routes':    ['routes',    'Routes',    'routes_sub',     'Collection routing · 3 active'],
  '/analytics': ['analytics', 'Analytics', 'analytics_sub',  'Trends · ML performance · 7 days'],
  '/alerts':    ['alerts',    'Alerts',    'alerts_sub',     'Active notifications · by severity'],
  '/reports':   ['reports',   'Reports',   'reports_sub',    'Data export · compliance reports'],
}

export default function Topbar() {
  const path = usePathname()
  const { data: session } = useSession()
  const { t, lang } = useLang()
  const [time, setTime] = useState('')
  const page = PAGES[path] ?? ['overview','Overview','','']
  const title = lang==='si' ? t(page[0]) : page[1]
  const sub = page[3]

  useEffect(()=>{
    const tick=()=>setTime(new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'}))
    tick()
    const timer=setInterval(tick,1000)
    return ()=>clearInterval(timer)
  },[])

  return (
    <header className="topbar">
      <div className="flex items-center gap-2.5">
        <h1 className="font-bold text-[15.5px] text-ink-400 tracking-tight">{title}</h1>
        <span className="font-mono text-[10px] text-sky-300">·</span>
        <span className="font-mono text-[10px] text-sky-400 tracking-wide">{sub}</span>
      </div>
      <div className="flex items-center gap-2.5">
        {time && (
          <div className="font-mono text-[10px] text-sky-400 px-2.5 py-1 rounded-lg"
            style={{background:'rgba(46,134,193,0.07)',border:'1px solid rgba(46,134,193,0.12)'}}>
            {time} IST
          </div>
        )}
        <SinhalaToggle />
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.25)'}}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 anim-blink"/>
          <span className="font-mono text-[10px] text-green-700 tracking-wide">LIVE</span>
        </div>
        <div className="font-mono text-[10px] text-sky-400 px-3 py-1.5 rounded-lg"
          style={{background:'rgba(46,134,193,0.08)',border:'1px solid rgba(46,134,193,0.15)'}}>
          {session?.user?.name?.split(' ')[0]||'User'}
        </div>
      </div>
    </header>
  )
}
