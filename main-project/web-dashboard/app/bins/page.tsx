"use client"
import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getAllBins } from "@/lib/api"
import { MOCK_BINS, BIN_LOCATIONS, BIN_LOCATIONS_SI } from "@/lib/data"
import type { Bin, Priority } from "@/lib/types"
import PriorityBadge from "@/components/PriorityBadge"
import FillBar from "@/components/FillBar"
import { useLang } from "@/lib/LangContext"

type Filter = Priority | "ALL"
const PC: Record<string, string> = { CRITICAL: "#DC2626", HIGH: "#D97706", MEDIUM: "#CA8A04", LOW: "#2D7A4F" }
const REAL_BINS = ["BIN_005"]

export default function BinsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { lang } = useLang()
  const si = lang === "si"
  const initialFilter = (searchParams.get("filter") as Filter) || "ALL"

  const [bins, setBins] = useState<Bin[]>(MOCK_BINS)
  const [filter, setFilter] = useState<Filter>(initialFilter)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Bin | null>(null)
  const [editing, setEditing] = useState<Bin | null>(null)
  const [deleting, setDeleting] = useState<Bin | null>(null)
  const [creating, setCreating] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Bin>>({})
  const [newBin, setNewBin] = useState({ bin_id: "", location: "", fill_level: 0, gas_ppm: 0, temperature: 30, humidity: 75 })
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllBins().then(b => { if (b?.length) setBins(b) }).catch(() => { }).finally(() => setLoading(false))
  }, [])

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const filtered = useMemo(() => bins.filter(b => {
    const mp = filter === "ALL" || b.priority_label === filter
    const ms = !search || b.bin_id.toLowerCase().includes(search.toLowerCase()) ||
      (BIN_LOCATIONS[b.bin_id] || "").toLowerCase().includes(search.toLowerCase())
    return mp && ms
  }), [bins, filter, search])

  const counts = useMemo(() => ({
    ALL: bins.length,
    CRITICAL: bins.filter(b => b.priority_label === "CRITICAL").length,
    HIGH: bins.filter(b => b.priority_label === "HIGH").length,
    MEDIUM: bins.filter(b => b.priority_label === "MEDIUM").length,
    LOW: bins.filter(b => b.priority_label === "LOW").length,
  }), [bins])

  function startEdit(bin: Bin) {
    setEditForm({ ...bin })
    setEditing(bin)
    setSelected(null)
  }

  async function saveEdit() {
    if (!editing) return
    try {
      await fetch("/api/bin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bin_id: editing.bin_id, ...editForm })
      })
    } catch { }
    setBins(prev => prev.map(b => b.bin_id === editing.bin_id ? { ...b, ...editForm } as Bin : b))
    setEditing(null)
    showToast(editing.bin_id + (si ? " යාවත්කාලීන විය" : " updated successfully"))
  }

  function confirmDelete() {
    if (!deleting) return
    setBins(prev => prev.filter(b => b.bin_id !== deleting.bin_id))
    setDeleting(null)
    setSelected(null)
    showToast(deleting.bin_id + (si ? " ඉවත් කරන ලදී" : " removed from system"), "error")
  }

  function createNewBin() {
    if (!newBin.bin_id || !newBin.location) { showToast(si ? "කූඩු ID සහ ස්ථානය අවශ්‍යයි" : "Bin ID and Location required", "error"); return }
    const gasScore = (newBin.gas_ppm / 1000) * 100
    const healthRisk = Math.round(Math.min((gasScore * 0.70) + (newBin.fill_level * 0.30), 100) * 10) / 10
    const pl = healthRisk >= 50 ? "CRITICAL" : healthRisk >= 30 ? "HIGH" : healthRisk >= 15 ? "MEDIUM" : "LOW"
    const bin: Bin = {
      bin_id: newBin.bin_id, fill_level: newBin.fill_level, gas_ppm: newBin.gas_ppm,
      temperature: newBin.temperature, humidity: newBin.humidity, health_risk: healthRisk,
      priority: pl === "CRITICAL" ? 3 : pl === "HIGH" ? 2 : pl === "MEDIUM" ? 1 : 0,
      priority_label: pl as Priority, last_updated: new Date().toISOString(),
      timestamp: String(Math.floor(Date.now() / 1000)), classified_by: "RandomForest_ML",
    }
    setBins(prev => [bin, ...prev])
    setCreating(false)
    setNewBin({ bin_id: "", location: "", fill_level: 0, gas_ppm: 0, temperature: 30, humidity: 75 })
    showToast(newBin.bin_id + (si ? " නිර්මාණය විය — ML වර්ගීකරණය: " : " created — ML classified as ") + pl)
  }

  const isReal = (id: string) => REAL_BINS.includes(id)
  const loc = (id: string) => si ? (BIN_LOCATIONS_SI?.[id] || BIN_LOCATIONS[id] || "හෝමාගම") : (BIN_LOCATIONS[id] || "Homagama")

  return (
    <div className="flex flex-col gap-4">
      {/* Toast */}
      {toast && (
        <div className="toast" style={{ background: toast.type === "success" ? "#1A3328" : "#DC2626" }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F2A3D] tracking-tight">{si ? "සජීව කූඩු" : "Live Bins"}</h1>
          <p className="font-mono text-[10px] text-[#5B8FA8] mt-1">
            {loading ? "Fetching from AWS..." : bins.length + (si ? " කූඩු · හෝමාගම නාගරික කලාපය" : " bins · Homagama Municipal Zone")}
          </p>
        </div>
        <button onClick={() => setCreating(true)}
          className="px-5 py-2.5 rounded-xl font-semibold text-[13px] text-white transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,#2D7A4F,#1A3328)", boxShadow: "0 4px 16px rgba(45,122,79,0.35)" }}>
          {si ? "නව කූඩුවක් එකතු කරන්න" : "Add New Bin"}
        </button>
      </div>

      {/* Search + filters */}
      <div className="glass-card flex items-center gap-3 flex-wrap px-4 py-3">
        <div className="flex-1 min-w-[200px] flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(46,134,193,0.15)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B8FA8" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={si ? "කූඩු හෝ ස්ථාන සොයන්න..." : "Search bins or locations..."}
            className="bg-transparent border-none outline-none flex-1 text-[13px] text-[#0F2A3D]" style={{ fontFamily: "Plus Jakarta Sans,sans-serif" }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="font-mono text-[10px] px-3.5 py-2 rounded-xl transition-all"
              style={{
                background: filter === f ? (f === "ALL" ? "rgba(46,134,193,0.12)" : `${PC[f as Priority]}10`) : "rgba(255,255,255,0.5)",
                border: `1px solid ${filter === f ? (f === "ALL" ? "rgba(46,134,193,0.3)" : `${PC[f as Priority]}33`) : "rgba(255,255,255,0.6)"}`,
                color: filter === f ? (f === "ALL" ? "#2E86C1" : PC[f as Priority]) : "#5B8FA8",
                fontWeight: filter === f ? 700 : 500,
              }}>
              {f} ({(counts as any)[f]})
            </button>
          ))}
        </div>
      </div>

      {/* Bin grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 font-mono text-[13px] text-[#5B8FA8]">{si ? "කූඩු හමු නොවීය" : "No bins match your search"}</div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>
          {filtered.map((b, i) => {
            const real = isReal(b.bin_id)
            const col = PC[b.priority_label]
            return (
              <div key={b.bin_id} onClick={() => setSelected(b)}
                className="cursor-pointer transition-all duration-200 hover:-translate-y-1"
                style={{
                  background: real ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.4)",
                  backdropFilter: "blur(20px) saturate(170%)",
                  WebkitBackdropFilter: "blur(20px) saturate(170%)",
                  border: real ? `2px solid ${col}44` : "1px solid rgba(255,255,255,0.6)",
                  borderTop: `3px solid ${col}`,
                  borderRadius: 16,
                  padding: "20px",
                  boxShadow: real ? `0 8px 32px ${col}15, inset 0 1px 0 rgba(255,255,255,0.85)` : "0 4px 20px rgba(15,42,61,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
                  animation: `fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.03}s both`,
                }}>

                {/* Header */}
                <div className="flex items-start justify-between mb-3.5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[14px] font-semibold text-[#0F2A3D]">{b.bin_id}</span>
                      {real && (
                        <span className="font-mono text-[8px] font-bold px-2 py-0.5 rounded-md text-white"
                          style={{ background: "linear-gradient(135deg,#22C55E,#166534)", boxShadow: "0 2px 8px rgba(34,197,94,0.3)" }}>
                          REAL DATA
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] text-[#5B8FA8]">{loc(b.bin_id)}</div>
                  </div>
                  <PriorityBadge priority={b.priority_label} size="sm" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2.5 mb-3.5">
                  <div className="rounded-xl px-3.5 py-2.5" style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.7)" }}>
                    <div className="font-mono text-[8px] text-[#5B8FA8] uppercase tracking-widest mb-1">{si ? "වායු" : "GAS"}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[22px] font-extrabold" style={{ color: col }}>{b.gas_ppm}</span>
                      <span className="font-mono text-[10px] text-[#5B8FA8]">ppm</span>
                    </div>
                  </div>
                  <div className="rounded-xl px-3.5 py-2.5" style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.7)" }}>
                    <div className="font-mono text-[8px] text-[#5B8FA8] uppercase tracking-widest mb-1">{si ? "අවදානම" : "RISK"}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[22px] font-extrabold" style={{ color: col }}>{b.health_risk}</span>
                      <span className="font-mono text-[10px] text-[#5B8FA8]">/100</span>
                    </div>
                  </div>
                </div>

                {/* Fill bar */}
                <div className="mb-3">
                  <div className="flex justify-between mb-1.5">
                    <span className="font-mono text-[8px] text-[#5B8FA8] uppercase tracking-widest">{si ? "පිරවීමේ මට්ටම" : "FILL LEVEL"}</span>
                    <span className="font-mono text-[10px] text-[#5B8FA8]">{b.fill_level}%</span>
                  </div>
                  <FillBar value={b.fill_level} priority={b.priority_label} label={false} />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(46,134,193,0.08)" }}>
                  <span className="font-mono text-[10px] text-[#5B8FA8]">{b.temperature}°C · {b.humidity}% RH</span>
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <button onClick={() => startEdit(b)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:-translate-y-0.5"
                      style={{ background: "rgba(46,134,193,0.08)", border: "1px solid rgba(46,134,193,0.2)", color: "#2E86C1" }}>
                      {si ? "සංස්කරණය" : "Edit"}
                    </button>
                    <button onClick={() => setDeleting(b)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:-translate-y-0.5"
                      style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.18)", color: "#DC2626" }}>
                      {si ? "මකන්න" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ═══ VIEW MODAL ═══ */}
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="font-mono text-[16px] font-bold text-[#0F2A3D]">{selected.bin_id}</span>
                  {isReal(selected.bin_id) && (
                    <span className="font-mono text-[8px] font-bold px-2 py-0.5 rounded-md text-white"
                      style={{ background: "linear-gradient(135deg,#22C55E,#166534)" }}>REAL DATA</span>
                  )}
                </div>
                <div className="text-[13px] text-[#5B8FA8]">{loc(selected.bin_id)}</div>
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={selected.priority_label} />
                <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5B8FA8]"
                  style={{ background: "rgba(46,134,193,0.06)", border: "1px solid rgba(46,134,193,0.12)" }}>x</button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {[
                { l: si ? "වායු PPM" : "Gas PPM", v: selected.gas_ppm, u: "ppm" },
                { l: si ? "පිරවීමේ මට්ටම" : "Fill Level", v: selected.fill_level, u: "%" },
                { l: si ? "සෞඛ්‍ය අවදානම" : "Health Risk", v: selected.health_risk, u: "/100" },
                { l: si ? "උෂ්ණත්වය" : "Temperature", v: selected.temperature, u: "°C" },
                { l: si ? "ආර්ද්‍රතාව" : "Humidity", v: selected.humidity, u: "%" },
                { l: si ? "බැටරිය" : "Battery", v: 94, u: "%" },
              ].map(x => (
                <div key={x.l} className="rounded-xl p-3 text-center"
                  style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}>
                  <div className="font-mono text-[8px] text-[#5B8FA8] uppercase tracking-widest mb-1.5">{x.l}</div>
                  <div className="text-xl font-extrabold" style={{ color: PC[selected.priority_label] }}>{x.v}<span className="text-[10px] font-normal text-[#5B8FA8]">{x.u}</span></div>
                </div>
              ))}
            </div>

            {/* Health risk bar */}
            <div className="mb-4 p-3 rounded-xl" style={{ background: "rgba(46,134,193,0.04)" }}>
              <div className="flex justify-between mb-1.5">
                <span className="font-mono text-[9px] text-[#5B8FA8]">{si ? "සෞඛ්‍ය අවදානම් ලකුණු" : "Health Risk Score"}</span>
                <span className="font-mono text-[10px] font-bold" style={{ color: PC[selected.priority_label] }}>{selected.health_risk}/100</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(46,134,193,0.1)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: selected.health_risk + "%", background: PC[selected.priority_label] }} />
              </div>
              <div className="font-mono text-[9px] text-[#5B8FA8] mt-2">
                Formula: (gas_ppm/1000 x 100 x 0.70) + (fill_level x 0.30)
              </div>
            </div>

            <div className="font-mono text-[10px] text-[#5B8FA8] mb-4 p-3 rounded-xl" style={{ background: "rgba(46,134,193,0.04)" }}>
              {si ? "සංවේදකය: MQ-135 + HC-SR04 · MCU: NodeMCU ESP8266 · MQTT/TLS · AWS IoT Core" : "Sensor: MQ-135 + HC-SR04 · MCU: NodeMCU ESP8266 · Protocol: MQTT/TLS · AWS IoT Core"}
            </div>

            <div className="flex gap-2.5">
              <button onClick={() => startEdit(selected)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-[13px] text-white"
                style={{ background: "linear-gradient(135deg,#2E86C1,#1A5276)", boxShadow: "0 4px 16px rgba(46,134,193,0.3)" }}>
                {si ? "සංස්කරණය" : "Edit Bin"}
              </button>
              <button onClick={() => { setDeleting(selected); setSelected(null) }}
                className="px-5 py-2.5 rounded-xl font-semibold text-[13px]"
                style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", color: "#DC2626" }}>
                {si ? "මකන්න" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EDIT MODAL ═══ */}
      {editing && (
        <div className="overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="text-[17px] font-bold text-[#0F2A3D]">{si ? "සංස්කරණය" : "Edit"} {editing.bin_id}</div>
              <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5B8FA8]"
                style={{ background: "rgba(46,134,193,0.06)", border: "1px solid rgba(46,134,193,0.12)" }}>x</button>
            </div>
            <div className="flex flex-col gap-3.5">
              <div>
                <div className="inp-label">{si ? "ස්ථානය" : "Location"}</div>
                <input className="inp-field" value={editForm.location || BIN_LOCATIONS[editing.bin_id] || ""} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><div className="inp-label">{si ? "වායු PPM" : "Gas PPM"}</div><input className="inp-field" type="number" value={editForm.gas_ppm || ""} onChange={e => setEditForm(f => ({ ...f, gas_ppm: Number(e.target.value) }))} /></div>
                <div><div className="inp-label">{si ? "පිරවීම %" : "Fill Level %"}</div><input className="inp-field" type="number" min="0" max="100" value={editForm.fill_level || ""} onChange={e => setEditForm(f => ({ ...f, fill_level: Number(e.target.value) }))} /></div>
                <div><div className="inp-label">{si ? "උෂ්ණත්වය °C" : "Temperature °C"}</div><input className="inp-field" type="number" value={editForm.temperature || ""} onChange={e => setEditForm(f => ({ ...f, temperature: Number(e.target.value) }))} /></div>
                <div><div className="inp-label">{si ? "ආර්ද්‍රතාව %" : "Humidity %"}</div><input className="inp-field" type="number" value={editForm.humidity || ""} onChange={e => setEditForm(f => ({ ...f, humidity: Number(e.target.value) }))} /></div>
              </div>
              <div>
                <div className="inp-label">{si ? "ප්‍රමුඛතාව" : "Priority Override"}</div>
                <select className="inp-field" value={editForm.priority_label || ""} onChange={e => setEditForm(f => ({ ...f, priority_label: e.target.value as Priority }))}>
                  <option value="CRITICAL">CRITICAL</option><option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2.5 mt-5">
              <button onClick={saveEdit}
                className="flex-1 py-2.5 rounded-xl font-semibold text-[13px] text-white"
                style={{ background: "linear-gradient(135deg,#2D7A4F,#1A3328)", boxShadow: "0 4px 16px rgba(45,122,79,0.3)" }}>
                {si ? "වෙනස්කම් සුරකින්න" : "Save Changes"}
              </button>
              <button onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-xl font-semibold text-[13px] text-[#5B8FA8]"
                style={{ background: "rgba(46,134,193,0.06)", border: "1px solid rgba(46,134,193,0.15)" }}>
                {si ? "අවලංගු" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DELETE CONFIRM ═══ */}
      {deleting && (
        <div className="overlay" onClick={() => setDeleting(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
              </div>
              <div className="text-[17px] font-bold text-[#0F2A3D] mb-2">{si ? "මකන්නද" : "Delete"} {deleting.bin_id}?</div>
              <p className="text-[13px] text-[#5B8FA8] leading-relaxed">
                {si ? "මෙය නිරීක්ෂණ පද්ධතියෙන් කූඩුව ඉවත් කරයි. මෙම ක්‍රියාව අහෝසි කළ නොහැක." : "This will remove the bin from the monitoring system. This action cannot be undone."}
              </p>
            </div>
            <div className="flex gap-2.5">
              <button onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl font-semibold text-[13px] text-white"
                style={{ background: "linear-gradient(135deg,#DC2626,#991B1B)", boxShadow: "0 4px 16px rgba(220,38,38,0.3)" }}>
                {si ? "මකන්න" : "Delete"}
              </button>
              <button onClick={() => setDeleting(null)} className="flex-1 py-2.5 rounded-xl font-semibold text-[13px] text-[#5B8FA8]"
                style={{ background: "rgba(46,134,193,0.06)", border: "1px solid rgba(46,134,193,0.15)" }}>
                {si ? "අවලංගු" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CREATE MODAL ═══ */}
      {creating && (
        <div className="overlay" onClick={() => setCreating(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="text-[17px] font-bold text-[#0F2A3D]">{si ? "නව කූඩුවක් එකතු කරන්න" : "Add New Bin"}</div>
              <button onClick={() => setCreating(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5B8FA8]"
                style={{ background: "rgba(46,134,193,0.06)", border: "1px solid rgba(46,134,193,0.12)" }}>x</button>
            </div>
            <div className="flex flex-col gap-3.5">
              <div>
                <div className="inp-label">{si ? "කූඩු ID" : "Bin ID"}</div>
                <input className="inp-field" placeholder="BIN_013" value={newBin.bin_id} onChange={e => setNewBin(f => ({ ...f, bin_id: e.target.value }))} />
              </div>
              <div>
                <div className="inp-label">{si ? "ස්ථානය" : "Location"}</div>
                <input className="inp-field" placeholder={si ? "හෝමාගම නගර මධ්‍යයේ" : "Homagama Town Center"} value={newBin.location} onChange={e => setNewBin(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><div className="inp-label">{si ? "පිරවීම %" : "Fill Level %"}</div><input className="inp-field" type="number" min="0" max="100" value={newBin.fill_level} onChange={e => setNewBin(f => ({ ...f, fill_level: Number(e.target.value) }))} /></div>
                <div><div className="inp-label">{si ? "වායු PPM" : "Gas PPM"}</div><input className="inp-field" type="number" min="0" max="1000" value={newBin.gas_ppm} onChange={e => setNewBin(f => ({ ...f, gas_ppm: Number(e.target.value) }))} /></div>
                <div><div className="inp-label">{si ? "උෂ්ණත්වය °C" : "Temperature °C"}</div><input className="inp-field" type="number" value={newBin.temperature} onChange={e => setNewBin(f => ({ ...f, temperature: Number(e.target.value) }))} /></div>
                <div><div className="inp-label">{si ? "ආර්ද්‍රතාව %" : "Humidity %"}</div><input className="inp-field" type="number" value={newBin.humidity} onChange={e => setNewBin(f => ({ ...f, humidity: Number(e.target.value) }))} /></div>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "rgba(46,134,193,0.04)", border: "1px solid rgba(46,134,193,0.12)" }}>
                <div className="font-mono text-[9px] text-[#5B8FA8] uppercase tracking-widest mb-1">{si ? "ML ස්වයංක්‍රීය වර්ගීකරණය" : "ML Auto-Classification"}</div>
                <div className="font-mono text-[11px] text-[#2E5266]">
                  health_risk = (gas/1000 x 100 x 0.70) + (fill x 0.30)
                </div>
              </div>
            </div>
            <div className="flex gap-2.5 mt-5">
              <button onClick={createNewBin}
                className="flex-1 py-2.5 rounded-xl font-semibold text-[13px] text-white"
                style={{ background: "linear-gradient(135deg,#2D7A4F,#1A3328)", boxShadow: "0 4px 16px rgba(45,122,79,0.3)" }}>
                {si ? "කූඩුව සාදන්න" : "Create Bin"}
              </button>
              <button onClick={() => setCreating(false)} className="px-5 py-2.5 rounded-xl font-semibold text-[13px] text-[#5B8FA8]"
                style={{ background: "rgba(46,134,193,0.06)", border: "1px solid rgba(46,134,193,0.15)" }}>
                {si ? "අවලංගු" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Collection History */}
      <CollectionHistory />
    </div>
  )
}


function CollectionHistory() {
  const { lang } = useLang()
  const si = lang === 'si'
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { BIN_LOCATIONS, BIN_LOCATIONS_SI } = require('@/lib/data')

  useEffect(() => {
    fetch('/api/history').then(r => r.json()).then(d => {
      if (d.success) setHistory(d.history)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const loc = (id: string) => si ? (BIN_LOCATIONS_SI?.[id] || BIN_LOCATIONS[id] || 'හෝමාගම') : (BIN_LOCATIONS[id] || 'Homagama')

  return (
    <div className="glass-card p-5">
      <div className="font-bold text-[14px] text-[#0F2A3D] mb-1">{si ? 'එකතු කිරීමේ ඉතිහාසය' : 'Collection History'}</div>
      <div className="font-mono text-[9.5px] text-[#5B8FA8] mb-4">{si ? 'BinSensorData · gas=0, fill=0 වාර්තා' : 'BinSensorData · records where gas=0, fill=0'}</div>
      {loading ? (
        <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"/></div>
      ) : history.length === 0 ? (
        <div className="text-center py-6 text-[#5B8FA8] text-[12px]">{si ? 'තවම එකතු කිරීමේ ඉතිහාසයක් නොමැත' : 'No collection history yet'}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>{si ? 'කූඩු' : 'Bin'}</th>
                <th>{si ? 'ස්ථානය' : 'Location'}</th>
                <th>{si ? 'එකතු කළ වේලාව' : 'Collected At'}</th>
                <th>{si ? 'ප්‍රමුඛතාව' : 'Priority'}</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h: any, i: number) => (
                <tr key={i}>
                  <td className="font-mono text-[12px] font-bold text-[#0F2A3D]">{h.bin_id}</td>
                  <td className="text-[12px] text-[#5B8FA8]">{loc(h.bin_id)}</td>
                  <td className="font-mono text-[11px] text-[#5B8FA8]">
                    {new Date(Number(h.timestamp) * 1000).toLocaleString('en-GB', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                  </td>
                  <td>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      {si ? 'සම්පූර්ණයි' : 'Collected'}
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