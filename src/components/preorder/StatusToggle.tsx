'use client'

import { useState } from 'react'

interface StatusToggleProps {
  id: string
  status: 'active' | 'inactive'
  onToggle: (id: string, newStatus: 'active' | 'inactive') => void
}

export function StatusToggle({ id, status, onToggle }: StatusToggleProps) {
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const newStatus = status === 'active' ? 'inactive' : 'active'
    try {
      const res = await fetch(`/api/preorders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        onToggle(id, newStatus)
      }
    } finally {
      setLoading(false)
    }
  }

  const isActive = status === 'active'

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 ${
        isActive ? 'bg-blue-600' : 'bg-gray-300'
      }`}
      title={isActive ? 'Set Inactive' : 'Set Active'}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          isActive ? 'translate-x-4' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
