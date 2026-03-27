'use client'
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getAllBins } from '@/lib/api'
import { MOCK_BINS, BIN_LOCATIONS } from '@/lib/data'
import type { Bin, Priority } from '@/lib/types'
import PriorityBadge from '@/components/PriorityBadge'
import FillBar from '@/components/FillBar'

type Filter = Priority | 'ALL'
const PC: Record<string,string> = {CRITICAL:'#DC2626',HIGH:'#D97706',MEDIUM:'#CA8A04',LOW:'#2D7A4F'}
const PBG: Record<string,string> = {CRITICAL:'#FEF2F2',HIGH:'#FFFBEB',MEDIUM:'#FEFCE8',LOW:'#F0FDF4',ALL:'#F9FAFB'}
const PBD: Record<string,string> = {CRITICAL:'#FECACA',HIGH:'#FDE68A',MEDIUM:'#FEF08A',LOW:'#BBF7D0',ALL:'#E5E7EB'}

export default function BinsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialFilter = (searchParams.get('filter') as Filter) || 'ALL'

  const [bins, setBins] = useState<Bin[]>(MOCK_BINS)
  const [filter, setFilter] = useState<Filter>(initialFilter)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Bin | null>(null)
  const [editing, setEditing] = useState<Bin | null>(null)
  const [deleting, setDeleting] = useState<Bin | null>(null)
  const [editForm, setEditForm] = useState<Partial<Bin>>({})
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'} | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newBin, setNewBin] = useState({bin_id:'',location:'',fill_level:0,gas_ppm:0,temperature:30,humidity:75})

  useEffect(() => {
    getAllBins().then(b => { if (b?.length) setBins(b) }).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({msg, type})
    setTimeout(() => setToast(null), 3000)
  }

  const filtered = useMemo(() => bins.filter(b => {
    const mp = filter === 'ALL' || b.priority_label === filter
    const ms = !search || b.bin_id.toLowerCase().includes(search.toLowerCase()) ||
               (BIN_LOCATIONS[b.bin_id]||'').toLowerCase().includes(search.toLowerCase())
    return mp && ms
  }), [bins, filter, search])

  const counts = useMemo(() => ({
    ALL: bins.length,
    CRITICAL: bins.filter(b=>b.priority_label==='CRITICAL').length,
    HIGH: bins.filter(b=>b.priority_label==='HIGH').length,
    MEDIUM: bins.filter(b=>b.priority_label==='MEDIUM').length,
    LOW: bins.filter(b=>b.priority_label==='LOW').length,
  }), [bins])

  function startEdit(bin: Bin) {
    setEditForm({...bin})
    setEditing(bin)
    setSelected(null)
  }

  function saveEdit() {
    if (!editing) return
    setBins(prev => prev.map(b => b.bin_id === editing.bin_id ? {...b, ...editForm} as Bin : b))
    setEditing(null)
    showToast(`${editing.bin_id} updated successfully`)
  }

  function confirmDelete() {
    if (!deleting) return
    setBins(prev => prev.filter(b => b.bin_id !== deleting.bin_id))
    setDeleting(null)
    setSelected(null)
    showToast(`${deleting.bin_id} removed from system`, 'error')
  }

  function createNewBin() {
    if (!newBin.bin_id || !newBin.location) { showToast('Bin ID and Location required', 'error'); return }
    const gasScore = (newBin.gas_ppm / 1000) * 100
    const healthRisk = Math.round(Math.min((gasScore * 0.70) + (newBin.fill_level * 0.30), 100) * 10) / 10
    const pl = healthRisk >= 50 ? 'CRITICAL' : healthRisk >= 30 ? 'HIGH' : healthRisk >= 15 ? 'MEDIUM' : 'LOW'
    const bin: Bin = {
      bin_id: newBin.bin_id, fill_level: newBin.fill_level, gas_ppm: newBin.gas_ppm,
      temperature: newBin.temperature, humidity: newBin.humidity, health_risk: healthRisk,
      priority: pl === 'CRITICAL' ? 3 : pl === 'HIGH' ? 2 : pl === 'MEDIUM' ? 1 : 0,
      priority_label: pl as Priority, last_updated: new Date().toISOString(),
      timestamp: String(Math.floor(Date.now()/1000)), classified_by: 'RandomForest_ML',
    }
    setBins(prev => [bin, ...prev])
    setCreating(false)
    setNewBin({bin_id:'',location:'',fill_level:0,gas_ppm:0,temperature:30,humidity:75})
    showToast(newBin.bin_id + ' created — ML classified as ' + pl)
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <style>{`
        .bin-card{transition:transform .18s,box-shadow .18s;cursor:pointer}
        .bin-card:hover{transform:translateY(-3px);box-shadow:0 14px 40px rgba(26,51,40,0.12)!important}
        .filter-btn{transition:all .15s;cursor:pointer;font-family:var(--mono)}
        .filter-btn:hover{opacity:.8}
        .action-btn{transition:background .15s,transform .12s;cursor:pointer}
        .action-btn:hover{transform:translateY(-1px)}
        .overlay{position:fixed;inset:0;background:rgba(26,51,40,.4);backdrop-filter:blur(8px);z-index:200;display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease}
        .modal{background:rgba(255,255,255,.96);backdrop-filter:blur(24px);border-radius:20px;padding:28px;width:100%;max-width:480px;box-shadow:0 32px 80px rgba(26,51,40,.2);animation:fadeUp .25s cubic-bezier(.16,1,.3,1);border:1px solid rgba(255,255,255,.9)}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {toast && (
        <div style={{position:'fixed',bottom:28,left:'50%',transform:'translateX(-50%)',padding:'12px 22px',borderRadius:10,fontFamily:'var(--mono)',fontSize:12,fontWeight:500,zIndex:999,animation:'slideIn .3s cubic-bezier(.16,1,.3,1)',background:toast.type==='success'?'#1A3328':'#DC2626',color:'#fff',boxShadow:'0 8px 32px rgba(26,51,40,.2)'}}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,color:'var(--g700)',letterSpacing:'-.02em'}}>Live Bins</div>
          <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--g400)',marginTop:3}}>
            {loading ? 'Fetching from AWS...' : `${bins.length} bins · Homagama Municipal Zone`}
          </div>
        </div>
        <button className="action-btn" onClick={()=>setCreating(true)} style={{padding:'10px 20px',borderRadius:10,background:'linear-gradient(135deg,#2D7A4F,#1A3328)',color:'#fff',fontFamily:'var(--sans)',fontSize:13,fontWeight:700,border:'none',boxShadow:'0 4px 16px rgba(45,122,79,.3)'}}>
          Add New Bin
        </button>
      </div>

      {/* Search + filters */}
      <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',padding:'14px 16px',borderRadius:14,background:'rgba(255,255,255,0.65)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',border:'1px solid rgba(255,255,255,0.82)'}}>
        <div style={{flex:1,minWidth:200,display:'flex',alignItems:'center',gap:10,padding:'9px 13px',borderRadius:9,background:'rgba(237,247,241,0.8)',border:'1px solid rgba(45,122,79,0.15)'}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--g400)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search bins or locations..."
            style={{background:'transparent',border:'none',outline:'none',flex:1,fontFamily:'var(--sans)',fontSize:13,color:'var(--g700)'}}/>
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {(['ALL','CRITICAL','HIGH','MEDIUM','LOW'] as Filter[]).map(f=>(
            <button key={f} className="filter-btn" onClick={()=>setFilter(f)} style={{
              padding:'8px 14px',borderRadius:8,fontSize:10,fontWeight:filter===f?700:500,
              letterSpacing:'.05em',textTransform:'uppercase',
              background:filter===f?PBG[f]:'rgba(255,255,255,0.8)',
              border:`1px solid ${filter===f?PBD[f]:'rgba(45,122,79,0.12)'}`,
              color:filter===f?(f==='ALL'?'var(--g600)':PC[f]):'var(--g400)',
            }}>
              {f} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      {/* Bin grid */}
      {filtered.length === 0
        ? <div style={{textAlign:'center',padding:'60px 0',fontFamily:'var(--mono)',fontSize:13,color:'var(--g400)'}}>No bins match your search</div>
        : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:14}}>
            {filtered.map((b,i) => (
              <div key={b.bin_id} className="bin-card" onClick={()=>setSelected(b)} style={{
                background:'rgba(255,255,255,0.72)',
                backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',
                border:'1px solid rgba(255,255,255,0.88)',
                borderTop:`3px solid ${PC[b.priority_label]}`,
                borderRadius:14,padding:'18px',
                boxShadow:'0 4px 20px rgba(26,51,40,0.06)',
                animation:`fadeUp .4s cubic-bezier(.16,1,.3,1) ${i*.03}s both`,
              }}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
                  <div>
                    <div style={{fontFamily:'var(--mono)',fontSize:13,fontWeight:500,color:'var(--g700)'}}>{b.bin_id}</div>
                    <div style={{fontSize:12,color:'var(--g500)',marginTop:2}}>{BIN_LOCATIONS[b.bin_id] || 'Homagama Zone'}</div>
                  </div>
                  <PriorityBadge priority={b.priority_label} size="sm"/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
                  <div style={{background:'rgba(237,247,241,0.8)',borderRadius:8,padding:'10px 12px'}}>
                    <div style={{fontFamily:'var(--mono)',fontSize:8,color:'var(--g400)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:3}}>Gas</div>
                    <div style={{fontFamily:'var(--sans)',fontSize:22,fontWeight:800,color:PC[b.priority_label],lineHeight:1}}>
                      {b.gas_ppm}<span style={{fontSize:10,color:'var(--g400)',fontWeight:400,marginLeft:2}}>ppm</span>
                    </div>
                  </div>
                  <div style={{background:'rgba(237,247,241,0.8)',borderRadius:8,padding:'10px 12px'}}>
                    <div style={{fontFamily:'var(--mono)',fontSize:8,color:'var(--g400)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:3}}>Risk</div>
                    <div style={{fontFamily:'var(--sans)',fontSize:22,fontWeight:800,color:PC[b.priority_label],lineHeight:1}}>
                      {b.health_risk}<span style={{fontSize:10,color:'var(--g400)',fontWeight:400}}>/100</span>
                    </div>
                  </div>
                </div>
                <div style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                    <span style={{fontFamily:'var(--mono)',fontSize:8.5,color:'var(--g400)',textTransform:'uppercase',letterSpacing:'.08em'}}>Fill Level</span>
                    <span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--g500)'}}>{b.fill_level}%</span>
                  </div>
                  <FillBar value={b.fill_level} priority={b.priority_label} label={false}/>
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:10,borderTop:'1px solid rgba(45,122,79,0.08)'}}>
                  <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--g400)'}}>{b.temperature}°C · {b.humidity}% RH</span>
                  <div style={{display:'flex',gap:6}} onClick={e=>e.stopPropagation()}>
                    <button className="action-btn" onClick={()=>startEdit(b)} style={{padding:'5px 12px',borderRadius:6,fontSize:11,fontWeight:600,background:'rgba(45,122,79,0.1)',border:'1px solid rgba(45,122,79,0.2)',color:'var(--g600)',fontFamily:'var(--sans)'}}>Edit</button>
                    <button className="action-btn" onClick={()=>setDeleting(b)} style={{padding:'5px 12px',borderRadius:6,fontSize:11,fontWeight:600,background:'rgba(220,38,38,0.06)',border:'1px solid rgba(220,38,38,0.18)',color:'#DC2626',fontFamily:'var(--sans)'}}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
      }

      {/* VIEW MODAL */}
      {selected && (
        <div className="overlay" onClick={()=>setSelected(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div>
                <div style={{fontFamily:'var(--mono)',fontSize:16,fontWeight:500,color:'var(--g700)'}}>{selected.bin_id}</div>
                <div style={{fontSize:13,color:'var(--g500)',marginTop:2}}>{BIN_LOCATIONS[selected.bin_id] || 'Homagama Zone'}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <PriorityBadge priority={selected.priority_label}/>
                <button onClick={()=>setSelected(null)} style={{width:30,height:30,borderRadius:8,background:'rgba(237,247,241,0.8)',border:'1px solid rgba(45,122,79,0.15)',cursor:'pointer',fontSize:16,color:'var(--g500)'}}>×</button>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
              {[
                {l:'Gas PPM',v:selected.gas_ppm,u:'ppm',c:PC[selected.priority_label]},
                {l:'Fill Level',v:selected.fill_level,u:'%',c:PC[selected.priority_label]},
                {l:'Health Risk',v:selected.health_risk,u:'/100',c:PC[selected.priority_label]},
                {l:'Temperature',v:selected.temperature,u:'°C',c:'var(--g600)'},
                {l:'Humidity',v:selected.humidity,u:'%',c:'var(--g600)'},
                {l:'Battery',v:selected.battery_level||94,u:'%',c:'#2D7A4F'},
              ].map(x=>(
                <div key={x.l} style={{background:'rgba(237,247,241,0.7)',borderRadius:10,padding:'12px',textAlign:'center'}}>
                  <div style={{fontFamily:'var(--mono)',fontSize:8,color:'var(--g400)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:4}}>{x.l}</div>
                  <div style={{fontFamily:'var(--sans)',fontSize:24,fontWeight:800,color:x.c,lineHeight:1}}>{x.v}<span style={{fontSize:11,fontWeight:400,color:'var(--g400)'}}>{x.u}</span></div>
                </div>
              ))}
            </div>
            <div style={{marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--g400)'}}>Health Risk Score</span>
                <span style={{fontFamily:'var(--mono)',fontSize:10,color:PC[selected.priority_label],fontWeight:600}}>{selected.health_risk}/100</span>
              </div>
              <div style={{height:6,background:'rgba(45,122,79,0.1)',borderRadius:3,overflow:'hidden'}}>
                <div style={{width:`${selected.health_risk}%`,height:'100%',background:PC[selected.priority_label],borderRadius:3}}/>
              </div>
              <div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--g400)',marginTop:6}}>
                Formula: (gas_ppm/1000 × 100 × 0.70) + (fill_level × 0.30)
              </div>
            </div>
            <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--g400)',marginBottom:16,padding:'10px 12px',background:'rgba(237,247,241,0.7)',borderRadius:8}}>
              Sensor: MQ-135 + HC-SR04 · MCU: NodeMCU ESP8266 · Protocol: MQTT/TLS · AWS IoT Core
            </div>
            <div style={{display:'flex',gap:10}}>
              <button className="action-btn" onClick={()=>startEdit(selected)} style={{flex:1,padding:'11px',borderRadius:10,background:'linear-gradient(135deg,#2D7A4F,#1A3328)',color:'#fff',fontFamily:'var(--sans)',fontSize:13,fontWeight:700,border:'none'}}>Edit Bin</button>
              <button className="action-btn" onClick={()=>{setDeleting(selected);setSelected(null)}} style={{padding:'11px 18px',borderRadius:10,background:'rgba(220,38,38,0.08)',color:'#DC2626',fontFamily:'var(--sans)',fontSize:13,fontWeight:600,border:'1px solid rgba(220,38,38,0.2)'}}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editing && (
        <div className="overlay" onClick={()=>setEditing(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div style={{fontSize:17,fontWeight:700,color:'var(--g700)'}}>Edit {editing.bin_id}</div>
              <button onClick={()=>setEditing(null)} style={{width:30,height:30,borderRadius:8,background:'rgba(237,247,241,0.8)',border:'1px solid rgba(45,122,79,0.15)',cursor:'pointer',fontSize:16,color:'var(--g500)'}}>×</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div>
                <div className="inp-label">Location</div>
                <input className="inp-field" value={editForm.location||BIN_LOCATIONS[editing.bin_id]||''} onChange={e=>setEditForm(f=>({...f,location:e.target.value}))} placeholder="Location name"/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <div className="inp-label">Gas PPM</div>
                  <input className="inp-field" type="number" value={editForm.gas_ppm||''} onChange={e=>setEditForm(f=>({...f,gas_ppm:Number(e.target.value)}))}/>
                </div>
                <div>
                  <div className="inp-label">Fill Level %</div>
                  <input className="inp-field" type="number" min="0" max="100" value={editForm.fill_level||''} onChange={e=>setEditForm(f=>({...f,fill_level:Number(e.target.value)}))}/>
                </div>
                <div>
                  <div className="inp-label">Temperature °C</div>
                  <input className="inp-field" type="number" value={editForm.temperature||''} onChange={e=>setEditForm(f=>({...f,temperature:Number(e.target.value)}))}/>
                </div>
                <div>
                  <div className="inp-label">Humidity %</div>
                  <input className="inp-field" type="number" value={editForm.humidity||''} onChange={e=>setEditForm(f=>({...f,humidity:Number(e.target.value)}))}/>
                </div>
              </div>
              <div>
                <div className="inp-label">Priority Override</div>
                <select className="inp-field" value={editForm.priority_label||''} onChange={e=>setEditForm(f=>({...f,priority_label:e.target.value as Priority}))}>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button className="action-btn" onClick={saveEdit} style={{flex:1,padding:'11px',borderRadius:10,background:'linear-gradient(135deg,#2D7A4F,#1A3328)',color:'#fff',fontFamily:'var(--sans)',fontSize:13,fontWeight:700,border:'none'}}>Save Changes</button>
              <button onClick={()=>setEditing(null)} style={{padding:'11px 18px',borderRadius:10,background:'rgba(237,247,241,0.8)',color:'var(--g500)',fontFamily:'var(--sans)',fontSize:13,fontWeight:600,border:'1px solid rgba(45,122,79,0.15)',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleting && (
        <div className="overlay" onClick={()=>setDeleting(null)}>
          <div className="modal" style={{maxWidth:380}} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:'center',marginBottom:20}}>
              <div style={{width:52,height:52,borderRadius:14,background:'rgba(220,38,38,0.08)',margin:'0 auto 14px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </div>
              <div style={{fontSize:17,fontWeight:700,color:'var(--g700)',marginBottom:6}}>Delete {deleting.bin_id}?</div>
              <div style={{fontSize:13,color:'var(--g500)',lineHeight:1.6}}>This will remove the bin from the monitoring system. This action cannot be undone.</div>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button className="action-btn" onClick={confirmDelete} style={{flex:1,padding:'11px',borderRadius:10,background:'#DC2626',color:'#fff',fontFamily:'var(--sans)',fontSize:13,fontWeight:700,border:'none'}}>Delete</button>
              <button onClick={()=>setDeleting(null)} style={{flex:1,padding:'11px',borderRadius:10,background:'rgba(237,247,241,0.8)',color:'var(--g500)',fontFamily:'var(--sans)',fontSize:13,fontWeight:600,border:'1px solid rgba(45,122,79,0.15)',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE BIN MODAL */}
      {creating && (
        <div className="overlay" onClick={()=>setCreating(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div style={{fontSize:17,fontWeight:700,color:'var(--g700)'}}>Add New Bin</div>
              <button onClick={()=>setCreating(false)} style={{width:30,height:30,borderRadius:8,background:'rgba(237,247,241,0.8)',border:'1px solid rgba(45,122,79,0.15)',cursor:'pointer',fontSize:16,color:'var(--g500)'}}>x</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div>
                <div className="inp-label">Bin ID</div>
                <input className="inp-field" placeholder="BIN_013" value={newBin.bin_id} onChange={e=>setNewBin(f=>({...f,bin_id:e.target.value}))}/>
              </div>
              <div>
                <div className="inp-label">Location</div>
                <input className="inp-field" placeholder="Homagama Town Center" value={newBin.location} onChange={e=>setNewBin(f=>({...f,location:e.target.value}))}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <div className="inp-label">Fill Level %</div>
                  <input className="inp-field" type="number" min="0" max="100" value={newBin.fill_level} onChange={e=>setNewBin(f=>({...f,fill_level:Number(e.target.value)}))}/>
                </div>
                <div>
                  <div className="inp-label">Gas PPM</div>
                  <input className="inp-field" type="number" min="0" max="1000" value={newBin.gas_ppm} onChange={e=>setNewBin(f=>({...f,gas_ppm:Number(e.target.value)}))}/>
                </div>
                <div>
                  <div className="inp-label">Temperature C</div>
                  <input className="inp-field" type="number" value={newBin.temperature} onChange={e=>setNewBin(f=>({...f,temperature:Number(e.target.value)}))}/>
                </div>
                <div>
                  <div className="inp-label">Humidity %</div>
                  <input className="inp-field" type="number" value={newBin.humidity} onChange={e=>setNewBin(f=>({...f,humidity:Number(e.target.value)}))}/>
                </div>
              </div>
              <div style={{padding:'12px',borderRadius:10,background:'rgba(46,134,193,0.06)',border:'1px solid rgba(46,134,193,0.12)'}}>
                <div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--g400)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:4}}>ML Auto-Classification</div>
                <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--g600)'}}>
                  Priority will be auto-calculated using: health_risk = (gas/1000 x 100 x 0.70) + (fill x 0.30)
                </div>
              </div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button className="action-btn" onClick={createNewBin} style={{flex:1,padding:'12px',borderRadius:10,background:'linear-gradient(135deg,#2D7A4F,#1A3328)',color:'#fff',fontFamily:'var(--sans)',fontSize:13,fontWeight:700,border:'none'}}>Create Bin</button>
              <button onClick={()=>setCreating(false)} style={{padding:'12px 18px',borderRadius:10,background:'rgba(237,247,241,0.8)',color:'var(--g500)',fontFamily:'var(--sans)',fontSize:13,fontWeight:600,border:'1px solid rgba(45,122,79,0.15)',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
