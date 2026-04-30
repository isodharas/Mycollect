'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useLang } from '@/lib/LangContext'
import { useState } from 'react'

const NAV = [
  { href:'/dashboard', key:'overview',   label:'Overview',   icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href:'/bins',      key:'live_bins',  label:'Live Bins',  icon:'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { href:'/routes',    key:'routes',     label:'Routes',     icon:'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { href:'/analytics', key:'analytics',  label:'Analytics',  icon:'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { href:'/alerts',    key:'alerts',     label:'Alerts',     icon:'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', },
  { href:'/reports',   key:'reports',    label:'Reports',    icon:'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
]

export default function Sidebar() {
  const path = usePathname()
  const { data: session } = useSession()
  const { lang, setLang, t } = useLang()
  const [collapsed, setCollapsed] = useState(false)
  const name = session?.user?.name || 'User'
  const initials = name.split(' ').map((n:string)=>n[0]).join('').slice(0,2).toUpperCase()
  const si = lang === 'si'

  return (
    <aside
      style={{
        width: collapsed ? '68px' : '220px',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderRight: '1px solid rgba(255,255,255,0.72)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 32px rgba(45,90,27,0.06)',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}
    >
      {/* Logo + collapse button */}
      <div style={{
        padding: '16px 12px',
        borderBottom: '1px solid rgba(74,140,40,0.10)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '64px',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:'10px',overflow:'hidden'}}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg,#4A8C28,#2D5A1B)',
            boxShadow: '0 4px 12px rgba(45,90,27,0.30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{color:'#fff',fontWeight:800,fontSize:'12px',fontFamily:'Poppins,sans-serif'}}>MC</span>
          </div>
          {!collapsed && (
            <div style={{overflow:'hidden'}}>
              <div style={{fontWeight:700,fontSize:'15px',color:'#2D5A1B',fontFamily:'Poppins,sans-serif',whiteSpace:'nowrap'}}>MyCollect</div>
              <div style={{fontSize:'9px',color:'#6BA53A',fontFamily:'Poppins,sans-serif',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.1em',marginTop:'1px'}}>
                {si ? 'පරිපාලක' : 'Admin'}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'rgba(74,140,40,0.08)',
            border: '1px solid rgba(74,140,40,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, color: '#4A8C28',
            transition: 'all 0.2s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {collapsed
              ? <path d="M9 18l6-6-6-6"/>
              : <path d="M15 18l-6-6 6-6"/>
            }
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav style={{flex:1,padding:'12px 8px',overflowY:'auto',overflowX:'hidden'}}>
        {!collapsed && (
          <div style={{
            fontFamily:'Poppins,sans-serif',fontSize:'9px',fontWeight:600,
            color:'#9CB89C',textTransform:'uppercase',letterSpacing:'0.1em',
            padding:'0 12px',marginBottom:'8px',
          }}>
            {si ? t('navigation') : 'Navigation'}
          </div>
        )}
        {NAV.map(item => {
          const active = path===item.href||(item.href!=='/dashboard'&&path.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? (si ? t(item.key) : item.label) : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '10px',
                marginBottom: '2px',
                fontSize: '13px',
                fontWeight: active ? 600 : 500,
                fontFamily: 'Poppins,sans-serif',
                color: active ? '#2D5A1B' : '#6B8C6B',
                textDecoration: 'none',
                position: 'relative',
                background: active ? 'rgba(74,140,40,0.12)' : 'transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e=>{if(!active)(e.currentTarget as HTMLElement).style.background='rgba(74,140,40,0.07)'}}
              onMouseLeave={e=>{if(!active)(e.currentTarget as HTMLElement).style.background='transparent'}}
            >
              {active && (
                <span style={{
                  position:'absolute',left:0,top:'20%',bottom:'20%',
                  width:'3px',borderRadius:'0 2px 2px 0',
                  background:'linear-gradient(180deg,#6BA53A,#2D5A1B)',
                }}/>
              )}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                <path d={item.icon}/>
              </svg>
              {!collapsed && (
                <span style={{flex:1,whiteSpace:'nowrap'}}>
                  {si ? t(item.key) : item.label}
                </span>
              )}
              {!collapsed && item.alert && (
                <span style={{
                  fontFamily:'Poppins,sans-serif',fontSize:'9px',fontWeight:700,
                  padding:'2px 6px',borderRadius:'10px',color:'#fff',
                  background:'#DC2626',lineHeight:'14px',flexShrink:0,
                }}>
                  {item.alert}
                </span>
              )}
              {collapsed && item.alert && (
                <span style={{
                  position:'absolute',top:'6px',right:'6px',
                  width:'8px',height:'8px',borderRadius:'50%',background:'#DC2626',
                }}/>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{padding:'10px',borderTop:'1px solid rgba(74,140,40,0.10)'}}>
        {!collapsed ? (
          <>
            <div style={{
              display:'flex',alignItems:'center',gap:'10px',
              padding:'10px',borderRadius:'10px',marginBottom:'6px',
              background:'rgba(255,255,255,0.60)',border:'1px solid rgba(255,255,255,0.72)',
            }}>
              <div style={{
                width:'32px',height:'32px',borderRadius:'8px',flexShrink:0,
                background:'linear-gradient(135deg,#4A8C28,#2D5A1B)',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontWeight:700,fontSize:'11px',color:'#fff',fontFamily:'Poppins,sans-serif',
              }}>{initials}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'12px',fontWeight:600,color:'#1A2E1A',fontFamily:'Poppins,sans-serif',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{name}</div>
                <div style={{fontSize:'10px',color:'#6B8C6B',fontFamily:'Poppins,sans-serif',marginTop:'1px'}}>
                  {si ? t('municipal_operator') : 'Municipal Operator'}
                </div>
              </div>
            </div>
            <button
              onClick={()=>signOut({callbackUrl:'/'})}
              style={{
                width:'100%',display:'flex',alignItems:'center',gap:'8px',
                padding:'8px 12px',borderRadius:'8px',fontSize:'12px',
                color:'#6B8C6B',background:'transparent',border:'none',cursor:'pointer',
                fontFamily:'Poppins,sans-serif',fontWeight:500,transition:'all 0.15s',
              }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='#DC2626';(e.currentTarget as HTMLElement).style.background='rgba(220,38,38,0.06)'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='#6B8C6B';(e.currentTarget as HTMLElement).style.background='transparent'}}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              {si ? t('sign_out') : 'Sign out'}
            </button>
          </>
        ) : (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}>
            <div style={{
              width:'32px',height:'32px',borderRadius:'8px',
              background:'linear-gradient(135deg,#4A8C28,#2D5A1B)',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontWeight:700,fontSize:'11px',color:'#fff',fontFamily:'Poppins,sans-serif',
            }}>{initials}</div>
            <button
              onClick={()=>signOut({callbackUrl:'/'})}
              title={si ? t('sign_out') : 'Sign out'}
              style={{
                width:'32px',height:'32px',borderRadius:'8px',
                background:'transparent',border:'none',cursor:'pointer',
                color:'#6B8C6B',display:'flex',alignItems:'center',justifyContent:'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
