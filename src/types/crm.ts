export type LeadOrigin = 'site' | 'social' | 'indication' | 'outbound' | 'events'

export type LeadStatus = 'new' | 'contacted' | 'negotiation' | 'proposal' | 'client' | 'lost'

export type InteractionType = 'call' | 'email' | 'meeting' | 'note'

export interface UserRecord {
  id: string
  email: string
  name: string
  avatar?: string
  created: string
  updated: string
}

export interface LeadRecord {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  position?: string
  origin: LeadOrigin
  estimated_value?: number
  notes?: string
  status: LeadStatus
  owner?: string
  expand?: {
    owner?: UserRecord
    'interactions(lead)'?: InteractionRecord[]
  }
  created: string
  updated: string
}

export interface InteractionRecord {
  id: string
  lead: string
  type: InteractionType
  description: string
  author?: string
  expand?: {
    author?: UserRecord
    lead?: LeadRecord
  }
  created: string
  updated: string
}

export interface StatusHistoryRecord {
  id: string
  lead: string
  old_status: LeadStatus
  new_status: LeadStatus
  changed_by?: string
  expand?: {
    changed_by?: UserRecord
  }
  created: string
  updated: string
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Novo',
  contacted: 'Contato Realizado',
  negotiation: 'Em Negociação',
  proposal: 'Proposta Enviada',
  client: 'Cliente',
  lost: 'Perdido',
}

export const STATUS_COLORS: Record<
  LeadStatus,
  { hex: string; bg: string; text: string; dot: string; border: string }
> = {
  new: {
    hex: '#3B82F6',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    border: 'border-blue-200',
  },
  contacted: {
    hex: '#EAB308',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500',
    border: 'border-yellow-200',
  },
  negotiation: {
    hex: '#F59E0B',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
  },
  proposal: {
    hex: '#8B5CF6',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
    border: 'border-purple-200',
  },
  client: {
    hex: '#10B981',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200',
  },
  lost: {
    hex: '#EF4444',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
    border: 'border-red-200',
  },
}

export const ORIGIN_LABELS: Record<LeadOrigin, string> = {
  site: 'Site',
  social: 'Redes Sociais',
  indication: 'Indicação',
  outbound: 'Outbound',
  events: 'Eventos',
}

export const INTERACTION_LABELS: Record<InteractionType, string> = {
  call: 'Ligação',
  email: 'E-mail',
  meeting: 'Reunião',
  note: 'Anotação',
}
