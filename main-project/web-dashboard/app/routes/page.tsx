"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useLang } from "@/lib/LangContext"
import { getAllBins, collectBin } from "@/lib/api"
import { MOCK_BINS, BIN_LOCATIONS, BIN_LOCATIONS_SI } from "@/lib/data"
import type { Bin, Priority } from "@/lib/types"
import PriorityBadge from "@/components/PriorityBadge"

const PC: Record<string,string> = {CRITICAL:"#DC2626",HIGH:"#D97706",MEDIUM:"#CA8A04",LOW:"#2D7A4F"}

const BIN_COORDS: Record<string,[number,number]> = {
  BIN_001:[6.8459,80.0004], BIN_002:[6.8478,80.0038], BIN_003:[6.8502,80.0015],
  BIN_004:[6.8418,80.0052], BIN_005:[6.8217,80.0434], BIN_006:[6.8432,79.9971],
  BIN_007:[6.8488,79.9959], BIN_008:[6.8455,80.0068], BIN_009:[6.8467,79.9988],
  BIN_010:[6.8422,80.0088], BIN_011:[6.8511,80.0042], BIN_012:[6.8398,79.9995],
}
const DEPOT: [number,number] = [6.8440, 80.0030]

interface RouteStop extends Bin {
  collected: boolean
  collectTime?: string
}

