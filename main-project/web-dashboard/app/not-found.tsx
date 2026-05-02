'use client'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()
  return (
    <div style={{
      minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',
      justifyContent:'center',background:'linear-gradient(135deg,#EBF4FA 0%,#F0FAF4 100%)',
      fontFamily:'sans-serif',padding:24,
    }}>
      <div style={{
        background:'rgba(255,255,255,0.7)',backdropFilter:'blur(20px)',
        border:'1px solid rgba(255,255,255,0.85)',borderRadius:20,
        padding:'48px 56px',textAlign:'center',
        boxShadow:'0 8px 32px rgba(26,51,40,0.08)',maxWidth:420,
      }}>
        <div style={{fontSize:64,marginBottom:8}}>🗑️</div>
        <div style={{fontFamily:'DM Mono, monospace',fontSize:11,color:'#5B8FA8',letterSpacing:'0.1em',marginBottom:12,textTransform:'uppercase'}}>
          MyCollect · 404
        </div>
        <h1 style={{fontSize:28,fontWeight:800,color:'#0F2A3D',marginBottom:8,lineHeight:1.2}}>
          Page Not Found
        </h1>
        <p style={{fontSize:13,color:'#5B8FA8',marginBottom:6,lineHeight:1.6}}>
          මෙම පිටුව සොයාගත නොහැකි විය
        </p>
        <p style={{fontSize:12,color:'#8AAFC4',marginBottom:32,lineHeight:1.6}}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background:'linear-gradient(135deg,#2E86C1,#1A5276)',
            color:'white',border:'none',borderRadius:12,
            padding:'12px 28px',fontSize:13,fontWeight:600,
            cursor:'pointer',boxShadow:'0 4px 16px rgba(46,134,193,0.3)',
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  )
}
