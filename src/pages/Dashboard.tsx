import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, UserCheck, TrendingUp, Percent, ArrowUpRight, ChevronRight } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { leadsService } from '@/services/crm'
import { LeadRecord, STATUS_LABELS, ORIGIN_LABELS } from '@/types/crm'
import { StatusBadge } from '@/components/StatusBadge'

export default function Dashboard() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState<LeadRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    leadsService
      .getLeads()
      .then((data) => {
        if (isMounted) {
          setLeads(data)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar leads no dashboard:', err)
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Compute metrics
  const totalLeads = leads.length

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const newThisMonth = leads.filter((l) => {
    const d = new Date(l.created)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }).length

  const conversions = leads.filter((l) => l.status === 'client').length
  const conversionRate = totalLeads > 0 ? ((conversions / totalLeads) * 100).toFixed(1) : '0'

  // Funnel distribution data
  const pipelineOrder: Array<LeadRecord['status']> = [
    'new',
    'contacted',
    'negotiation',
    'proposal',
    'client',
    'lost',
  ]

  const statusColorsMap: Record<LeadRecord['status'], string> = {
    new: '#3B82F6',
    contacted: '#EAB308',
    negotiation: '#F59E0B',
    proposal: '#8B5CF6',
    client: '#10B981',
    lost: '#EF4444',
  }

  const funnelData = pipelineOrder.map((st) => ({
    name: STATUS_LABELS[st],
    count: leads.filter((l) => l.status === st).length,
    fill: statusColorsMap[st],
  }))

  // Evolution last 6 months
  const monthsNames = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ]
  const evolutionData = []
  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date()
    targetDate.setMonth(targetDate.getMonth() - i)
    const m = targetDate.getMonth()
    const y = targetDate.getFullYear()

    const count = leads.filter((l) => {
      const d = new Date(l.created)
      return d.getMonth() === m && d.getFullYear() === y
    }).length

    evolutionData.push({
      month: `${monthsNames[m]}/${String(y).slice(-2)}`,
      leads: count,
    })
  }

  // Origin distribution data
  const originColors: Record<string, string> = {
    site: '#1E40AF',
    social: '#3B82F6',
    indication: '#10B981',
    outbound: '#F59E0B',
    events: '#8B5CF6',
  }

  const originKeys = ['site', 'social', 'indication', 'outbound', 'events'] as const
  const originData = originKeys
    .map((orig) => {
      const count = leads.filter((l) => l.origin === orig).length
      return {
        name: ORIGIN_LABELS[orig],
        value: count,
        color: originColors[orig],
      }
    })
    .filter((item) => item.value > 0)

  // Recent 5 leads
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    .slice(0, 5)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#10B981] border-t-transparent" />
          <p className="text-sm font-medium text-gray-500">Atualizando indicadores comerciais...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div
          className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition hover:shadow-md animate-fade-in-up"
          style={{ animationDelay: '0ms' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Leads Totais
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[#1F2937]">{totalLeads}</span>
            <span className="flex items-center text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="h-3.5 w-3.5" />
              +12% vs mês anterior
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition hover:shadow-md animate-fade-in-up"
          style={{ animationDelay: '50ms' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Novos (Mês)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#10B981]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[#1F2937]">{newThisMonth}</span>
            <span className="text-xs font-medium text-gray-500">Neste mês atual</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div
          className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition hover:shadow-md animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Conversões (Clientes)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[#1F2937]">{conversions}</span>
            <span className="text-xs font-medium text-emerald-600">Fechamentos ativos</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div
          className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition hover:shadow-md animate-fade-in-up"
          style={{ animationDelay: '150ms' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Taxa de Conversão
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Percent className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[#1F2937]">
              {conversionRate}%
            </span>
            <span className="text-xs font-medium text-gray-500">Do total de leads</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Funnel Chart */}
        <div
          className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm animate-fade-in-up"
          style={{ animationDelay: '200ms' }}
        >
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#1F2937]">Funil Comercial por Status</h2>
            <p className="text-xs text-[#6B7280]">Distribuição atual dos leads em cada estágio</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={funnelData}
                margin={{ top: 10, right: 20, left: 30, bottom: 5 }}
              >
                <XAxis type="number" allowDecimals={false} stroke="#9CA3AF" fontSize={11} />
                <YAxis dataKey="name" type="category" width={110} stroke="#4B5563" fontSize={11} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  formatter={(value: number) => [`${value} leads`, 'Quantidade']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evolution Chart */}
        <div
          className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm animate-fade-in-up"
          style={{ animationDelay: '250ms' }}
        >
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#1F2937]">
              Evolução de Leads (Últimos 6 meses)
            </h2>
            <p className="text-xs text-[#6B7280]">
              Volume de novos contatos registrados ao longo do tempo
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1E40AF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} />
                <YAxis allowDecimals={false} stroke="#9CA3AF" fontSize={11} />
                <Tooltip
                  formatter={(val: number) => [`${val} cadastrados`, 'Leads']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#1E40AF"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorLeads)"
                  dot={{ r: 4, fill: '#1E40AF' }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row: Donut Chart & Recent Leads */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Origin Donut */}
        <div
          className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm animate-fade-in-up lg:col-span-1"
          style={{ animationDelay: '300ms' }}
        >
          <div className="mb-2">
            <h2 className="text-base font-bold text-[#1F2937]">Origem dos Leads</h2>
            <p className="text-xs text-[#6B7280]">Canais com maior atração de oportunidades</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={originData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {originData.map((entry, index) => (
                    <Cell key={`donut-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val} leads`, 'Total']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-gray-700">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5 Recent Leads Table */}
        <div
          className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm animate-fade-in-up lg:col-span-2"
          style={{ animationDelay: '350ms' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1F2937]">Leads Mais Recentes</h2>
              <p className="text-xs text-[#6B7280]">Últimas oportunidades ingressadas no sistema</p>
            </div>
            <button
              onClick={() => navigate('/leads')}
              className="flex items-center gap-1 text-xs font-semibold text-[#1E40AF] hover:text-[#1E3A8A] hover:underline"
            >
              Ver todos os leads
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-[#F9FAFB] text-[11px] font-semibold uppercase text-gray-500">
                  <th className="py-2.5 px-3">Nome</th>
                  <th className="py-2.5 px-3">Empresa</th>
                  <th className="py-2.5 px-3">E-mail</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-gray-400">
                      Nenhum lead cadastrado ainda.
                    </td>
                  </tr>
                ) : (
                  recentLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => navigate(`/leads/${lead.id}`)}
                      className="cursor-pointer transition-colors hover:bg-gray-50/80"
                    >
                      <td className="py-3 px-3 font-semibold text-[#1F2937]">{lead.name}</td>
                      <td className="py-3 px-3 text-xs text-gray-600">{lead.company || '—'}</td>
                      <td className="py-3 px-3 text-xs text-gray-500">{lead.email || '—'}</td>
                      <td className="py-3 px-3">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="py-3 px-3 text-right text-xs text-gray-400">
                        {new Date(lead.created).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
