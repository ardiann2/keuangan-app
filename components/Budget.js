'use client'
import { useState } from "react";
import { CATS, fmt, fmtShort, getYM, nowYM, ymFull, ymShort } from '@/lib/utils';
import { getTheme } from '@/lib/theme'

const BUDGET_TYPE = {
  income:  "target",
  outcome: "limit",
  saving:  "target",
  asset:   "target",
};

function getBudgetStatus(cat, actual, budget, D) {
  const type = BUDGET_TYPE[cat];
  const pct  = budget > 0 ? (actual/budget)*100 : 0;
  if (type === "limit") {
    if (pct >= 100) return { color:D.outcome.solid, label:"Melebihi batas!",            icon:"ti-alert-triangle", good:false };
    if (pct >= 75)  return { color:D.saving.solid,  label:"Hampir habis, hati-hati",    icon:"ti-alert-circle",   good:false };
                    return { color:D.income.solid,   label:"Aman, masih terkontrol",     icon:"ti-circle-check",   good:true  };
  } else {
    if (pct >= 100) return { color:D.income.solid,  label:"Target tercapai! 🎉",        icon:"ti-trophy",         good:true  };
    if (pct >= 75)  return { color:D.saving.solid,  label:"Hampir tercapai, semangat!", icon:"ti-trending-up",    good:true  };
                    return { color:D.outcome.solid,  label:"Belum mencapai target",      icon:"ti-target",         good:false };
  }
}

