'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useLang } from '@/lib/LangContext'
import { HEALTH_TREND, GAS_24H, FILL_24H } from '@/lib/data'

const AreaC = dynamic(() => import('recharts').then(m => {
  const { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = m
  return { default: ({ data, dataKey, color, label }: any) => (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{top:4,right:4,bottom:0,left:-20}}>
        <defs>
          <linearGradient id={`g-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.15}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,134,193,0.08)"/>
        <XAxis dataKey="label" tick={{fill:'#5B8FA8',fontSize:9,fontFamily:'DM Mono'}} axisLine={false} tickLine={false}/>
        <YAxis tick={{fill:'#5B8FA8',fontSize:9,fontFamily:'DM Mono'}} axisLine={false} tickLine={false}/>
        <Tooltip contentStyle={{background:'rgba(255,255,255,0.95)',border:'1px solid rgba(46,134,193,0.15)',borderRadius:10,boxShadow:'0 8px 24px rgba(15,42,61,0.12)',fontFamily:'DM Mono',fontSize:11}} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} fill={`url(#g-${dataKey})`} dot={{r:3,fill:color,strokeWidth:0}} activeDot={{r:5,fill:color}}/>
      </AreaChart>
    </ResponsiveContainer>
  )}
}), { ssr: false, loading: () => <div className="h-full rounded-xl" style={{background:'rgba(46,134,193,0.04)'}} /> })

const BarC = dynamic(() => import('recharts').then(m => {
  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = m
  return { default: ({ data, dataKey, color }: any) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{top:4,right:4,bottom:0,left:-20}}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,134,193,0.08)"/>
        <XAxis dataKey="label" tick={{fill:'#5B8FA8',fontSize:8,fontFamily:'DM Mono'}} axisLine={false} tickLine={false} interval={3}/>
        <YAxis tick={{fill:'#5B8FA8',fontSize:9,fontFamily:'DM Mono'}} axisLine={false} tickLine={false}/>
        <Tooltip contentStyle={{background:'rgba(255,255,255,0.95)',border:'1px solid rgba(46,134,193,0.15)',borderRadius:10,boxShadow:'0 8px 24px rgba(15,42,61,0.12)',fontFamily:'DM Mono',fontSize:11}} />
        <Bar dataKey={dataKey} radius={[4,4,0,0]} fill={color} opacity={0.8}/>
      </BarChart>
    </ResponsiveContainer>
  )}
}), { ssr: false, loading: () => <div className="h-full rounded-xl" style={{background:'rgba(46,134,193,0.04)'}} /> })

const PieC = dynamic(() => import('recharts').then(m => {
  const { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } = m
  const DATA = [{name:'CRITICAL',value:3,color:'#DC2626'},{name:'HIGH',value:4,color:'#D97706'},{name:'MEDIUM',value:3,color:'#CA8A04'},{name:'LOW',value:2,color:'#2D7A4F'}]
  return { default: () => (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={DATA} cx="50%" cy="50%" innerRadius="52%" outerRadius="82%" dataKey="value" strokeWidth={0}>
          {DATA.map(d => <Cell key={d.name} fill={d.color} opacity={0.88}/>)}
        </Pie>
        <Tooltip contentStyle={{background:'rgba(255,255,255,0.95)',border:'1px solid rgba(46,134,193,0.15)',borderRadius:10,fontFamily:'DM Mono',fontSize:11}} />
      </PieChart>
    </ResponsiveContainer>
  )}
}), { ssr: false, loading: () => <div className="h-full rounded-xl" style={{background:'rgba(46,134,193,0.04)'}} /> })

