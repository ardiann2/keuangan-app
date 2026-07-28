'use client'

import { useState, useEffect } from 'react'
import { getTheme } from '@/lib/theme'



const MN  = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]
const MNS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"]
const getYM   = (iso) => { const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}` }
const ymFull  = (ym)  => { const [y,m] = ym.split("-"); return `${MN[+m-1]} ${y}` }
const ymShort = (ym)  => { const [y,m] = ym.split("-"); return `${MNS[+m-1]} ${y}` }
const nowYM   = ()    => getYM(new Date().toISOString())

function Section({ title, icon, children, D }) {
  return (
    <div style={{ background: D.surfaceUp, borderRadius: 18, border: `1.5px solid ${D.border}`, marginBottom: 14, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className={`ti ${icon}`} style={{ fontSize: 16, color: D.accent }} />
        <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: D.textPri }}>{title}</p>
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  )
}

function Toast({ toast, D }) {
  if (!toast) return null
  const accentColor = toast.color || D.accent

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { transform: translate(-50%, 30px); opacity: 0; }
          to   { transform: translate(-50%, 0);     opacity: 1; }
        }
        @keyframes toastBar {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
      <div
        key={toast.id}
        style={{
          position: 'fixed',
          bottom: 28,
          left: '50%',
          zIndex: 9999,
          minWidth: 280,
          maxWidth: '92vw',
          background: D.surfaceUp,
          borderRadius: 18,
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: `0 12px 32px rgba(0,0,0,0.45), 0 0 0 1px ${D.border}, 0 0 24px ${accentColor}30`,
          animation: 'toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
        }}
      >
        <div style={{
          width: 38, height: 38, borderRadius: 12, flexShrink: 0,
          background: `${accentColor}1f`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="ti ti-check" style={{ fontSize: 20, color: accentColor, fontWeight: 700 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: D.textPri }}>{toast.title}</p>
          {toast.message && (
            <p style={{ margin: '2px 0 0', fontSize: 11.5, color: D.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {toast.message}
            </p>
          )}
        </div>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, height: 3, borderRadius: '0 0 0 18px',
          background: accentColor,
          animation: 'toastBar 3s linear forwards',
        }} />
      </div>
    </>
  )
}

/* ─── Export CSV ─── */
function ExportCSV({ txs, D, onSuccess }) {
  const months = [...new Set([nowYM(), ...txs.map(t => getYM(t.date))])].sort((a, b) => b.localeCompare(a))
  const [selectedMonth, setSelectedMonth] = useState(nowYM())

  const handleExport = () => {
    const filtered = txs.filter(t => getYM(t.date) === selectedMonth)
    if (filtered.length === 0) { alert('Tidak ada transaksi di bulan ini'); return }

    const rows = [
      ['Tanggal', 'Kategori', 'Nominal', 'Keterangan'],
      ...filtered.map(t => [
        new Date(t.date).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }),
        t.category === 'income'  ? 'Pemasukan'   :
        t.category === 'outcome' ? 'Pengeluaran' :
        t.category === 'saving'  ? 'Tabungan'    : 'Aset',
        t.amount,
        t.description || '-',
      ])
    ]

    const sum = filtered.reduce((a, t) => ({ ...a, [t.category]: (a[t.category]||0) + t.amount }), {})
    rows.push([])
    rows.push(['RINGKASAN', '', '', ''])
    rows.push(['Total Pemasukan',   '', sum.income  || 0, ''])
    rows.push(['Total Pengeluaran', '', sum.outcome || 0, ''])
    rows.push(['Total Tabungan',    '', sum.saving  || 0, ''])
    rows.push(['Total Aset',        '', sum.asset   || 0, ''])
    rows.push(['Saldo Bersih',      '', (sum.income||0) - (sum.outcome||0), ''])

    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `keuanganku-${selectedMonth}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    onSuccess?.({
      title: 'CSV berhasil diunduh!',
      message: `keuanganku-${selectedMonth}.csv`,
      color: D.income?.solid || '#059669',
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 }}>
        <div style={{ background: D.surfaceHi, borderRadius: 10, padding: '10px 14px' }}>
          <p style={{ margin: '0 0 2px', fontSize: 10, color: D.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>Total Transaksi</p>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: D.accent }}>{txs.length}</p>
        </div>
        <div style={{ background: D.surfaceHi, borderRadius: 10, padding: '10px 14px' }}>
          <p style={{ margin: '0 0 2px', fontSize: 10, color: D.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>Bulan Dipilih</p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: D.saving.solid }}>{ymShort(selectedMonth)}</p>
        </div>
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: D.textMuted, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Pilih Bulan</label>
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {months.map(m => {
            const active = selectedMonth === m
            const count  = txs.filter(t => getYM(t.date) === m).length
            return (
              <button key={m} onClick={() => setSelectedMonth(m)} style={{
                flexShrink: 0, padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                background: active ? D.accent : D.surfaceHi,
                color: active ? (D.bg === '#000000' ? '#000' : '#fff') : D.textSec,
                border: active ? 'none' : `1.5px solid ${D.border}`,
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: active ? `0 0 12px ${D.accent}55` : 'none',
              }}>
                {ymShort(m)} <span style={{ opacity: 0.7, fontWeight: 500 }}>({count})</span>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ background: D.surfaceHi, borderRadius: 10, padding: '10px 14px' }}>
        <p style={{ margin: 0, fontSize: 12, color: D.textSec }}>
          <i className="ti ti-calendar" style={{ marginRight: 6, color: D.accent, fontSize: 13 }} />
          <strong style={{ color: D.textPri }}>{ymFull(selectedMonth)}</strong>
          {' '}— {txs.filter(t => getYM(t.date) === selectedMonth).length} transaksi
        </p>
      </div>

      <button onClick={handleExport} style={{
        width: '100%', padding: '13px', borderRadius: 12, fontSize: 14, fontWeight: 700,
        background: D.accent, color: D.bg === '#000000' ? '#000' : '#fff',
        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: `0 0 20px ${D.accent}55`,
      }}>
        <i className="ti ti-file-spreadsheet" style={{ fontSize: 16 }} />
        Export CSV — {ymFull(selectedMonth)}
      </button>
    </div>
  )
}

