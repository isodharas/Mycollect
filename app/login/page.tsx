'use client'
import './login.css'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/LangContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { lang } = useLang()
  const t = (en: string, si: string) => lang === 'si' ? si : en

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.error) { setError(t('Invalid email or password', 'වැරදි විද්‍යුත් තැපෑල හෝ මුරපදය')); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Plus Jakarta Sans, Noto Sans Sinhala, sans-serif', position:'relative', overflow:'hidden' }}>
      <img src="https://images.unsplash.com/photo-1776777484084-531576dace95?q=80&w=1600&auto=format&fit=crop" alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', zIndex:0 }} />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(10,25,18,0.82) 0%,rgba(20,45,32,0.75) 100%)', zIndex:1 }} />
      <div style={{ position:'relative', zIndex:2, width:'100%', maxWidth:420, padding:'0 24px' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{fontSize:42,fontWeight:800,letterSpacing:"-0.03em",margin:"0 auto 14px",textAlign:"center"}}><span style={{color:"#fff"}}>My</span><span style={{color:"#90EE90"}}>Collect</span></div>
          <div style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:5, letterSpacing:'.1em', textTransform:'uppercase' }}>{t('Health-First Waste Intelligence','සෞඛ්‍ය-ප්‍රථම අපද්‍රව්‍ය බුද්ධිය')}</div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.07)', backdropFilter:'blur(32px)', WebkitBackdropFilter:'blur(32px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:24, padding:36, boxShadow:'0 32px 80px rgba(0,0,0,0.4)' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'5px 12px', borderRadius:100, marginBottom:22, background:'rgba(76,175,114,0.12)', border:'1px solid rgba(76,175,114,0.25)' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#4CAF72', display:'inline-block' }} />
            <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', color:'#4CAF72' }}>{t('System Live · Homagama','පද්ධතිය සජීව · හෝමාගම')}</span>
          </div>
          <div style={{ fontSize:20, fontWeight:700, color:'#fff', marginBottom:5 }}>{t('Welcome back','නැවත සාදරයෙන්')}</div>
          <div style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:28, letterSpacing:'.03em' }}>{t('Homagama Municipal Zone','හෝමාගම නාගරික කලාපය')}</div>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.4)', marginBottom:7, letterSpacing:'.06em', textTransform:'uppercase' }}>{t('Email','විද්‍යුත් තැපෑල')}</div>
              <input className="inp" type="email" placeholder="admin@mycollect.lk" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.4)', marginBottom:7, letterSpacing:'.06em', textTransform:'uppercase' }}>{t('Password','මුරපදය')}</div>
              <input className="inp" type="password" placeholder="••••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(220,38,38,0.12)', border:'1px solid rgba(220,38,38,0.25)', color:'#FCA5A5', fontSize:13 }}>{error}</div>}
            <button className="btn" type="submit" disabled={loading} style={{ marginTop:4 }}>
              {loading && <span className="spinner" />}
              {loading ? t('Signing in...','පිවිසෙමින්...') : t('Sign In','පිවිසෙන්න')}
            </button>
          </form>
        </div>
        <div style={{ textAlign:'center', marginTop:20, fontFamily:'DM Mono,monospace', fontSize:10, color:'rgba(255,255,255,0.15)', letterSpacing:'.06em' }}>
          {t('NSBM GREEN UNIVERSITY · BSc HONS SOFTWARE ENGINEERING · 2025–2026','NSBM · BSc (Hons) මෘදුකාංග ඉංජිනේරු · 2025–2026')}
        </div>
      </div>
    </div>
  )
}
