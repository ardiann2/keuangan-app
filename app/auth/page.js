'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {getTheme} from "@/lib/theme"

const D = getTheme()

export default function AuthPage() {
  const router = useRouter()

  const [mode,     setMode]     = useState('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const reset = () => setError('')

  /* ─── Register ─── */
  const handleRegister = async () => {
    reset(); setLoading(true)
    if (!email || !password) { setError('Email dan password wajib diisi'); setLoading(false); return }
    if (password.length < 6) { setError('Password minimal 6 karakter'); setLoading(false); return }

    const { data, error: err } = await supabase.auth.signUp({ email, password })
    
    // Email sudah terdaftar
    if (data?.user?.identities?.length === 0) {
      setError('Email ini sudah terdaftar. Silakan login atau gunakan email lain.')
      setLoading(false)
      return
    }

    if (err) { setError(err.message); setLoading(false); return }

    setMode('check-email')
    setLoading(false)
  }

  /* ─── Login ─── */
  const handleLogin = async () => {
    reset(); setLoading(true)
    if (!email || !password) { setError('Email dan password wajib diisi'); setLoading(false); return }

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError('Email atau password salah'); setLoading(false); return }

    router.replace('/dashboard')
    setLoading(false)
  }

  /* ─── Lupa Password ─── */
  const handleForgotPassword = async () => {
    reset(); setLoading(true)
    if (!email) { setError('Masukkan email kamu dulu'); setLoading(false); return }

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (err) { setError(err.message); setLoading(false); return }

    setMode('forgot-sent')
    setLoading(false)
  }

  /* ─── Kirim Ulang ─── */
  const handleResend = async () => {
    setLoading(true)
    await supabase.auth.resend({ type: 'signup', email })
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:D.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20, position:'relative', overflow:'hidden' }}>
          {/* ─── Background ─── */}
    <style>{`
      @keyframes bgFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(50px,40px) scale(1.12)} }
      @keyframes bgFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-60px,-40px) scale(1.18)} }
      @keyframes bgIcon   { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-16px) rotate(6deg)} }
    `}</style>

    <div aria-hidden="true" style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>

      {/* Grid tipis, memudar ke pinggir */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:'linear-gradient(rgba(129,140,248,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.07) 1px, transparent 1px)',
        backgroundSize:'48px 48px',
        maskImage:'radial-gradient(ellipse at center, #000 20%, transparent 75%)',
        WebkitMaskImage:'radial-gradient(ellipse at center, #000 20%, transparent 75%)',
      }} />

      {/* Glow ungu/indigo (kiri atas) */}
      <div style={{ position:'absolute', top:'-12%', left:'-8%', width:480, height:480, borderRadius:'50%', background:'radial-gradient(circle, rgba(129,140,248,0.28) 0%, transparent 70%)', filter:'blur(40px)', animation:'bgFloat1 14s ease-in-out infinite' }} />

      {/* Glow hijau (kanan bawah) */}
      <div style={{ position:'absolute', bottom:'-15%', right:'-10%', width:520, height:520, borderRadius:'50%', background:'radial-gradient(circle, rgba(52,211,153,0.16) 0%, transparent 70%)', filter:'blur(50px)', animation:'bgFloat2 18s ease-in-out infinite' }} />

      {/* Ikon keuangan melayang */}
      <i className="ti ti-coin"        style={{ position:'absolute', top:'14%',    right:'14%', fontSize:44, color:'rgba(129,140,248,0.14)', animation:'bgIcon 7s ease-in-out infinite' }} />
      <i className="ti ti-chart-line"  style={{ position:'absolute', bottom:'18%', left:'10%',  fontSize:52, color:'rgba(52,211,153,0.13)',  animation:'bgIcon 9s ease-in-out infinite 1s' }} />
      <i className="ti ti-pig-money"   style={{ position:'absolute', top:'60%',    right:'8%',  fontSize:40, color:'rgba(129,140,248,0.12)', animation:'bgIcon 8s ease-in-out infinite 2s' }} />
      <i className="ti ti-credit-card" style={{ position:'absolute', top:'22%',    left:'12%',  fontSize:38, color:'rgba(129,140,248,0.12)', animation:'bgIcon 10s ease-in-out infinite 0.5s' }} />
    </div>
      <div style={{ width:'100%', maxWidth:400, position:'relative', zIndex:1 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:60, height:60, borderRadius:16, background:D.accentDim, border:'1.5px solid #3730A3', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
            <i className="ti ti-wallet" style={{ fontSize:28, color:D.accent }} />
          </div>
          <h1 style={{ margin:0, fontSize:24, fontWeight:800, color:D.textPri }}>Keuanganku</h1>
          <p style={{ margin:'6px 0 0', fontSize:13, color:D.textMuted }}>Manajemen keuangan pribadi</p>
        </div>

        <div style={{ background:D.surface, borderRadius:20, padding:28, border:`1.5px solid ${D.borderHi}`, boxShadow:'0 0 40px rgba(129,140,248,0.08)' }}>

          {/* ─── Login / Register ─── */}
          {(mode === 'login' || mode === 'register') && (
            <>
              {/* Tab */}
              <div style={{ display:'flex', background:D.surfaceHi, borderRadius:12, padding:4, marginBottom:24 }}>
                {['login','register'].map(m => (
                  <button key={m} onClick={() => { setMode(m); reset() }} style={{
                    flex:1, padding:'9px', borderRadius:9, fontSize:13, fontWeight:700,
                    background:mode===m ? D.accent : 'transparent',
                    color:mode===m ? '#0D0F1A' : D.textSec,
                    border:'none', transition:'all 0.15s', cursor:'pointer',
                    boxShadow:mode===m ? '0 0 14px rgba(129,140,248,0.3)' : 'none',
                  }}>
                    {m === 'login' ? 'Masuk' : 'Daftar'}
                  </button>
                ))}
              </div>

              {/* Email */}
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, fontWeight:700, color:D.textMuted, display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.07em' }}>Email</label>
                <input type="email" placeholder="contoh@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && (mode==='login' ? handleLogin() : handleRegister())} />
              </div>

              {/* Password */}
              <div style={{ marginBottom: mode==='login' ? 8 : 20 }}>
                <label style={{ fontSize:11, fontWeight:700, color:D.textMuted, display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.07em' }}>Password</label>
                <input type="password" placeholder="Minimal 6 karakter" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && (mode==='login' ? handleLogin() : handleRegister())} />
              </div>

              {/* Lupa password */}
              {mode === 'login' && (
                <div style={{ textAlign:'right', marginBottom:20 }}>
                  <button onClick={() => { setMode('forgot'); reset() }} style={{ background:'none', border:'none', fontSize:12, color:D.accent, cursor:'pointer', fontWeight:600 }}>
                    Lupa password?
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:D.outcome.dim, border:`1px solid ${D.outcome.border}`, borderRadius:10, marginBottom:16 }}>
                  <i className="ti ti-alert-circle" style={{ fontSize:14, color:D.outcome.solid, flexShrink:0 }} />
                  <span style={{ fontSize:13, color:D.outcome.solid, fontWeight:600 }}>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button onClick={mode==='login' ? handleLogin : handleRegister} disabled={loading} style={{ width:'100%', padding:'14px', borderRadius:12, fontSize:14, fontWeight:800, background:loading?'#3730A3':D.accent, color:'#0D0F1A', border:'none', boxShadow:loading?'none':'0 0 20px rgba(129,140,248,0.4)', cursor:loading?'wait':'pointer' }}>
                {loading ? 'Memproses...' : mode==='login' ? 'Masuk' : 'Buat Akun'}
              </button>
            </>
          )}

          {/* ─── Cek Email (setelah register) ─── */}
          {mode === 'check-email' && (
            <div style={{ textAlign:'center' }}>
              {/* Ikon */}
              <div style={{ width:70, height:70, borderRadius:20, background:'#2E2105', border:'1.5px solid #5C400A', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                <i className="ti ti-mail-forward" style={{ fontSize:34, color:'#FBBF24' }} />
              </div>

              <h2 style={{ margin:'0 0 10px', fontSize:20, fontWeight:800, color:D.textPri }}>
                Konfirmasi Email Kamu
              </h2>

              <p style={{ margin:'0 0 6px', fontSize:13, color:D.textMuted, lineHeight:1.7 }}>
                Kami telah mengirim email konfirmasi ke:
              </p>
              <p style={{ margin:'0 0 20px', fontSize:14, fontWeight:700, color:D.accent }}>
                {email}
              </p>

              <div style={{ background:D.surfaceUp, borderRadius:14, padding:'16px 18px', marginBottom:20, textAlign:'left' }}>
                <p style={{ margin:'0 0 10px', fontSize:12, fontWeight:700, color:D.textSec }}>Langkah selanjutnya:</p>
                {[
                  { icon:'ti-inbox', text:'Buka inbox email kamu' },
                  { icon:'ti-mail-opened', text:'Cari email dari Keuanganku' },
                  { icon:'ti-pointer', text:'Klik tombol "Konfirmasi Email"' },
                  { icon:'ti-check', text:'Akun aktif, langsung bisa masuk!' },
                ].map((s, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom: i < 3 ? 10 : 0 }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:D.surfaceHi, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <i className={`ti ${s.icon}`} style={{ fontSize:13, color:D.accent }} />
                    </div>
                    <span style={{ fontSize:12, color:D.textSec }}>{s.text}</span>
                  </div>
                ))}
              </div>

              {/* Info spam */}
              <div style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'10px 14px', background:D.accentDim, border:'1px solid #3730A3', borderRadius:10, marginBottom:20, textAlign:'left' }}>
                <i className="ti ti-info-circle" style={{ fontSize:14, color:D.accent, flexShrink:0, marginTop:1 }} />
                <span style={{ fontSize:12, color:D.textSec, lineHeight:1.6 }}>
                  Tidak ada email masuk? Cek folder <strong style={{ color:D.textPri }}>Spam</strong> atau <strong style={{ color:D.textPri }}>Promotions</strong>. Email bisa memakan waktu 1-2 menit.
                </span>
              </div>

              {/* Kirim ulang */}
              <button onClick={handleResend} disabled={loading} style={{ width:'100%', padding:'12px', borderRadius:12, fontSize:13, fontWeight:700, background:D.surfaceHi, color:loading?D.textMuted:D.textSec, border:`1.5px solid ${D.border}`, cursor:loading?'wait':'pointer', marginBottom:10 }}>
                {loading ? 'Mengirim...' : '↺ Kirim ulang email konfirmasi'}
              </button>

              <button onClick={() => { setMode('login'); reset() }} style={{ width:'100%', padding:'10px', borderRadius:10, fontSize:12, fontWeight:600, background:'transparent', color:D.textMuted, border:'none', cursor:'pointer' }}>
                ← Kembali ke Login
              </button>
            </div>
          )}

          {/* ─── Lupa Password ─── */}
          {mode === 'forgot' && (
            <>
              <div style={{ textAlign:'center', marginBottom:24 }}>
                <div style={{ width:52, height:52, borderRadius:14, background:D.accentDim, border:'1.5px solid #3730A3', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                  <i className="ti ti-key" style={{ fontSize:24, color:D.accent }} />
                </div>
                <h2 style={{ margin:0, fontSize:17, fontWeight:800, color:D.textPri }}>Lupa Password?</h2>
                <p style={{ margin:'6px 0 0', fontSize:12, color:D.textMuted, lineHeight:1.6 }}>
                  Tenang! Masukkan email kamu dan kami akan kirimkan link untuk membuat password baru.
                </p>
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:11, fontWeight:700, color:D.textMuted, display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.07em' }}>Email</label>
                <input type="email" placeholder="contoh@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && handleForgotPassword()} />
              </div>

              {error && (
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:D.outcome.dim, border:`1px solid ${D.outcome.border}`, borderRadius:10, marginBottom:16 }}>
                  <i className="ti ti-alert-circle" style={{ fontSize:14, color:D.outcome.solid, flexShrink:0 }} />
                  <span style={{ fontSize:13, color:D.outcome.solid, fontWeight:600 }}>{error}</span>
                </div>
              )}

              <button onClick={handleForgotPassword} disabled={loading} style={{ width:'100%', padding:'14px', borderRadius:12, fontSize:14, fontWeight:800, background:loading?'#3730A3':D.accent, color:'#0D0F1A', border:'none', boxShadow:loading?'none':'0 0 20px rgba(129,140,248,0.4)', cursor:loading?'wait':'pointer', marginBottom:12 }}>
                {loading ? 'Mengirim...' : 'Kirim Link Reset Password'}
              </button>

              <button onClick={() => { setMode('login'); reset() }} style={{ width:'100%', padding:'10px', borderRadius:10, fontSize:13, fontWeight:600, background:D.surfaceHi, color:D.textSec, border:`1px solid ${D.border}`, cursor:'pointer' }}>
                ← Kembali ke Login
              </button>
            </>
          )}

          {/* ─── Forgot Sent ─── */}
          {mode === 'forgot-sent' && (
            <div style={{ textAlign:'center' }}>
              <div style={{ width:70, height:70, borderRadius:20, background:D.income.dim, border:`1.5px solid ${D.income.border}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                <i className="ti ti-mail-check" style={{ fontSize:34, color:D.income.solid }} />
              </div>
              <h2 style={{ margin:'0 0 10px', fontSize:20, fontWeight:800, color:D.textPri }}>Email Terkirim!</h2>
              <p style={{ margin:'0 0 6px', fontSize:13, color:D.textMuted, lineHeight:1.7 }}>
                Link reset password sudah dikirim ke:
              </p>
              <p style={{ margin:'0 0 20px', fontSize:14, fontWeight:700, color:D.accent }}>{email}</p>
              <div style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'10px 14px', background:D.accentDim, border:'1px solid #3730A3', borderRadius:10, marginBottom:20, textAlign:'left' }}>
                <i className="ti ti-info-circle" style={{ fontSize:14, color:D.accent, flexShrink:0, marginTop:1 }} />
                <span style={{ fontSize:12, color:D.textSec, lineHeight:1.6 }}>
                  Cek folder <strong style={{ color:D.textPri }}>Spam</strong> jika tidak ada di inbox. Link berlaku selama <strong style={{ color:D.textPri }}>1 jam</strong>.
                </span>
              </div>
              <button onClick={() => { setMode('login'); reset() }} style={{ width:'100%', padding:'13px', borderRadius:12, fontSize:14, fontWeight:700, background:D.accent, color:'#0D0F1A', border:'none', cursor:'pointer', boxShadow:'0 0 20px rgba(129,140,248,0.4)' }}>
                Kembali ke Login
              </button>
            </div>
          )}

        </div>

        <p style={{ textAlign:'center', marginTop:20, fontSize:11, color:D.textMuted }}>
          <i className="ti ti-lock" style={{ fontSize:11, marginRight:4 }} />
          Data kamu aman & terenkripsi
        </p>
      </div>
    </div>
  )
}