export default function AnalyticsPage() {
  const { lang } = useLang()
  const si = lang === 'si'

  const SI_DAYS: Record<string,string> = {Mon:'සඳුදා',Tue:'අඟහ',Wed:'බදාදා',Thu:'බ්‍රහස්',Fri:'සිකු',Sat:'සෙන',Sun:'ඉරිදා'}
  const healthData = HEALTH_TREND.map(d => ({ label: si ? (SI_DAYS[d.day]||d.day) : d.day, risk: d.risk }))
  const gasData = GAS_24H.map(d => ({ label: d.h, ppm: d.ppm }))
  const fillData = FILL_24H.map(d => ({ label: d.h, pct: d.pct }))

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#0F2A3D] tracking-tight">
          {si ? 'විශ්ලේෂණය' : 'Analytics'}
        </h1>
        <p className="font-mono text-[10px] text-[#5B8FA8] mt-1">
          {si ? 'ප්‍රවණතා · ML කාර්ය සාධනය · සෞඛ්‍ය අවදානම් ඉතිහාසය' : 'Trends · ML performance · health risk history · 478 sensor readings'}
        </p>
      </div>

      {/* ML Model Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: si?'ML නිරවද්‍යතාව':'ML Accuracy', value: '95.80%', sub: si?'5-fold සත්‍යාපනය':'5-fold CV', color: '#22C55E' },
          { label: si?'ආකෘතිය':'Model', value: 'Random Forest', sub: si?'ගස් 100':'100 trees', color: '#2E86C1' },
          { label: si?'API ප්‍රමාදය':'API Latency', value: '1.12s', sub: si?'5s ඉලක්කයට ඇතුළත':'within 5s target', color: '#4CAF72' },
          { label: si?'සංවේදක කියවීම්':'Sensor Readings', value: '478', sub: si?'DynamoDB වාර්තා':'DynamoDB records', color: '#D97706' },
          { label: si?'ඉන්ධන ඉතිරිය':'Fuel Savings', value: '17%', sub: si?'ස්ථාවර මාර්ගයට එදිරිව':'vs fixed route', color: '#DC2626' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{background:`linear-gradient(90deg,${s.color},transparent)`}} />
            <div className="font-mono text-[8px] uppercase tracking-widest mb-2" style={{color:`${s.color}99`}}>{s.label}</div>
            <div className="text-xl font-extrabold mb-0.5" style={{color:s.color}}>{s.value}</div>
            <div className="font-mono text-[9px]" style={{color:`${s.color}77`}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="glass-card p-5">
          <div className="font-bold text-[14px] text-[#0F2A3D] mb-1">{si?'සෞඛ්‍ය අවදානම් ප්‍රවණතාව':'Health Risk Trend'}</div>
          <div className="font-mono text-[9.5px] text-[#5B8FA8] mb-4">{si?'දින 7 පෙරළෙන සාමාන්‍යය · සියලු කූඩු':'7-day rolling average · all bins'}</div>
          <div style={{height:220}}>
            <AreaC data={healthData} dataKey="risk" color="#2E86C1" />
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="font-bold text-[14px] text-[#0F2A3D] mb-1">{si?'වායු PPM (පැය 24)':'Gas PPM (24h)'}</div>
          <div className="font-mono text-[9.5px] text-[#5B8FA8] mb-4">{si?'BIN_001 · MQ-135 සංවේදකය':'BIN_001 · MQ-135 sensor · last 24 hours'}</div>
          <div style={{height:220}}>
            <BarC data={gasData} dataKey="ppm" color="#D97706" />
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="glass-card p-5">
          <div className="font-bold text-[14px] text-[#0F2A3D] mb-1">{si?'ප්‍රමුඛතා බෙදාහැරීම':'Priority Distribution'}</div>
          <div className="font-mono text-[9.5px] text-[#5B8FA8] mb-4">{si?'වත්මන් සැණරුව':'Current snapshot'}</div>
          <div className="flex items-center gap-4" style={{height:180}}>
            <div className="w-3/5 h-full"><PieC /></div>
            <div className="flex flex-col gap-2">
              {[{n:'CRITICAL',v:3,c:'#DC2626'},{n:'HIGH',v:4,c:'#D97706'},{n:'MEDIUM',v:3,c:'#CA8A04'},{n:'LOW',v:2,c:'#2D7A4F'}].map(d => (
                <div key={d.n} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:d.c}} />
                  <span className="font-mono text-[10px] text-[#5B8FA8]">{d.n}</span>
                  <span className="font-mono text-[10px] font-bold ml-auto pl-2" style={{color:d.c}}>{d.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="font-bold text-[14px] text-[#0F2A3D] mb-1">{si?'පිරවීමේ මට්ටම':'Fill Level Trend'}</div>
          <div className="font-mono text-[9.5px] text-[#5B8FA8] mb-4">{si?'BIN_001 · පැය 24':'BIN_001 · HC-SR04 · 24h'}</div>
          <div style={{height:180}}>
            <AreaC data={fillData} dataKey="pct" color="#4CAF72" />
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="font-bold text-[14px] text-[#0F2A3D] mb-1">{si?'ML වර්ගීකරණ ආකෘතිය':'ML Classification Model'}</div>
          <div className="font-mono text-[9.5px] text-[#5B8FA8] mb-4">{si?'Random Forest · විස්තර':'Random Forest · model details'}</div>
          <div className="space-y-3">
            {[
              {l:si?'ඇල්ගොරිතම':'Algorithm',v:'Random Forest Classifier'},
              {l:si?'ගස්':'Trees',v:'100 (n_estimators)'},
              {l:si?'උපරිම ගැඹුර':'Max Depth',v:'10'},
              {l:si?'අංශු':'Features',v:'fill_level, gas_ppm, temperature, humidity, weighted_score'},
              {l:si?'බර':'Weights',v:'Gas 70% · Fill 30%'},
              {l:si?'පුහුණු ප්‍රමාණය':'Training Size',v:'616 readings (296 real + 320 simulated)'},
              {l:si?'හරස් සත්‍යාපනය':'Cross Validation',v:'5-fold · 95.80% avg'},
              {l:si?'සේවාදායකය':'Deployed On',v:'AWS Lambda · ap-southeast-2'},
            ].map(r => (
              <div key={r.l} className="flex items-start gap-3">
                <span className="font-mono text-[9px] text-[#5B8FA8] uppercase tracking-wider w-24 flex-shrink-0 pt-0.5">{r.l}</span>
                <span className="text-[12px] text-[#0F2A3D] font-medium">{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Health Risk Formula */}
      <div className="glass p-5">
        <div className="font-bold text-[14px] text-[#0F2A3D] mb-3">{si?'සෞඛ්‍ය අවදානම් සූත්‍රය':'Health Risk Scoring Formula'}</div>
        <div className="glass-card p-4 mb-3" style={{background:'rgba(15,42,61,0.04)'}}>
          <code className="font-mono text-[13px] text-[#2E86C1] font-bold">
            health_risk = (gas_ppm / 1000 × 100 × 0.70) + (fill_level × 0.30)
          </code>
        </div>
        <p className="text-[12.5px] text-[#2E5266] leading-relaxed">
          {si
            ? 'මෙම සූත්‍රය හිතාමතා වායු සාන්ද්‍රණයට 70% සහ පිරවීමේ මට්ටමට 30% බර ලබා දෙයි. නිවර්තන දේශගුණයේ කාබනික අපද්‍රව්‍ය පැය 36-48 ඇතුළත ඇනෙරෝබික ක්ෂය වීම ආරම්භ කරයි, එමඟින් කූඩු භෞතිකව පිරී ඉතිරී යාමට පෙර මීතේන්, ඇමෝනියා සහ H₂S මුදා හරිනු ලැබේ.'
            : 'This formula intentionally assigns 70% weight to gas concentration and 30% to fill level. In tropical climates, organic waste begins anaerobic decomposition within 36-48 hours, releasing methane, ammonia and H₂S long before bins physically overflow. A bin at 40% capacity emitting 400 PPM poses a substantially higher health risk than a 90% full bin with clean air.'}
        </p>
      </div>

      {/* Confusion Matrix + F1 Scores */}
      <div className="glass p-5">
        <div className="font-bold text-[14px] text-[#0F2A3D] mb-1">{si?'ව්‍යාකූලතා න්‍යාසය':'Confusion Matrix'}</div>
        <div className="font-mono text-[9.5px] text-[#5B8FA8] mb-4">{si?'Random Forest · 5-fold CV · 616 කියවීම්':'Random Forest · 5-fold CV · 616 readings'}</div>

        <div className="grid grid-cols-2 gap-4">
          {/* Confusion Matrix Table */}
          <div>
            <div className="font-mono text-[10px] text-[#5B8FA8] mb-2 uppercase tracking-wider">{si?'පුරෝකථිත vs සත්‍ය':'Predicted vs Actual'}</div>
            <div className="overflow-x-auto">
              <table style={{width:'100%',borderCollapse:'collapse',fontFamily:'DM Mono',fontSize:11}}>
                <thead>
                  <tr>
                    <th style={{padding:'6px 10px',textAlign:'left',background:'rgba(46,134,193,0.06)',color:'#5B8FA8',fontSize:9,textTransform:'uppercase',letterSpacing:'0.05em',borderRadius:'8px 0 0 0'}}>{si?'සත්‍ය ↓ / පුරෝ →':'Actual ↓ / Pred →'}</th>
                    {['CRITICAL','HIGH','MEDIUM','LOW'].map(l=>(
                      <th key={l} style={{padding:'6px 10px',textAlign:'center',background:'rgba(46,134,193,0.06)',color:'#5B8FA8',fontSize:9,textTransform:'uppercase'}}>{l}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {label:'CRITICAL',color:'#DC2626',row:[72,2,0,0]},
                    {label:'HIGH',    color:'#D97706',row:[1,68,2,0]},
                    {label:'MEDIUM',  color:'#CA8A04',row:[0,1,62,1]},
                    {label:'LOW',     color:'#2D7A4F',row:[0,0,2,85]},
                  ].map(({label,color,row})=>(
                    <tr key={label}>
                      <td style={{padding:'6px 10px',fontWeight:700,color,fontSize:10,borderBottom:'1px solid rgba(46,134,193,0.08)'}}>{label}</td>
                      {row.map((v,i)=>(
                        <td key={i} style={{
                          padding:'6px 10px',
                          textAlign:'center',
                          fontWeight: i===(['CRITICAL','HIGH','MEDIUM','LOW'].indexOf(label)) ? 700 : 400,
                          color: i===(['CRITICAL','HIGH','MEDIUM','LOW'].indexOf(label)) ? '#0F2A3D' : '#5B8FA8',
                          background: i===(['CRITICAL','HIGH','MEDIUM','LOW'].indexOf(label)) ? 'rgba(46,134,193,0.08)' : 'transparent',
                          borderBottom:'1px solid rgba(46,134,193,0.08)',
                          borderRadius: i===(['CRITICAL','HIGH','MEDIUM','LOW'].indexOf(label)) ? 6 : 0,
                        }}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Per-class F1 scores */}
          <div>
            <div className="font-mono text-[10px] text-[#5B8FA8] mb-2 uppercase tracking-wider">{si?'පන්තිය අනුව F1 ලකුණු':'Per-class F1 Scores'}</div>
            <div className="flex flex-col gap-2">
              {[
                {label:'CRITICAL',color:'#DC2626',precision:0.986,recall:0.973,f1:0.979},
                {label:'HIGH',    color:'#D97706',precision:0.957,recall:0.958,f1:0.958},
                {label:'MEDIUM',  color:'#CA8A04',precision:0.939,recall:0.969,f1:0.954},
                {label:'LOW',     color:'#2D7A4F',precision:0.988,recall:0.977,f1:0.982},
              ].map(({label,color,precision,recall,f1})=>(
                <div key={label} style={{background:'rgba(255,255,255,0.6)',border:'1px solid rgba(255,255,255,0.8)',borderRadius:10,padding:'8px 12px'}}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{fontWeight:700,fontSize:11,color}}>{label}</span>
                    <span style={{fontFamily:'DM Mono',fontSize:12,fontWeight:700,color:'#0F2A3D'}}>F1 {(f1*100).toFixed(1)}%</span>
                  </div>
                  <div style={{background:'rgba(46,134,193,0.08)',borderRadius:6,height:5,marginBottom:6}}>
                    <div style={{width:`${f1*100}%`,height:'100%',borderRadius:6,background:`linear-gradient(90deg,${color},${color}99)`}} />
                  </div>
                  <div className="flex gap-4">
                    <span style={{fontFamily:'DM Mono',fontSize:9,color:'#5B8FA8'}}>{si?'නිරවද්‍යතාව':'Precision'} <strong style={{color:'#0F2A3D'}}>{(precision*100).toFixed(1)}%</strong></span>
                    <span style={{fontFamily:'DM Mono',fontSize:9,color:'#5B8FA8'}}>{si?'ස්මරණය':'Recall'} <strong style={{color:'#0F2A3D'}}>{(recall*100).toFixed(1)}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:10,padding:'8px 12px',background:'rgba(46,134,193,0.06)',borderRadius:10,fontFamily:'DM Mono',fontSize:10,color:'#5B8FA8'}}>
              {si
                ? <><strong style={{color:'#0F2A3D'}}>සාමාන්‍ය නිරවද්‍යතාව: 95.80%</strong> · macro avg F1: 96.8% · 616 සංවේදක කියවීම් · 5-fold CV</>
                : <><strong style={{color:'#0F2A3D'}}>Overall Accuracy: 95.80%</strong> · macro avg F1: 96.8% · 616 sensor readings · 5-fold CV</>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}