import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { leadsService } from '@/services/crm'
import { LeadRecord, LeadStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/crm'
import { DollarSign, Layers } from 'lucide-react'

const PIPELINE_COLUMNS: LeadStatus[] = [
  'new',
  'contacted',
  'negotiation',
  'proposal',
  'client',
  'lost',
]

export default function Kanban() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState<LeadRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null)

  // Mobile selected column view
  const [mobileSelectedStatus, setMobileSelectedStatus] = useState<LeadStatus>('new')

  const loadLeads = async () => {
    try {
      const data = await leadsService.getLeads()
      setLeads(data)
    } catch (err) {
      console.error('Erro ao buscar leads do Kanban:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLeads()
  }, [])

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id)
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverColumn !== status) {
      setDragOverColumn(status)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault()
    setDragOverColumn(null)

    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId
    if (!leadId) return

    const lead = leads.find((l) => l.id === leadId)
    if (!lead || lead.status === targetStatus) {
      setDraggedLeadId(null)
      return
    }

    const oldStatus = lead.status

    // Optimistic update
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: targetStatus } : l)))
    setDraggedLeadId(null)

    try {
      await leadsService.updateLeadStatus(leadId, targetStatus, oldStatus)
    } catch (err) {
      console.error('Erro ao mover status no banco:', err)
      // Revert on failure
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: oldStatus } : l)))
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#10B981] border-t-transparent" />
          <p className="text-sm font-medium text-gray-500">Montando quadro Kanban...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Mobile filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1F2937]">Quadro de Oportunidades</h2>
          <p className="text-xs text-gray-500">
            Arraste os cards entre as fases para atualizar o status e registrar histórico de vendas.
          </p>
        </div>

        {/* Mobile View Selector */}
        <div className="block sm:hidden">
          <label className="text-xs font-semibold text-gray-600 block mb-1">
            Fase Atual no Mobile:
          </label>
          <select
            value={mobileSelectedStatus}
            onChange={(e) => setMobileSelectedStatus(e.target.value as LeadStatus)}
            className="h-10 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 text-xs font-semibold text-[#1F2937] focus:border-[#10B981] focus:outline-none"
          >
            {PIPELINE_COLUMNS.map((st) => {
              const count = leads.filter((l) => l.status === st).length
              return (
                <option key={st} value={st}>
                  {STATUS_LABELS[st]} ({count})
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {/* Desktop & Tablet: Horizontal Scrollable Columns */}
      <div className="hidden sm:flex gap-4 overflow-x-auto pb-6 pt-1">
        {PIPELINE_COLUMNS.map((status) => {
          const colLeads = leads.filter((l) => l.status === status)
          const colConf = STATUS_COLORS[status]
          const isOver = dragOverColumn === status

          const totalValue = colLeads.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0)

          return (
            <div
              key={status}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
              className={`flex flex-col w-[290px] shrink-0 rounded-2xl border transition-all duration-200 ${
                isOver
                  ? 'border-[#10B981] ring-2 ring-emerald-500/20 bg-emerald-50/20'
                  : 'border-[#E5E7EB] bg-[#F9FAFB]/70'
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-gray-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: colConf.hex }}
                  />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    {STATUS_LABELS[status]}
                  </h3>
                </div>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-gray-600 shadow-2xs border border-gray-200">
                  {colLeads.length}
                </span>
              </div>

              {/* Column Subhead: Total Value */}
              <div className="px-3.5 py-1.5 text-[11px] text-gray-400 font-medium border-b border-gray-100 flex items-center justify-between">
                <span>Total estimado</span>
                <span className="font-semibold text-gray-700">
                  {totalValue > 0
                    ? `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
                    : 'R$ 0'}
                </span>
              </div>

              {/* Column Cards Container (Vertical Scroll) */}
              <div className="flex-1 p-3 space-y-3 min-h-[460px] max-h-[70vh] overflow-y-auto">
                {colLeads.length === 0 ? (
                  <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 p-4 text-center">
                    <Layers className="h-6 w-6 text-gray-300" />
                    <p className="mt-1 text-xs text-gray-400">Nenhum lead nesta fase</p>
                  </div>
                ) : (
                  colLeads.map((lead) => {
                    const initial = lead.name.charAt(0).toUpperCase()
                    const isBeingDragged = draggedLeadId === lead.id

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => navigate(`/leads/${lead.id}`)}
                        className={`group relative cursor-grab rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-xs transition-all duration-150 hover:shadow-md hover:border-gray-300 active:cursor-grabbing ${
                          isBeingDragged ? 'opacity-40 scale-[1.02] shadow-xl' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-[#1F2937] group-hover:text-[#1E40AF] transition line-clamp-1">
                            {lead.name}
                          </h4>
                          {/* Circular Avatar with Initial */}
                          <div
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-2xs"
                            style={{ backgroundColor: colConf.hex }}
                          >
                            {initial}
                          </div>
                        </div>

                        <p className="mt-1 text-[11px] text-gray-500 line-clamp-1">
                          {lead.company || 'Sem empresa'}
                        </p>

                        <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-2 text-xs">
                          <div className="flex items-center gap-1 font-bold text-gray-700">
                            <DollarSign className="h-3 w-3 text-emerald-500" />
                            <span>
                              {lead.estimated_value
                                ? lead.estimated_value.toLocaleString('pt-BR', {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  })
                                : '0'}
                            </span>
                          </div>

                          <span className="text-[10px] font-medium text-gray-400">
                            {new Date(lead.created).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile Vertical View (Below sm) */}
      <div className="sm:hidden space-y-3">
        {leads
          .filter((l) => l.status === mobileSelectedStatus)
          .map((lead) => {
            const initial = lead.name.charAt(0).toUpperCase()
            const conf = STATUS_COLORS[lead.status]

            return (
              <div
                key={lead.id}
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="cursor-pointer rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#1F2937]">{lead.name}</h4>
                    <p className="text-xs text-gray-500">{lead.company || 'Sem empresa'}</p>
                  </div>
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-2xs"
                    style={{ backgroundColor: conf.hex }}
                  >
                    {initial}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-xs">
                  <span className="font-semibold text-emerald-600">
                    {lead.estimated_value
                      ? `R$ ${lead.estimated_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : 'R$ 0,00'}
                  </span>
                  <span className="text-gray-400">
                    {new Date(lead.created).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            )
          })}

        {leads.filter((l) => l.status === mobileSelectedStatus).length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-xs text-gray-400">
            Nenhum lead nesta fase selecionada.
          </div>
        )}
      </div>
    </div>
  )
}
