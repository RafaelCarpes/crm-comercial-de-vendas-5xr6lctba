import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Target, CheckCircle2, AlertCircle } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('Token de verificação não encontrado na URL.')
      return
    }

    let isMounted = true
    pb.collection('users')
      .confirmVerification(token)
      .then(() => {
        if (isMounted) setStatus('success')
      })
      .catch((err) => {
        console.error('Erro na confirmação:', err)
        if (isMounted) {
          setStatus('error')
          setErrorMessage('Token de verificação inválido ou expirado.')
        }
      })

    return () => {
      isMounted = false
    }
  }, [token])

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F3F4F6] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1220] shadow-md">
            <Target className="h-6 w-6 text-[#10B981]" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#1F2937]">
            Verificação de E-mail
          </h1>
        </div>

        {status === 'verifying' && (
          <div className="space-y-4">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#10B981] border-t-transparent" />
            <p className="text-sm text-gray-600">Validando seu e-mail junto ao servidor...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-[#10B981]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-base font-semibold text-gray-800">E-mail confirmado com sucesso!</p>
            <p className="text-sm text-gray-600">
              Sua conta está ativa e pronta para uso no VendaForte CRM.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#10B981] py-2.5 text-sm font-semibold text-white hover:bg-[#059669]"
            >
              Ir para o Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <p className="text-base font-semibold text-gray-800">Falha na verificação</p>
            <p className="text-sm text-red-600">{errorMessage}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#10B981] py-2.5 text-sm font-semibold text-white hover:bg-[#059669]"
            >
              Ir para o Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
