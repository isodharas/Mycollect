'use client'
import './landing.css'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const TICKER = ['95.94% ML Accuracy','446ms Response Time','Health-First Waste Intelligence','SDG 3 · Good Health','SDG 11 · Sustainable Cities','Random Forest · 100 Trees','12 Bins · Homagama Zone','17% Fuel Reduction','AWS Lambda · ap-southeast-2','70% Weight on Gas PPM']

export default function LandingPage() {
  const [ppm, setPpm] = useState(487)
  const [lang, setLang] = useState<'en'|'si'>('en')
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const t = setInterval(() => setPpm(v => Math.round(Math.max(480, Math.min(496, v + (Math.random() - .48) * 3)))), 2600)
    const s = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', s)
    return () => { clearInterval(t); window.removeEventListener('scroll', s) }
  }, [])

  useEffect(() => {
    if (!mounted) return
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis') }), { threshold: .1 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [mounted])

  const gaugeAngle = -135 + (ppm / 1000) * 270
  const arc = 2 * Math.PI * 140 * 0.75
  const fillOffset = arc - arc * (ppm / 1000)

  return (
    <div style={{fontFamily:'Plus Jakarta Sans, sans-serif',color:'#0F1F18',overflowX:'hidden'}}>

      {/* NAV */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-logo">
          <div className="nav-mark">MC</div>
          <span className="nav-name">MyCollect</span>
        </div>
        <div className="nav-links">
          <a href="#how">{lang==='si'?'ක්‍රියා කරන ආකාරය':'How It Works'}</a>
          <a href="#features">{lang==='si'?'විශේෂාංග':'Features'}</a>
          <a href="#story">{lang==='si'?'අපේ කතාව':'Our Story'}</a>
        </div>
        <div className="nav-right">
          <div style={{display:'flex',alignItems:'center',borderRadius:8,overflow:'hidden',border:'1px solid rgba(45,90,61,0.22)',backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)'}}>
            <button onClick={()=>setLang('si')} style={{padding:'7px 15px',cursor:'pointer',border:'none',borderRight:'1px solid rgba(45,90,61,0.15)',background:lang==='si'?'#1A3328':'rgba(255,255,255,0.55)',color:lang==='si'?'#fff':'#1A3328',fontFamily:'Plus Jakarta Sans,sans-serif',fontSize:11.5,fontWeight:700,transition:'all .2s'}}>සිංහලෙන් බලන්න</button>
            <button onClick={()=>setLang('en')} style={{padding:'7px 15px',cursor:'pointer',border:'none',background:lang==='en'?'#1A3328':'rgba(255,255,255,0.55)',color:lang==='en'?'#fff':'#1A3328',fontFamily:'Plus Jakarta Sans,sans-serif',fontSize:11.5,fontWeight:700,transition:'all .2s'}}>View in English</button>
          </div>
          <Link href='/login' className='btn-signin'>{lang==='si'?'පිවිසෙන්න':'Sign In'}</Link>
          <Link href='/login' className='btn-getstarted'>{lang==='si'?'ආරම්භ කරන්න':'Get Started'}</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-photo" />
        <div className="hero-tint" />
        <div className="hero-inner">
          <div>
            <div className="eyebrow au">
              <span className="live-dot" />
              System Live · Homagama, Sri Lanka
            </div>
            <h1 className="hero-h1 au d1">
              {lang==='si'?'සෞඛ්‍ය-ප්‍රථම':'Health-First'}<br/>
              <span className="green">{lang==='si'?'අපද්‍රව්‍ය':'Waste'}</span><br/>
              <span className="light">{lang==='si'?'බුද්ධිය.':'Intelligence.'}</span>
            </h1>
            <p className="hero-sub au d2">
              {lang==='si'
                ? 'කූඩුව පිරෙන්නට පෙර. පැමිණිල්ල ගොනු වන්නට පෙර. රෝගය පැතිරෙන්නට පෙර — MyCollect සැබෑ කාලයේදී විෂ වාතය හඳුනාගෙන සෞඛ්‍ය අවදානම අනුව එකතු කිරීම් සැලසුම් කරයි.'
                : 'Before the bin overflows. Before the complaint is filed. Before the illness spreads — MyCollect detects toxic gases in real time and routes collection by health risk, not schedule.'}
            </p>
            <div className="alert-bar au d3">
              <span style={{display:'flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:6,background:'rgba(220,38,38,.1)',border:'1px solid rgba(220,38,38,.22)',fontFamily:'DM Mono,monospace',fontSize:9.5,letterSpacing:'.08em',textTransform:'uppercase',color:'#DC2626'}}>
                <span style={{width:5,height:5,borderRadius:'50%',background:'#DC2626',display:'inline-block'}}/>
                Critical
              </span>
              <span style={{fontFamily:'DM Mono,monospace',fontSize:12,color:'#0F1F18'}}>BIN_001 · {mounted ? ppm : 487} PPM · Risk 61.5 · North Market</span>
              <span style={{fontFamily:'DM Mono,monospace',fontSize:10,color:'#9CA3AF'}}>just now</span>
            </div>
            <div className="hero-btns au d4">
              <Link href="/login" className="btn-dark">{lang==='si'?'උපකරණ පුවරුව':'Open Dashboard'}</Link>
              <a href='#how' className='btn-outline-hero'>{lang==='si'?'ක්‍රියා කරන ආකාරය':'How It Works'}</a>
            </div>
          </div>

          {/* RIGHT */}
          <div className="person-wrap au d2">
            <img
              src="https://images.unsplash.com/photo-1747067409998-ed50411cebaf?q=80&w=987&auto=format&fit=crop"
              alt="Municipal worker"
              className="person-img"
            />
            {/* Gauge card */}
            <div className="float-card" style={{top:60,left:-110,width:210,animation:'float 6s ease-in-out .5s infinite'}}>
              <div style={{fontFamily:'DM Mono,monospace',fontSize:9,letterSpacing:'.14em',textTransform:'uppercase',color:'#9CA3AF',marginBottom:10}}>Gas Level — BIN_001</div>
              <svg viewBox="0 0 160 90" style={{width:'100%',marginBottom:4}}>
                <path d="M 20 80 A 60 60 0 0 1 140 80" fill="none" stroke="rgba(45,90,61,.15)" strokeWidth="10" strokeLinecap="round"/>
                <path d="M 20 80 A 60 60 0 0 1 140 80" fill="none" stroke="#DC2626" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray="188 188" strokeDashoffset={188 - (188 * (mounted ? ppm : 487) / 1000)}/>
                <line x1="80" y1="80"
                  x2={80 + 55 * Math.cos(((mounted ? gaugeAngle : -87) - 90) * Math.PI / 180)}
                  y2={80 + 55 * Math.sin(((mounted ? gaugeAngle : -87) - 90) * Math.PI / 180)}
                  stroke="#DC2626" strokeWidth="2" strokeLinecap="round" opacity=".85"/>
                <circle cx="80" cy="80" r="5" fill="#DC2626" stroke="white" strokeWidth="1.5"/>
                <text x="16" y="90" fontFamily="DM Mono" fontSize="8" fill="#9CA3AF">0</text>
                <text x="144" y="90" fontFamily="DM Mono" fontSize="8" fill="#9CA3AF" textAnchor="end">1000</text>
              </svg>
              <div style={{textAlign:'center'}}>
                <span style={{fontWeight:800,fontSize:34,color:'#0F1F18',lineHeight:1,fontFamily:'Plus Jakarta Sans,sans-serif'}}>{mounted ? ppm : 487}</span>
                <span style={{fontFamily:'DM Mono,monospace',fontSize:10,color:'#9CA3AF',display:'block',marginTop:2}}>PPM · LIVE</span>
              </div>
            </div>
            {/* Health risk card */}
            <div className="float-card" style={{top:'36%',right:-95,animation:'float 5s ease-in-out 1s infinite'}}>
              <div style={{fontFamily:'DM Mono,monospace',fontSize:9,letterSpacing:'.14em',textTransform:'uppercase',color:'#9CA3AF',marginBottom:6}}>Health Risk Score</div>
              <div style={{display:'flex',alignItems:'baseline',gap:3}}>
                <span style={{fontFamily:'Plus Jakarta Sans,sans-serif',fontSize:44,fontWeight:800,lineHeight:1,color:'#DC2626'}}>61</span>
                <span style={{fontSize:20,color:'#DC2626',fontWeight:800}}>.5</span>
                <span style={{fontFamily:'DM Mono,monospace',fontSize:11,color:'#9CA3AF',marginLeft:4}}>/100</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6,marginTop:7,fontFamily:'DM Mono,monospace',fontSize:10,color:'#4A6858'}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:'#DC2626',display:'inline-block'}}/>
                BIN_001 · North Market
              </div>
            </div>
            {/* ML card */}
            <div style={{position:'absolute',bottom:90,left:-85,padding:'13px 17px',borderRadius:13,background:'rgba(45,90,61,.08)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',border:'1px solid rgba(45,90,61,.2)',animation:'float 4.5s ease-in-out 1.8s infinite'}}>
              <div style={{fontFamily:'DM Mono,monospace',fontSize:9,letterSpacing:'.14em',textTransform:'uppercase',color:'#9CA3AF',marginBottom:5}}>ML Classification</div>
              <div style={{fontFamily:'DM Mono,monospace',fontSize:20,fontWeight:500,color:'#DC2626',letterSpacing:'.04em'}}>CRITICAL</div>
              <div style={{fontFamily:'DM Mono,monospace',fontSize:9.5,color:'#9CA3AF',marginTop:4}}>Random Forest · 95.94%</div>
            </div>
            {/* Annotation pills */}
            <div className="ann-pill" style={{top:'18%',right:-65,animation:'float 4s ease-in-out .3s infinite'}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:'#2D5A3D',flexShrink:0}}/>
              MQ-135 Gas Sensor
            </div>
            <div className="ann-pill" style={{bottom:'32%',left:-125,animation:'float 4s ease-in-out 1.2s infinite'}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:'#5E9FC0',flexShrink:0}}/>
              AWS Lambda · 446ms
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[...TICKER,...TICKER].map((t,i)=>(
            <span key={i} className="tick">{t}<span className="tick-dot"/></span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="l-section">
        <div className="sec-label reveal">{lang==='si'?'සංඛ්‍යා අනුව':'By the numbers'}</div>
        <h2 className="sec-h reveal">{lang==='si'?'සෑම මිණුම් දඬුවක්ම':'Built to exceed every'}<br/><span className="g">{lang==='si'?'ඉක්මවා යාමට නිර්මිතය.':'benchmark.'}</span></h2>
        <div className="stats-grid reveal">
          {[{v:'95.94%',l:lang==='si'?'ML නිරවද්‍යතාව':'ML Accuracy',s:lang==='si'?'5-fold හරස් සත්‍යාපනය':'5-fold cross-validation'},{v:'446ms',l:lang==='si'?'API ප්‍රමාදය':'API Latency',s:lang==='si'?'5s ඉලක්කයට වඩා 11× වේගවත්':'11× faster than 5s target'},{v:'70/30',l:lang==='si'?'වායු–පිරවීම් බර':'Gas–Fill Weight',s:lang==='si'?'සෞඛ්‍ය-ප්‍රථම වර්ගීකරණය':'Health-first classification'},{v:'17%',l:lang==='si'?'ඉන්ධන අඩුකිරීම':'Fuel Reduction',s:lang==='si'?'ස්ථිර-මාර්ග කාලසටහනට එදිරිව':'vs fixed-route scheduling'}].map(s=>(
            <div key={s.l} className="stat-cell">
              <span className="stat-v">{s.v}</span>
              <div className="stat-l">{s.l}</div>
              <div className="stat-s">{s.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div id="how" className="l-section" style={{paddingTop:0}}>
        <div className="sec-label reveal">{lang==='si'?'එය ක්‍රියා කරන ආකාරය':'How it works'}</div>
        <h2 className="sec-h reveal" style={{marginBottom:0}}>{lang==='si'?'සංවේදකයෙන්':'From sensor to'} <span className="g">{lang==='si'?'තත්පරවලින් ක්‍රියාවට.':'action in seconds.'}</span></h2>
        <div className="how-grid">
          {[
            {n:'01',t:lang==='si'?'සංවේදකය හඳුනාගනී':'Sensor detects',b:lang==='si'?'MQ-135 සෑම මිනිත්තු 15කට වරක් මීතේන්, ඇමෝනියා සහ H₂S කියවයි. HC-SR04 පිරවීමේ මට්ටම මැනීමේ.':'MQ-135 reads methane, ammonia and H₂S every 15 minutes. HC-SR04 measures fill level. IP65 weatherproof enclosure.'},
            {n:'02',t:lang==='si'?'වලාකුළ ලබාගනී':'Cloud receives',b:lang==='si'?'NodeMCU TLS-සංකේතාත්මක JSON MQTT හරහා AWS IoT Core වෙත යවයි.':'NodeMCU transmits TLS-encrypted JSON via MQTT to AWS IoT Core. 24-hour local buffer during outages.'},
            {n:'03',t:lang==='si'?'ML වර්ගීකරණය':'ML classifies',b:lang==='si'?'Lambda අංශු 5ක් මත Random Forest ධාවනය කරයි. CRITICAL / HIGH / MEDIUM / LOW පවරයි.':'Lambda runs Random Forest on 5 features. Assigns CRITICAL / HIGH / MEDIUM / LOW with health risk 0–100.'},
            {n:'04',t:lang==='si'?'ක්‍රියාමාර්ගය':'Action taken',b:lang==='si'?'උපකරණ පුවරුව සජීවීව යාවත්කාලීන වේ. CRITICAL කූඩු දැනුම්දීම් යවයි.':'Dashboard updates live. CRITICAL bins trigger push notifications. Routes reprioritise by health risk, not calendar.'},
          ].map(h=>(
            <div key={h.n} className="how-card reveal">
              <span className="how-num">{h.n}</span>
              <div className="how-t">{h.t}</div>
              <div className="how-b">{h.b}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="feat-sect">
        <div className="feat-inner">
          <div className="sec-label reveal">{lang==='si'?'හැකියාවන්':'Capabilities'}</div>
          <h2 className="sec-h reveal">{lang==='si'?'සෑම තීරණයක්ම සෞඛ්‍ය අවදානමෙන්':'Every decision driven by'} <span className="g">{lang==='si'?'මෙහෙයවේ.':'health risk.'}</span></h2>
          <div className="bento" style={{marginTop:52}}>
            <div className="fc reveal" style={{gridColumn:'span 5'}}>
              <span className="fc-tag">{lang==='si'?'යන්ත්‍ර ඉගෙනීම':'Machine Learning'}</span>
              <div className="fc-t">{lang==='si'?'Random Forest වර්ගීකාරකය':'Random Forest Classifier'}</div>
              <div className="fc-b">{lang==='si'?'ගස් 100ක්. නිදර්ශන 296ක්. 95.94% හරස්-සත්‍යාපන නිරවද්‍යතාව.':'100 decision trees. 296 training samples. 95.94% cross-validation accuracy.'}</div>
            </div>
            <div className="fc dk reveal" style={{gridColumn:'span 7'}}>
              <span className="fc-tag">{lang==='si'?'සෞඛ්‍ය-ප්‍රථම සැලසුම':'Health-First Design'}</span>
              <div className="fc-t">{lang==='si'?'වායු 70%, පිරවීම 30%':'Gas weighted 70%, Fill 30%'}</div>
              <div className="fc-b">{lang==='si'?'40% ක් පිරී 400 PPM විමෝචනය කරන කූඩුවක් පිරි කූඩුවකට වඩා ඉහළ ශ්‍රේණිගත වේ. වායුව තර්ජනයයි.':'A bin at 40% emitting 400 PPM ranks higher than a full bin with clean air. The gas is the threat.'}</div>
            </div>
            <div className="fc reveal" style={{gridColumn:'span 4'}}>
              <span className="fc-tag">{lang==='si'?'IoT දෘඩාංග':'IoT Hardware'}</span>
              <div className="fc-t">NodeMCU + MQ-135</div>
              <div className="fc-b">{lang==='si'?'මීතේන්, ඇමෝනියා සහ H₂S හඳුනාගැනීම 50–1000 PPM. IP65 කාලගුණ ආරක්ෂිත.':'Methane, ammonia and H₂S detection 50–1000 PPM. IP65 weatherproof. TLS-encrypted MQTT.'}</div>
            </div>
            <div className="fc reveal" style={{gridColumn:'span 4'}}>
              <span className="fc-tag">{lang==='si'?'වලාකුළ සේවාදායකය':'Cloud Backend'}</span>
              <div className="fc-t">{lang==='si'?'Lambda මත Serverless':'Serverless on Lambda'}</div>
              <div className="fc-b">{lang==='si'?'ap-southeast-2 හි ProcessBinData + GetBinData. DynamoDB ද්විත්ව වගුව. 446ms.':'ProcessBinData + GetBinData in ap-southeast-2. DynamoDB dual-table. 446ms.'}</div>
            </div>
            <div className="fc reveal" style={{gridColumn:'span 4'}}>
              <span className="fc-tag">{lang==='si'?'ජංගම යෙදුම':'Mobile App'}</span>
              <div className="fc-t">{lang==='si'?'Flutter + සිංහල':'Flutter + Sinhala'}</div>
              <div className="fc-b">{lang==='si'?'සැබෑ කාල ඇඟවීම්. එකතු කිරීමේ කාලසටහන්. සිංහල භාෂා සහාය.':'Real-time alerts. Collection schedules. Sinhala language support.'}</div>
            </div>
          </div>
        </div>
      </section>
      {/* STORY */}
      <section id="story" className="story-sect">
        <div className="story-bg"/>
        <div className="story-inner">
          <div className="sec-label reveal" style={{justifyContent:'center',color:'rgba(184,212,232,.45)'}}>{lang==='si'?'මෙය අවශ්‍ය කළ මොහොත':'The moment that made this necessary'}</div>
          <p className="reveal" style={{fontSize:'clamp(22px,3.2vw,38px)',fontWeight:700,lineHeight:1.52,color:'#F0F7F3',marginBottom:28,marginTop:12}}>
            {lang==='si'?'"2017 අප්‍රේල් 14 වන දින, කොළඹ මීතොටමුල්ල අපද්‍රව්‍ය කන්ද කඩා වැටුණි — ':'"On 14 April 2017, the Meethotamulla garbage mountain in Colombo collapsed — killing '}
            <span style={{color:'#B8D4E8'}}>{lang==='si'?'පුද්ගලයින් 32 දෙනෙකු':'32 people'}</span>
            {lang==='si'?' ජීවිතක්ෂය කර ':' and destroying '}
            <span style={{color:'#B8D4E8'}}>{lang==='si'?'නිවාස 145ක්':'145 homes.'}</span>
            {lang==='si'?' විනාශ කළේය. දශක ගණනාවක් ගෑස් ගොඩනැගී තිබුණි. එය හඳුනාගැනීමට කිසිදු පද්ධතියක් නොතිබිණි."':' Gas had been building for decades. No system existed to detect it."'}
          </p>
          <p className="reveal" style={{fontSize:15,fontWeight:300,lineHeight:1.82,color:'rgba(184,212,232,.6)',maxWidth:580,margin:'0 auto 44px'}}>
            {lang==='si'?'MyCollect ඒ යටිතල පහසුකම් — ශ්‍රී ලංකාවේ, ශ්‍රී ලංකාව සඳහා ගොඩනගන ලදී.':'MyCollect is that infrastructure — built in Sri Lanka, for Sri Lanka.'}
          </p>
          <div className="reveal" style={{display:'flex',justifyContent:'center',gap:14}}>
            <Link href="/login" className="btn-dark">{lang==='si'?'උපකරණ පුවරුව':'Open Dashboard'}</Link>
            <Link href="/login" style={{padding:'14px 30px',borderRadius:10,background:'transparent',border:'1px solid rgba(184,212,232,.3)',color:'rgba(184,212,232,.75)',fontSize:14,fontWeight:600,display:'inline-flex',alignItems:'center',gap:8,textDecoration:'none',fontFamily:'Plus Jakarta Sans,sans-serif'}}>{lang==='si'?'පිවිසෙන්න':'Sign In'}</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="l-footer">
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,borderRadius:9,background:'#1A3328',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:12}}>MC</div>
          <span style={{fontWeight:800,fontSize:16,color:'#0F1F18',letterSpacing:'-.01em'}}>MyCollect</span>
        </div>
        <div style={{fontFamily:'DM Mono,monospace',fontSize:10,letterSpacing:'.08em',color:'#9CA3AF'}}>{lang==="si"?'දිනිතිඋ විජේසිංහ · NSBM කොළඹ සරසවිය · BSc (Hons) මෘදුකාංග ඉංජිනේරු · 2025–2026':'DINITHI WIJESINGHE · NSBM GREEN UNIVERSITY · BSc HONS SOFTWARE ENGINEERING · 2025–2026'}</div>
        <div style={{display:'flex',gap:8}}>
          {['SDG 3','SDG 11','AWS'].map(t=>(
            <span key={t} style={{padding:'4px 12px',borderRadius:100,fontFamily:'DM Mono,monospace',fontSize:9.5,background:'rgba(45,90,61,.1)',border:'1px solid rgba(45,90,61,.2)',color:'#2D5A3D'}}>{t}</span>
          ))}
        </div>
      </footer>
    </div>
  )
}
