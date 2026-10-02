import React from 'react'
import { STATUS_LABELS, STATUS_COLORS, LeadStatus } from '@/types/crm'

interface StatusBadgeProps {
  status: LeadStatus
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const conf = STATUS_COLORS[status] || STATUS_COLORS.new
  const label = STATUS_LABELS[status] || status

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${conf.bg} ${conf.text} ${conf.border} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${conf.dot}`} />
      {label}
    </span>
  )
}
