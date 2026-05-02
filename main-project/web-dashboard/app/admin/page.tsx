'use client'
import { useState, useEffect } from 'react'
import { useLang } from '@/lib/LangContext'

export default function AdminPage() {
  const { lang } = useLang()
  const si = lang === 'si'
  const [tab, setTab] = useState<'users'|'ratepayers'>('ratepayers')
  const [users, setUsers] = useState<any[]>([])
  const [ratepayers, setRatepayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newRP, setNewRP] = useState({ registration_number:'', name:'', phone:'', address:'', street:'', district:'Colombo' })
  const [saving, setSaving] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [rpSearch, setRpSearch] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [uRes, rRes] = await Promise.all([
        fetch('/api/admin/users').then(r => r.json()),
        fetch('/api/admin/ratepayer').then(r => r.json()),
      ])
      if (uRes.success) setUsers(uRes.users)
      if (rRes.success) setRatepayers(rRes.ratepayers)
    } catch {}
    setLoading(false)
  }

  const removeUser = async (phone: string, name: string) => {
    if (!confirm(`Remove ${name}?`)) return
    const res = await fetch('/api/admin/users', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ phone }) })
    const d = await res.json()
    if (d.success) { setUsers(prev => prev.filter(u => u.phone !== phone)); showToast(si ? 'පරිශීලකයා ඉවත් කළා' : 'User removed') }
  }

  const removeRatepayer = async (reg: string) => {
    if (!confirm(`Remove ${reg}?`)) return
    const res = await fetch('/api/admin/ratepayer', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ registration_number: reg }) })
    const d = await res.json()
    if (d.success) { setRatepayers(prev => prev.filter(r => r.registration_number !== reg)); showToast(si ? 'ඉවත් කළා' : 'Removed') }
  }

  const updatePayment = async (reg: string, status: string, active: boolean) => {
    const res = await fetch('/api/admin/ratepayer', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ registration_number: reg, payment_status: status, active }) })
    const d = await res.json()
    if (d.success) {
      setRatepayers(prev => prev.map(r => r.registration_number === reg ? {...r, payment_status: status, active} : r))
      showToast(si ? 'යාවත්කාලීන විය' : 'Updated successfully')
    }
  }

  const addRatepayer = async () => {
    if (!newRP.registration_number || !newRP.name || !newRP.phone) { showToast(si ? 'සියලු ක්ෂේත්‍ර අවශ්‍යයි' : 'All fields required'); return }
    setSaving(true)
    const res = await fetch('/api/admin/ratepayer', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(newRP) })
    const d = await res.json()
    if (d.success) {
      showToast(si ? 'රේට්පේයර් එකතු කළා' : 'Ratepayer added')
      setShowAddModal(false)
      setNewRP({ registration_number:'', name:'', phone:'', address:'', street:'', district:'Colombo' })
      fetchAll()
    }
    setSaving(false)
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone?.includes(userSearch)
  )

  const filteredRPs = ratepayers.filter(r =>
    r.name?.toLowerCase().includes(rpSearch.toLowerCase()) ||
    r.registration_number?.toLowerCase().includes(rpSearch.toLowerCase()) ||
    r.phone?.includes(rpSearch)
  )

  const paidCount = ratepayers.filter(r => r.payment_status === 'paid').length
  const activeCount = ratepayers.filter(r => r.active).length
  const ratepayerUsers = users.filter(u => u.is_ratepayer).length

  return (
    <div className="flex flex-col gap-4">
      {toast && <div className="toast" style={{background:'#1A3328'}}>{toast}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F2A3D] tracking-tight">{si ? 'පරිපාලක පැනලය' : 'Admin Panel'}</h1>
          <p className="font-mono text-[10px] text-[#5B8FA8] mt-1">{si ? 'පරිශීලක කළමනාකරණය · රේට්පේයර් රෙජිස්ට්‍රි' : 'User management · Ratepayer registry · Homagama Municipal'}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          {l:si?'මුළු පරිශීලකයන්':'Total Users', v:users.length, c:'#2E86C1'},
          {l:si?'රේට්පේයර්ස්':'Ratepayers', v:ratepayerUsers, c:'#2D7A4F'},
          {l:si?'ගෙවූ රේට්පේයර්ස්':'Paid Ratepayers', v:paidCount, c:'#22C55E'},
          {l:si?'සක්‍රිය ලියාපදිංචි':'Active Registry', v:activeCount, c:'#D97706'},
        ].map(s => (
          <div key={s.l} className="glass-card px-4 py-3">
            <div className="font-mono text-[8px] uppercase tracking-widest mb-1.5" style={{color:s.c+'99'}}>{s.l}</div>
            <div className="text-2xl font-extrabold" style={{color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {(['ratepayers','users'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-5 py-2.5 rounded-xl font-semibold text-[13px] transition-all"
            style={{
              background: tab===t ? 'linear-gradient(135deg,#2D5A1B,#4A8C28)' : 'rgba(255,255,255,0.6)',
              color: tab===t ? '#fff' : '#5B8FA8',
              border: tab===t ? 'none' : '1px solid rgba(255,255,255,0.6)',
              boxShadow: tab===t ? '0 4px 16px rgba(45,90,27,0.25)' : 'none',
            }}>
            {t === 'ratepayers' ? (si?'රේට්පේයර් රෙජිස්ට්‍රි':'Ratepayer Registry') : (si?'ලියාපදිංචි පරිශීලකයන්':'Registered Users')}
          </button>
        ))}
      </div>

      {tab === 'ratepayers' && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-bold text-[14px] text-[#0F2A3D]">{si?'රේට්පේයර් රෙජිස්ට්‍රි':'Ratepayer Registry'}</div>
              <div className="font-mono text-[9.5px] text-[#5B8FA8]">{si?`${ratepayers.length} ලියාපදිංචි · ${paidCount} ගෙවූ`:`${ratepayers.length} registered · ${paidCount} paid`}</div>
            </div>
            <div className="flex gap-2">
              <input value={rpSearch} onChange={e=>setRpSearch(e.target.value)}
                placeholder={si?'සොයන්න...':'Search...'}
                className="px-3 py-1.5 rounded-lg text-[12px] border border-gray-200 outline-none"
                style={{background:'rgba(255,255,255,0.8)',width:'160px'}}/>
              <button onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl text-[12px] font-semibold text-white"
                style={{background:'linear-gradient(135deg,#2D5A1B,#4A8C28)'}}>
                + {si?'නව රේට්පේයර්':'Add Ratepayer'}
              </button>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"/></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{si?'ලියාපදිංචි අංකය':'Reg Number'}</th>
                    <th>{si?'නම':'Name'}</th>
                    <th>{si?'දුරකථනය':'Phone'}</th>
                    <th>{si?'ලිපිනය':'Address'}</th>
                    <th>{si?'ගෙවීම':'Payment'}</th>
                    <th>{si?'තත්ත්වය':'Status'}</th>
                    <th>{si?'ක්‍රියා':'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRPs.map(r => (
                    <tr key={r.registration_number}>
                      <td className="font-mono text-[11px] font-bold text-[#0F2A3D]">{r.registration_number}</td>
                      <td className="text-[12px] font-medium">{r.name}</td>
                      <td className="font-mono text-[11px] text-[#5B8FA8]">{r.phone}</td>
                      <td className="text-[11px] text-[#5B8FA8] max-w-[150px] truncate">{r.address || r.street || '-'}</td>
                      <td>
                        <select value={r.payment_status || 'unpaid'}
                          onChange={e => updatePayment(r.registration_number, e.target.value, r.active)}
                          className="text-[11px] px-2 py-1 rounded-lg border border-gray-200 outline-none cursor-pointer"
                          style={{
                            background: r.payment_status === 'paid' ? 'rgba(34,197,94,0.1)' : 'rgba(220,38,38,0.08)',
                            color: r.payment_status === 'paid' ? '#166534' : '#DC2626',
                            fontWeight: 600,
                          }}>
                          <option value="paid">{si?'ගෙවූ':'Paid'}</option>
                          <option value="unpaid">{si?'නොගෙවූ':'Unpaid'}</option>
                          <option value="overdue">{si?'කල් ඉකුත්':'Overdue'}</option>
                        </select>
                      </td>
                      <td>
                        <button onClick={() => updatePayment(r.registration_number, r.payment_status || 'unpaid', !r.active)}
                          className="text-[11px] px-2.5 py-1 rounded-lg font-semibold"
                          style={{
                            background: r.active ? 'rgba(34,197,94,0.1)' : 'rgba(220,38,38,0.08)',
                            color: r.active ? '#166534' : '#DC2626',
                          }}>
                          {r.active ? (si?'සක්‍රිය':'Active') : (si?'අක්‍රිය':'Inactive')}
                        </button>
                      </td>
                      <td>
                        <button onClick={() => removeRatepayer(r.registration_number)}
                          className="text-[11px] px-2.5 py-1 rounded-lg font-semibold"
                          style={{background:'rgba(220,38,38,0.08)',color:'#DC2626'}}>
                          {si?'ඉවත් කරන්න':'Remove'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-bold text-[14px] text-[#0F2A3D]">{si?'ලියාපදිංචි පරිශීලකයන්':'Registered Citizens'}</div>
              <div className="font-mono text-[9.5px] text-[#5B8FA8]">{si?`${users.length} මුළු · ${ratepayerUsers} රේට්පේයර්ස්`:`${users.length} total · ${ratepayerUsers} ratepayers`}</div>
            </div>
            <input value={userSearch} onChange={e=>setUserSearch(e.target.value)}
              placeholder={si?'නම හෝ දුරකථනය...':'Search name or phone...'}
              className="px-3 py-1.5 rounded-lg text-[12px] border border-gray-200 outline-none"
              style={{background:'rgba(255,255,255,0.8)',width:'200px'}}/>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"/></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{si?'නම':'Name'}</th>
                    <th>{si?'දුරකථනය':'Phone'}</th>
                    <th>{si?'ප්‍රදේශය':'Area'}</th>
                    <th>{si?'රේට්පේයර්':'Ratepayer'}</th>
                    <th>{si?'ලියාපදිංචි':'Registered'}</th>
                    <th>{si?'ක්‍රියා':'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.phone}>
                      <td className="font-medium text-[12px] text-[#0F2A3D]">{u.name}</td>
                      <td className="font-mono text-[11px] text-[#5B8FA8]">{u.phone}</td>
                      <td className="text-[11px] text-[#5B8FA8]">{u.area || 'Homagama'}</td>
                      <td>
                        <span className={'text-[11px] font-semibold px-2 py-0.5 rounded-full ' + (u.is_ratepayer ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                          {u.is_ratepayer ? (si?'ඔව්':'Yes') : (si?'නැත':'No')}
                        </span>
                      </td>
                      <td className="text-[10px] text-[#5B8FA8]">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '-'}
                      </td>
                      <td>
                        <button onClick={() => removeUser(u.phone, u.name)}
                          className="text-[11px] px-2.5 py-1 rounded-lg font-semibold"
                          style={{background:'rgba(220,38,38,0.08)',color:'#DC2626'}}>
                          {si?'ඉවත් කරන්න':'Remove'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:'rgba(0,0,0,0.5)'}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="font-bold text-[17px] text-[#0F2A3D]">{si?'නව රේට්පේයර් එකතු කරන්න':'Add New Ratepayer'}</div>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">✕</button>
            </div>
            <div className="flex flex-col gap-3">
              {[
                {l:si?'ලියාපදිංචි අංකය':'Registration Number', k:'registration_number', ph:'HMC-2024-006'},
                {l:si?'සම්පූර්ණ නම':'Full Name', k:'name', ph:'John Silva'},
                {l:si?'දුරකථනය':'Phone', k:'phone', ph:'0771234567'},
                {l:si?'ලිපිනය':'Address', k:'address', ph:'No.15, Homagama'},
                {l:si?'වීදිය':'Street', k:'street', ph:'Main Street'},
              ].map(f => (
                <div key={f.k}>
                  <div className="text-[11px] font-semibold text-[#5B8FA8] uppercase tracking-wide mb-1">{f.l}</div>
                  <input value={(newRP as any)[f.k]} onChange={e => setNewRP(prev => ({...prev, [f.k]: e.target.value}))}
                    placeholder={f.ph}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] outline-none focus:border-green-500"/>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600">
                {si?'අවලංගු':'Cancel'}
              </button>
              <button onClick={addRatepayer} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white disabled:opacity-50"
                style={{background:'linear-gradient(135deg,#2D5A1B,#4A8C28)'}}>
                {saving ? (si?'සුරකිමින්...':'Saving...') : (si?'එකතු කරන්න':'Add Ratepayer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