function BudgetCard({ cat, actual, budget, onSetBudget, D }) {
  const c        = CATS[cat];
  const type     = BUDGET_TYPE[cat];
  const isTarget = type === "target";
  const pct      = budget > 0 ? Math.min((actual/budget)*100, 100) : 0;
  const status   = budget > 0 ? getBudgetStatus(cat, actual, budget, D) : null;
  const sisa     = budget - actual;
  const [editing, setEditing] = useState(false);
  const [input,   setInput]   = useState("");

  const save = () => {
    const val = parseInt(input.replace(/\D/g,""), 10);
    if (val > 0) onSetBudget(cat, val);
    setEditing(false); setInput("");
  };

  return (
    <div style={{
      background:D.surfaceUp, borderRadius:16,
      border:`1.5px solid ${status?(status.good?D.income.border:D.outcome.border):D.border}`,
      padding:"16px 18px", marginBottom:10,
      boxShadow: status ? `0 0 16px ${status.good?D.income.glow:D.outcome.glow}` : "none",
      transition:"all 0.2s",
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:c.dim, border:`1.5px solid ${c.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <i className={`ti ${c.icon}`} style={{ fontSize:17, color:c.solid }} />
          </div>
          <div>
            <p style={{ margin:0, fontSize:14, fontWeight:700, color:D.textPri }}>{c.label}</p>
            <p style={{ margin:0, fontSize:12, color:c.solid, fontWeight:600 }}>
              {fmt(actual)}<span style={{ color:D.textMuted, fontWeight:400 }}> {isTarget?"terkumpul":"dipakai"}</span>
            </p>
          </div>
        </div>
        <span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:20, background:isTarget?D.income.dim:D.outcome.dim, color:isTarget?D.income.solid:D.outcome.solid, border:`1px solid ${isTarget?D.income.border:D.outcome.border}`, textTransform:"uppercase", letterSpacing:"0.05em" }}>
          {isTarget?"🎯 Target":"🚫 Batas Max"}
        </span>
      </div>

      {budget > 0 ? (
        <>
          <div style={{ height:8, background:D.surfaceHi, borderRadius:20, overflow:"hidden", marginBottom:8 }}>
            <div style={{ height:"100%", width:`${pct}%`, borderRadius:20, background:status?.color, transition:"width 0.5s ease" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:11, color:D.textMuted }}>{pct.toFixed(0)}% {isTarget?"dari target":"dari batas"}</span>
            <span style={{ fontSize:11, fontWeight:700, color:status?.color }}>
              {isTarget
                ? (sisa<=0?`✅ Lebih ${fmt(Math.abs(sisa))}`:` Kurang ${fmt(sisa)}`)
                : (sisa<0 ?`⚠ Lebih ${fmt(Math.abs(sisa))}`:` Sisa ${fmt(sisa)}`)}
            </span>
          </div>
          {status && (
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px", borderRadius:10, marginBottom:10, background:status.good?D.income.dim:D.outcome.dim, border:`1px solid ${status.good?D.income.border:D.outcome.border}` }}>
              <i className={`ti ${status.icon}`} style={{ fontSize:13, color:status.color, flexShrink:0 }} />
              <span style={{ fontSize:12, fontWeight:600, color:status.color }}>{status.label}</span>
            </div>
          )}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:11, color:D.textMuted }}>
              {isTarget?"Target:":"Batas:"} <span style={{ color:D.textSec, fontWeight:600 }}>{fmt(budget)}</span>
            </span>
            <button onClick={() => { setEditing(true); setInput(String(budget)); }} style={{ fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:8, background:D.surfaceHi, color:D.textSec, border:`1px solid ${D.border}`, cursor:"pointer" }}>
              <i className="ti ti-edit" style={{ fontSize:11, marginRight:4 }} />Ubah
            </button>
          </div>
        </>
      ) : (
        <p style={{ margin:"0 0 8px", fontSize:12, color:D.textMuted, textAlign:"center" }}>
          {isTarget?"Belum ada target untuk kategori ini.":"Belum ada batas maksimal untuk kategori ini."}
        </p>
      )}

      {(editing || budget === 0) && (
        <div style={{ marginTop:budget>0?12:0, display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ position:"relative", flex:1 }}>
            <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:12, color:D.textSec, fontWeight:600 }}>Rp</span>
            <input type="number" min="0" step="10000" placeholder={budget>0?String(budget):"Contoh: 2000000"} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter"&&save()} style={{ paddingLeft:34, fontSize:13, fontWeight:600, background:D.surfaceHi, color:D.textPri, border:`1.5px solid ${D.border}` }} />
          </div>
          <button onClick={save} style={{ padding:"10px 16px", borderRadius:10, fontWeight:700, fontSize:13, background:D.accent, color:"#FFFFFF", border:"none", cursor:"pointer", boxShadow:`0 0 12px ${D.accent}55`, whiteSpace:"nowrap" }}>
            {budget>0?"Simpan":isTarget?"Set Target":"Set Batas"}
          </button>
          {budget > 0 && (
            <button onClick={() => { setEditing(false); setInput(""); }} style={{ padding:"10px 12px", borderRadius:10, fontSize:13, background:D.surfaceHi, color:D.textSec, border:`1px solid ${D.border}`, cursor:"pointer" }}>
              <i className="ti ti-x" style={{ fontSize:14 }} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Budget({ txs, budgets, saveBudget}) {
  const D = getTheme()
  const [month, setMonth] = useState(nowYM());

  const months   = [...new Set([nowYM(), ...txs.map(t => getYM(t.date))])].sort((a,b) => b.localeCompare(a));
  const filtered = txs.filter(t => getYM(t.date) === month);
  const sum      = filtered.reduce((a,t) => ({ ...a, [t.category]:(a[t.category]||0)+t.amount }), {});

  const cumulativeUpTo = (cat) => txs.filter(t => t.category===cat && getYM(t.date)<=month).reduce((s,t) => s+t.amount, 0);
  const getActual  = (cat) => (cat==="saving"||cat==="asset") ? cumulativeUpTo(cat) : (sum[cat]||0);
  const getBudget  = (cat) => budgets[`${month}-${cat}`] || 0;
  const onSetBudget = (cat, val) => saveBudget(`${month}-${cat}`, val);

  const totalSet  = Object.keys(CATS).filter(k => getBudget(k) > 0).length;
  const totalGood = Object.keys(CATS).filter(k => {
    const b = getBudget(k), a = getActual(k);
    if (!b) return false;
    return BUDGET_TYPE[k]==="limit" ? a<=b : a>=b;
  }).length;

  const topBarBg = "rgba(0,0,0,0.95)";

  return (
    <div style={{ minHeight:"100vh", background:D.bg }}>
      <div style={{ background:topBarBg, backdropFilter:"blur(12px)", borderBottom:`1px solid ${D.border}`, padding:"14px 20px", position:"sticky", top:0, zIndex:10 }}>
        <h1 style={{ margin:0, fontSize:17, fontWeight:800, color:D.textPri, display:"flex", alignItems:"center", gap:8 }}>
          <i className="ti ti-target" style={{ fontSize:18, color:D.accent }} />Budget & Target
        </h1>
        <p style={{ margin:"2px 0 0", fontSize:11, color:D.textMuted }}>Pemasukan / Tabungan / Aset = Target · Pengeluaran = Batas Maksimal</p>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"20px 16px 24px" }}>

        {/* Month Pills */}
        <div style={{ display:"flex", gap:7, overflowX:"auto", paddingBottom:4, marginBottom:16, scrollbarWidth:"none" }}>
          {months.map(m => {
            const active = month === m;
            return (
              <button key={m} onClick={() => setMonth(m)} style={{ flexShrink:0, padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:700, background:active?D.accent:D.surfaceUp, color:active?"#FFFFFF":D.textSec, border:active?"none":`1.5px solid ${D.border}`, transition:"all 0.15s", cursor:"pointer", boxShadow:active?`0 0 12px ${D.accent}55`:"none" }}>
                {ymShort(m)}
              </button>
            );
          })}
        </div>

        {/* Summary */}
        {totalSet > 0 && (
          <div style={{ background:totalGood===totalSet?D.income.dim:D.outcome.dim, borderRadius:18, padding:"18px 20px", marginBottom:16, border:`1.5px solid ${totalGood===totalSet?D.income.border:D.outcome.border}`, boxShadow:`0 0 20px ${totalGood===totalSet?D.income.glow:D.outcome.glow}` }}>
            <p style={{ margin:"0 0 6px", fontSize:11, fontWeight:700, color:D.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Ringkasan · {ymFull(month)}</p>
            <p style={{ margin:"0 0 4px", fontSize:22, fontWeight:800, color:totalGood===totalSet?D.income.solid:D.saving.solid }}>
              {totalGood} dari {totalSet} <span style={{ fontSize:13, color:D.textMuted, fontWeight:500 }}>target/batas terpenuhi</span>
            </p>
            <p style={{ margin:0, fontSize:12, color:D.textMuted }}>
              {totalGood===totalSet?"🏆 Semua target & batas terpenuhi bulan ini!":"📊 Terus pantau yang belum terpenuhi."}
            </p>
          </div>
        )}

        {/* Legend */}
        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          {[
            { color:D.income.solid,  bg:D.income.dim,  border:D.income.border,  label:"🎯 Target — semakin tinggi semakin baik" },
            { color:D.outcome.solid, bg:D.outcome.dim, border:D.outcome.border, label:"🚫 Batas Max — jangan sampai lewat" },
          ].map((l,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 11px", borderRadius:20, background:l.bg, border:`1px solid ${l.border}` }}>
              <span style={{ fontSize:11, color:l.color, fontWeight:600 }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Cards */}
        {Object.keys(CATS).map(cat => (
          <BudgetCard key={cat} cat={cat} actual={getActual(cat)} budget={getBudget(cat)} onSetBudget={onSetBudget} D={D} />
        ))}

        <div style={{ marginTop:16, padding:"12px 16px", borderRadius:12, background:D.surfaceUp, border:`1px solid ${D.border}` }}>
          <p style={{ margin:0, fontSize:11, color:D.textMuted, lineHeight:1.7 }}>
            <i className="ti ti-info-circle" style={{ marginRight:5, fontSize:12 }} />
            Budget berlaku untuk bulan <strong style={{ color:D.textSec }}>{ymFull(month)}</strong> saja. Setiap bulan bisa diatur berbeda.
          </p>
        </div>
      </div>
    </div>
  );
}
