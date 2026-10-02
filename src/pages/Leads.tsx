import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, X, User, Filter } from 'lucide-react'
import { leadsService, interactionsService, usersService } from '@/services/crm'
import {
  LeadRecord,
  InteractionRecord,
  UserRecord,
  LeadStatus,
  LeadOrigin,
  STATUS_LABELS,
  ORIGIN_LABELS,
} from '@/types/crm'
import { StatusBadge } from '@/components/StatusBadge'
import { OriginBadge } from '@/components/OriginBadge'
import { LeadModal } from '@/components/LeadModal'

export default function Leads() {
  const navigate = useNavigate()

  const [leads, setLeads] = useState<LeadRecord[]>([])
  const [interactions, setInteractions] = useState<InteractionRecord[]>([])
  const [users, setUsers] = useState<UserRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [originFilter, setOriginFilter] = useState<string>('all')
  const [ownerFilter, setOwnerFilter] = useState<string>('all')

  // Modal create/edit
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadData = async () => {
    try {
      const [leadsData, interData, usersData] = await Promise.all([
        leadsService.getLeads(),
        interactionsService.getAllInteractions(),
        usersService.getUsers(),
      ])
      setLeads(leadsData)
      setInteractions(interData)
      setUsers(usersData)
    } catch (err) {
      console.error('Erro ao carregar lista de leads:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    statusFilter !== 'all' ||
    originFilter !== 'all' ||
    ownerFilter !== 'all'

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setOriginFilter('all')
    setOwnerFilter('all')
  }

  // Find last interaction per lead
  const lastInteractionMap = useMemo(() => {
    const map = new Map<string, string>()
    interactions.forEach((inter) => {
      if (!map.has(inter.lead)) {
        map.set(inter.lead, inter.created)
      }
    })
    return map
  }, [interactions])

  // Client-side filtering
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Text search in name or company
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchesName = lead.name.toLowerCase().includes(query)
        const matchesCompany = (lead.company || '').toLowerCase().includes(query)
        if (!matchesName && !matchesCompany) return false
      }

      // Status filter
      if (statusFilter !== 'all' && lead.status !== statusFilter) {
        return false
      }

      // Origin filter
      if (originFilter !== 'all' && lead.origin !== originFilter) {
        return false
      }

      // Owner filter
      if (ownerFilter !== 'all') {
        if (lead.owner !== ownerFilter) return false
      }

      return true
    })
  }, [leads, searchTerm, statusFilter, originFilter, ownerFilter])

  const handleCreateLead = async (data: Partial<LeadRecord>) => {
    await leadsService.createLead(data)
    await loadData()
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Filter Bar */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#D1D5DB] pl-9 pr-3 text-xs text-[#1F2937] placeholder:text-gray-400 focus:border-[#10B981] focus:outline-none focus:ring-3 focus:ring-emerald-500/20"
              />
            </div>

            {/* Status Dropdown */}
            <div className="min-w-[150px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 text-xs text-[#1F2937] focus:border-[#10B981] focus:outline-none focus:ring-3 focus:ring-emerald-500/20"
              >
                <option value="all">Status: Todos</option>
                {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((st) => (
                  <option key={st} value={st}>
                    {STATUS_LABELS[st]}
                  </option>
                ))}
              </select>
            </div>

            {/* Origin Dropdown */}
            <div className="min-w-[150px]">
              <select
                value={originFilter}
                onChange={(e) => setOriginFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 text-xs text-[#1F2937] focus:border-[#10B981] focus:outline-none focus:ring-3 focus:ring-emerald-500/20"
              >
                <option value="all">Origem: Todas</option>
                {(Object.keys(ORIGIN_LABELS) as LeadOrigin[]).map((orig) => (
                  <option key={orig} value={orig}>
                    {ORIGIN_LABELS[orig]}
                  </option>
                ))}
              </select>
            </div>

            {/* Owner Dropdown */}
            <div className="min-w-[160px]">
              <select
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 text-xs text-[#1F2937] focus:border-[#10B981] focus:outline-none focus:ring-3 focus:ring-emerald-500/20"
              >
                <option value="all">Responsável: Todos</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
              >
                <X className="h-3.5 w-3.5" />
                Limpar Filtros
              </button>
            )}
          </div>

          <div className="text-xs text-gray-500 font-medium shrink-0">
            {filteredLeads.length}{' '}
            {filteredLeads.length === 1 ? 'lead encontrado' : 'leads encontrados'}
          </div>
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#10B981] border-t-transparent" />
              <p className="text-sm font-medium text-gray-500">Carregando leads cadastrados...</p>
            </div>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <Filter className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-gray-700">
              Nenhum lead corresponde aos filtros
            </h3>
            <p className="mt-1 text-xs text-gray-500 max-w-sm">
              Tente redefinir os parâmetros de pesquisa ou cadastre uma nova oportunidade no botão
              abaixo.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-[#10B981] px-4 py-2 text-xs font-semibold text-white hover:bg-[#059669]"
              >
                Limpar filtros aplicados
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-[#F9FAFB] text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">Empresa</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4 hidden md:table-cell">Telefone</th>
                  <th className="py-3 px-4">Origem</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Responsável</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Valor (R$)</th>
                  <th className="py-3 px-4 text-right hidden sm:table-cell">Última Interação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredLeads.map((lead) => {
                  const lastInteractionDate = lastInteractionMap.get(lead.id)
                  const formattedValue = lead.estimated_value
                    ? lead.estimated_value.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : '—'

                  const ownerName = lead.expand?.owner?.name || lead.expand?.owner?.email || '—'

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => navigate(`/leads/${lead.id}`)}
                      className="cursor-pointer transition-colors hover:bg-gray-50/80"
                    >
                      {/* Nome */}
                      <td className="py-3 px-4 font-semibold text-[#1F2937]">
                        <div>{lead.name}</div>
                        {lead.position && (
                          <div className="text-[11px] font-normal text-gray-500 md:hidden">
                            {lead.position}
                          </div>
                        )}
                      </td>

                      {/* Empresa */}
                      <td className="py-3 px-4 text-xs text-gray-600">{lead.company || '—'}</td>

                      {/* Email */}
                      <td className="py-3 px-4 text-xs text-gray-500">{lead.email || '—'}</td>

                      {/* Telefone */}
                      <td className="py-3 px-4 text-xs text-gray-500 hidden md:table-cell">
                        {lead.phone || '—'}
                      </td>

                      {/* Origem */}
                      <td className="py-3 px-4">
                        <OriginBadge origin={lead.origin} />
                      </td>

                      {/* Responsável */}
                      <td className="py-3 px-4 text-xs text-gray-600 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          <span>{ownerName}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <StatusBadge status={lead.status} />
                      </td>

                      {/* Valor */}
                      <td className="py-3 px-4 text-right text-xs font-semibold text-[#1F2937]">
                        {formattedValue !== '—' ? `R$ ${formattedValue}` : '—'}
                      </td>

                      {/* Última Interação */}
                      <td className="py-3 px-4 text-right text-xs text-gray-400 hidden sm:table-cell">
                        {lastInteractionDate
                          ? new Date(lastInteractionDate).toLocaleDateString('pt-BR')
                          : 'Sem registro'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) at Bottom Right */}
      <button
        onClick={() => setIsModalOpen(true)}
        aria-label="Criar Novo Lead"
        title="Cadastrar Lead"
        className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#059669] focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* Modal for creating a new lead */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateLead}
      />
    </div>
  )
}
