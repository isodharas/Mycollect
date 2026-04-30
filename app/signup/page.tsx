'use client'
import './signup.css'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '@/lib/LangContext'

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', zone: 'Homagama' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { lang } = useLang()

  const t = (en: string, si: string) => lang === 'si' ? si : en

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError(t('Passwords do not match', 'මුරපද නොගැලපේ')); return }
    if (form.password.length < 8) { setError(t('Password must be at least 8 characters', 'මුරපදය අවම වශයෙන් අකුරු 8ක් විය යුතුය')); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password, zone: form.zone })
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || t('Registration failed', 'ලියාපදිංචිය අසාර්ථකයි')); setLoading(false); return }
    const login = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    if (login?.error) { setError(t('Account created. Please sign in.', 'ගිණුම සාදන ලදී. කරුණාකර පිවිසෙන්න.')); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#0F1F18 0%,#1A3328 50%,#0F1F18 100%)', fontFamily: 'Plus Jakarta Sans,sans-serif', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#2D5A3D', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: '#fff' }}>MC</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-.02em' }}>MyCollect</div>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 6, letterSpacing: '.1em', textTransform: 'uppercase' }}>{t('Create your account', 'ගිණුමක් සාදන්න')}</div>
        </div>

        <div className="card" style={{ background: 'rgba(255,255,255,.05)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: 36 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{t('Get started', 'ආරම්භ කරන්න')}</div>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'rgba(255,255,255,.35)', marginBottom: 28, letterSpacing: '.04em' }}>{t('Homagama Municipal Zone', 'හෝමාගම නාගරික කලාපය')}</div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.5)', marginBottom: 7, letterSpacing: '.04em' }}>{t('FULL NAME', 'සම්පූර්ණ නම')}</div>
              <input className="inp" type="text" placeholder={t('Your full name', 'ඔබේ සම්පූර්ණ නම')} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.5)', marginBottom: 7, letterSpacing: '.04em' }}>{t('EMAIL', 'විද්‍යුත් තැපෑල')}</div>
              <input className="inp" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.5)', marginBottom: 7, letterSpacing: '.04em' }}>{t('PASSWORD', 'මුරපදය')}</div>
              <input className="inp" type="password" placeholder={t('Min. 8 characters', 'අවම. අකුරු 8')} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.5)', marginBottom: 7, letterSpacing: '.04em' }}>{t('CONFIRM PASSWORD', 'මුරපදය තහවුරු කරන්න')}</div>
              <input className="inp" type="password" placeholder={t('Repeat password', 'මුරපදය නැවත ඇතුළත් කරන්න')} value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(220,38,38,.12)', border: '1px solid rgba(220,38,38,.25)', color: '#FCA5A5', fontSize: 13, fontFamily: 'DM Mono,monospace' }}>{error}</div>
            )}

            <button className="btn" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading && <span className="spinner" />}
              {loading ? t('Creating account...', 'ගිණුම සාදමින්...') : t('Create Account', 'ගිණුම සාදන්න')}
            </button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,.08)', textAlign: 'center', fontFamily: 'DM Mono,monospace', fontSize: 12, color: 'rgba(255,255,255,.35)' }}>
            {t('Already have an account?', 'දැනටමත් ගිණුමක් තිබේද?')}{' '}
            <Link href="/login" style={{ color: '#7AAE8A', textDecoration: 'none', fontWeight: 500 }}>{t('Sign in', 'පිවිසෙන්න')}</Link>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 24, fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'rgba(255,255,255,.2)', letterSpacing: '.08em' }}>
          {t('NSBM GREEN UNIVERSITY · BSc HONS SOFTWARE ENGINEERING · 2025–2026', 'NSBM කොළඹ සරසවිය · BSc (Hons) මෘදුකාංග ඉංජිනේරු · 2025–2026')}
        </div>
      </div>
    </div>
  )
}
