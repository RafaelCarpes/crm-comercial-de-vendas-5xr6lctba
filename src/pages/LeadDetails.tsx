import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Building,
  Briefcase,
  DollarSign,
  Calendar,
  Plus,
  StickyNote,
  CalendarDays,
  User,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { leadsService, interactionsService, statusHistoryService } from '@/services/crm'
import {
  LeadRecord,
  InteractionRecord,
  StatusHistoryRecord,
  LeadStatus,
  InteractionType,
  STATUS_LABELS,
  INTERACTION_LABELS,
} from '@/types/crm'
import { StatusBadge } from '@/components/StatusBadge'
import { OriginBadge } from '@/components/OriginBadge'
import { LeadModal } from '@/components/LeadModal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function LeadDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [lead, setLead] = useState<LeadRecord | null>(null)
  const [interactions, setInteractions] = useState<InteractionRecord[]>([])
  const [statusHistory, setStatusHistory] = useState<StatusHistoryRecord[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'interactions' | 'history'>('overview')
  const [isLoading, setIsLoading] = useState(true)

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Inline interaction form
  const [showInteractionForm, setShowInteractionForm] = useState(false)
  const [interactionType, setInteractionType] = useState<InteractionType>('call')
  const [interactionDesc, setInteractionDesc] = useState('')
  const [isAddingInteraction, setIsAddingInteraction] = useState(false)

  const loadAll = async () => {
    if (!id) return
    try {
      const [leadData, interData, historyData] = await Promise.all([
        leadsService.getLeadById(id),
        interactionsService.getByLead(id),
        statusHistoryService.getByLead(id),
      ])
      setLead(leadData)
      setInteractions(interData)
      setStatusHistory(historyData)
    } catch (err) {
      console.error('Erro ao carregar detalhes do lead:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [id])

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead || lead.status === newStatus) return
    const oldStatus = lead.status
    try {
      const updated = await leadsService.updateLeadStatus(lead.id, newStatus, oldStatus)
      setLead(updated)
      // Reload history to reflect the new record
      const historyData = await statusHistoryService.getByLead(lead.id)
      setStatusHistory(historyData)
    } catch (err) {
      console.error('Erro ao alterar status:', err)
    }
  }

  const handleUpdateLead = async (data: Partial<LeadRecord>) => {
    if (!lead) return
    const updated = await leadsService.updateLead(lead.id, data)
    setLead(updated)
  }

  const handleDeleteLead = async () => {
    if (!lead) return
    setIsDeleting(true)
    try {
      await leadsService.deleteLead(lead.id)
      navigate('/leads')
    } catch (err) {
      console.error('Erro ao excluir lead:', err)
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lead || !interactionDesc.trim()) return

    setIsAddingInteraction(true)
    try {
      await interactionsService.create({
        lead: lead.id,
        type: interactionType,
        description: interactionDesc.trim(),
      })
      setInteractionDesc('')
      setShowInteractionForm(false)
      const interData = await interactionsService.getByLead(lead.id)
      setInteractions(interData)
    } catch (err) {
      console.error('Erro ao registrar interação:', err)
    } finally {
      setIsAddingInteraction(false)
    }
  }

  const getInteractionIcon = (type: InteractionType) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4 text-blue-500" />
      case 'email':
        return <Mail className="h-4 w-4 text-emerald-500" />
      case 'meeting':
        return <CalendarDays className="h-4 w-4 text-purple-500" />
      case 'note':
        return <StickyNote className="h-4 w-4 text-amber-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#10B981] border-t-transparent" />
          <p className="text-sm font-medium text-gray-500">Buscando histórico do lead...</p>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm font-semibold text-red-600">Lead não encontrado no banco de dados.</p>
        <button
          onClick={() => navigate('/leads')}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm border border-gray-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para listagem
        </button>
      </div>
    )
  }

  const formattedValue = lead.estimated_value
    ? lead.estimated_value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : 'Não informado'

  const ownerName = lead.expand?.owner?.name || lead.expand?.owner?.email || 'Não atribuído'

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb / Back button */}
      <div>
        <button
          onClick={() => navigate('/leads')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para Leads
        </button>
      </div>

      {/* Header Card */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#1F2937]">{lead.name}</h1>
              <StatusBadge status={lead.status} />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {lead.company ? `${lead.company}` : 'Empresa não vinculada'}
              {lead.position ? ` • ${lead.position}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Status Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Mudar status:</span>
              <select
                value={lead.status}
                onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                className="h-9 rounded-lg border border-[#D1D5DB] bg-white px-3 text-xs font-medium text-[#1F2937] focus:border-[#10B981] focus:outline-none focus:ring-3 focus:ring-emerald-500/20"
              >
                {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((st) => (
                  <option key={st} value={st}>
                    {STATUS_LABELS[st]}
                  </option>
                ))}
              </select>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:border-[#10B981] hover:text-[#10B981] transition shadow-xs"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </button>

            {/* Delete Button */}
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition shadow-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-[#10B981] text-[#10B981]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('interactions')}
            className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'interactions'
                ? 'border-[#10B981] text-[#10B981]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Interações
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {interactions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'history'
                ? 'border-[#10B981] text-[#10B981]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Histórico de Status
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {statusHistory.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab 1: Visão Geral */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Contact & Company Details */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-[#1F2937]">Informações de Contato</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">E-mail</span>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-800">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{lead.email || 'Não informado'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">Telefone</span>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-800">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{lead.phone || 'Não informado'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">Empresa</span>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-800">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span>{lead.company || 'Não informada'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">
                    Cargo / Função
                  </span>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-800">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span>{lead.position || 'Não informado'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Commercial Details */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-[#1F2937]">Dados da Oportunidade</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">Origem</span>
                  <div className="mt-1">
                    <OriginBadge origin={lead.origin} />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">Responsável</span>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-800">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{ownerName}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">
                    Valor Estimado
                  </span>
                  <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#1F2937]">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <span>
                      {formattedValue !== 'Não informado' ? `R$ ${formattedValue}` : formattedValue}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">
                    Data de Criação
                  </span>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-800">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{new Date(lead.created).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#1F2937]">Observações & Anotações</h2>
            <div className="mt-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {lead.notes || 'Nenhuma observação registrada até o momento.'}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Interações */}
      {activeTab === 'interactions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1F2937]">Timeline de Contatos</h2>
              <p className="text-xs text-gray-500">
                Histórico de ligações, reuniões e e-mails trocados
              </p>
            </div>
            {!showInteractionForm && (
              <button
                onClick={() => setShowInteractionForm(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#10B981] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#059669] transition"
              >
                <Plus className="h-4 w-4" />
                Nova Interação
              </button>
            )}
          </div>

          {/* Inline Form */}
          {showInteractionForm && (
            <div className="rounded-2xl border border-[#10B981]/30 bg-emerald-50/40 p-5 shadow-sm animate-fade-in-down">
              <h3 className="text-sm font-bold text-[#1F2937] mb-3">Registrar Nova Interação</h3>
              <form onSubmit={handleAddInteraction} className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Tipo de Interação</label>
                    <select
                      value={interactionType}
                      onChange={(e) => setInteractionType(e.target.value as InteractionType)}
                      className="mt-1 h-9 w-full rounded-md border border-[#D1D5DB] bg-white px-3 text-xs text-[#1F2937] focus:border-[#10B981] focus:outline-none"
                    >
                      {(Object.keys(INTERACTION_LABELS) as InteractionType[]).map((t) => (
                        <option key={t} value={t}>
                          {INTERACTION_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700">Descrição / Resumo</label>
                  <textarea
                    required
                    rows={3}
                    value={interactionDesc}
                    onChange={(e) => setInteractionDesc(e.target.value)}
                    placeholder="Descreva os tópicos discutidos, próximos passos e impressões..."
                    className="mt-1 flex w-full rounded-md border border-[#D1D5DB] bg-white p-3 text-xs text-[#1F2937] placeholder:text-gray-400 focus:border-[#10B981] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInteractionForm(false)}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingInteraction || !interactionDesc.trim()}
                    className="rounded-lg bg-[#10B981] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#059669] disabled:opacity-50"
                  >
                    {isAddingInteraction ? 'Salvando...' : 'Salvar Interação'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Interactions Timeline */}
          {interactions.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <StickyNote className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm font-semibold text-gray-700">
                Nenhuma interação registrada
              </p>
              <p className="text-xs text-gray-400">
                Clique em "Nova Interação" para adicionar a primeira.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
              {interactions.map((inter) => {
                const authorName =
                  inter.expand?.author?.name || inter.expand?.author?.email || 'Membro do time'
                return (
                  <div key={inter.id} className="relative group">
                    {/* Bullet */}
                    <div className="absolute -left-6 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-gray-200 shadow-xs">
                      {getInteractionIcon(inter.type)}
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-xs transition hover:shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-800">
                            {INTERACTION_LABELS[inter.type]}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 font-medium">{authorName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(inter.created).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {inter.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Histórico de Status */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="mb-2">
            <h2 className="text-base font-bold text-[#1F2937]">Mudanças de Fase no Pipeline</h2>
            <p className="text-xs text-gray-500">
              Histórico auditável de movimentação deste lead pelo funil
            </p>
          </div>

          {statusHistory.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <Clock className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm font-semibold text-gray-700">
                Sem alterações de status registradas
              </p>
              <p className="text-xs text-gray-400">O status inicial foi mantido desde a criação.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
              {statusHistory.map((item) => {
                const userWhoChanged =
                  item.expand?.changed_by?.name || item.expand?.changed_by?.email || 'Sistema'
                return (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-6 top-2 h-4 w-4 rounded-full border-2 border-white bg-[#10B981] shadow-xs" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-xs gap-2">
                      <div className="flex items-center gap-3">
                        <StatusBadge status={item.old_status} />
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <StatusBadge status={item.new_status} />
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>
                          Por:{' '}
                          <strong className="text-gray-600 font-medium">{userWhoChanged}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(item.created).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <LeadModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateLead}
        initialData={lead}
      />

      {/* Confirmation Dialog for Delete */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-[#1F2937]">
              Excluir Lead Permanentemente?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-gray-500">
              Esta ação não pode ser desfeita. Todos os dados associados a este lead, incluindo suas
              interações e histórico de status, serão removidos do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-lg border-gray-300 text-xs font-semibold"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLead}
              disabled={isDeleting}
              className="rounded-lg bg-red-600 text-xs font-semibold text-white hover:bg-red-700"
            >
              {isDeleting ? 'Excluindo...' : 'Sim, Excluir Lead'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
