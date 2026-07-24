'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Dashboard from '@/components/Dashboard'
import Analytics from '@/components/Analytics'
import Budget    from '@/components/Budget'
import Settings  from '@/components/Settings'

async function apiFetch(path, method = 'GET', body = null) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  const res = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : null,
  })
  return res.json()
}

function BottomNav({ page, setPage }) {
  const bg      =  'rgba(0,0,0,0.96)'     
  const border  =  '#2A2A2A'           
  const accent  = '#818CF8'                
  const muted   ='#444444'               

  const items = [
    { id: 'dashboard', icon: 'ti-home-2',    label: 'Beranda'    },
    { id: 'analytics', icon: 'ti-chart-bar', label: 'Analitik'   },
    { id: 'budget',    icon: 'ti-target',    label: 'Budget'     },
    { id: 'settings',  icon: 'ti-settings',  label: 'Pengaturan' },
  ]
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: bg, backdropFilter: 'blur(16px)',
      borderTop: `1px solid ${border}`,
      display: 'flex', padding: '10px 0 12px',
    }}>
      {items.map(item => {
        const active = page === item.id
        return (
          <button key={item.id} onClick={() => setPage(item.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer',
            color: active ? accent : muted, transition: 'color 0.15s',
          }}>
            <i className={`ti ${item.icon}`} style={{
              fontSize: 22,
              filter: active ? `drop-shadow(0 0 6px ${accent})` : 'none',
              transition: 'filter 0.15s',
            }} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: '0.02em' }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function DashboardPage() {
  const router             = useRouter()
  const [user,    setUser]    = useState(null)
  const [txs,     setTxs]     = useState([])
  const [budgets, setBudgets] = useState({})
  const [page,setPage] = useState(()=>{
  if(typeof window !== 'undefined'){
    return localStorage.getItem('activePage') || 'dashboard'
  }
  return 'dashboard'
  })
  const changePage=(value)=>{
  setPage(value)
  localStorage.setItem('activePage',value)
  }
  const [loading, setLoading] = useState(true)
  const isDark = true
  const hasFetched = useRef(false)  // ← kunci: hanya fetch sekali

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [txData, budgetData] = await Promise.all([
        apiFetch('/api/transactions'),
        apiFetch('/api/budgets'),
      ])
      if (Array.isArray(txData)) setTxs(txData)
      if (budgetData && !budgetData.error) setBudgets(budgetData)
    } catch (err) {
      console.error('loadData error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setUser(session.user)
      if (!hasFetched.current) {
        hasFetched.current = true
        loadData()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && !hasFetched.current) {
        localStorage.removeItem('activePage')
        setPage('dashboard')
        hasFetched.current = true
        setUser(session.user)
        loadData()
      }
      if (!session) router.push('/auth')
    })

    return () => subscription.unsubscribe()
  }, [loadData, router])

  /* CRUD Transaksi */
  const addTx = async ({ amount, category, description }) => {
    try {
      const date = new Date().toISOString()
      const data = await apiFetch('/api/transactions', 'POST', { amount, category, description, date })
      if (data && !data.error) {
        setTxs(prev => [data, ...prev])
        return data.date.slice(0, 7)
      }
    } catch (err) {
      console.error('addTx error:', err)
    }
  }

  const updateTx = async (id, updates) => {
    const data = await apiFetch('/api/transactions', 'PUT', { id, ...updates })
    if (data && !data.error) {
      setTxs(prev => prev.map(t => t.id === id ? data : t))
    }
  }

  const deleteTx = async (id) => {
    await apiFetch('/api/transactions', 'DELETE', { id })
    setTxs(prev => prev.filter(t => t.id !== id))
  }

  const deleteAll = async () => {
    for (const tx of txs) {
      await apiFetch('/api/transactions', 'DELETE', { id: tx.id })
    }
    await apiFetch('/api/budgets', 'DELETE')
    setTxs([])
    setBudgets({})
  }

  const saveBudget = async (key, amount) => {
    await apiFetch('/api/budgets', 'POST', { key, amount })
    setBudgets(prev => ({ ...prev, [key]: amount }))
  }

  const handleRestore = async ({ transactions: newTxs, budgets: newBudgets }) => {
    if (newTxs) {
      for (const tx of txs) await apiFetch('/api/transactions', 'DELETE', { id: tx.id })
      const inserted = []
      for (const tx of newTxs) {
        const data = await apiFetch('/api/transactions', 'POST', {
          amount: tx.amount, category: tx.category,
          description: tx.description, date: tx.date,
        })
        if (data && !data.error) inserted.push(data)
      }
      setTxs(inserted)
    }
    if (newBudgets) {
      for (const [key, amount] of Object.entries(newBudgets)) {
        await saveBudget(key, amount)
      }
    }
  }

  const handleLogout = async () => {
    localStorage.removeItem('activePage')

    await supabase.auth.signOut()

    router.replace('/auth')
  }

  const toggleTheme = () => {
    setIsDark(v => !v)
  }

  const bgColor = '#000000' 

  if (loading) return (
    <div style={{ minHeight: '100vh', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color:'#444' }}>
      <i className="ti ti-loader-2" style={{ fontSize: 32, color:'#6366F1'  }} />
      <span style={{ fontSize: 14 }}>Memuat data...</span>
    </div>
  )

  const shared = { txs, budgets, addTx, updateTx, deleteTx, saveBudget, }

  return (
    <div style={{ background: bgColor, minHeight: '100vh', paddingBottom: 72 }}>
      {page === 'dashboard' && <Dashboard {...shared} />}
      {page === 'analytics' && <Analytics txs={txs}  />}
      {page === 'budget'    && <Budget    {...shared} />}
      {page === 'settings'  && (
        <Settings
          txs={txs}
          budgets={budgets}
          onLogout={handleLogout}
          onDeleteAll={deleteAll}
          userEmail={user?.email}
        />
      )}
      <BottomNav page={page} setPage={changePage} />
    </div>
  )
}
