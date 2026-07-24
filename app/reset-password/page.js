'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {getTheme} from "@/lib/theme"

const D=getTheme()

export default function ResetPasswordPage() {
  const router   = useRouter()
  const [password,  setPassword]  = useState('')
  const [password2, setPassword2] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [done,      setDone]      = useState(false)

  useEffect(() => {
    // Supabase otomatis set session dari URL hash saat user klik link reset
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Session sudah aktif, siap ganti password
      }
    })
  }, [])

  const handleReset = async () => {
    setError(''); setLoading(true)
    if (!password || !password2) { setError('Semua field wajib diisi'); setLoading(false); return }
    if (password.length < 6)     { setError('Password minimal 6 karakter'); setLoading(false); return }
    if (password !== password2)  { setError('Password tidak cocok'); setLoading(false); return }

    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) { setError(err.message); setLoading(false); return }

    setDone(true)
    setLoading(false)
    setTimeout(() => router.push('/auth'), 2500)
  }

  return (
    <div style={{ minHeight:'100vh', background:D.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:400 }}>

        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:60, height:60, borderRadius:16, background:D.accentDim, border:'1.5px solid #3730A3', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
            <i className="ti ti-wallet" style={{ fontSize:28, color:D.accent }} />
          </div>
          <h1 style={{ margin:0, fontSize:24, fontWeight:800, color:D.textPri }}>Keuanganku</h1>
        </div>

        <div style={{ background:D.surface, borderRadius:20, padding:28, border:`1.5px solid ${D.borderHi}`, boxShadow:'0 0 40px rgba(129,140,248,0.08)' }}>
          {!done ? (
            <>
              <div style={{ textAlign:'center', marginBottom:24 }}>
                <div style={{ width:52, height:52, borderRadius:14, background:D.accentDim, border:'1.5px solid #3730A3', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                  <i className="ti ti-lock-open" style={{ fontSize:24, color:D.accent }} />
                </div>
                <h2 style={{ margin:0, fontSize:17, fontWeight:800, color:D.textPri }}>Buat Password Baru</h2>
                <p style={{ margin:'6px 0 0', fontSize:12, color:D.textMuted }}>Masukkan password baru kamu</p>
              </div>

              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, fontWeight:700, color:D.textMuted, display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.07em' }}>Password Baru</label>
                <input type="password" placeholder="Minimal 6 karakter"
                  value={password} onChange={e => setPassword(e.target.value)} />
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:11, fontWeight:700, color:D.textMuted, display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.07em' }}>Konfirmasi Password</label>
                <input type="password" placeholder="Ulangi password baru"
                  value={password2} onChange={e => setPassword2(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && handleReset()} />
              </div>

              {error && (
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:D.outcome.dim, border:`1px solid ${D.outcome.border}`, borderRadius:10, marginBottom:16 }}>
                  <i className="ti ti-alert-circle" style={{ fontSize:14, color:D.outcome.solid, flexShrink:0 }} />
                  <span style={{ fontSize:13, color:D.outcome.solid, fontWeight:600 }}>{error}</span>
                </div>
              )}

              <button onClick={handleReset} disabled={loading} style={{ width:'100%', padding:'14px', borderRadius:12, fontSize:14, fontWeight:800, background:loading?'#3730A3':D.accent, color:'#0D0F1A', border:'none', boxShadow:loading?'none':'0 0 20px rgba(129,140,248,0.4)', cursor:loading?'wait':'pointer' }}>
                {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
              </button>
            </>
          ) : (
            <div style={{ textAlign:'center' }}>
              <div style={{ width:60, height:60, borderRadius:16, background:D.income.dim, border:`1.5px solid ${D.income.border}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                <i className="ti ti-circle-check" style={{ fontSize:28, color:D.income.solid }} />
              </div>
              <h2 style={{ margin:'0 0 8px', fontSize:17, fontWeight:800, color:D.textPri }}>Password berhasil diubah!</h2>
              <p style={{ margin:0, fontSize:13, color:D.textMuted }}>Mengalihkan ke halaman login...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
