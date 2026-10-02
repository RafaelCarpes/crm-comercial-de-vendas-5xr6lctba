import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { LeadRecord, LeadOrigin, ORIGIN_LABELS } from '@/types/crm'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<LeadRecord>) => Promise<void>
  initialData?: LeadRecord | null
}

export const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [origin, setOrigin] = useState<LeadOrigin>('site')
  const [estimatedValue, setEstimatedValue] = useState<string>('')
  const [notes, setNotes] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setEmail(initialData.email || '')
      setPhone(initialData.phone || '')
      setCompany(initialData.company || '')
      setPosition(initialData.position || '')
      setOrigin(initialData.origin || 'site')
      setEstimatedValue(initialData.estimated_value ? String(initialData.estimated_value) : '')
      setNotes(initialData.notes || '')
    } else {
      setName('')
      setEmail('')
      setPhone('')
      setCompany('')
      setPosition('')
      setOrigin('site')
      setEstimatedValue('')
      setNotes('')
    }
    setErrors({})
  }, [initialData, isOpen])

  if (!isOpen) return null

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) {
      newErrors.name = 'Nome Completo é obrigatório.'
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Formato de e-mail inválido.'
    }
    if (estimatedValue && isNaN(Number(estimatedValue))) {
      newErrors.estimatedValue = 'O valor estimado deve ser um número válido.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSave({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        position: position.trim() || undefined,
        origin,
        estimated_value: estimatedValue ? Number(estimatedValue) : undefined,
        notes: notes.trim() || undefined,
        status: initialData ? initialData.status : 'new',
      })
      onClose()
    } catch (err) {
      console.error('Erro ao salvar lead:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-[#1F2937]">
              {initialData ? 'Editar Lead' : 'Cadastrar Novo Lead'}
            </h2>
            <p className="text-xs text-gray-500">
              Preencha as informações do contato para alimentar o pipeline de vendas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Nome */}
          <div>
            <Label htmlFor="lead-name" className="text-xs font-semibold text-[#1F2937]">
              Nome Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lead-name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
              }}
              placeholder="Ex: Carlos Eduardo Silva"
              className={`mt-1 focus-visible:border-[#10B981] focus-visible:ring-emerald-500/20 ${
                errors.name ? 'border-red-500' : ''
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Email */}
            <div>
              <Label htmlFor="lead-email" className="text-xs font-semibold text-[#1F2937]">
                E-mail
              </Label>
              <Input
                id="lead-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
                }}
                placeholder="carlos@empresa.com.br"
                className={`mt-1 focus-visible:border-[#10B981] focus-visible:ring-emerald-500/20 ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Telefone */}
            <div>
              <Label htmlFor="lead-phone" className="text-xs font-semibold text-[#1F2937]">
                Telefone / WhatsApp
              </Label>
              <Input
                id="lead-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="mt-1 focus-visible:border-[#10B981] focus-visible:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Empresa */}
            <div>
              <Label htmlFor="lead-company" className="text-xs font-semibold text-[#1F2937]">
                Empresa
              </Label>
              <Input
                id="lead-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ex: TechPrime Soluções"
                className="mt-1 focus-visible:border-[#10B981] focus-visible:ring-emerald-500/20"
              />
            </div>

            {/* Cargo */}
            <div>
              <Label htmlFor="lead-position" className="text-xs font-semibold text-[#1F2937]">
                Cargo / Função
              </Label>
              <Input
                id="lead-position"
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Ex: Diretor de Operações"
                className="mt-1 focus-visible:border-[#10B981] focus-visible:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Origem */}
            <div>
              <Label htmlFor="lead-origin" className="text-xs font-semibold text-[#1F2937]">
                Origem do Lead
              </Label>
              <select
                id="lead-origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value as LeadOrigin)}
                className="mt-1 flex h-10 w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#1F2937] focus:border-[#10B981] focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
              >
                {(Object.keys(ORIGIN_LABELS) as LeadOrigin[]).map((key) => (
                  <option key={key} value={key}>
                    {ORIGIN_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>

            {/* Valor Estimado */}
            <div>
              <Label htmlFor="lead-value" className="text-xs font-semibold text-[#1F2937]">
                Valor Estimado (R$)
              </Label>
              <Input
                id="lead-value"
                type="number"
                step="0.01"
                value={estimatedValue}
                onChange={(e) => {
                  setEstimatedValue(e.target.value)
                  if (errors.estimatedValue) setErrors((prev) => ({ ...prev, estimatedValue: '' }))
                }}
                placeholder="Ex: 35000"
                className={`mt-1 focus-visible:border-[#10B981] focus-visible:ring-emerald-500/20 ${
                  errors.estimatedValue ? 'border-red-500' : ''
                }`}
              />
              {errors.estimatedValue && (
                <p className="mt-1 text-xs text-red-500">{errors.estimatedValue}</p>
              )}
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="lead-notes" className="text-xs font-semibold text-[#1F2937]">
              Observações / Contexto Comercial
            </Label>
            <textarea
              id="lead-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione detalhes sobre dores do cliente, expectativas ou informações de contato..."
              className="mt-1 flex w-full rounded-md border border-[#D1D5DB] bg-white p-3 text-sm text-[#1F2937] placeholder:text-gray-400 focus:border-[#10B981] focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-[#D1D5DB] bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:border-[#10B981] hover:text-[#10B981] transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-[#10B981] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#059669] transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : null}
              {initialData ? 'Atualizar Lead' : 'Salvar Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
