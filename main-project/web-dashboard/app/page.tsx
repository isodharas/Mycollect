'use client'
import './landing.css'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLang } from '@/lib/LangContext'

export default function LandingPage() {
  const { lang, setLang } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const s = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', s)
    return () => window.removeEventListener('scroll', s)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('vis')
    }), { threshold: .1 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [mounted])

  const si = lang === 'si'

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', color: '#0F1F18', overflowX: 'hidden' }}>

      {/* NAV */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-logo">
          <div className="nav-mark">MC</div>
          <span className="nav-name">MyCollect</span>
        </div>
        <div className="nav-links">
          <a href="#how">{si ? 'ක්‍රියා කරන ආකාරය' : 'How It Works'}</a>
          <a href="#features">{si ? 'විශේෂාංග' : 'Features'}</a>
          <a href="#story">{si ? 'අපේ කතාව' : 'Our Story'}</a>
        </div>
        <div className="nav-right">
          <Link href='/login' className='btn-signin'>{si ? 'පිවිසෙන්න' : 'Sign In'}</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-photo" />
        <div className="hero-tint" />
        <div className="hero-inner">
          <div style={{ maxWidth: 600 }}>
            <div className="eyebrow au">
              <span className="live-dot" />
              {si ? 'පද්ධතිය සජීව · හෝමාගම, ශ්‍රී ලංකාව' : 'System Live · Homagama, Sri Lanka'}
            </div>
            <h1 className="hero-h1 au d1">
              {si ? 'සෞඛ්‍ය-ප්‍රථම' : 'Health-First'}<br />
              <span className="green">{si ? 'අපද්‍රව්‍ය' : 'Waste'}</span><br />
              <span className="light">{si ? 'බුද්ධිය.' : 'Intelligence.'}</span>
            </h1>
            <p className="hero-sub au d2">
              {si
                ? 'කූඩුව පිරෙන්නට පෙර. රෝගය පැතිරෙන්නට පෙර — MyCollect සැබෑ කාලයේදී විෂ වාතය හඳුනාගෙන සෞඛ්‍ය අවදානම අනුව එකතු කිරීම් සැලසුම් කරයි.'
                : 'Before the bin overflows. Before the illness spreads — MyCollect detects toxic gases in real time and routes collection by health risk, not schedule.'}
            </p>

            {/* Language choice buttons */}
            <div className="au d3" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '36px', maxWidth: '340px' }}>
              <Link
                href="/"
                onClick={() => setLang('en')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 24px', borderRadius: '12px', textDecoration: 'none',
                  background: lang === 'en' ? '#1A3328' : 'rgba(26,51,40,0.75)',
                  border: lang === 'en' ? '2px solid #4A8C28' : '2px solid rgba(255,255,255,0.5)',
                  backdropFilter: 'blur(12px)',
                  color: '#fff',
                  fontFamily: 'Poppins,sans-serif',
                  transition: 'all 0.2s',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>Continue in English</div>
                  <div style={{ fontSize: '11px', opacity: 0.65, fontWeight: 400 }}>Dashboard in English</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>

              <Link
                href="/"
                onClick={() => setLang('si')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 24px', borderRadius: '12px', textDecoration: 'none',
                  background: lang === 'si' ? '#1A3328' : 'rgba(26,51,40,0.65)',
                  border: lang === 'si' ? '2px solid #4A8C28' : '2px solid rgba(255,255,255,0.4)',
                  backdropFilter: 'blur(12px)',
                  color: '#fff',
                  fontFamily: 'Poppins,sans-serif',
                  transition: 'all 0.2s',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>සිංහලෙන් ඉදිරියට යන්න</div>
                  <div style={{ fontSize: '11px', opacity: 0.65, fontWeight: 400 }}>Dashboard සිංහලෙන්</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            </div>

            <div className="au d4" style={{ marginTop: '20px' }}>
              <a href='#how' style={{
                fontSize: '13px', color: '#1A3328', background: 'rgba(255,255,255,0.55)', padding: '6px 12px', borderRadius: '8px', backdropFilter: 'blur(8px)',
                fontFamily: 'Poppins,sans-serif', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
                {si ? 'ක්‍රියා කරන ආකාරය' : 'How it works'}
              </a>
            </div>
          </div>

          {/* Right side — just the worker photo, no floating cards */}
          <div className="person-wrap au d2">
            <img
              src="https://images.unsplash.com/photo-1747067409998-ed50411cebaf?q=80&w=987&auto=format&fit=crop"
              alt="Municipal worker"
              className="person-img"
            />
          </div>
        </div>
      </section>



      {/* STATS */}
      <div className="l-section">
        <div className="sec-label reveal">{si ? 'සංඛ්‍යා අනුව' : 'By the numbers'}</div>
        <h2 className="sec-h reveal">{si ? 'සෑම මිණුම් දඬුවක්ම' : 'Built to exceed every'}<br /><span className="g">{si ? 'ඉක්මවා යාමට නිර්මිතය.' : 'benchmark.'}</span></h2>
        <div className="stats-grid reveal">
          {[
            { v: '95.94%', l: si ? 'ML නිරවද්‍යතාව' : 'ML Accuracy', s: si ? '5-fold හරස් සත්‍යාපනය' : '5-fold cross-validation' },
            { v: '446ms', l: si ? 'API ප්‍රමාදය' : 'API Latency', s: si ? '5s ඉලක්කයට වඩා 11× වේගවත්' : '11× faster than 5s target' },
            { v: '70/30', l: si ? 'වායු–පිරවීම් බර' : 'Gas–Fill Weight', s: si ? 'සෞඛ්‍ය-ප්‍රථම වර්ගීකරණය' : 'Health-first classification' },
            { v: '17%', l: si ? 'ඉන්ධන අඩුකිරීම' : 'Fuel Reduction', s: si ? 'ස්ථිර-මාර්ග කාලසටහනට එදිරිව' : 'vs fixed-route scheduling' },
          ].map(s => (
            <div key={s.l} className="stat-cell">
              <span className="stat-v">{s.v}</span>
              <div className="stat-l">{s.l}</div>
              <div className="stat-s">{s.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div id="how" className="l-section" style={{ paddingTop: 0 }}>
        <div className="sec-label reveal">{si ? 'එය ක්‍රියා කරන ආකාරය' : 'How it works'}</div>
        <h2 className="sec-h reveal" style={{ marginBottom: 0 }}>{si ? 'සංවේදකයෙන්' : 'From sensor to'} <span className="g">{si ? 'තත්පරවලින් ක්‍රියාවට.' : 'action in seconds.'}</span></h2>
        <div className="how-grid">
          {[
            { n: '01', t: si ? 'සංවේදකය හඳුනාගනී' : 'Sensor detects', b: si ? 'MQ-135 සෑම මිනිත්තු 15කට වරක් මීතේන්, ඇමෝනියා සහ H₂S කියවයි.' : 'MQ-135 reads methane, ammonia and H₂S every 15 minutes. HC-SR04 measures fill level.' },
            { n: '02', t: si ? 'වලාකුළ ලබාගනී' : 'Cloud receives', b: si ? 'NodeMCU TLS-සංකේතාත්මක JSON MQTT හරහා AWS IoT Core වෙත යවයි.' : 'NodeMCU transmits TLS-encrypted JSON via MQTT to AWS IoT Core. 24-hour local buffer during outages.' },
            { n: '03', t: si ? 'ML වර්ගීකරණය' : 'ML classifies', b: si ? 'Lambda CRITICAL / HIGH / MEDIUM / LOW පවරයි.' : 'Lambda runs Random Forest on 5 features. Assigns CRITICAL / HIGH / MEDIUM / LOW with health risk 0–100.' },
            { n: '04', t: si ? 'ක්‍රියාමාර්ගය' : 'Action taken', b: si ? 'උපකරණ පුවරුව සජීවීව යාවත්කාලීන වේ.' : 'Dashboard updates live. CRITICAL bins trigger alerts. Routes reprioritise by health risk, not calendar.' },
          ].map(h => (
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
          <div className="sec-label reveal">{si ? 'හැකියාවන්' : 'Capabilities'}</div>
          <h2 className="sec-h reveal">{si ? 'සෑම තීරණයක්ම සෞඛ්‍ය අවදානමෙන්' : 'Every decision driven by'} <span className="g">{si ? 'මෙහෙයවේ.' : 'health risk.'}</span></h2>
          <div className="bento" style={{ marginTop: 52 }}>
            <div className="fc reveal" style={{ gridColumn: 'span 5' }}>
              <span className="fc-tag">{si ? 'යන්ත්‍ර ඉගෙනීම' : 'Machine Learning'}</span>
              <div className="fc-t">{si ? 'Random Forest වර්ගීකාරකය' : 'Random Forest Classifier'}</div>
              <div className="fc-b">{si ? 'ගස් 100ක්. නිදර්ශන 296ක්. 95.94% නිරවද්‍යතාව.' : '100 decision trees. 296 training samples. 95.94% cross-validation accuracy.'}</div>
            </div>
            <div className="fc dk reveal" style={{ gridColumn: 'span 7' }}>
              <span className="fc-tag">{si ? 'සෞඛ්‍ය-ප්‍රථම සැලසුම' : 'Health-First Design'}</span>
              <div className="fc-t">{si ? 'වායු 70%, පිරවීම 30%' : 'Gas weighted 70%, Fill 30%'}</div>
              <div className="fc-b">{si ? '40% ක් පිරී 400 PPM විමෝචනය කරන කූඩුවක් CRITICAL ලෙස ශ්‍රේණිගත වේ.' : 'A bin at 40% emitting 400 PPM ranks CRITICAL. The gas is the threat, not the fill level.'}</div>
            </div>
            <div className="fc reveal" style={{ gridColumn: 'span 4' }}>
              <span className="fc-tag">{si ? 'IoT දෘඩාංග' : 'IoT Hardware'}</span>
              <div className="fc-t">NodeMCU + MQ-135</div>
              <div className="fc-b">{si ? 'මීතේන්, ඇමෝනියා සහ H₂S හඳුනාගැනීම 50–1000 PPM.' : 'Methane, ammonia and H₂S detection 50–1000 PPM. TLS-encrypted MQTT.'}</div>
            </div>
            <div className="fc reveal" style={{ gridColumn: 'span 4' }}>
              <span className="fc-tag">{si ? 'වලාකුළ සේවාදායකය' : 'Cloud Backend'}</span>
              <div className="fc-t">{si ? 'Lambda මත Serverless' : 'Serverless on Lambda'}</div>
              <div className="fc-b">{si ? 'ProcessBinData + GetBinData. DynamoDB ද්විත්ව වගුව. 446ms.' : 'ProcessBinData + GetBinData. DynamoDB dual-table. 446ms response time.'}</div>
            </div>
            <div className="fc reveal" style={{ gridColumn: 'span 4' }}>
              <span className="fc-tag">{si ? 'ජංගම යෙදුම' : 'Mobile App'}</span>
              <div className="fc-t">{si ? 'Flutter + සිංහල' : 'Flutter + Sinhala'}</div>
              <div className="fc-b">{si ? 'සැබෑ කාල ඇඟවීම්. සිංහල භාෂා සහාය.' : 'Real-time alerts. Collection schedules. Full Sinhala language support.'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section id="story" className="story-sect">
        <div className="story-bg" />
        <div className="story-inner">
          <div className="sec-label reveal" style={{ justifyContent: 'center', color: 'rgba(184,212,232,.45)' }}>{si ? 'මෙය අවශ්‍ය කළ මොහොත' : 'The moment that made this necessary'}</div>
          <p className="reveal" style={{ fontSize: 'clamp(22px,3.2vw,38px)', fontWeight: 700, lineHeight: 1.52, color: '#F0F7F3', marginBottom: 28, marginTop: 12 }}>
            {si
              ? <>"2017 අප්‍රේල් 14 වන දින, කොළඹ මීතොටමුල්ල — <span style={{ color: '#B8D4E8' }}>පුද්ගලයින් 32 දෙනෙකු</span> ජීවිතක්ෂය කළේය. කිසිදු අනතුරු ඇඟවීමක් නොතිබිණි."</>
              : <>"On 14 April 2017, the Meethotamulla garbage mountain collapsed — killing <span style={{ color: '#B8D4E8' }}>32 people</span> and destroying <span style={{ color: '#B8D4E8' }}>145 homes.</span> No system existed to detect it."</>
            }
          </p>
          <p className="reveal" style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.82, color: 'rgba(184,212,232,.6)', maxWidth: 580, margin: '0 auto 44px' }}>
            {si ? 'MyCollect ඒ යටිතල පහසුකම් — ශ්‍රී ලංකාවේ, ශ්‍රී ලංකාව සඳහා ගොඩනගන ලදී.' : 'MyCollect is that infrastructure — built in Sri Lanka, for Sri Lanka.'}
          </p>
          <div className="reveal" style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
            <Link href="/signup" className="btn-dark">{si ? 'උපකරණ පුවරුව' : 'Open Dashboard'}</Link>
            <Link href="/signup" style={{ padding: '14px 30px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(184,212,232,.3)', color: 'rgba(184,212,232,.75)', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontFamily: 'Poppins,sans-serif' }}>{si ? 'පිවිසෙන්න' : 'Sign In'}</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="l-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: '#1A3328', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>MC</div>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#0F1F18', letterSpacing: '-.01em' }}>MyCollect</span>
        </div>
        <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: 10, letterSpacing: '.06em', color: '#9CA3AF' }}>
          {si ? 'දිනිතිඋ විජේසිංහ · NSBM · BSc (Hons) මෘදුකාංග ඉංජිනේරු' : 'DINITHI WIJESINGHE · NSBM GREEN UNIVERSITY · BSc HONS SOFTWARE ENGINEERING · 2025–2026'}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['SDG 3', 'SDG 11', 'AWS'].map(t => (
            <span key={t} style={{ padding: '4px 12px', borderRadius: 100, fontFamily: 'Poppins,sans-serif', fontSize: 9.5, background: 'rgba(45,90,61,.1)', border: '1px solid rgba(45,90,61,.2)', color: '#2D5A3D' }}>{t}</span>
          ))}
        </div>
      </footer>
    </div>
  )
}
