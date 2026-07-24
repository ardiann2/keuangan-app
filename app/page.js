'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
      else router.replace('/auth')
    })
  }, [router])


  return (
    <div style={{ minHeight: '100vh', background:'#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color:'#444' }}>
      <i className="ti ti-loader-2" style={{ fontSize: 32, color:'#6366F1'  }} />
      <span style={{ fontSize: 14 }}>Memuat data...</span>
    </div>
  )
}
