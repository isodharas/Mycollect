'use client'
import { useState, useEffect } from 'react'
import { useLang } from '@/lib/LangContext'
import { getAllBins } from '@/lib/api'
import { MOCK_BINS, BIN_LOCATIONS } from '@/lib/data'
import type { Bin, Priority } from '@/lib/types'
import PriorityBadge from '@/components/PriorityBadge'

const PC: Record<string,string> = {CRITICAL:'#DC2626',HIGH:'#D97706',MEDIUM:'#CA8A04',LOW:'#2D7A4F'}

interface Alert {
  id: string
  bin_id: string
  priority: Priority
  gas_ppm: number
  fill_level: number
  health_risk: number
  message: string
  messageSi: string
  time: string
  read: boolean
}

function generateAlerts(bins: Bin[]): Alert[] {
  const alerts: Alert[] = []
  const now = new Date()

  bins.forEach((bin, idx) => {
    if (bin.priority_label === 'CRITICAL') {
      alerts.push({
        id: `alert-crit-${bin.bin_id}`,
        bin_id: bin.bin_id,
        priority: 'CRITICAL',
        gas_ppm: bin.gas_ppm,
        fill_level: bin.fill_level,
        health_risk: bin.health_risk,
        message: `Gas concentration at ${bin.gas_ppm} PPM exceeds safe threshold (500 PPM). Immediate collection required.`,
        messageSi: `${bin.gas_ppm} PPM වායු සාන්ද්‍රණය ආරක්ෂිත සීමාව (500 PPM) ඉක්මවා ඇත. ක්ෂණික එකතු කිරීම අවශ්‍යයි.`,
        time: new Date(now.getTime() - idx * 120000).toISOString(),
        read: false,
      })
    }
    if (bin.priority_label === 'HIGH') {
      alerts.push({
        id: `alert-high-${bin.bin_id}`,
        bin_id: bin.bin_id,
        priority: 'HIGH',
        gas_ppm: bin.gas_ppm,
        fill_level: bin.fill_level,
        health_risk: bin.health_risk,
        message: `Fill level at ${bin.fill_level}% with elevated gas (${bin.gas_ppm} PPM). Schedule collection within 2 hours.`,
        messageSi: `${bin.fill_level}% පිරවීමේ මට්ටම ඉහළ වායු (${bin.gas_ppm} PPM) සමඟ. පැය 2 ඇතුළත එකතු කිරීම සැලසුම් කරන්න.`,
        time: new Date(now.getTime() - (idx + 3) * 300000).toISOString(),
        read: false,
      })
    }
    if (bin.priority_label === 'MEDIUM') {
      alerts.push({
        id: `alert-med-${bin.bin_id}`,
        bin_id: bin.bin_id,
        priority: 'MEDIUM',
        gas_ppm: bin.gas_ppm,
        fill_level: bin.fill_level,
        health_risk: bin.health_risk,
        message: `Moderate gas levels detected (${bin.gas_ppm} PPM). Monitor and include in next scheduled collection.`,
        messageSi: `මධ්‍යස්ථ වායු මට්ටම් හඳුනාගන ඇත (${bin.gas_ppm} PPM). නිරීක්ෂණය කර ඊළඟ සැලසුම්ගත එකතු කිරීමට ඇතුළත් කරන්න.`,
        time: new Date(now.getTime() - (idx + 6) * 600000).toISOString(),
        read: true,
      })
    }
  })

  return alerts.sort((a, b) => {
    const pOrder: Record<Priority,number> = {CRITICAL:0,HIGH:1,MEDIUM:2,LOW:3}
    return pOrder[a.priority] - pOrder[b.priority]
  })
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  return `${Math.floor(s/3600)}h ago`
}

