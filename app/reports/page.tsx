'use client'
import { useState, useEffect } from 'react'
import { useLang } from '@/lib/LangContext'
import { getAllBins } from '@/lib/api'
import { MOCK_BINS, BIN_LOCATIONS, BIN_LOCATIONS_SI } from '@/lib/data'
import type { Bin } from '@/lib/types'

const PC: Record<string, string> = { CRITICAL: '#DC2626', HIGH: '#D97706', MEDIUM: '#CA8A04', LOW: '#2D7A4F' }
const REPORTS_PER_PAGE = 10

export default function ReportsPage() {
  const { lang } = useLang()
  const si = lang === 'si'
  const [bins, setBins] = useState<Bin[]>(MOCK_BINS)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    getAllBins().then(b => { if (b?.length) setBins(b) }).catch(() => { })
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const loc = (id: string) => si ? (BIN_LOCATIONS_SI[id] || BIN_LOCATIONS[id] || 'හෝමාගම') : (BIN_LOCATIONS[id] || 'Homagama')

  const critical = bins.filter(b => b.priority_label === 'CRITICAL').length
  const high = bins.filter(b => b.priority_label === 'HIGH').length
  const medium = bins.filter(b => b.priority_label === 'MEDIUM').length
  const low = bins.filter(b => b.priority_label === 'LOW').length
  const avgRisk = bins.length ? (bins.reduce((s, b) => s + Number(b.health_risk), 0) / bins.length).toFixed(1) : '0'
  const avgGas = bins.length ? (bins.reduce((s, b) => s + Number(b.gas_ppm), 0) / bins.length).toFixed(0) : '0'

  const exportCSV = () => {
    setExporting(true)
    const headers = ['Bin ID', 'Location', 'Priority', 'Fill Level (%)', 'Gas PPM', 'Health Risk', 'Temperature (°C)', 'Humidity (%)', 'Last Updated', 'Classified By']
    const rows = bins.map(b => [
      b.bin_id, BIN_LOCATIONS[b.bin_id] || 'Homagama',
      b.priority_label, b.fill_level, b.gas_ppm, b.health_risk,
      b.temperature, b.humidity, b.last_updated, b.classified_by,
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mycollect-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
    showToast(si ? 'CSV ගොනුව සාර්ථකව බාගත විය' : 'CSV downloaded successfully')
  }

  const exportPDF = () => {
    setExporting(true)
    const now = new Date()
    const html = `<!DOCTYPE html><html><head><title>MyCollect Municipal Report</title>
    <style>
      body{font-family:Arial,sans-serif;padding:40px;color:#0F2A3D;font-size:12px}
      h1{font-size:22px;margin-bottom:2px}
      h2{font-size:14px;margin:20px 0 8px;color:#2E86C1}
      .sub{font-size:11px;color:#666;margin-bottom:20px}
      .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
      .stat{background:#f0f8ff;padding:12px;border-radius:8px;text-align:center}
      .stat-val{font-size:26px;font-weight:bold}
      .stat-label{font-size:9px;color:#666;text-transform:uppercase;margin-top:2px}
      .critical{color:#DC2626}.high{color:#D97706}.medium{color:#CA8A04}.low{color:#2D7A4F}
      table{width:100%;border-collapse:collapse;font-size:10px;margin-bottom:16px}
      th{background:#EBF4FA;padding:7px 8px;text-align:left;border-bottom:2px solid #2E86C1;font-size:9px;text-transform:uppercase}
      td{padding:7px 8px;border-bottom:1px solid #eee}
      .summary-box{background:#f9f9f9;border:1px solid #ddd;border-radius:8px;padding:16px;margin-bottom:16px}
      .footer{margin-top:24px;font-size:9px;color:#999;border-top:1px solid #eee;padding-top:10px}
    </style></head><body>
    <h1>MyCollect — Municipal Health Risk Report</h1>
    <div class="sub">
      Generated: ${now.toLocaleString('en-GB')} &nbsp;|&nbsp;
      Homagama Municipal Zone &nbsp;|&nbsp;
      ${bins.length} Active Bins &nbsp;|&nbsp;
      Powered by Random Forest ML (95.80% CV Accuracy)
    </div>

    <h2>Executive Summary</h2>
    <div class="stats">
      <div class="stat"><div class="stat-val critical">${critical}</div><div class="stat-label">Critical Bins</div></div>
      <div class="stat"><div class="stat-val high">${high}</div><div class="stat-label">High Priority</div></div>
      <div class="stat"><div class="stat-val" style="color:#2E86C1">${avgRisk}</div><div class="stat-label">Avg Health Risk</div></div>
      <div class="stat"><div class="stat-val" style="color:#2E86C1">${avgGas}</div><div class="stat-label">Avg Gas PPM</div></div>
    </div>

    <div class="summary-box">
      <strong>Health Risk Assessment</strong><br/>
      ${critical > 0 ? `<span class="critical">⚠ ${critical} bin(s) require IMMEDIATE collection.</span><br/>` : ''}
      ${high > 0 ? `<span class="high">${high} bin(s) require same-day collection.</span><br/>` : ''}
      ${medium > 0 ? `${medium} bin(s) scheduled for routine collection.<br/>` : ''}
      ${low > 0 ? `${low} bin(s) at low risk — no immediate action required.` : ''}
    </div>

    <h2>Bin Status Detail</h2>
    <table>
      <thead><tr><th>Bin ID</th><th>Location</th><th>Priority</th><th>Fill %</th><th>Gas PPM</th><th>Health Risk /100</th><th>Temp °C</th><th>Humidity %</th><th>Last Updated</th></tr></thead>
      <tbody>${bins.map(b => `<tr>
        <td><strong>${b.bin_id}</strong></td>
        <td>${BIN_LOCATIONS[b.bin_id] || 'Homagama'}</td>
        <td class="${b.priority_label.toLowerCase()}"><strong>${b.priority_label}</strong></td>
        <td>${b.fill_level}%</td>
        <td style="color:${PC[b.priority_label]};font-weight:bold">${b.gas_ppm}</td>
        <td>${b.health_risk}</td>
        <td>${b.temperature}</td>
        <td>${b.humidity}</td>
        <td style="font-size:9px">${new Date(b.last_updated).toLocaleString('en-GB')}</td>
      </tr>`).join('')}</tbody>
    </table>

    <h2>ML Model Information</h2>
    <table>
      <thead><tr><th>Parameter</th><th>Value</th></tr></thead>
      <tbody>
        <tr><td>Algorithm</td><td>Random Forest Classifier</td></tr>
        <tr><td>Training Dataset</td><td>616 readings (296 real sensor + 320 simulated)</td></tr>
        <tr><td>Cross-Validation Accuracy</td><td>95.80% (5-fold)</td></tr>
        <tr><td>Test Accuracy</td><td>99.19%</td></tr>
        <tr><td>Health Risk Formula</td><td>(gas_ppm / 1000 × 100 × 0.70) + (fill_level × 0.30)</td></tr>
        <tr><td>Gas Weight</td><td>70% — primary health indicator</td></tr>
        <tr><td>Fill Weight</td><td>30% — secondary logistical indicator</td></tr>
        <tr><td>API Response Time</td><td>Avg 1.12s (min 558ms)</td></tr>
        <tr><td>Cloud Infrastructure</td><td>AWS Lambda · ap-southeast-2 (Sydney)</td></tr>
      </tbody>
    </table>

    <div class="footer">
      MyCollect — AI-Powered Waste Management with Health-Responsive Routing &nbsp;|&nbsp;
      Dinithi Wijesinghe · NSBM Green University · BSc (Hons) Software Engineering · 2025–2026 &nbsp;|&nbsp;
      Supervisor: Miss Dharani Rajasinghe
    </div>
    </body></html>`

    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 500) }
    setExporting(false)
    showToast(si ? 'PDF වාර්තාව විවෘත විය — Print > Save as PDF' : 'PDF opened — use Print > Save as PDF')
  }

  return (
    <div className="flex flex-col gap-4">
      {toast && <div className="toast" style={{ background: '#1A3328' }}>{toast}</div>}

      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#0F2A3D] tracking-tight">{si ? 'වාර්තා' : 'Reports'}</h1>
        <p className="font-mono text-[10px] text-[#5B8FA8] mt-1">
          {si ? 'දත්ත අපනයනය · අනුකූලතා වාර්තා · CSV සහ PDF' : 'Data export · compliance reports · CSV and PDF formats'}
        </p>
      </div>

      {/* Municipal Summary */}
      <div className="glass-card p-5">
        <div className="font-bold text-[14px] text-[#0F2A3D] mb-1">{si ? 'නාගරික සාරාංශය' : 'Municipal Summary'}</div>
        <div className="font-mono text-[9.5px] text-[#5B8FA8] mb-4">{si ? 'සජීව දත්ත · AWS DynamoDB' : 'Live data · AWS DynamoDB'}</div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { l: si ? 'අවදානම් බදුන්' : 'Critical Bins', v: critical, c: '#DC2626' },
            { l: si ? 'ඉහළ ප්‍රමුඛතා' : 'High Priority', c: '#D97706', v: high },
            { l: si ? 'සාමාන්‍ය අවදානම' : 'Avg Health Risk', v: avgRisk + '/100', c: '#2E86C1' },
            { l: si ? 'සාමාන්‍ය වායු' : 'Avg Gas PPM', v: avgGas + ' PPM', c: '#4A8C28' },
            { l: si ? 'මධ්‍යම ප්‍රමුඛතා' : 'Medium Priority', v: medium, c: '#CA8A04' },
            { l: si ? 'අඩු ප්‍රමුඛතා' : 'Low Priority', v: low, c: '#2D7A4F' },
          ].map(s => (
            <div key={s.l} className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.8)' }}>
              <div className="font-mono text-[8px] uppercase tracking-widest mb-1" style={{ color: s.c + '99' }}>{s.l}</div>
              <div className="text-[22px] font-extrabold" style={{ color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>
        {critical > 0 && (
          <div className="px-4 py-3 rounded-xl text-[12px] font-semibold" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#DC2626' }}>
            ⚠ {critical} {si ? 'බදුන් ක්ෂණික එකතු කිරීමක් අවශ්‍යයි' : 'bin(s) require immediate collection'}
          </div>
        )}
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(46,134,193,0.1)', border: '1px solid rgba(46,134,193,0.2)' }}>
            <span className="font-mono text-[16px] font-bold text-[#2E86C1]">CSV</span>
          </div>
          <div className="font-bold text-[16px] text-[#0F2A3D] mb-2">{si ? 'බදුන් දත්ත CSV' : 'Bin Data CSV'}</div>
          <p className="text-[12.5px] text-[#5B8FA8] leading-relaxed mb-4">
            {si ? 'සියලු බදුන් සංවේදක කියවීම්, ප්‍රමුඛතා සහ සෞඛ්‍ය අවදානම් ලකුණු CSV ආකෘතියෙන් අපනයනය කරන්න.' : 'Export all bin sensor readings, priority classifications and health risk scores. Compatible with Excel and Google Sheets.'}
          </p>
          <div className="flex gap-2 mb-4">
            <span className="font-mono text-[10px] text-[#5B8FA8] px-2.5 py-1 rounded-lg" style={{ background: 'rgba(46,134,193,0.06)' }}>{bins.length} {si ? 'බදුන්' : 'bins'}</span>
            <span className="font-mono text-[10px] text-[#5B8FA8] px-2.5 py-1 rounded-lg" style={{ background: 'rgba(46,134,193,0.06)' }}>10 {si ? 'තීරු' : 'columns'}</span>
          </div>
          <button onClick={exportCSV} disabled={exporting}
            className="w-full py-3 rounded-xl font-semibold text-[13px] text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#2E86C1,#1A5276)', boxShadow: '0 4px 16px rgba(46,134,193,0.3)' }}>
            {exporting ? (si ? 'අපනයනය කරමින්...' : 'Exporting...') : (si ? 'CSV බාගන්න' : 'Download CSV')}
          </button>
        </div>

        <div className="glass-card p-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.18)' }}>
            <span className="font-mono text-[16px] font-bold text-[#DC2626]">PDF</span>
          </div>
          <div className="font-bold text-[16px] text-[#0F2A3D] mb-2">{si ? 'නාගරික සෞඛ්‍ය අවදානම් වාර්තාව' : 'Municipal Health Risk Report'}</div>
          <p className="text-[12.5px] text-[#5B8FA8] leading-relaxed mb-4">
            {si ? 'නාගරික සභාවට ඉදිරිපත් කිරීමට සූදානම් සෞඛ්‍ය අවදානම් වාර්තාවක් සාදන්න. ML ආකෘති විස්තර, ප්‍රමුඛතා සංඛ්‍යාලේඛන සහ සියලු බදුන් දත්ත ඇතුළත්.' : 'Generate a print-ready report for municipal council submission. Includes ML model details, priority statistics, executive summary and complete bin data.'}
          </p>
          <div className="flex gap-2 mb-4">
            <span className="font-mono text-[10px] text-[#5B8FA8] px-2.5 py-1 rounded-lg" style={{ background: 'rgba(46,134,193,0.06)' }}>{si ? 'මුද්‍රණයට සූදානම්' : 'Print-ready'}</span>
            <span className="font-mono text-[10px] text-[#5B8FA8] px-2.5 py-1 rounded-lg" style={{ background: 'rgba(46,134,193,0.06)' }}>{si ? 'නාගරික සභා' : 'Council format'}</span>
          </div>
          <button onClick={exportPDF} disabled={exporting}
            className="w-full py-3 rounded-xl font-semibold text-[13px] text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#DC2626,#991B1B)', boxShadow: '0 4px 16px rgba(220,38,38,0.3)' }}>
            {exporting ? (si ? 'උත්පාදනය කරමින්...' : 'Generating...') : (si ? 'PDF උත්පාදනය' : 'Generate PDF')}
          </button>
        </div>
      </div>

      {/* Citizen Reports with pagination */}
      <CitizenReports />

      {/* Data Preview */}
      <div className="glass p-5">
        <div className="font-bold text-[14px] text-[#0F2A3D] mb-1">{si ? 'දත්ත පෙරදසුන' : 'Data Preview'}</div>
        <div className="font-mono text-[9.5px] text-[#5B8FA8] mb-4">{si ? 'අපනයනයට ඇතුළත් දත්ත' : 'Live data included in exports'}</div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                {(si ? ['බදුන්', 'ස්ථානය', 'ප්‍රමුඛතාව', 'පිරවීම', 'වායු', 'අවදානම', 'උෂ්ණත්වය'] : ['Bin', 'Location', 'Priority', 'Fill', 'Gas', 'Risk', 'Temp']).map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bins.slice(0, 5).map(b => (
                <tr key={b.bin_id}>
                  <td className="font-mono text-[12px] font-medium text-[#0F2A3D]">{b.bin_id}</td>
                  <td className="text-[12px] text-[#5B8FA8]">{loc(b.bin_id)}</td>
                  <td><span className={`badge-${b.priority_label.toLowerCase()}`}><span className="badge-dot" />{b.priority_label}</span></td>
                  <td className="font-mono text-[12px]">{b.fill_level}%</td>
                  <td className="font-mono text-[12px]" style={{ color: PC[b.priority_label] }}>{b.gas_ppm}</td>
                  <td className="font-mono text-[12px]">{b.health_risk}</td>
                  <td className="font-mono text-[12px]">{b.temperature}°C</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bins.length > 5 && (
          <div className="font-mono text-[10px] text-[#5B8FA8] mt-3 text-center">
            + {bins.length - 5} {si ? 'තවත් බදුන් (අපනයනයේ ඇතුළත්)' : 'more bins (included in export)'}
          </div>
        )}
      </div>
    </div>
  )
}

function CitizenReports() {
  const { lang } = useLang()
  const si = lang === 'si'
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all')

  useEffect(() => {
    fetchReports()
    const interval = setInterval(fetchReports, 30000)
    return () => clearInterval(interval)
  }, [])

  const resolveReport = async (report_id: string) => {
    try {
      const res = await fetch('/api/resolve-report', {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ report_id, resolved_by: 'admin' })
      })
      const d = await res.json()
      if (d.success) {
        setReports(prev => prev.map((r: any) =>
          r.report_id === report_id ? {...r, status: 'resolved'} : r
        ))
      }
    } catch {}
  }

  const fetchReports = async () => {
    try {
      const res = await fetch('https://g7oob1ovd6.execute-api.ap-southeast-2.amazonaws.com/prod/report')
      const data = await res.json()
      setReports(data.reports || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const filtered = reports.filter(r => filter === 'all' ? true : r.status === filter)
  const totalPages = Math.ceil(filtered.length / REPORTS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * REPORTS_PER_PAGE, page * REPORTS_PER_PAGE)
  const pending = reports.filter(r => r.status === 'pending').length

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-bold text-[14px] text-[#0F2A3D]">{si ? 'පුරවැසි වාර්තා' : 'Citizen Reports'}</div>
          <div className="font-mono text-[9.5px] text-[#5B8FA8]">
            {si ? `MyCollect යෙදුම හරහා · ${reports.length} මුළු · ${pending} අපේක්ෂාවෙන්` : `Via MyCollect mobile app · ${reports.length} total · ${pending} pending`}
          </div>
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'resolved'] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1) }}
              className="font-mono text-[10px] px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: filter === f ? 'rgba(45,90,27,0.12)' : 'rgba(255,255,255,0.5)',
                border: `1px solid ${filter === f ? 'rgba(45,90,27,0.3)' : 'rgba(255,255,255,0.6)'}`,
                color: filter === f ? '#2D5A1B' : '#5B8FA8',
                fontWeight: filter === f ? 700 : 500,
              }}>
              {f === 'all' ? (si ? 'සියල්ල' : 'All') : f === 'pending' ? (si ? 'අපේක්ෂාවෙන්' : 'Pending') : (si ? 'විසඳා ඇත' : 'Resolved')}
              {f === 'all' ? ` (${reports.length})` : f === 'pending' ? ` (${pending})` : ` (${reports.length - pending})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-[#5B8FA8] text-sm">{si ? 'වාර්තා නොමැත' : 'No reports found'}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{si ? 'පුරවැසියා' : 'Citizen'}</th>
                  <th>{si ? 'වර්ගය' : 'Type'}</th>
                  <th>{si ? 'බදුන්ව' : 'Bin'}</th>
                  <th>{si ? 'විස්තරය' : 'Description'}</th>
                  <th>{si ? 'ප්‍රදේශය' : 'Area'}</th>
                  <th>{si ? 'වේලාව' : 'Time'}</th>
                  <th>{si ? 'තත්ත්වය' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((r: any) => (
                  <tr key={r.report_id}>
                    <td>
                      <div className="font-semibold text-xs text-[#0F2A3D]">{r.name}</div>
                      <div className="text-[10px] text-[#5B8FA8]">{r.phone}</div>
                    </td>
                    <td>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">{r.report_type}</span>
                    </td>
                    <td className="font-mono text-xs">{r.bin_id || 'General'}</td>
                    <td className="text-xs text-[#5B8FA8] max-w-[150px] truncate">{r.description}</td>
                    <td className="text-xs text-[#5B8FA8]">{r.area || 'Homagama'}</td>
                    <td className="text-[10px] text-[#5B8FA8]">
                      {new Date(r.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' + (r.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                          {r.status === 'resolved' ? (si ? 'විසඳා ඇත' : 'Resolved') : (si ? 'අපේක්ෂාවෙන්' : 'Pending')}
                        </span>
                        {r.status !== 'resolved' && (
                          <button onClick={() => resolveReport(r.report_id)}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-600 text-white hover:bg-green-700 transition-all">
                            {si ? 'විසඳන්න' : 'Resolve'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid rgba(46,134,193,0.08)' }}>
              <div className="font-mono text-[10px] text-[#5B8FA8]">
                {si ? `${(page - 1) * REPORTS_PER_PAGE + 1}–${Math.min(page * REPORTS_PER_PAGE, filtered.length)} / ${filtered.length}` : `${(page - 1) * REPORTS_PER_PAGE + 1}–${Math.min(page * REPORTS_PER_PAGE, filtered.length)} of ${filtered.length}`}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg font-mono text-[11px] disabled:opacity-40"
                  style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(46,134,193,0.2)', color: '#2E86C1' }}>
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className="px-3 py-1.5 rounded-lg font-mono text-[11px]"
                    style={{
                      background: page === p ? 'rgba(45,90,27,0.12)' : 'rgba(255,255,255,0.6)',
                      border: `1px solid ${page === p ? 'rgba(45,90,27,0.3)' : 'rgba(46,134,193,0.2)'}`,
                      color: page === p ? '#2D5A1B' : '#2E86C1',
                      fontWeight: page === p ? 700 : 400,
                    }}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg font-mono text-[11px] disabled:opacity-40"
                  style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(46,134,193,0.2)', color: '#2E86C1' }}>
                  →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}