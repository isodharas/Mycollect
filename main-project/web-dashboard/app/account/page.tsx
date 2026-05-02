'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useLang } from '@/lib/LangContext'

export default function AccountPage() {
  const { data: session } = useSession()
  const { lang } = useLang()
  const si = lang === 'si'
  const [toast, setToast] = useState('')
  const [changing, setChanging] = useState(false)
  const [pwForm, setPwForm] = useState({ current:'', newpw:'', confirm:'' })
  const [saving, setSaving] = useState(false)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const changePassword = async () => {
    if (!pwForm.current || !pwForm.newpw || !pwForm.confirm) { showToast(si?'සියලු ක්ෂේත්‍ර අවශ්‍යයි':'All fields required'); return }
    if (pwForm.newpw !== pwForm.confirm) { showToast(si?'මුරපද ගැලපෙන්නේ නැත':'Passwords do not match'); return }
    if (pwForm.newpw.length < 8) { showToast(si?'මුරපදය අවම අක්ෂර 8ක් විය යුතුය':'Password must be at least 8 characters'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ current: pwForm.current, newPassword: pwForm.newpw })
      })
      const d = await res.json()
      if (d.success) {
        showToast(si?'මුරපදය සාර්ථකව වෙනස් කළා':'Password changed successfully')
        setPwForm({ current:'', newpw:'', confirm:'' })
        setChanging(false)
      } else {
        showToast(d.error || (si?'අසාර්ථකයි':'Failed'))
      }
    } catch { showToast(si?'දෝෂයකි':'Error occurred') }
    setSaving(false)
  }

  const name = session?.user?.name || 'Admin'
  const email = session?.user?.email || 'admin@mycollect.lk'
  const initials = name.split(' ').map((n:string)=>n[0]).join('').slice(0,2).toUpperCase()

  return (
    <div className="flex flex-col gap-4">
      {toast && <div className="toast" style={{background:'#1A3328'}}>{toast}</div>}

      <div>
        <h1 className="text-xl font-extrabold text-[#0F2A3D] tracking-tight">{si?'ගිණුම':'Account'}</h1>
        <p className="font-mono text-[10px] text-[#5B8FA8] mt-1">{si?'පරිපාලක පැනලය · ගිණුම් සැකසුම්':'Admin profile · account settings'}</p>
      </div>

      {/* Profile Card */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div style={{
            width:'64px',height:'64px',borderRadius:'16px',flexShrink:0,
            background:'linear-gradient(135deg,#4A8C28,#2D5A1B)',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'22px',fontWeight:800,color:'#fff',fontFamily:'Poppins,sans-serif',
            boxShadow:'0 4px 16px rgba(45,90,27,0.3)',
          }}>{initials}</div>
          <div>
            <div className="text-[18px] font-bold text-[#0F2A3D]">{name}</div>
            <div className="text-[12px] text-[#5B8FA8] mt-0.5">{email}</div>
            <div className="mt-1.5">
              <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg text-white"
                style={{background:'linear-gradient(135deg,#2D5A1B,#4A8C28)'}}>
                {si?'නාගරික ක්‍රියාකරු':'Municipal Operator'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            {l:si?'භූමිකාව':'Role', v:si?'නාගරික ක්‍රියාකරු':'Municipal Operator'},
            {l:si?'සංවිධානය':'Organisation', v:'Homagama Municipal Council'},
            {l:si?'ප්‍රදේශය':'Zone', v:'Homagama, Colombo District'},
            {l:si?'ප්‍රවේශ මට්ටම':'Access Level', v:si?'පූර්ණ ප්‍රවේශය':'Full Access'},
          ].map(f => (
            <div key={f.l} className="px-4 py-3 rounded-xl" style={{background:'rgba(255,255,255,0.5)',border:'1px solid rgba(255,255,255,0.7)'}}>
              <div className="font-mono text-[9px] uppercase tracking-widest text-[#5B8FA8] mb-1">{f.l}</div>
              <div className="text-[13px] font-semibold text-[#0F2A3D]">{f.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="glass-card p-5">
        <div className="font-bold text-[14px] text-[#0F2A3D] mb-3">{si?'පද්ධති තොරතුරු':'System Information'}</div>
        <div className="grid grid-cols-3 gap-3">
          {[
            {l:'AWS Region', v:'ap-southeast-2 (Sydney)'},
            {l:si?'ML ආකෘතිය':'ML Model', v:'Random Forest · 99.19% accuracy'},
            {l:si?'CV නිරවද්‍යතාව':'CV Accuracy', v:'95.80% (5-fold)'},
            {l:si?'පුහුණු දත්ත':'Training Data', v:'616 readings (296 real + 320 simulated)'},
            {l:si?'API ප්‍රතිචාරය':'API Response', v:'Avg 1.12s · Min 558ms'},
            {l:si?'Lambda කාර්යයන්':'Lambda Functions', v:'6 functions deployed'},
            {l:'DynamoDB', v:'4 tables · BinLatestStatus · BinSensorData'},
            {l:si?'සෞඛ්‍ය සූත්‍රය':'Health Formula', v:'Gas 70% · Fill 30%'},
          ].map(f => (
            <div key={f.l} className="px-4 py-3 rounded-xl" style={{background:'rgba(255,255,255,0.5)',border:'1px solid rgba(255,255,255,0.7)'}}>
              <div className="font-mono text-[9px] uppercase tracking-widest text-[#5B8FA8] mb-1">{f.l}</div>
              <div className="font-mono text-[11px] font-semibold text-[#0F2A3D]">{f.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold text-[14px] text-[#0F2A3D]">{si?'මුරපදය වෙනස් කරන්න':'Change Password'}</div>
          <button onClick={() => setChanging(!changing)}
            className="px-4 py-1.5 rounded-lg text-[12px] font-semibold"
            style={{background:'rgba(46,134,193,0.1)',color:'#2E86C1',border:'1px solid rgba(46,134,193,0.2)'}}>
            {changing ? (si?'අවලංගු':'Cancel') : (si?'වෙනස් කරන්න':'Change')}
          </button>
        </div>
        {!changing ? (
          <div className="font-mono text-[11px] text-[#5B8FA8]">●●●●●●●●●●●●</div>
        ) : (
          <div className="flex flex-col gap-3">
            {[
              {l:si?'වත්මන් මුරපදය':'Current Password', k:'current'},
              {l:si?'නව මුරපදය':'New Password', k:'newpw'},
              {l:si?'නව මුරපදය තහවුරු කරන්න':'Confirm New Password', k:'confirm'},
            ].map(f => (
              <div key={f.k}>
                <div className="text-[11px] font-semibold text-[#5B8FA8] uppercase tracking-wide mb-1">{f.l}</div>
                <input type="password" value={(pwForm as any)[f.k]}
                  onChange={e => setPwForm(prev => ({...prev, [f.k]: e.target.value}))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] outline-none focus:border-green-500"
                  style={{background:'rgba(255,255,255,0.8)'}}/>
              </div>
            ))}
            <button onClick={changePassword} disabled={saving}
              className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white mt-1 disabled:opacity-50"
              style={{background:'linear-gradient(135deg,#2D5A1B,#4A8C28)'}}>
              {saving ? (si?'සුරකිමින්...':'Saving...') : (si?'මුරපදය යාවත්කාලීන කරන්න':'Update Password')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
