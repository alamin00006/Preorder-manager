'use client'

interface StatusBadgeProps {
  status: 'active' | 'inactive'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        status === 'active'
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-600'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'active' ? 'bg-green-500' : 'bg-gray-400'
        }`}
      />
      {status === 'active' ? 'Active' : 'Inactive'}
    </span>
  )
}