export default function AlertsPage() {
  const { lang } = useLang()
  const si = lang === 'si'
  const [bins, setBins] = useState<Bin[]>(MOCK_BINS)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filter, setFilter] = useState<Priority | 'ALL'>('ALL')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  useEffect(() => {
    getAllBins().then(b => { if (b?.length) setBins(b) }).catch(() => {})
  }, [])

  useEffect(() => {
    setAlerts(generateAlerts(bins))
  }, [bins])

  const filtered = filter === 'ALL' ? alerts : alerts.filter(a => a.priority === filter)
  const counts = {
    ALL: alerts.length,
    CRITICAL: alerts.filter(a=>a.priority==='CRITICAL').length,
    HIGH: alerts.filter(a=>a.priority==='HIGH').length,
    MEDIUM: alerts.filter(a=>a.priority==='MEDIUM').length,
  }

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? {...a, read: true} : a))
  }

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
    setSelectedAlert(null)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F2A3D] tracking-tight">
            {si ? 'අනතුරු ඇඟවීම්' : 'Alerts'}
          </h1>
          <p className="font-mono text-[10px] text-[#5B8FA8] mt-1">
            {si ? 'සෞඛ්‍ය අවදානම් දැනුම්දීම් · තරබාරුබව අනුව' : `${alerts.filter(a=>!a.read).length} unread · sorted by severity`}
          </p>
        </div>
        <button onClick={() => setAlerts(prev => prev.map(a => ({...a, read: true})))}
          className="px-4 py-2 rounded-xl font-mono text-[11px] font-medium text-[#5B8FA8] transition-all hover:bg-white/50"
          style={{background:'rgba(255,255,255,0.45)',border:'1px solid rgba(46,134,193,0.15)'}}>
          {si ? 'සියල්ල කියවා ඇති ලෙස සලකුණු' : 'Mark all as read'}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['ALL','CRITICAL','HIGH','MEDIUM'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="font-mono text-[10px] px-3.5 py-2 rounded-xl transition-all"
            style={{
              background: filter === f ? (f === 'ALL' ? 'rgba(46,134,193,0.1)' : `${PC[f as Priority]}10`) : 'rgba(255,255,255,0.45)',
              border: `1px solid ${filter === f ? (f === 'ALL' ? 'rgba(46,134,193,0.25)' : `${PC[f as Priority]}33`) : 'rgba(255,255,255,0.6)'}`,
              color: filter === f ? (f === 'ALL' ? '#2E86C1' : PC[f as Priority]) : '#5B8FA8',
              fontWeight: filter === f ? 700 : 500,
            }}>
            {f} ({(counts as any)[f] || 0})
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 font-mono text-[13px] text-[#5B8FA8]">
            {si ? 'අනතුරු ඇඟවීම් නැත' : 'No alerts in this category'}
          </div>
        ) : filtered.map(alert => (
          <button key={alert.id}
            onClick={() => { setSelectedAlert(alert); markAsRead(alert.id) }}
            className="w-full text-left glass-card px-5 py-4 transition-all hover:-translate-y-0.5"
            style={{
              borderLeft: `4px solid ${PC[alert.priority]}`,
              opacity: alert.read ? 0.75 : 1,
            }}>
            <div className="flex items-start gap-4">
              {/* Unread dot */}
              <div className="pt-1.5 flex-shrink-0">
                {!alert.read && <span className="w-2 h-2 rounded-full bg-[#2E86C1] block anim-blink" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="font-mono text-[12px] font-semibold text-[#0F2A3D]">{alert.bin_id}</span>
                  <PriorityBadge priority={alert.priority} size="sm" />
                  <span className="font-mono text-[9px] text-[#5B8FA8] ml-auto">{timeAgo(alert.time)}</span>
                </div>
                <p className="text-[12.5px] text-[#2E5266] leading-relaxed mb-2">
                  {si ? alert.messageSi : alert.message}
                </p>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[10px] text-[#5B8FA8]">{BIN_LOCATIONS[alert.bin_id] || 'Homagama'}</span>
                  <span className="font-mono text-[10px]" style={{color:PC[alert.priority]}}>
                    {si ? 'අවදානම' : 'Risk'} {alert.health_risk} · {alert.gas_ppm} PPM · {alert.fill_level}%
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Alert detail modal */}
      {selectedAlert && (
        <div className="overlay" onClick={() => setSelectedAlert(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{background:`${PC[selectedAlert.priority]}12`,border:`1px solid ${PC[selectedAlert.priority]}25`}}>
                  <span className="text-lg" style={{color:PC[selectedAlert.priority]}}>!</span>
                </div>
                <div>
                  <div className="font-mono text-[14px] font-semibold text-[#0F2A3D]">{selectedAlert.bin_id}</div>
                  <div className="font-mono text-[10px] text-[#5B8FA8]">{BIN_LOCATIONS[selectedAlert.bin_id]}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={selectedAlert.priority} />
                <button onClick={() => setSelectedAlert(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5B8FA8] hover:bg-sky-50 transition-all"
                  style={{background:'rgba(46,134,193,0.06)',border:'1px solid rgba(46,134,193,0.12)'}}>
                  x
                </button>
              </div>
            </div>

            <p className="text-[13px] text-[#2E5266] leading-relaxed mb-4 p-3 rounded-xl" style={{background:'rgba(46,134,193,0.04)'}}>
              {si ? selectedAlert.messageSi : selectedAlert.message}
            </p>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                {l:si?'වායු PPM':'Gas PPM', v:selectedAlert.gas_ppm, c:PC[selectedAlert.priority]},
                {l:si?'පිරවීමේ මට්ටම':'Fill Level', v:`${selectedAlert.fill_level}%`, c:PC[selectedAlert.priority]},
                {l:si?'සෞඛ්‍ය අවදානම':'Health Risk', v:`${selectedAlert.health_risk}/100`, c:PC[selectedAlert.priority]},
              ].map(s => (
                <div key={s.l} className="rounded-xl p-3 text-center" style={{background:'rgba(46,134,193,0.04)'}}>
                  <div className="font-mono text-[8px] uppercase tracking-widest text-[#5B8FA8] mb-1">{s.l}</div>
                  <div className="text-xl font-extrabold" style={{color:s.c}}>{s.v}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => dismissAlert(selectedAlert.id)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-[13px] text-white transition-all"
                style={{background:`linear-gradient(135deg,${PC[selectedAlert.priority]},${PC[selectedAlert.priority]}cc)`}}>
                {si ? 'ඉවත් කරන්න' : 'Dismiss Alert'}
              </button>
              <button onClick={() => setSelectedAlert(null)}
                className="px-5 py-2.5 rounded-xl font-semibold text-[13px] text-[#5B8FA8] transition-all"
                style={{background:'rgba(46,134,193,0.06)',border:'1px solid rgba(46,134,193,0.15)'}}>
                {si ? 'වසන්න' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
