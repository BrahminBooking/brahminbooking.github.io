'use client'

import { useEffect, useState } from 'react'

export function CurrentDate() {
  const [label, setLabel] = useState('Local date')
  useEffect(() => {
    const timer = window.setTimeout(() => setLabel(new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())), 0)
    return () => window.clearTimeout(timer)
  }, [])
  return <time>{label}</time>
}
