'use client'
import { useState } from "react";
import { CATS, fmt, fmtShort, fmtDate, getYM, nowYM, ymFull, ymShort } from '@/lib/utils';
import { getTheme } from '@/lib/theme'

function TxForm({ initial = null, onSave, onCancel, D }) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    amount:      initial ? String(initial.amount) : "",
    category:    initial?.category ?? "income",
    description: initial?.description ?? "",
  });
  const [error, setError] = useState("");
  const [busy,  setBusy]  = useState(false);
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(""); };
  const handleSave = async () => {
    const amt = parseInt(form.amount.toString().replace(/\D/g, ""), 10);
    if (!amt || amt <= 0) { setError("Nominal tidak boleh kosong atau nol"); return; }
    setBusy(true);
    await onSave({ amount: amt, category: form.category, description: form.description.trim() });
    setBusy(false);
  };
  const ac = CATS[form.category];
  return (
    <>
      <div onClick={onCancel} style={{ position:"fixed", inset:0, zIndex:40, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)", animation:"fadeIn 0.2s ease" }} />
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:50,
        background:  "#111111" ,
        borderRadius:"22px 22px 0 0",
        borderTop:`1.5px solid ${D.border}`, borderLeft:`1.5px solid ${D.border}`, borderRight:`1.5px solid ${D.border}`,
        padding:"0 20px calc(80px + env(safe-area-inset-bottom, 0px))",
        maxHeight:"88vh", overflowY:"auto",
        boxShadow:"0 -12px 60px rgba(0,0,0,0.4)",
        animation:"slideUp 0.28s cubic-bezier(0.32,0.72,0,1)",
      }}>
        <div style={{ display:"flex", justifyContent:"center", paddingTop:14, paddingBottom:6 }}>
          <div style={{ width:36, height:4, borderRadius:4, background:D.border }} />
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0 20px" }}>
          <div>
            <h2 style={{ margin:0, fontSize:17, fontWeight:800, color:D.textPri }}>{isEdit ? "Edit Transaksi" : "Transaksi Baru"}</h2>
            <p style={{ margin:"3px 0 0", fontSize:12, color:D.textMuted }}>{isEdit ? "Ubah detail di bawah ini" : "Waktu dicatat otomatis saat simpan"}</p>
          </div>
          <button onClick={onCancel} style={{ width:34, height:34, borderRadius:10, border:`1px solid ${D.border}`, background:D.surfaceHi, color:D.textSec, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <i className="ti ti-x" style={{ fontSize:15 }} />
          </button>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11, fontWeight:700, color:D.textMuted, display:"block", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.07em" }}>Nominal</label>
          <div style={{ display:"flex", alignItems:"center", background:D.surfaceHi, borderRadius:14, border:`1.5px solid ${form.amount && +form.amount > 0 ? ac.border : D.border}`, overflow:"hidden", transition:"border-color 0.2s" }}>
            <span style={{ padding:"0 4px 0 16px", fontSize:18, fontWeight:800, color:form.amount && +form.amount > 0 ? ac.solid : D.textMuted }}>Rp</span>
            <input type="number" min="0" step="1000" placeholder="0" value={form.amount} onChange={e => set("amount", e.target.value)} onKeyDown={e => e.key === "Enter" && handleSave()} autoFocus
              style={{ flex:1, border:"none", background:"transparent", outline:"none", fontSize:24, fontWeight:800, color:form.amount && +form.amount > 0 ? ac.solid : D.textPri, padding:"14px 16px 14px 6px" }} />
          </div>
          {form.amount && !isNaN(+form.amount) && +form.amount > 0 && (
            <p style={{ margin:"6px 0 0", fontSize:12, color:ac.solid, fontWeight:600 }}>= {fmt(+form.amount)}</p>
          )}
        </div>
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:11, fontWeight:700, color:D.textMuted, display:"block", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.07em" }}>Kategori</label>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
            {Object.entries(CATS).map(([key, c]) => {
              const active = form.category === key;
              return (
                <button key={key} onClick={() => set("category", key)} style={{
                  padding:"12px 4px", borderRadius:12, fontSize:11, fontWeight:700,
                  border:`1.5px solid ${active ? c.border : D.border}`,
                  background: active ? c.dim : D.surfaceHi,
                  color: active ? c.solid : D.textMuted,
                  display:"flex", flexDirection:"column", alignItems:"center", gap:6,
                  transition:"all 0.15s", cursor:"pointer",
                  boxShadow: active ? `0 0 12px ${c.glow}` : "none",
                }}>
                  <div style={{ width:32, height:32, borderRadius:9, background: active ? "rgba(255,255,255,0.08)" : D.surfaceUp, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${D.border}` }}>
                    <i className={`ti ${c.icon}`} style={{ fontSize:17, color: active ? c.solid : D.textSec }} />
                  </div>
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11, fontWeight:700, color:D.textMuted, display:"block", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.07em" }}>
            Keterangan <span style={{ color:D.textMuted, fontWeight:400, textTransform:"none", fontSize:11 }}>(opsional)</span>
          </label>
          <input type="text" placeholder="Contoh: Gaji, beli bensin, bayar listrik…" value={form.description} onChange={e => set("description", e.target.value)} onKeyDown={e => e.key === "Enter" && handleSave()} style={{ borderRadius:12, background:D.surfaceHi, color:D.textPri, border:`1.5px solid ${D.border}` }} />
        </div>
        {error && (
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:D.outcome.dim, border:`1px solid ${D.outcome.border}`, borderRadius:12, marginBottom:16 }}>
            <i className="ti ti-alert-circle" style={{ fontSize:14, color:D.outcome.solid, flexShrink:0 }} />
            <span style={{ fontSize:13, color:D.outcome.solid, fontWeight:600 }}>{error}</span>
          </div>
        )}
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:"14px", borderRadius:14, fontSize:14, fontWeight:700, background:D.surfaceHi, color:D.textSec, border:`1.5px solid ${D.border}`, cursor:"pointer" }}>Batal</button>
          <button onClick={handleSave} disabled={busy} style={{ flex:2, padding:"14px", borderRadius:14, fontSize:14, fontWeight:800, cursor:busy?"wait":"pointer", background:busy?"#3730A3":D.accent, color:"#FFFFFF", border:"none", transition:"all 0.15s", boxShadow:busy?"none":`0 0 20px ${D.accent}55` }}>
            {busy ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : `Simpan · ${CATS[form.category].label}`}
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </>
  );
}

function CategoryDetail({ cat, txs, month, onClose, onEdit, onDelete, D }) {
  const c = CATS[cat];
  const filtered = txs.filter(t => t.category === cat && getYM(t.date) === month);
  const total = filtered.reduce((s, t) => s + t.amount, 0);
  return (
    <div style={{ background:D.surfaceUp, borderRadius:18, border:`1.5px solid ${c.border}`, marginBottom:16, overflow:"hidden", boxShadow:`0 0 20px ${c.glow}` }}>
      <div style={{ padding:"16px 18px", background:c.dim, borderBottom:`1px solid ${c.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:D.surfaceUp, border:`1.5px solid ${c.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <i className={`ti ${c.icon}`} style={{ fontSize:17, color:c.solid }} />
          </div>
          <div>
            <p style={{ margin:0, fontSize:13, fontWeight:700, color:c.solid }}>Rincian {c.label}</p>
            <p style={{ margin:0, fontSize:11, color:D.textMuted }}>{ymFull(month)} · {filtered.length} transaksi</p>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ margin:0, fontSize:18, fontWeight:800, color:c.solid }}>{fmtShort(total)}</p>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:D.textMuted, fontSize:11, padding:0, marginTop:2 }}>
            <i className="ti ti-x" style={{ fontSize:13, marginRight:3 }} />Tutup
          </button>
        </div>
      </div>
      <div style={{ padding:"10px 14px", maxHeight:320, overflowY:"auto" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"28px 0", color:D.textMuted }}>
            <i className="ti ti-inbox" style={{ fontSize:28, display:"block", marginBottom:8 }} />
            <p style={{ margin:0, fontSize:13 }}>Belum ada {c.label.toLowerCase()} bulan ini</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {filtered.map((tx, i) => (
              <div key={tx.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:12, background:i%2===0?D.surfaceHi:"transparent", border:`1px solid ${i%2===0?D.border:"transparent"}` }}>
                <span style={{ fontSize:11, color:D.textMuted, fontWeight:600, minWidth:18, textAlign:"center" }}>{i+1}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:8 }}>
                    <span style={{ fontSize:14, fontWeight:800, color:c.solid }}>{fmt(tx.amount)}</span>
                    <span style={{ fontSize:10, color:D.textMuted, flexShrink:0 }}>{fmtDate(tx.date)}</span>
                  </div>
                  {tx.description && <p style={{ margin:"2px 0 0", fontSize:12, color:D.textSec, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{tx.description}</p>}
                </div>
                <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                  <button onClick={() => onEdit(tx)} style={{ background:D.accentDim, border:`1px solid ${D.accent}44`, borderRadius:7, padding:"5px 7px", color:D.accent, cursor:"pointer", lineHeight:1 }}>
                    <i className="ti ti-edit" style={{ fontSize:12 }} />
                  </button>
                  <button onClick={() => onDelete(tx.id)} style={{ background:D.outcome.dim, border:`1px solid ${D.outcome.border}`, borderRadius:7, padding:"5px 7px", color:D.outcome.solid, cursor:"pointer", lineHeight:1 }}>
                    <i className="ti ti-trash" style={{ fontSize:12 }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {filtered.length > 0 && (
        <div style={{ padding:"10px 18px", borderTop:`1px solid ${c.border}`, background:c.dim, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:12, color:D.textMuted, fontWeight:600 }}>Total {c.label}</span>
          <span style={{ fontSize:16, fontWeight:800, color:c.solid }}>{fmt(total)}</span>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, cat, active, onClick, D }) {
  const c = CATS[cat];
  return (
    <div onClick={onClick} style={{ background:active?c.dim:D.surfaceUp, border:`1.5px solid ${active?c.border:D.border}`, borderRadius:16, padding:"16px 18px", cursor:"pointer", transition:"all 0.2s", boxShadow:active?`0 0 20px ${c.glow}`:"none" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <span style={{ fontSize:11, fontWeight:600, color:active?c.solid:D.textSec, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</span>
        <div style={{ width:30, height:30, borderRadius:9, background:active?D.surfaceUp:c.dim, border:`1px solid ${c.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <i className={`ti ${c.icon}`} style={{ fontSize:14, color:c.solid }} />
        </div>
      </div>
      <p style={{ margin:"0 0 8px", fontSize:19, fontWeight:800, color:c.solid, letterSpacing:"-0.02em" }}>{fmtShort(value)}</p>
      <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:active?c.solid:D.textMuted, fontWeight:600 }}>
        <i className={`ti ${active?"ti-chevron-up":"ti-list-details"}`} style={{ fontSize:12 }} />
        {active ? "Sembunyikan rincian" : "Lihat rincian"}
      </div>
    </div>
  );
}

function TxItem({ tx, onEdit, onDelete, D }) {
  const c = CATS[tx.category];
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ display:"flex", alignItems:"center", gap:14, background:hov?D.surfaceHi:D.surfaceUp, border:`1.5px solid ${hov?D.borderHi:D.border}`, borderRadius:14, padding:"13px 16px", transition:"all 0.18s", boxShadow:hov?`0 4px 16px rgba(0,0,0,0.1)`:"none" }}>
      <div style={{ width:40, height:40, borderRadius:12, flexShrink:0, background:c.dim, border:`1.5px solid ${c.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <i className={`ti ${c.icon}`} style={{ fontSize:18, color:c.solid }} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:8 }}>
          <span style={{ fontSize:15, fontWeight:800, color:c.solid }}>{fmt(tx.amount)}</span>
          <span style={{ fontSize:11, color:D.textMuted, flexShrink:0 }}>{fmtDate(tx.date)}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:5, flexWrap:"wrap" }}>
          <span style={{ fontSize:11, padding:"2px 9px", borderRadius:20, fontWeight:700, background:c.dim, color:c.solid, border:`1px solid ${c.border}` }}>{c.label}</span>
          {tx.description && <span style={{ fontSize:12, color:D.textSec, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:200 }}>{tx.description}</span>}
        </div>
      </div>
      <div style={{ display:"flex", gap:6, flexShrink:0 }}>
        <button onClick={() => onEdit(tx)} style={{ background:hov?D.accentDim:"transparent", border:`1px solid ${hov?D.accent+"44":"transparent"}`, borderRadius:8, padding:"6px 8px", color:hov?D.accent:D.textMuted, transition:"all 0.15s", lineHeight:1, cursor:"pointer" }}>
          <i className="ti ti-edit" style={{ fontSize:14 }} />
        </button>
        <button onClick={() => onDelete(tx.id)} style={{ background:hov?D.outcome.dim:"transparent", border:`1px solid ${hov?D.outcome.border:"transparent"}`, borderRadius:8, padding:"6px 8px", color:hov?D.outcome.solid:D.textMuted, transition:"all 0.15s", lineHeight:1, cursor:"pointer" }}>
          <i className="ti ti-trash" style={{ fontSize:14 }} />
        </button>
      </div>
    </div>
  );
}

function NetWorthCard({ income, outcome, saving, asset, D }) {
  const saldo = income - outcome;
  const netWorth = saldo + saving + asset;
  const isPos = netWorth >= 0;
  const [open, setOpen] = useState(false);
  const rows = [
    { label:"Total Pemasukan",   value:income,           color:D.income.solid,  icon:"ti-trending-up",   sign:"+" },
    { label:"Total Pengeluaran", value:outcome,          color:D.outcome.solid, icon:"ti-trending-down", sign:"−" },
    { label:"Total Tabungan",    value:saving,           color:D.saving.solid,  icon:"ti-coin",          sign:"+" },
    { label:"Total Aset",        value:asset,            color:D.asset.solid,   icon:"ti-briefcase",     sign:"+" },
    { label:"Saldo Bersih",      value:Math.abs(saldo),  color:saldo>=0?D.income.solid:D.outcome.solid, icon:"ti-scale", sign:saldo>=0?"+":"−" },
  ];
  return (
    <div style={{ borderRadius:20, overflow:"hidden", border:`1.5px solid ${isPos?D.income.border:D.outcome.border}`, boxShadow:`0 0 24px ${isPos?D.income.glow:D.outcome.glow}`, marginBottom:20 }}>
      <div onClick={() => setOpen(v=>!v)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 22px", cursor:"pointer", background:isPos?D.income.dim:D.outcome.dim }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:42, height:42, borderRadius:13, background:D.surfaceUp, border:`1.5px solid ${isPos?D.income.border:D.outcome.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <i className="ti ti-trophy" style={{ fontSize:20, color:isPos?D.income.solid:D.outcome.solid }} />
          </div>
          <div>
            <p style={{ margin:0, fontSize:11, fontWeight:700, color:D.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Total Kekayaan Bersih</p>
            <p style={{ margin:"3px 0 0", fontSize:26, fontWeight:800, letterSpacing:"-0.02em", lineHeight:1, color:isPos?D.income.solid:D.outcome.solid }}>{fmtShort(netWorth)}</p>
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
          <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:D.surfaceUp, color:isPos?D.income.solid:D.outcome.solid, border:`1px solid ${isPos?D.income.border:D.outcome.border}` }}>
            {isPos?"▲ Positif":"▼ Negatif"}
          </span>
          <span style={{ fontSize:11, color:D.textMuted, display:"flex", alignItems:"center", gap:4 }}>
            <i className={`ti ${open?"ti-chevron-up":"ti-chevron-down"}`} style={{ fontSize:13 }} />
            {open?"Sembunyikan":"Rincian"}
          </span>
        </div>
      </div>
      {open && (
        <div style={{ background:D.surfaceUp, padding:"6px 22px 16px" }}>
          <div style={{ height:1, background:D.border, marginBottom:12 }} />
          {rows.map((r,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:i<rows.length-1?`1px solid ${D.border}`:"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:D.surfaceHi, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <i className={`ti ${r.icon}`} style={{ fontSize:13, color:r.color }} />
                </div>
                <span style={{ fontSize:13, color:D.textSec, fontWeight:500 }}>{r.label}</span>
              </div>
              <span style={{ fontSize:14, fontWeight:800, color:r.color }}>{r.sign}{fmt(r.value)}</span>
            </div>
          ))}
          <div style={{ marginTop:10, padding:"14px 16px", borderRadius:12, background:isPos?D.income.dim:D.outcome.dim, border:`1.5px solid ${isPos?D.income.border:D.outcome.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <i className="ti ti-trophy" style={{ fontSize:15, color:isPos?D.income.solid:D.outcome.solid }} />
              <span style={{ fontSize:13, fontWeight:700, color:isPos?D.income.solid:D.outcome.solid }}>Total Kekayaan Bersih</span>
            </div>
            <span style={{ fontSize:16, fontWeight:800, color:isPos?D.income.solid:D.outcome.solid }}>{fmt(netWorth)}</span>
          </div>
          <div style={{ marginTop:10, padding:"10px 14px", borderRadius:10, background:D.surfaceHi, border:`1px solid ${D.border}` }}>
            <p style={{ margin:0, fontSize:11, color:D.textMuted, lineHeight:1.6 }}>
              <i className="ti ti-info-circle" style={{ marginRight:5, fontSize:12 }} />
              Kekayaan Bersih = Saldo + Tabungan + Aset, dari <strong style={{ color:D.textSec }}>semua bulan</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ txs, addTx, updateTx, deleteTx}) {
  const D = getTheme()
  const [month,       setMonth]       = useState(nowYM());
  const [mode,        setMode]        = useState(null);
  const [editTx,      setEditTx]      = useState(null);
  const [activeCat,   setActiveCat]   = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const openAdd   = () => { setEditTx(null); setMode("add"); setActiveCat(null); };
  const openEdit  = (tx) => { setEditTx(tx); setMode("edit"); setActiveCat(null); };
  const closeForm = () => { setMode(null); setEditTx(null); };
  const toggleCat = (cat) => { setActiveCat(prev => prev === cat ? null : cat); setShowHistory(false); };

  const handleSave = async (data) => {
    if (mode === "edit" && editTx) { await updateTx(editTx.id, data); }
    else { const ym = await addTx(data); if (ym) setMonth(ym); }
    closeForm();
  };

  const months   = [...new Set([nowYM(), ...txs.map(t => getYM(t.date))])].sort((a,b) => b.localeCompare(a));
  const filtered = txs.filter(t => getYM(t.date) === month);
  const sum      = filtered.reduce((a,t) => ({ ...a, [t.category]:(a[t.category]||0)+t.amount }), {});
  const income   = sum.income  || 0;
  const outcome  = sum.outcome || 0;
  const cumulativeUpTo = (cat) => txs.filter(t => t.category===cat && getYM(t.date)<=month).reduce((s,t) => s+t.amount, 0);
  const saving   = cumulativeUpTo("saving");
  const asset    = cumulativeUpTo("asset");
  const saldo    = income - outcome;
  const isPositive = saldo >= 0;
  const allSum   = txs.reduce((a,t) => ({ ...a, [t.category]:(a[t.category]||0)+t.amount }), {});

  const topBarBg = "rgba(0,0,0,0.95)";

  return (
    <div style={{ minHeight:"100vh", background:D.bg }}>
      {/* Top Bar */}
      <div style={{ background:topBarBg, backdropFilter:"blur(12px)", borderBottom:`1px solid ${D.border}`, padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:D.accentDim, border:`1px solid ${D.accent}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <i className="ti ti-wallet" style={{ fontSize:18, color:D.accent }} />
          </div>
          <div>
            <p style={{ margin:0, fontSize:15, fontWeight:800, color:D.textPri }}>Keuanganku</p>
            <p style={{ margin:0, fontSize:11, color:D.textMuted }}>Manajemen keuangan pribadi</p>
          </div>
        </div>
        <button onClick={openAdd} style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", background:D.accent, color:"#FFFFFF", border:"none", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:`0 0 16px ${D.accent}55` }}>
          <i className="ti ti-plus" style={{ fontSize:15 }} />Tambah
        </button>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"20px 16px 24px" }}>
        {mode && <TxForm D={D}  initial={mode==="edit"?editTx:null} onSave={handleSave} onCancel={closeForm} />}

        {/* Month Pills */}
        <div style={{ display:"flex", gap:7, overflowX:"auto", paddingBottom:4, marginBottom:14, scrollbarWidth:"none" }}>
          {months.map(m => {
            const active = month === m;
            return (
              <button key={m} onClick={() => { setMonth(m); setActiveCat(null); }} style={{ flexShrink:0, padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:700, background:active?D.accent:D.surfaceUp, color:active?"#FFFFFF":D.textSec, border:active?"none":`1.5px solid ${D.border}`, transition:"all 0.15s", cursor:"pointer", boxShadow:active?`0 0 12px ${D.accent}55`:"none" }}>
                {ymShort(m)}
              </button>
            );
          })}
        </div>

        {/* Hero */}
        <div style={{ borderRadius:22, padding:"26px 24px", marginBottom:14, background:isPositive?D.income.dim:D.outcome.dim, border:`1.5px solid ${isPositive?D.income.border:D.outcome.border}`, boxShadow:`0 0 24px ${isPositive?D.income.glow:D.outcome.glow}`, position:"relative", overflow:"hidden" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:4 }}>
            <p style={{ margin:0, fontSize:11, fontWeight:700, color:D.textMuted, textTransform:"uppercase", letterSpacing:"0.08em" }}>Saldo bersih · {ymFull(month)}</p>
            <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:D.surfaceUp, color:isPositive?D.income.solid:D.outcome.solid, border:`1px solid ${isPositive?D.income.border:D.outcome.border}` }}>
              {isPositive?"▲ Surplus":"▼ Defisit"}
            </span>
          </div>
          <p style={{ margin:"8px 0 20px", fontSize:38, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1, color:isPositive?D.income.solid:D.outcome.solid }}>
            {fmtShort(saldo)}
          </p>
          <div style={{ display:"flex", background:"rgba(255,255,255,0.04)", borderRadius:12, overflow:"hidden" }}>
            {[
              { label:"Pemasukan",   value:`+${fmtShort(income)}`,  color:D.income.solid  },
              { label:"Pengeluaran", value:`−${fmtShort(outcome)}`, color:D.outcome.solid },
              { label:"Transaksi",   value:`${filtered.length}x`,   color:D.textSec       },
            ].map((item,i) => (
              <div key={i} style={{ flex:1, padding:"11px 14px", borderRight:i<2?`1px solid ${D.border}`:"none" }}>
                <p style={{ margin:"0 0 3px", fontSize:10, color:D.textMuted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>{item.label}</p>
                <p style={{ margin:0, fontSize:13, fontWeight:800, color:item.color }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <p style={{ margin:"0 0 10px", fontSize:11, color:D.textMuted, display:"flex", alignItems:"center", gap:5 }}>
          <i className="ti ti-hand-click" style={{ fontSize:12 }} />Klik kartu untuk lihat rincian transaksi
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
          <StatCard label="Pemasukan"   value={income}  cat="income"  active={activeCat==="income"}  onClick={() => toggleCat("income")}  D={D} />
          <StatCard label="Pengeluaran" value={outcome} cat="outcome" active={activeCat==="outcome"} onClick={() => toggleCat("outcome")} D={D} />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:6 }}>
          <StatCard label="Tabungan" value={saving} cat="saving" active={activeCat==="saving"} onClick={() => toggleCat("saving")} D={D} />
          <StatCard label="Aset"     value={asset}  cat="asset"  active={activeCat==="asset"}  onClick={() => toggleCat("asset")}  D={D} />
        </div>
        <p style={{ margin:"0 0 16px", fontSize:11, color:D.textMuted, display:"flex", alignItems:"center", gap:5 }}>
          <i className="ti ti-info-circle" style={{ fontSize:11, color:D.saving.solid }} />
          <span>Tabungan & Aset dihitung <strong style={{ color:D.textSec }}>akumulatif dari semua bulan</strong>, bukan reset per bulan</span>
        </p>

        {activeCat && (
          <CategoryDetail D={D} cat={activeCat} txs={txs} month={month} onClose={() => setActiveCat(null)} onEdit={(tx) => { openEdit(tx); setActiveCat(null); }} onDelete={(id) => { deleteTx(id); }} />
        )}

        <NetWorthCard D={D} income={allSum.income||0} outcome={allSum.outcome||0} saving={allSum.saving||0} asset={allSum.asset||0} />

        <div style={{ height:1, background:D.border, margin:"4px 0 16px" }} />

        {/* Riwayat */}
        <button onClick={() => { setShowHistory(v=>!v); setActiveCat(null); }} style={{ width:"100%", padding:"13px 18px", borderRadius:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", background:showHistory?D.surfaceHi:D.surfaceUp, border:`1.5px solid ${showHistory?D.borderHi:D.border}`, transition:"all 0.2s", marginBottom:showHistory?14:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <i className="ti ti-history" style={{ fontSize:16, color:D.accent }} />
            <span style={{ fontSize:14, fontWeight:700, color:D.textPri }}>Riwayat Transaksi</span>
            <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:D.accentDim, color:D.accent, fontWeight:600 }}>{filtered.length} transaksi</span>
          </div>
          <i className={`ti ${showHistory?"ti-chevron-up":"ti-chevron-down"}`} style={{ fontSize:16, color:D.textMuted }} />
        </button>

        {showHistory && (
          <>
            {filtered.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 24px", background:D.surfaceUp, borderRadius:16, border:`1.5px solid ${D.border}` }}>
                <i className="ti ti-inbox" style={{ fontSize:32, display:"block", marginBottom:10, color:D.textMuted }} />
                <p style={{ margin:"0 0 4px", fontSize:14, fontWeight:700, color:D.textPri }}>{txs.length===0?"Belum ada transaksi":`Kosong di ${ymFull(month)}`}</p>
                <p style={{ margin:0, fontSize:12, color:D.textMuted }}>{txs.length===0?"Ketuk Tambah untuk mencatat transaksi pertamamu.":"Pilih bulan lain atau tambah transaksi baru."}</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {filtered.map(tx => <TxItem key={tx.id} tx={tx} onEdit={openEdit} onDelete={deleteTx} D={D} />)}
              </div>
            )}
          </>
        )}

        <p style={{ textAlign:"center", marginTop:28, fontSize:11, color:D.textMuted, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
          <i className="ti ti-lock" style={{ fontSize:11 }} />Data tersimpan di Supabase
        </p>
      </div>
    </div>
  );
}
