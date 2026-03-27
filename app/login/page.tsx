'use client'
import './login.css'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '@/lib/LangContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { lang, setLang } = useLang()

  const t = (en: string, si: string) => lang === 'si' ? si : en

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.error) { setError(t('Invalid email or password','වැරදි විද්‍යුත් තැපෑල හෝ මුරපදය')); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#0F1F18 0%,#1A3328 50%,#0F1F18 100%)',fontFamily:'Plus Jakarta Sans,sans-serif',padding:'24px'}}>
      <div style={{width:'100%',maxWidth:440}}>

        {/* Lang toggle */}
        <div style={{display:'flex',justifyContent:'center',marginBottom:24}}>
          <div style={{display:'flex',borderRadius:8,overflow:'hidden',border:'1px solid rgba(255,255,255,0.15)'}}>
            <button onClick={()=>setLang('si')} style={{padding:'6px 16px',cursor:'pointer',border:'none',borderRight:'1px solid rgba(255,255,255,0.15)',background:lang==='si'?'rgba(255,255,255,0.2)':'transparent',color:'#fff',fontFamily:'Plus Jakarta Sans,sans-serif',fontSize:11.5,fontWeight:700,transition:'all .2s'}}>සිංහලෙන් බලන්න</button>
            <button onClick={()=>setLang('en')} style={{padding:'6px 16px',cursor:'pointer',border:'none',background:lang==='en'?'rgba(255,255,255,0.2)':'transparent',color:'#fff',fontFamily:'Plus Jakarta Sans,sans-serif',fontSize:11.5,fontWeight:700,transition:'all .2s'}}>View in English</button>
          </div>
        </div>

        <div style={{textAlign:'center',marginBottom:36}}>
          <div style={{width:56,height:56,borderRadius:16,background:'#2D5A3D',margin:'0 auto 16px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:18,color:'#fff'}}>MC</div>
          <div style={{fontSize:26,fontWeight:800,color:'#fff',letterSpacing:'-.02em'}}>MyCollect</div>
          <div style={{fontFamily:'DM Mono,monospace',fontSize:11,color:'rgba(255,255,255,.4)',marginTop:6,letterSpacing:'.1em',textTransform:'uppercase'}}>{t('Health-First Waste Intelligence','සෞඛ්‍ය-ප්‍රථම අපද්‍රව්‍ය බුද්ධිය')}</div>
        </div>

        <div className="card" style={{background:'rgba(255,255,255,.05)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',border:'1px solid rgba(255,255,255,.1)',borderRadius:20,padding:36}}>
          <div style={{fontSize:20,fontWeight:700,color:'#fff',marginBottom:6}}>{t('Welcome back','නැවත සාදරයෙන් පිළිගනිමු')}</div>
          <div style={{fontFamily:'DM Mono,monospace',fontSize:11,color:'rgba(255,255,255,.35)',marginBottom:28,letterSpacing:'.04em'}}>{t('Homagama Municipal Zone','හෝමාගම නාගරික කලාපය')}</div>

          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:14}}>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,.5)',marginBottom:7,letterSpacing:'.04em'}}>{t('EMAIL','විද්‍යුත් තැපෑල')}</div>
              <input className="inp" type="email" placeholder="admin@mycollect.lk" value={email} onChange={e=>setEmail(e.target.value)} required/>
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,.5)',marginBottom:7,letterSpacing:'.04em'}}>{t('PASSWORD','මුරපදය')}</div>
              <input className="inp" type="password" placeholder="••••••••••" value={password} onChange={e=>setPassword(e.target.value)} required/>
            </div>
            {error && (
              <div style={{padding:'10px 14px',borderRadius:8,background:'rgba(220,38,38,.12)',border:'1px solid rgba(220,38,38,.25)',color:'#FCA5A5',fontSize:13,fontFamily:'DM Mono,monospace'}}>{error}</div>
            )}
            <button className="btn" type="submit" disabled={loading} style={{marginTop:6}}>
              {loading && <span className="spinner"/>}
              {loading ? t('Signing in...','පිවිසෙමින්...') : t('Sign In','පිවිසෙන්න')}
            </button>
          </form>

          <div style={{marginTop:20,paddingTop:18,borderTop:'1px solid rgba(255,255,255,.08)',textAlign:'center',fontFamily:'DM Mono,monospace',fontSize:12,color:'rgba(255,255,255,.35)'}}>
            {t('New to MyCollect?','MyCollect වෙත නවකයෙක්ද?')}{' '}
            <Link href="/signup" style={{color:'#7AAE8A',textDecoration:'none',fontWeight:500}}>{t('Create an account','ගිණුමක් සාදන්න')}</Link>
          </div>

          <div style={{marginTop:14,padding:'12px 14px',borderRadius:10,background:'rgba(45,90,61,.12)',border:'1px solid rgba(45,90,61,.2)'}}>
            <div style={{fontFamily:'DM Mono,monospace',fontSize:10,color:'rgba(255,255,255,.3)',marginBottom:6,letterSpacing:'.08em',textTransform:'uppercase'}}>{t('Demo credentials','ආදර්ශ අක්‍රයන්')}</div>
            <div style={{fontFamily:'DM Mono,monospace',fontSize:11,color:'rgba(255,255,255,.5)',lineHeight:1.8}}>
              admin@mycollect.lk<br/>mycollect2024
            </div>
          </div>
        </div>

        <div style={{textAlign:'center',marginTop:24,fontFamily:'DM Mono,monospace',fontSize:10,color:'rgba(255,255,255,.2)',letterSpacing:'.08em'}}>
          {t('NSBM GREEN UNIVERSITY · BSc HONS SOFTWARE ENGINEERING · 2025–2026','NSBM කොළඹ සරසවිය · BSc (Hons) මෘදුකාංග ඉංජිනේරු · 2025–2026')}
        </div>
      </div>
    </div>
  )
}
