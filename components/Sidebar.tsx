'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useLang } from '@/lib/LangContext'
import { useState, useEffect } from 'react'

const NAV = [
  { href: '/dashboard', key: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/bins', key: 'live_bins', label: 'Live Bins', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { href: '/routes', key: 'routes', label: 'Routes', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { href: '/analytics', key: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { href: '/alerts', key: 'alerts', label: 'Alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { href: '/reports', key: 'reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { href: '/admin', key: 'admin', label: 'Admin', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { href: '/account', key: 'account', label: 'Account', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]

export default function Sidebar() {
  const path = usePathname()
  const { data: session } = useSession()
  const { lang, t } = useLang()
  const [collapsed, setCollapsed] = useState(false)
  const [criticalCount, setCriticalCount] = useState(0)

  useEffect(() => {
    const fetchCritical = async () => {
      try {
        const res = await fetch('/api/proxy/catchall?path=bin')
        const data = await res.json()
        const bins = data.bins || []
        const count = bins.filter((b: any) => b.priority_label === 'CRITICAL').length
        setCriticalCount(count)
      } catch {}
    }
    fetchCritical()
    const interval = setInterval(fetchCritical, 30000)
    return () => clearInterval(interval)
  }, [])
  const si = lang === 'si'
  const name = session?.user?.name || 'User'
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  const bg = '#132218'
  const bgActive = 'rgba(255,255,255,0.08)'
  const bgHover = 'rgba(255,255,255,0.06)'
  const textActive = '#90EE90'
  const textMuted = 'rgba(255,255,255,0.45)'
  const textNormal = 'rgba(255,255,255,0.72)'
  const border = 'rgba(255,255,255,0.07)'

  return (
    <aside style={{
      width: collapsed ? '68px' : '220px',
      flexShrink: 0,
      height: '100vh',
      position: 'sticky',
      top: 0,
      background: bg,
      borderRight: `1px solid ${border}`,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden',
    }}>

      {/* LOGO */}
      <div style={{
        padding: '16px 12px',
        borderBottom: `1px solid ${border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        minHeight: '64px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <div style={{
            width: '130px', height: '36px', borderRadius: '10px',
            background: 'transparent',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{fontWeight:800,fontSize:16,letterSpacing:"-0.02em",fontFamily:"Poppins,sans-serif"}}><span style={{color:"#fff"}}>My</span><span style={{color:"#90EE90"}}>Collect</span></span>
          </div>
        </div>
        <button onClick={() => setCollapsed(!collapsed)} style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.06)', border: `1px solid ${border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0, color: textMuted, transition: 'all 0.2s',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {collapsed ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
          </svg>
        </button>
      </div>

      {/* NAV */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {!collapsed && (
          <div style={{
            fontFamily: 'Poppins,sans-serif', fontSize: '9px', fontWeight: 600,
            color: textMuted, textTransform: 'uppercase', letterSpacing: '0.12em',
            padding: '0 12px', marginBottom: '8px',
          }}>
            {si ? 'සංචලනය' : 'Navigation'}
          </div>
        )}
        {NAV.map(item => {
          const active = path === item.href || (item.href !== '/dashboard' && path.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}
              title={collapsed ? (si ? t(item.key) : item.label) : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: collapsed ? '10px 0' : '9px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '10px', marginBottom: '2px',
                fontSize: '13px', fontWeight: active ? 600 : 400,
                fontFamily: 'Poppins,sans-serif',
                color: active ? textActive : textNormal,
                textDecoration: 'none', position: 'relative',
                background: active ? bgActive : 'transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = bgHover }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              {active && (
                <span style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: '3px', borderRadius: '0 2px 2px 0',
                  background: 'linear-gradient(180deg,#A8D5A2,#4A7A5A)',
                }} />
              )}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: active ? 1 : 0.65 }}>
                  <path d={item.icon} />
                </svg>
                {item.key === 'alerts' && criticalCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-6px', right: '-6px',
                    background: '#DC2626', color: '#fff',
                    borderRadius: '50%', width: '14px', height: '14px',
                    fontSize: '9px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Poppins,sans-serif',
                  }}>{criticalCount > 9 ? '9+' : criticalCount}</span>
                )}
              </div>
              {!collapsed && (
                <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{si ? t(item.key) : item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* BOTTOM USER */}
      <div style={{ padding: '10px', borderTop: `1px solid ${border}` }}>
        {!collapsed ? (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px', borderRadius: '10px', marginBottom: '6px',
              background: 'rgba(255,255,255,0.05)', border: `1px solid ${border}`,
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '11px', color: '#fff', fontFamily: 'Poppins,sans-serif',
              }}>{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', fontFamily: 'Poppins,sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                <div style={{ fontSize: '10px', color: textMuted, fontFamily: 'Poppins,sans-serif', marginTop: '1px' }}>
                  {si ? 'නාගරික ක්‍රියාකරු' : 'Municipal Operator'}
                </div>
              </div>
            </div>
            <button onClick={() => signOut({ callbackUrl: '/' })} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px', borderRadius: '8px', fontSize: '12px',
              color: textMuted, background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'Poppins,sans-serif', fontWeight: 500, transition: 'all 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FF6B6B'; (e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,0.08)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = textMuted; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {si ? t('sign_out') : 'Sign out'}
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '11px', color: '#fff', fontFamily: 'Poppins,sans-serif',
            }}>{initials}</div>
            <button onClick={() => signOut({ callbackUrl: '/' })} title={si ? t('sign_out') : 'Sign out'} style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