/* ─── Export PDF ─── */
function ExportPDF({ txs, D, onSuccess }) {
  const months = [...new Set([nowYM(), ...txs.map(t => getYM(t.date))])].sort((a, b) => b.localeCompare(a))
  const [selectedMonth, setSelectedMonth] = useState(nowYM())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    import('jspdf')
    import('jspdf-autotable')
  }, [])

  const handleExport = async () => {
    const filtered = txs.filter(t => getYM(t.date) === selectedMonth)
    if (filtered.length === 0) { alert('Tidak ada transaksi di bulan ini'); return }
    setLoading(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')
      const doc = new jsPDF()
      const sum = filtered.reduce((a, t) => ({ ...a, [t.category]: (a[t.category]||0) + t.amount }), {})
      const saldo = (sum.income||0) - (sum.outcome||0)

      doc.setFillColor(99, 102, 241)
      doc.rect(0, 0, 210, 38, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20); doc.setFont('helvetica', 'bold')
      doc.text('Keuanganku', 14, 16)
      doc.setFontSize(11); doc.setFont('helvetica', 'normal')
      doc.text(`Laporan Keuangan ${ymFull(selectedMonth)}`, 14, 26)
      doc.setFontSize(9)
      doc.text(`Diekspor: ${new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}`, 14, 34)

      const cards = [
        { label:'Pemasukan',   value:sum.income  ||0, color:[5,150,105]  },
        { label:'Pengeluaran', value:sum.outcome ||0, color:[220,38,38]  },
        { label:'Tabungan',    value:sum.saving  ||0, color:[217,119,6]  },
        { label:'Aset',        value:sum.asset   ||0, color:[124,58,237] },
      ]
      cards.forEach((card, i) => {
        const x = 14 + i * 46
        doc.setFillColor(...card.color)
        doc.roundedRect(x, 46, 43, 22, 3, 3, 'F')
        doc.setTextColor(255,255,255)
        doc.setFontSize(8); doc.setFont('helvetica','normal')
        doc.text(card.label, x+4, 53)
        doc.setFontSize(9); doc.setFont('helvetica','bold')
        doc.text(`Rp ${new Intl.NumberFormat('id-ID').format(card.value)}`, x+4, 62)
      })

      doc.setFillColor(...(saldo >= 0 ? [5,150,105] : [220,38,38]))
      doc.roundedRect(14, 73, 182, 14, 3, 3, 'F')
      doc.setTextColor(255,255,255)
      doc.setFontSize(9); doc.setFont('helvetica','bold')
      doc.text('Saldo Bersih', 18, 82)
      doc.text(`${saldo>=0?'+':'-'} Rp ${new Intl.NumberFormat('id-ID').format(Math.abs(saldo))}`, 140, 82)

      autoTable(doc, {
        startY: 93,
        head: [['No','Tanggal','Kategori','Nominal','Keterangan']],
        body: filtered.map((t,i) => [
          i+1,
          new Date(t.date).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}),
          t.category==='income'?'Pemasukan':t.category==='outcome'?'Pengeluaran':t.category==='saving'?'Tabungan':'Aset',
          `Rp ${new Intl.NumberFormat('id-ID').format(t.amount)}`,
          t.description||'-',
        ]),
        headStyles:{ fillColor:[30,27,75], textColor:[255,255,255], fontStyle:'bold', fontSize:9 },
        bodyStyles:{ fontSize:8.5, textColor:[30,30,30] },
        alternateRowStyles:{ fillColor:[245,245,255] },
        columnStyles:{ 0:{cellWidth:10,halign:'center'}, 1:{cellWidth:28}, 2:{cellWidth:28}, 3:{cellWidth:35,halign:'right'}, 4:{cellWidth:'auto'} },
        margin:{ left:14, right:14 },
      })

      const pages = doc.internal.getNumberOfPages()
      for (let i=1; i<=pages; i++) {
        doc.setPage(i)
        doc.setFontSize(8); doc.setTextColor(150,150,150)
        doc.text(`Keuanganku · Halaman ${i} dari ${pages}`, 14, 290)
      }

      const pdfBlob = doc.output('blob')
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `keuanganku-${selectedMonth}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      onSuccess?.({
        title: 'PDF berhasil diunduh!',
        message: `keuanganku-${selectedMonth}.pdf`,
        color: '#059669',
      })
    } catch(err) {
      console.error(err); alert('Gagal membuat PDF.')
    }
    setLoading(false)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <button onClick={handleExport} disabled={loading} style={{
        width: '100%', padding: '13px', borderRadius: 12, fontSize: 14, fontWeight: 700,
        background: D.accent, color: D.bg === '#000000' ? '#000' : '#fff',
        border: 'none', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: `0 0 20px ${D.accent}55`,
        opacity: loading ? 0.7 : 1,
      }}>
        <i className="ti ti-file-type-pdf" style={{ fontSize: 16 }} />
        {loading ? 'Membuat PDF...' : `Export PDF — ${ymFull(selectedMonth)}`}
      </button>
    </div>
  )
}

/* ─── Danger Zone ─── */
function DangerZone({ onDeleteAll, D }) {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    await onDeleteAll()
    setLoading(false)
    setConfirm(false)
  }

  return (
    <>
      {!confirm ? (
        <button onClick={() => setConfirm(true)} style={{ width: '100%', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: D.outcome.dim, color: D.outcome.solid, border: `1.5px solid ${D.outcome.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <i className="ti ti-trash" style={{ fontSize: 15 }} />
          Hapus Semua Data Transaksi
        </button>
      ) : (
        <div style={{ background: D.outcome.dim, borderRadius: 12, padding: '14px 16px', border: `1.5px solid ${D.outcome.border}` }}>
          <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: D.outcome.solid }}>
            ⚠️ Yakin? Semua transaksi & budget akan terhapus permanen!
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setConfirm(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: D.surfaceHi, color: D.textSec, border: `1px solid ${D.border}`, cursor: 'pointer' }}>
              Batal
            </button>
            <button onClick={handleDelete} disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: D.outcome.solid, color: '#fff', border: 'none', cursor: loading ? 'wait' : 'pointer' }}>
              {loading ? 'Menghapus...' : 'Ya, Hapus Semua'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/* ─── Settings Page ─── */
export default function Settings({ txs, budgets, onLogout, onDeleteAll, userEmail }) {
  const D = getTheme()
  const [toast, setToast] = useState(null)
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast])
  const showToast = ({ title, message, color }) => {
    setToast({ id: Date.now(), title, message, color })
  }

  return (
    <div style={{ minHeight: '100vh', background: D.bg }}>
      <div style={{ background: 'rgba(0,0,0,0.95)' , backdropFilter: 'blur(12px)', borderBottom: `1px solid ${D.border}`, padding: '14px 20px', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: D.textPri, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-settings" style={{ fontSize: 18, color: D.accent }} />Pengaturan
        </h1>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: D.textMuted }}>Akun & manajemen data</p>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 24px' }}>

        {/* Akun */}
        <Section title="Akun" icon="ti-user-circle" D={D}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: D.accentDim, border: `1.5px solid ${D.borderHi}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="ti ti-user" style={{ fontSize: 20, color: D.accent }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: D.textPri }}>{userEmail}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: D.textMuted }}>Login via Supabase Auth</p>
            </div>
          </div>
        </Section>

        {/* Export CSV & PDF */}
        <Section title="Export CSV & PDF" D={D}>
          <ExportCSV txs={txs} D={D} onSuccess={showToast} />
          <div
            style={{
              height: 1,
              background: D.border,
              margin: '18px 0',
              opacity: 0.6,
            }}
          />
          <ExportPDF txs={txs} D={D} onSuccess={showToast} />
        </Section>

        {/* Hapus Data */}
        <Section title="Hapus Data" icon="ti-trash" D={D}>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: D.textMuted }}>
            Hapus semua transaksi dan budget secara permanen. Data tidak bisa dipulihkan.
          </p>
          <DangerZone onDeleteAll={onDeleteAll} D={D} />
        </Section>

        {/* Logout */}
        <Section title="Sesi" icon="ti-logout" D={D}>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: D.textMuted }}>
            Keluar dari akun ini. Data kamu tetap aman tersimpan di server.
          </p>
          <button onClick={onLogout} style={{ width: '100%', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: D.outcome.dim, color: D.outcome.solid, border: `1.5px solid ${D.outcome.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <i className="ti ti-logout" style={{ fontSize: 15 }} />
            Keluar dari Akun
          </button>
        </Section>

        <p style={{ textAlign: 'center', fontSize: 11, color: D.textMuted, marginTop: 8, lineHeight: 1.7 }}>
          Keuanganku v2.0 · Data tersimpan di Supabase
        </p>
      </div>
      <Toast toast={toast} D={D} />
    </div>
  )
}
