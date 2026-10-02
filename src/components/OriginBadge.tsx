import React from 'react'
import { Globe, Share2, UserPlus, Megaphone, CalendarClock } from 'lucide-react'
import { ORIGIN_LABELS, LeadOrigin } from '@/types/crm'

interface OriginBadgeProps {
  origin: LeadOrigin
  showIconOnly?: boolean
  className?: string
}

export const OriginBadge: React.FC<OriginBadgeProps> = ({
  origin,
  showIconOnly = false,
  className = '',
}) => {
  const getIcon = () => {
    switch (origin) {
      case 'site':
        return <Globe className="h-3.5 w-3.5 text-blue-500" />
      case 'social':
        return <Share2 className="h-3.5 w-3.5 text-indigo-500" />
      case 'indication':
        return <UserPlus className="h-3.5 w-3.5 text-emerald-500" />
      case 'outbound':
        return <Megaphone className="h-3.5 w-3.5 text-amber-500" />
      case 'events':
        return <CalendarClock className="h-3.5 w-3.5 text-purple-500" />
      default:
        return <Globe className="h-3.5 w-3.5 text-gray-500" />
    }
  }

  const label = ORIGIN_LABELS[origin] || origin

  if (showIconOnly) {
    return (
      <span title={label} className={`inline-flex items-center ${className}`}>
        {getIcon()}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-gray-600 ${className}`}>
      {getIcon()}
      <span>{label}</span>
    </span>
  )
}
