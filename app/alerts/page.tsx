'use client'
import { useState, useEffect } from 'react'
import { useLang } from '@/lib/LangContext'
import { BIN_LOCATIONS } from '@/lib/data'
import PriorityBadge from '@/components/PriorityBadge'

const PC: Record<string,string> = {CRITICAL:'#DC2626',HIGH:'#D97706',MEDIUM:'#CA8A04',LOW:'#2D7A4F'}
const BINS = ['BIN_001','BIN_002','BIN_003','BIN_004','BIN_005']

interface Alert {
  id: string
  bin_id: string
  priority: 'CRITICAL'|'HIGH'|'MEDIUM'
  gas_ppm: number
  fill_level: number
  health_risk: number
  timestamp: string
}

function timeAgo(ts: string): string {
  const s = Math.floor((Date.now() - parseInt(ts)*1000) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

function formatTime(ts: string): string {
  return new Date(parseInt(ts)*1000).toLocaleString('en-GB', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})
}

export default function AlertsPage() {
  const { lang } = useLang()
  const si = lang === 'si'
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL'|'CRITICAL'|'HIGH'|'MEDIUM'>('ALL')
  const [selectedAlert, setSelectedAlert] = useState<Alert|null>(null)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      const all: Alert[] = []
      await Promise.all(BINS.map(async bin_id => {
        try {
          const res = await fetch(`/api/proxy/catchall?path=bin/${bin_id}/history`)
          const data = await res.json()
          ;(data.history || []).forEach((h: any) => {
            if (['CRITICAL','HIGH','MEDIUM'].includes(h.priority_label)) {
              all.push({
                id: `${bin_id}-${h.timestamp}`,
                bin_id,
                priority: h.priority_label,
                gas_ppm: h.gas_ppm || 0,
                fill_level: h.fill_level || 0,
                health_risk: h.health_risk || 0,
                timestamp: h.timestamp,
              })
            }
          })
        } catch {}
      }))
      const priorityOrder = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2}
      all.sort((a,b) => {
        const pd = (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3) - (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3)
        return pd !== 0 ? pd : parseInt(b.timestamp) - parseInt(a.timestamp)
      })
      setAlerts(all)
      setLoading(false)
    }
    fetchAll()
  }, [])

  const filtered = filter === 'ALL' ? alerts : alerts.filter(a => a.priority === filter)
  const counts = {
    ALL: alerts.length,
    CRITICAL: alerts.filter(a=>a.priority==='CRITICAL').length,
    HIGH: alerts.filter(a=>a.priority==='HIGH').length,
    MEDIUM: alerts.filter(a=>a.priority==='MEDIUM').length,
  }
  const unreadCount = alerts.filter(a => !readIds.has(a.id)).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F2A3D] tracking-tight">
            {si ? 'අනතුරු ඇඟවීම්' : 'Alerts'}
          </h1>
          <p className="font-mono text-[10px] text-[#5B8FA8] mt-1">
            {si ? `${unreadCount} නොකියවූ · ඉතිහාස සිදුවීම්` : `${unreadCount} unread · historical events`}
          </p>
        </div>
        <button onClick={() => { setReadIds(new Set(alerts.map(a=>a.id))); localStorage.setItem('alerts_cleared_at', Date.now().toString()) }}
          className="px-4 py-2 rounded-xl font-mono text-[11px] font-medium text-[#5B8FA8] transition-all hover:bg-white/50"
          style={{background:'rgba(255,255,255,0.45)',border:'1px solid rgba(46,134,193,0.15)'}}>
          {si ? 'සියල්ල කියවා ඇති ලෙස සලකුණු' : 'Mark all as read'}
        </button>
      </div>

      <div className="flex gap-2">
        {(['ALL','CRITICAL','HIGH','MEDIUM'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="font-mono text-[10px] px-3.5 py-2 rounded-xl transition-all"
            style={{
              background: filter===f ? (f==='ALL' ? 'rgba(46,134,193,0.1)' : `${PC[f]}18`) : 'rgba(255,255,255,0.45)',
              border: `1px solid ${filter===f ? (f==='ALL' ? 'rgba(46,134,193,0.25)' : `${PC[f]}44`) : 'rgba(255,255,255,0.6)'}`,
              color: filter===f ? (f==='ALL' ? '#2E86C1' : PC[f]) : '#5B8FA8',
              fontWeight: filter===f ? 700 : 500,
            }}>
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 font-mono text-[13px] text-[#5B8FA8]">
          {si ? 'දත්ත පූරණය වෙමින්...' : 'Loading alerts...'}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 font-mono text-[13px] text-[#5B8FA8]">
          {si ? 'අනතුරු ඇඟවීම් නැත' : 'No alerts found'}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(alert => {
            const isRead = readIds.has(alert.id)
            return (
              <button key={alert.id}
                onClick={() => { setSelectedAlert(alert); setReadIds(prev => new Set([...prev, alert.id])) }}
                className="w-full text-left glass-card px-5 py-4 transition-all hover:-translate-y-0.5"
                style={{borderLeft:`4px solid ${PC[alert.priority]}`,opacity:isRead?0.7:1}}>
                <div className="flex items-start gap-4">
                  <div className="pt-1.5 flex-shrink-0">
                    {!isRead && <span className="w-2 h-2 rounded-full block" style={{background:PC[alert.priority]}} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="font-mono text-[12px] font-semibold text-[#0F2A3D]">{alert.bin_id}</span>
                      <PriorityBadge priority={alert.priority} size="sm" />
                      <span className="font-mono text-[9px] text-[#5B8FA8] ml-auto">{timeAgo(alert.timestamp)}</span>
                    </div>
                    <p className="text-[12.5px] text-[#2E5266] leading-relaxed mb-2">
                      {si
                        ? `${alert.gas_ppm} PPM වායු · ${alert.fill_level}% පිරවීම · අවදානම් ලකුණු ${alert.health_risk}`
                        : `Gas ${alert.gas_ppm} PPM · Fill ${alert.fill_level}% · Health risk ${alert.health_risk}`}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] text-[#5B8FA8]">{BIN_LOCATIONS[alert.bin_id] || 'Homagama'}</span>
                      <span className="font-mono text-[10px] text-[#5B8FA8]">{formatTime(alert.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {selectedAlert && (
        <div className="overlay" onClick={() => setSelectedAlert(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{background:`${PC[selectedAlert.priority]}12`,border:`1px solid ${PC[selectedAlert.priority]}25`}}>
                  <span style={{color:PC[selectedAlert.priority],fontWeight:800,fontSize:18}}>!</span>
                </div>
                <div>
                  <div className="font-mono text-[14px] font-semibold text-[#0F2A3D]">{selectedAlert.bin_id}</div>
                  <div className="font-mono text-[10px] text-[#5B8FA8]">{BIN_LOCATIONS[selectedAlert.bin_id] || 'Homagama'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={selectedAlert.priority} />
                <button onClick={() => setSelectedAlert(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5B8FA8]"
                  style={{background:'rgba(46,134,193,0.06)',border:'1px solid rgba(46,134,193,0.12)'}}>×</button>
              </div>
            </div>
            <div className="font-mono text-[10px] text-[#5B8FA8] mb-4">{formatTime(selectedAlert.timestamp)}</div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                {l:si?'වායු PPM':'Gas PPM',v:selectedAlert.gas_ppm},
                {l:si?'පිරවීමේ මට්ටම':'Fill Level',v:`${selectedAlert.fill_level}%`},
                {l:si?'සෞඛ්‍ය අවදානම':'Health Risk',v:`${selectedAlert.health_risk}/100`},
              ].map(s => (
                <div key={s.l} className="rounded-xl p-3 text-center" style={{background:'rgba(46,134,193,0.04)'}}>
                  <div className="font-mono text-[8px] uppercase tracking-widest text-[#5B8FA8] mb-1">{s.l}</div>
                  <div className="text-xl font-extrabold" style={{color:PC[selectedAlert.priority]}}>{s.v}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setSelectedAlert(null)}
              className="w-full py-2.5 rounded-xl font-semibold text-[13px] text-[#5B8FA8] transition-all"
              style={{background:'rgba(46,134,193,0.06)',border:'1px solid rgba(46,134,193,0.15)'}}>
              {si ? 'වසන්න' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