export default function RoutesPage() {
  const { lang } = useLang()
  const si = lang === "si"
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInst = useRef<any>(null)
  const routeLineRef = useRef<any>(null)
  const truckRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  const [bins, setBins] = useState<Bin[]>(MOCK_BINS)
  const [route, setRoute] = useState<RouteStop[]>([])
  const [dispatched, setDispatched] = useState(false)
  const [collecting, setCollecting] = useState<string|null>(null)
  const [toast, setToast] = useState("")

  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(""),3500) }
  const [showSchedule, setShowSchedule] = useState(false)
  const [schedule, setSchedule] = useState<any>(null)
  const [schedForm, setSchedForm] = useState({monday_date:"",monday_note:"",thursday_date:"",thursday_note:""})
  const [schedSaving, setSchedSaving] = useState(false)

  useEffect(() => {
    fetch("https://g7oob1ovd6.execute-api.ap-southeast-2.amazonaws.com/prod/schedule")
      .then(r => r.json()).then(d => {
        if (d.success) {
          setSchedule(d.schedule)
          setSchedForm({monday_date:d.schedule.monday_date,monday_note:d.schedule.monday_note,thursday_date:d.schedule.thursday_date,thursday_note:d.schedule.thursday_note})
        }
      }).catch(()=>{})
  }, [])

  const saveSchedule = async () => {
    setSchedSaving(true)
    try {
      const res = await fetch("https://g7oob1ovd6.execute-api.ap-southeast-2.amazonaws.com/prod/schedule", {
        method: "PUT",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({...schedForm, monday_time:"8:00 AM - 10:00 AM", thursday_time:"8:00 AM - 10:00 AM", updated_by:"admin"})
      })
      const d = await res.json()
      if (d.success) { showToast("Schedule updated successfully!"); setShowSchedule(false) }
    } catch(e) { showToast("Failed to save schedule") }
    finally { setSchedSaving(false) }
  }

  // Fetch bins
  useEffect(() => {
    const fetch = () => getAllBins().then(b => { if (b?.length) setBins(b) }).catch(()=>{})
    fetch()
    const t = setInterval(fetch, 15000)
    return () => clearInterval(t)
  }, [])

  // Build route from CRITICAL + HIGH bins
  useEffect(() => {
    const urgent = bins
      .filter(b => b.priority_label === "CRITICAL" || b.priority_label === "HIGH")
      .sort((a, b) => b.health_risk - a.health_risk)
      .map(b => ({
        ...b,
        collected: b.gas_ppm === 0 && b.fill_level === 0,
        collectTime: (b.gas_ppm === 0 && b.fill_level === 0) ? new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}) : undefined,
      }))
    setRoute(urgent)
  }, [bins])

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInst.current) return
    const L = require("leaflet")
    require("leaflet/dist/leaflet.css")
    const map = L.map(mapRef.current, { center:DEPOT, zoom:15, zoomControl:false })
    L.control.zoom({ position:"bottomright" }).addTo(map)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:"\u00a9 OpenStreetMap", maxZoom:19
    }).addTo(map)
    const depotIcon = L.divIcon({
      html:'<div style="width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#2E86C1,#1A5276);border:3px solid white;box-shadow:0 4px 16px rgba(46,134,193,0.45);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:800">D</div>',
      className:"", iconSize:[38,38], iconAnchor:[19,19],
    })
    L.marker(DEPOT, { icon:depotIcon }).addTo(map)
    mapInst.current = map
    return () => { map.remove(); mapInst.current = null }
  }, [])

  // Update map markers when route changes
  useEffect(() => {
    if (!mapInst.current || !route.length) return
    const L = require("leaflet")
    const map = mapInst.current

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    if (routeLineRef.current) routeLineRef.current.remove()
    if (truckRef.current) truckRef.current.remove()

    const pts: [number,number][] = [DEPOT]
    route.forEach(b => { const c = BIN_COORDS[b.bin_id]; if(c) pts.push(c) })
    pts.push(DEPOT)

    if (dispatched) {
      routeLineRef.current = L.polyline(pts, {
        color:"#2E86C1", weight:4, opacity:0.7, dashArray:"12 8", smoothFactor:1.5,
      }).addTo(map)
    }

    route.forEach((bin, idx) => {
      const c = BIN_COORDS[bin.bin_id]
      if (!c) return
      const col = bin.collected ? "#22C55E" : PC[bin.priority_label]
      const label = bin.collected ? "\u2713" : String(idx+1)
      const icon = L.divIcon({
        html:'<div style="width:44px;height:44px;border-radius:50%;background:'+col+';border:3px solid white;box-shadow:0 4px 16px '+col+'44;display:flex;align-items:center;justify-content:center;font-family:DM Mono,monospace;font-size:13px;font-weight:700;color:white">'+label+'</div>',
        className:"", iconSize:[44,44], iconAnchor:[22,22],
      })
      const m = L.marker(c, { icon }).addTo(map)
      m.bindPopup(
        '<div style="font-family:Plus Jakarta Sans;padding:4px;min-width:170px">'+
        '<div style="font-weight:800;font-size:14px;margin-bottom:2px">Stop '+(idx+1)+' \u2014 '+bin.bin_id+'</div>'+
        '<div style="font-family:DM Mono;font-size:10px;color:#5B8FA8;margin-bottom:8px">'+(si ? (BIN_LOCATIONS_SI[bin.bin_id]||"හෝමාගම") : (BIN_LOCATIONS[bin.bin_id]||"Homagama"))+'</div>'+
        (bin.collected
          ? '<div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:8px;text-align:center;color:#166534;font-weight:700;font-size:12px">\u2713 COLLECTED'+(bin.collectTime?' at '+bin.collectTime:'')+'</div>'
          : '<div style="display:flex;gap:10px"><div><span style="font-family:DM Mono;font-size:8px;color:#5B8FA8">GAS</span><br/><b style="font-size:16px;color:'+col+'">'+bin.gas_ppm+'</b> <span style="font-size:9px;color:#5B8FA8">ppm</span></div><div><span style="font-family:DM Mono;font-size:8px;color:#5B8FA8">FILL</span><br/><b style="font-size:16px;color:'+col+'">'+bin.fill_level+'%</b></div><div><span style="font-family:DM Mono;font-size:8px;color:#5B8FA8">RISK</span><br/><b style="font-size:16px;color:'+col+'">'+bin.health_risk+'</b></div></div>'
        )+'</div>'
      )
      markersRef.current.push(m)
    })

    if (dispatched) {
      const truckIcon = L.divIcon({
        html:'<div style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#22C55E,#166534);border:3px solid white;box-shadow:0 6px 20px rgba(34,197,94,0.5);display:flex;align-items:center;justify-content:center;font-size:18px;z-index:9999">\ud83d\ude9b</div>',
        className:"", iconSize:[42,42], iconAnchor:[21,21],
      })
      const firstUncollected = route.find(b => !b.collected)
      const truckPos = firstUncollected ? (BIN_COORDS[firstUncollected.bin_id] || DEPOT) : DEPOT
      truckRef.current = L.marker(truckPos, { icon:truckIcon, zIndexOffset:2000 }).addTo(map)
    }

    map.fitBounds(L.latLngBounds(pts), { padding:[50,50] })
  }, [route, dispatched])

  // Collect a bin - sends POST to AWS with zero values
  const handleCollect = async (binId: string) => {
    setCollecting(binId)
    try {
      await collectBin(binId)
      showToast(binId + (si?" එකතු කරන ලදී — සංවේදකය 0 PPM, 0% පිරවීම ලෙස යාවත්කාලීන විය":" collected — sensor updated to 0 PPM, 0% fill"))
      // Update local state immediately
      setRoute(prev => prev.map(b => b.bin_id === binId ? {...b, collected:true, collectTime: new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}), gas_ppm:0, fill_level:0, health_risk:0, priority_label:"LOW" as Priority} : b))
      // Refresh from AWS after a short delay
      setTimeout(() => {
        getAllBins().then(b => { if (b?.length) setBins(b) }).catch(()=>{})
      }, 2000)
    } catch (e) {
      showToast(si?"එකතු කිරීම අසාර්ථක විය":"Collection failed — check AWS connection")
    }
    setCollecting(null)
  }

  const collectedCount = route.filter(b => b.collected).length
  const totalStops = route.length
  const isComplete = totalStops > 0 && collectedCount === totalStops

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F2A3D] tracking-tight">{si?"මාර්ග":"Routes"}</h1>
          <p className="font-mono text-[10px] text-[#5B8FA8] mt-1">{si?"ප්‍රමුඛතා රූට් කළමනාකරණය":"Priority route management · Homagama"}</p>
        </div>
        <button onClick={() => setShowSchedule(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{background:"linear-gradient(135deg,#2D5A1B,#4A8C28)"}}>
          📅 {si?"එකතු කිරීමේ කාලසටහන සංස්කරණය":"Edit Collection Schedule"}
        </button>
      </div>
      <style>{`
        .leaflet-control-zoom{border:none!important;box-shadow:0 4px 16px rgba(0,0,0,0.12)!important;border-radius:10px!important;overflow:hidden!important}
        .leaflet-control-zoom a{border-radius:0!important}
        .leaflet-popup-content-wrapper{border-radius:14px!important;box-shadow:0 20px 60px rgba(0,0,0,0.15)!important;border:1px solid rgba(255,255,255,0.8)!important}
        .leaflet-popup-content{margin:12px!important}
        .leaflet-popup-tip-container{display:none!important}
      `}</style>

      {toast && <div className="toast" style={{background:"#1A3328"}}>{toast}</div>}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F2A3D] tracking-tight">
            {si?"එකතු කිරීමේ මාර්ග":"Collection Routes"}
          </h1>
          <p className="font-mono text-[10px] text-[#5B8FA8] mt-1">
            {si?"අවදානම් + ඉහළ ප්\u200dරමුඛතා පමණක් · වායු=0 සහ පිරවීම=0 විට ස්වයංක්\u200dරීයව එකතු කළ ලෙස සලකුණු":"CRITICAL + HIGH only · auto-marks collected when gas=0 and fill=0 after emptying"}
          </p>
        </div>
        {!dispatched ? (
          <button onClick={()=>setDispatched(true)}
            className="px-5 py-2.5 rounded-xl font-semibold text-[13px] text-white transition-all hover:-translate-y-0.5"
            style={{background:"linear-gradient(135deg,#22C55E,#166534)",boxShadow:"0 4px 16px rgba(34,197,94,0.35)"}}>
            {si?"මාර්ගය යවන්න":"Dispatch Route"}
          </button>
        ) : isComplete ? (
          <div className="px-5 py-2.5 rounded-xl font-semibold text-[13px] text-white"
            style={{background:"linear-gradient(135deg,#22C55E,#166534)"}}>
            {si?"මාර්ගය සම්පූර්ණයි":"Route Complete"} \u2713
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl font-mono text-[11px]"
              style={{background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.25)",color:"#166534"}}>
              {si?"සක්\u200dරියයි · ":"ACTIVE · "}{collectedCount}/{totalStops} {si?"එකතු කළා":"collected"}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {l:si?"මුළු නැවතුම්":"Today's Stops", v:totalStops, c:"#2E86C1"},
          {l:si?"එකතු කළ":"Collected", v:collectedCount+"/"+totalStops, c:"#22C55E"},
          {l:si?"ඉතිරි":"Remaining", v:totalStops-collectedCount, c:totalStops-collectedCount>0?"#DC2626":"#22C55E"},
          {l:si?"තත්ත්වය":"Status", v:!dispatched?(si?"බලා සිටී":"Waiting"):isComplete?(si?"සම්පූර්ණයි":"Complete"):(si?"සක්\u200dරියයි":"Active"), c:!dispatched?"#5B8FA8":isComplete?"#22C55E":"#D97706"},
        ].map(s=>(
          <div key={s.l} className="glass-card px-4 py-3">
            <div className="font-mono text-[9px] uppercase tracking-widest mb-1.5" style={{color:s.c+"99"}}>{s.l}</div>
            <div className="text-2xl font-extrabold" style={{color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Map + Panel */}
      <div className="grid gap-0 rounded-2xl overflow-hidden" style={{gridTemplateColumns:"1fr 380px",height:540,border:"1px solid rgba(255,255,255,0.6)",boxShadow:"0 8px 40px rgba(15,42,61,0.08)"}}>
        {/* Map */}
        <div className="relative overflow-hidden">
          <div ref={mapRef} style={{height:"100%",width:"100%"}} />
          <div className="absolute top-3.5 left-3.5 z-[1000] px-3.5 py-2 rounded-xl"
            style={{background:"rgba(255,255,255,0.92)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.8)",boxShadow:"0 4px 16px rgba(15,42,61,0.1)"}}>
            <div className="font-bold text-[13px] text-[#0F2A3D]">{si?"සජීව මාර්ග සිතියම":"Live Route Map"}</div>
            <div className="font-mono text-[9px] text-[#5B8FA8] mt-0.5">{si?"ඩිපෝව → අවදානම් කූඩු → ඩිපෝව":"Depot \u2192 CRITICAL/HIGH bins \u2192 Depot"}</div>
          </div>
          <div className="absolute bottom-3.5 left-3.5 z-[1000] px-3 py-2 rounded-xl flex items-center gap-4"
            style={{background:"rgba(255,255,255,0.92)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.8)"}}>
            {[["Critical","#DC2626"],["High","#D97706"],["Collected","#22C55E"],["Depot","#2E86C1"]].map(([l,c])=>(
              <div key={l} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{background:c as string}}/>
                <span className="font-mono text-[9px] text-[#5B8FA8]">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Route panel */}
        <div className="flex flex-col overflow-hidden" style={{background:"rgba(255,255,255,0.45)",backdropFilter:"blur(16px)",borderLeft:"1px solid rgba(255,255,255,0.5)"}}>
          <div className="px-4 py-3 flex-shrink-0" style={{borderBottom:"1px solid rgba(46,134,193,0.1)"}}>
            <div className="font-bold text-[14px] text-[#0F2A3D]">{si?"එකතු කිරීමේ අනුපිළිවෙල":"Collection Order"}</div>
            <div className="font-mono text-[9px] text-[#5B8FA8] mt-0.5">
              {si?"වායු=0, පිරවීම=0 විට ස්වයංක්\u200dරීයව එකතු කළ ලෙස සලකුණු":"Auto-marks collected when sensor reads gas=0, fill=0"}
            </div>
            {dispatched && (
              <div className="mt-2.5">
                <div className="h-2 rounded-full overflow-hidden" style={{background:"rgba(46,134,193,0.1)"}}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{width:totalStops?(collectedCount/totalStops*100)+"%":"0%",background:"linear-gradient(90deg,#22C55E,#166534)"}}/>
                </div>
                <div className="font-mono text-[9px] text-[#5B8FA8] mt-1">{collectedCount}/{totalStops} {si?"එකතු කළා":"collected"}</div>
              </div>
            )}
          </div>

          {/* Depot */}
          <div className="px-4 py-2.5 flex items-center gap-3 flex-shrink-0" style={{background:"rgba(46,134,193,0.05)",borderBottom:"1px solid rgba(46,134,193,0.08)"}}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{background:"linear-gradient(135deg,#2E86C1,#1A5276)"}}>D</div>
            <div>
              <div className="text-[12px] font-semibold text-[#0F2A3D]">{si?"එකතු කිරීමේ ඩිපෝව":"Collection Depot"}</div>
              <div className="font-mono text-[9px] text-[#5B8FA8]">{si?"හෝමාගම නාගරික කාර්යාලය":"Homagama Municipal Office"}</div>
            </div>
          </div>

          {/* Stops */}
          <div className="flex-1 overflow-y-auto px-2.5 py-2">
            {route.map((bin, idx) => {
              const col = bin.collected ? "#22C55E" : PC[bin.priority_label]
              const isCollecting = collecting === bin.bin_id
              return (
                <div key={bin.bin_id}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl mb-2 transition-all"
                  style={{
                    background: bin.collected ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.5)",
                    border: "1px solid " + (bin.collected ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.6)"),
                    borderLeft: "4px solid " + col,
                    backdropFilter: "blur(12px)",
                  }}>
                  {/* Number/check */}
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
                    style={{background:col, boxShadow:"0 2px 8px "+col+"44"}}>
                    {bin.collected ? "\u2713" : idx+1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-[12px] font-semibold text-[#0F2A3D]"
                        style={{textDecoration:bin.collected?"line-through":"none"}}>{bin.bin_id}</span>
                      {!bin.collected && <PriorityBadge priority={bin.priority_label} size="sm"/>}
                      {(bin as any).is_real && <span className="font-mono text-[7px] font-bold px-1.5 py-0.5 rounded text-white" style={{background:"linear-gradient(135deg,#22C55E,#166534)"}}>LIVE</span>}
                      {bin.collected && <span className="font-mono text-[9px] text-[#22C55E] font-medium">{si?"එකතු කළා":"COLLECTED"}{bin.collectTime?" "+bin.collectTime:""}</span>}
                    </div>
                    <div className="font-mono text-[9px] text-[#5B8FA8] truncate">{si ? (BIN_LOCATIONS_SI[bin.bin_id]||"හෝමාගම") : (BIN_LOCATIONS[bin.bin_id]||"Homagama")}</div>
                    {!bin.collected && (
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-mono text-[9px]" style={{color:col}}>{bin.gas_ppm} PPM</span>
                        <span className="font-mono text-[9px]" style={{color:col}}>{bin.fill_level}%</span>
                        <span className="font-mono text-[9px]" style={{color:col}}>Risk {bin.health_risk}</span>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  {dispatched && !bin.collected && (
                    <button onClick={()=>handleCollect(bin.bin_id)} disabled={isCollecting}
                      className="px-3 py-2 rounded-lg font-semibold text-[11px] text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 flex-shrink-0"
                      style={{background:"linear-gradient(135deg,"+col+","+col+"cc)",boxShadow:"0 2px 10px "+col+"33"}}>
                      {isCollecting ? "..." : (si?"එකතු කරන්න":"Collect")}
                    </button>
                  )}
                  {bin.collected && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white text-[12px]"
                      style={{background:"#22C55E"}}>\u2713</div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Depot return */}
          <div className="px-4 py-2.5 flex items-center gap-3 flex-shrink-0" style={{background:"rgba(46,134,193,0.05)",borderTop:"1px solid rgba(46,134,193,0.08)"}}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{background:"linear-gradient(135deg,#2E86C1,#1A5276)"}}>D</div>
            <div>
              <div className="text-[12px] font-semibold text-[#0F2A3D]">{si?"ඩිපෝවට ආපසු":"Return to Depot"}</div>
              <div className="font-mono text-[9px] text-[#5B8FA8]">{isComplete?(si?"මාර්ගය සම්පූර්ණයි":"Route complete \u2713"):(si?"එකතු කිරීම් ඉතිරිව ඇත":"Collections remaining")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(0,0,0,0.7)", zIndex:9999}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6" style={{position:"relative", zIndex:10000}}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#0F2A3D]">{si?"එකතු කිරීමේ කාලසටහන සංස්කරණය":"Edit Collection Schedule"}</h2>
                <p className="text-xs text-[#5B8FA8] mt-0.5">{si?"හෝමාගම නාගරික කලාපය":"Homagama Municipal Area"}</p>
              </div>
              <button onClick={() => setShowSchedule(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">✕</button>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white text-xs font-bold">M</div>
                  <span className="font-bold text-[#0F2A3D]">{si?"සඳුදා එකතු කිරීම":"Monday Collection"}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-semibold text-[#5B8FA8] uppercase tracking-wide">{si?"එකතු කිරීමේ දිනය":"Collection Date"}</label>
                    <input type="date" value={schedForm.monday_date}
                      onChange={e => setSchedForm(f => ({...f, monday_date:e.target.value}))}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#5B8FA8] uppercase tracking-wide">{si?"සටහන (විකල්ප)":"Note (optional)"}</label>
                    <input type="text" value={schedForm.monday_note} placeholder="e.g. Postponed due to public holiday"
                      onChange={e => setSchedForm(f => ({...f, monday_note:e.target.value}))}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-500" />
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">T</div>
                  <span className="font-bold text-[#0F2A3D]">{si?"බ්‍රහස්පතින්දා එකතු කිරීම":"Thursday Collection"}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-semibold text-[#5B8FA8] uppercase tracking-wide">{si?"එකතු කිරීමේ දිනය":"Collection Date"}</label>
                    <input type="date" value={schedForm.thursday_date}
                      onChange={e => setSchedForm(f => ({...f, thursday_date:e.target.value}))}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#5B8FA8] uppercase tracking-wide">{si?"සටහන (විකල්ප)":"Note (optional)"}</label>
                    <input type="text" value={schedForm.thursday_note} placeholder="e.g. Postponed due to vehicle maintenance"
                      onChange={e => setSchedForm(f => ({...f, thursday_note:e.target.value}))}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-500" />
                  </div>
                </div>
              </div>
              {schedule?.updated_at && (
                <p className="text-xs text-[#5B8FA8] text-center">
                  {si?"අවසන් වරට යාවත්කාලීන කළේ: ":"Last updated: "}{new Date(schedule.updated_at).toLocaleDateString("en-GB", {day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})} {si?"විසින්":"by"} {schedule.updated_by}
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowSchedule(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                {si?"අවලංගු":"Cancel"}
              </button>
              <button onClick={saveSchedule} disabled={schedSaving}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{background:"linear-gradient(135deg,#2D5A1B,#4A8C28)"}}>
                {schedSaving ? (si?"සුරකිමින්...":"Saving...") : (si?"කාලසටහන සුරකින්න":"Save Schedule")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="glass p-5">
        <div className="font-bold text-[14px] text-[#0F2A3D] mb-3">{si?"ක්\u200dරියා කරන ආකාරය":"How Collection Works"}</div>
        <div className="grid grid-cols-4 gap-3">
          {[
            {n:"1", t:si?"ML වර්ගීකරණය":"ML Classifies", d:si?"Random Forest සෑම මිනිත්තු 15කට කූඩු වර්ගීකරණය කරයි. CRITICAL + HIGH මාර්ගයට එකතු වේ.":"Random Forest classifies bins every 15 min. CRITICAL + HIGH bins are added to today's route.",c:"#2E86C1"},
            {n:"2", t:si?"මාර්ගය යවන්න":"Dispatch Route", d:si?"කළමනාකරු මාර්ගය ට්\u200dරක් රථයට පවරයි. රියදුරු ජංගම යෙදුම හරහා මාර්ගය ලබා ගනී.":"Manager dispatches route to truck. Driver receives route via mobile app.",c:"#D97706"},
            {n:"3", t:si?"කූඩුව හිස් කරන්න":"Empty Bin", d:si?"ට්\u200dරක් රථය පැමිණ කූඩුව හිස් කරයි. සංවේදකය වායු=0, පිරවීම=0 කියවයි.":"Truck arrives and empties the bin. Sensor reads gas=0, fill=0 after emptying.",c:"#22C55E"},
            {n:"4", t:si?"ස්වයංක්\u200dරීය යාවත්කාලීන":"Auto Update", d:si?"Lambda නැවත වර්ගීකරණය LOW ලෙස කරයි. උපකරණ පුවරුව එකතු කළ ලෙස පෙන්වයි. මාර්ගය යාවත්කාලීන වේ.":"Lambda reclassifies as LOW. Dashboard shows collected. Route updates automatically.",c:"#DC2626"},
          ].map(s=>(
            <div key={s.n} className="glass-card p-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold text-white mb-3" style={{background:s.c}}>{s.n}</div>
              <div className="font-bold text-[13px] text-[#0F2A3D] mb-1.5">{s.t}</div>
              <p className="text-[11px] text-[#5B8FA8] leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
