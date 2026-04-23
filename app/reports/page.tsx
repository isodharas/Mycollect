'use client'
import { useState, useEffect } from 'react'
import { useLang } from '@/lib/LangContext'
import { getAllBins } from '@/lib/api'
import { MOCK_BINS, BIN_LOCATIONS } from '@/lib/data'
import type { Bin } from '@/lib/types'

const PC: Record<string,string> = {CRITICAL:'#DC2626',HIGH:'#D97706',MEDIUM:'#CA8A04',LOW:'#2D7A4F'}

export default function ReportsPage() {
  const { lang } = useLang()
  const si = lang === 'si'
  const [bins, setBins] = useState<Bin[]>(MOCK_BINS)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    getAllBins().then(b => { if (b?.length) setBins(b) }).catch(() => {})
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const exportCSV = () => {
    setExporting(true)
    const headers = ['Bin ID','Location','Priority','Fill Level (%)','Gas PPM','Health Risk','Temperature (°C)','Humidity (%)','Last Updated','Classified By']
    const rows = bins.map(b => [
      b.bin_id,
      BIN_LOCATIONS[b.bin_id] || 'Homagama',
      b.priority_label,
      b.fill_level,
      b.gas_ppm,
      b.health_risk,
      b.temperature,
      b.humidity,
      b.last_updated,
      b.classified_by,
    ])

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mycollect-bin-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    setExporting(false)
    showToast(si ? 'CSV ගොනුව සාර්ථකව බාගත විය' : 'CSV file downloaded successfully')
  }

  const exportPDF = () => {
    setExporting(true)
    // Generate a printable HTML report
    const html = `
      <!DOCTYPE html>
      <html><head><title>MyCollect Bin Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #0F2A3D; }
        h1 { font-size: 24px; margin-bottom: 4px; }
        .sub { font-size: 12px; color: #666; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #EBF4FA; padding: 8px 10px; text-align: left; border-bottom: 2px solid #2E86C1; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
        td { padding: 8px 10px; border-bottom: 1px solid #eee; }
        tr:hover td { background: #F0F8FF; }
        .critical { color: #DC2626; font-weight: bold; }
        .high { color: #D97706; font-weight: bold; }
        .medium { color: #CA8A04; }
        .low { color: #2D7A4F; }
        .footer { margin-top: 24px; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 12px; }
        .stats { display: flex; gap: 24px; margin-bottom: 24px; }
        .stat { background: #EBF4FA; padding: 12px 16px; border-radius: 8px; }
        .stat-val { font-size: 28px; font-weight: bold; color: #2E86C1; }
        .stat-label { font-size: 10px; color: #666; text-transform: uppercase; }
      </style></head><body>
      <h1>MyCollect — Bin Status Report</h1>
      <div class="sub">Generated ${new Date().toLocaleString()} · Homagama Municipal Zone · ${bins.length} bins</div>
      <div class="stats">
        <div class="stat"><div class="stat-val">${bins.filter(b=>b.priority_label==='CRITICAL').length}</div><div class="stat-label">Critical</div></div>
        <div class="stat"><div class="stat-val">${bins.filter(b=>b.priority_label==='HIGH').length}</div><div class="stat-label">High</div></div>
        <div class="stat"><div class="stat-val">${bins.filter(b=>b.priority_label==='MEDIUM').length}</div><div class="stat-label">Medium</div></div>
        <div class="stat"><div class="stat-val">${bins.filter(b=>b.priority_label==='LOW').length}</div><div class="stat-label">Low</div></div>
      </div>
      <table>
        <thead><tr><th>Bin ID</th><th>Location</th><th>Priority</th><th>Fill %</th><th>Gas PPM</th><th>Health Risk</th><th>Temp</th><th>Humidity</th></tr></thead>
        <tbody>${bins.map(b => `
          <tr>
            <td><strong>${b.bin_id}</strong></td>
            <td>${BIN_LOCATIONS[b.bin_id] || 'Homagama'}</td>
            <td class="${b.priority_label.toLowerCase()}">${b.priority_label}</td>
            <td>${b.fill_level}%</td>
            <td>${b.gas_ppm}</td>
            <td>${b.health_risk}/100</td>
            <td>${b.temperature}°C</td>
            <td>${b.humidity}%</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div class="footer">
        MyCollect — AI-Powered Waste Management with Odor Sensing and Health-Responsive Routing<br/>
        Dinithi Wijesinghe · NSBM Green University · BSc (Hons) Software Engineering · 2025-2026<br/>
        ML Model: Random Forest · 95.94% accuracy · Health Risk Formula: (gas/1000×100×0.70) + (fill×0.30)
      </div>
      </body></html>
    `
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
      setTimeout(() => { win.print() }, 500)
    }
    setExporting(false)
    showToast(si ? 'PDF වාර්තාව විවෘත විය' : 'PDF report opened — use Print > Save as PDF')
  }

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <div className="toast" style={{background:'#1A3328'}}>{toast}</div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#0F2A3D] tracking-tight">
          {si ? 'වාර්තා' : 'Reports'}
        </h1>
        <p className="font-mono text-[10px] text-[#5B8FA8] mt-1">
          {si ? 'දත්ත අපනයනය · අනුකූලතා වාර්තා · CSV සහ PDF' : 'Data export · compliance reports · CSV and PDF formats'}
        </p>
      </div>

      {/* Export cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* CSV Export */}
        <div className="glass-card p-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{background:'rgba(46,134,193,0.1)',border:'1px solid rgba(46,134,193,0.2)'}}>
            <span className="font-mono text-[16px] font-bold text-[#2E86C1]">CSV</span>
          </div>
          <div className="font-bold text-[16px] text-[#0F2A3D] mb-2">
            {si ? 'කූඩු දත්ත CSV' : 'Bin Data CSV'}
          </div>
          <p className="text-[12.5px] text-[#5B8FA8] leading-relaxed mb-4">
            {si
              ? 'සියලු කූඩු සංවේදක කියවීම්, ප්‍රමුඛතා වර්ගීකරණ, සහ සෞඛ්‍ය අවදානම් ලකුණු CSV ආකෘතියෙන් අපනයනය කරන්න. Excel හෝ Google Sheets හි විවෘත කිරීමට හැකියි.'
              : 'Export all bin sensor readings, priority classifications, and health risk scores in CSV format. Compatible with Excel and Google Sheets for further analysis.'}
          </p>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] text-[#5B8FA8] px-2.5 py-1 rounded-lg" style={{background:'rgba(46,134,193,0.06)'}}>
              {bins.length} {si ? 'කූඩු' : 'bins'}
            </span>
            <span className="font-mono text-[10px] text-[#5B8FA8] px-2.5 py-1 rounded-lg" style={{background:'rgba(46,134,193,0.06)'}}>
              10 {si ? 'තීරු' : 'columns'}
            </span>
          </div>
          <button onClick={exportCSV} disabled={exporting}
            className="w-full py-3 rounded-xl font-semibold text-[13px] text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{background:'linear-gradient(135deg,#2E86C1,#1A5276)',boxShadow:'0 4px 16px rgba(46,134,193,0.3)'}}>
            {exporting ? (si?'අපනයනය කරමින්...':'Exporting...') : (si?'CSV බාගන්න':'Download CSV')}
          </button>
        </div>

        {/* PDF Export */}
        <div className="glass-card p-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{background:'rgba(220,38,38,0.08)',border:'1px solid rgba(220,38,38,0.18)'}}>
            <span className="font-mono text-[16px] font-bold text-[#DC2626]">PDF</span>
          </div>
          <div className="font-bold text-[16px] text-[#0F2A3D] mb-2">
            {si ? 'තත්ත්ව වාර්තාව PDF' : 'Status Report PDF'}
          </div>
          <p className="text-[12.5px] text-[#5B8FA8] leading-relaxed mb-4">
            {si
              ? 'මුද්‍රණයට සූදානම් තත්ත්ව වාර්තාවක් උත්පාදනය කරන්න. ප්‍රමුඛතා සංඛ්‍යාලේඛන, සියලු කූඩු දත්ත, සහ ML ආකෘති විස්තර ඇතුළත්.'
              : 'Generate a print-ready status report with priority statistics, complete bin data table, and ML model details. Suitable for municipal council submissions.'}
          </p>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] text-[#5B8FA8] px-2.5 py-1 rounded-lg" style={{background:'rgba(46,134,193,0.06)'}}>
              {si ? 'මුද්‍රණයට සූදානම්' : 'Print-ready'}
            </span>
            <span className="font-mono text-[10px] text-[#5B8FA8] px-2.5 py-1 rounded-lg" style={{background:'rgba(46,134,193,0.06)'}}>
              {si ? 'නාගරික සභා' : 'Council format'}
            </span>
          </div>
          <button onClick={exportPDF} disabled={exporting}
            className="w-full py-3 rounded-xl font-semibold text-[13px] text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{background:'linear-gradient(135deg,#DC2626,#991B1B)',boxShadow:'0 4px 16px rgba(220,38,38,0.3)'}}>
            {exporting ? (si?'උත්පාදනය කරමින්...':'Generating...') : (si?'PDF උත්පාදනය':'Generate PDF')}
          </button>
        </div>
      </div>


      {/* Citizen Reports */}
      <CitizenReports />
      {/* Data preview */}
      <div className="glass p-5">
        <div className="font-bold text-[14px] text-[#0F2A3D] mb-1">{si ? 'දත්ත පෙරදසුන' : 'Data Preview'}</div>
        <div className="font-mono text-[9.5px] text-[#5B8FA8] mb-4">{si ? 'අපනයනයට ඇතුළත් දත්ත' : 'Data included in exports'}</div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                {(si ? ['කූඩු','ස්ථානය','ප්‍රමුඛතාව','පිරවීම','වායු','අවදානම','උෂ්ණත්වය'] : ['Bin','Location','Priority','Fill','Gas','Risk','Temp']).map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bins.slice(0, 5).map(b => (
                <tr key={b.bin_id}>
                  <td className="font-mono text-[12px] font-medium text-[#0F2A3D]">{b.bin_id}</td>
                  <td className="text-[12px] text-[#5B8FA8]">{BIN_LOCATIONS[b.bin_id] || 'Homagama'}</td>
                  <td><span className={`badge-${b.priority_label.toLowerCase()}`}><span className="badge-dot" />{b.priority_label}</span></td>
                  <td className="font-mono text-[12px]">{b.fill_level}%</td>
                  <td className="font-mono text-[12px]" style={{color: PC[b.priority_label]}}>{b.gas_ppm}</td>
                  <td className="font-mono text-[12px]">{b.health_risk}</td>
                  <td className="font-mono text-[12px]">{b.temperature}°C</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bins.length > 5 && (
          <div className="font-mono text-[10px] text-[#5B8FA8] mt-3 text-center">
            + {bins.length - 5} {si ? 'තවත් කූඩු (අපනයනයේ ඇතුළත්)' : 'more bins (included in export)'}
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

  useEffect(() => {
    fetchReports()
    const interval = setInterval(fetchReports, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchReports = async () => {
    try {
      const res = await fetch('https://g7oob1ovd6.execute-api.ap-southeast-2.amazonaws.com/prod/report')
      const data = await res.json()
      setReports(data.reports || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const markResolved = (reportId: string) => {
    setReports(prev => prev.map((r: any) =>
      r.report_id === reportId ? { ...r, status: 'resolved' } : r
    ))
  }

  const pending = reports.filter((r: any) => r.status === 'pending').length

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-bold text-[14px] text-[#0F2A3D]">{si ? 'පුරවැසි වාර්තා' : 'Citizen Reports'}</div>
          <div className="font-mono text-[9.5px] text-[#5B8FA8]">{si ? 'MyCollect යෙදුම හරහා ඉදිරිපත් කරන ලදී' : 'Submitted via MyCollect mobile app'}</div>
        </div>

      </div>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-8 text-[#5B8FA8] text-sm">{si ? 'තවම පුරවැසි වාර්තා නැත' : 'No citizen reports yet'}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>{si ? 'පුරවැසියා' : 'Citizen'}</th>
                <th>{si ? 'වර්ගය' : 'Type'}</th>
                <th>{si ? 'කූඩුව' : 'Bin'}</th>
                <th>{si ? 'විස්තරය' : 'Description'}</th>
                <th>{si ? 'ප්‍රදේශය' : 'Area'}</th>
                <th>{si ? 'වේලාව' : 'Time'}</th>
                <th>{si ? 'තත්ත්වය' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report: any) => (
                <tr key={report.report_id}>
                  <td>
                    <div className="font-semibold text-xs text-[#0F2A3D]">{report.name}</div>
                    <div className="text-[10px] text-[#5B8FA8]">{report.phone}</div>
                  </td>
                  <td>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                      {report.report_type}
                    </span>
                  </td>
                  <td className="font-mono text-xs">{report.bin_id}</td>
                  <td className="text-xs text-[#5B8FA8] max-w-[150px] truncate">{report.description}</td>
                  <td className="text-xs text-[#5B8FA8]">{report.area || 'Homagama'}</td>
                  <td className="text-[10px] text-[#5B8FA8]">
                    {new Date(report.timestamp).toLocaleDateString("en-GB", {day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}
                  </td>
                  <td>
                    <span className={"text-xs font-semibold px-2 py-0.5 rounded-full " + (report.status === "resolved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                      {report.status === 'resolved' ? (si ? 'විසඳා ඇත' : 'resolved') : (si ? 'අපේක්ෂාවෙන්' : 'pending')}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
