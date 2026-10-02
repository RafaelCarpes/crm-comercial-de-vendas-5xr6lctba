import React, { useState, useEffect, useRef } from 'react'
import { Send, Plus, Bot, User, MessageSquare, ArrowLeft, Sparkles, BookOpen } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import {
  streamAgentChat,
  displayableMessages,
  AgentMessage,
  DisplayMessage,
  AgentCitation,
} from '@/lib/skipAi'

interface ConversationItem {
  id: string
  title?: string
  created: string
  updated: string
}

export default function AgendaIA() {
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingDelta, setStreamingDelta] = useState('')
  const [streamingCitations, setStreamingCitations] = useState<AgentCitation[]>([])

  // Mobile navigation between conversation list and chat
  const [mobileShowChat, setMobileShowChat] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingDelta])

  // Load previous conversations
  const loadConversations = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/chats?limit=30`, {
        headers: {
          Authorization: pb.authStore.token,
        },
      })
      if (res.ok) {
        const data = await res.json()
        // data can be array or object with conversations
        const list = Array.isArray(data) ? data : data.conversations || []
        setConversations(list)
      }
    } catch (err) {
      console.error('Erro ao listar conversas da IA:', err)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])

  // Load messages for the selected conversation
  const loadMessages = async (convId: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/chats/${convId}/messages`,
        {
          headers: {
            Authorization: pb.authStore.token,
          },
        },
      )
      if (res.ok) {
        const data = await res.json()
        const rawMsgs: AgentMessage[] = Array.isArray(data) ? data : data.messages || []
        setMessages(displayableMessages(rawMsgs))
      }
    } catch (err) {
      console.error('Erro ao carregar mensagens da conversa:', err)
    }
  }

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId)
    setMobileShowChat(true)
    loadMessages(convId)
  }

  const handleNewConversation = () => {
    setActiveConversationId(null)
    setMessages([])
    setStreamingDelta('')
    setStreamingCitations([])
    setMobileShowChat(true)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const prompt = inputMessage.trim()
    if (!prompt || isStreaming) return

    // Add user message to local state immediately
    const userMsg: DisplayMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      created: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInputMessage('')
    setIsStreaming(true)
    setStreamingDelta('')
    setStreamingCitations([])

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const res = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/ask-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: pb.authStore.token,
        },
        body: JSON.stringify({
          message: prompt,
          conversation_id: activeConversationId || null,
        }),
        signal: controller.signal,
      })

      const result = await streamAgentChat(res, {
        onChunk: (_delta, full) => {
          setStreamingDelta(full)
        },
        onCitations: (citations) => {
          setStreamingCitations(citations)
        },
        signal: controller.signal,
      })

      const newConvId = res.headers.get('X-Conversation-Id') || result.conversation_id
      if (!activeConversationId && newConvId) {
        setActiveConversationId(newConvId)
        loadConversations()
      }

      // Append completed assistant response
      const assistantMsg: DisplayMessage = {
        id: result.message_id || `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.content,
        citations: result.citations,
        created: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err: unknown) {
      console.error('Erro no stream do agente Atlas:', err)
      const errMsg = (err as Error)?.message || 'Erro ao processar resposta do assistente.'
      const fallbackMsg: DisplayMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Desculpe, ocorreu uma falha na consulta: ${errMsg}`,
        created: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, fallbackMsg])
    } finally {
      setIsStreaming(false)
      setStreamingDelta('')
      setStreamingCitations([])
      abortControllerRef.current = null
    }
  }

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[550px] rounded-2xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
      {/* Left Column: Conversations List (Desktop or Mobile List view) */}
      <div
        className={`w-full md:w-80 shrink-0 border-r border-[#E5E7EB] bg-[#F9FAFB] flex flex-col ${
          mobileShowChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* New Conversation Button */}
        <div className="p-4 border-b border-gray-200/80">
          <button
            onClick={handleNewConversation}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#059669] transition"
          >
            <Plus className="h-4 w-4" />
            Nova Conversa
          </button>
        </div>

        {/* Previous threads */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Histórico de Conversas
          </div>
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400">Nenhuma conversa anterior.</div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId
              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full text-left rounded-xl p-3 text-xs transition-colors ${
                    isActive
                      ? 'bg-white text-[#1F2937] font-semibold shadow-xs border border-gray-200'
                      : 'text-gray-600 hover:bg-gray-200/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{conv.title || 'Consulta de Vendas'}</span>
                  </div>
                  <div className="mt-1 text-[10px] text-gray-400">
                    {new Date(conv.created).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Right Column: Chat Screen */}
      <div
        className={`flex-1 flex flex-col bg-white ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}
      >
        {/* Chat Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#E5E7EB] px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Back Button */}
            <button
              onClick={() => setMobileShowChat(false)}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 md:hidden"
              aria-label="Voltar para lista de conversas"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#10B981]">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1F2937] flex items-center gap-1.5">
                Assistente de Vendas
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                  Atlas IA
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">
                Conectado à base de leads, interações e funil de vendas
              </p>
            </div>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F9FAFB]/40">
          {messages.length === 0 && !isStreaming ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#10B981] shadow-xs mb-4">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-[#1F2937]">Como posso ajudar hoje?</h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                Eu tenho acesso completo a todos os dados do CRM e posso analisar métricas, resumir
                históricos de contatos e sugerir prioridades para o seu time.
              </p>

              <div className="mt-6 flex flex-col gap-2 w-full text-left">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Sugestões de perguntas:
                </p>
                {[
                  'Quantos leads estão em negociação atualmente?',
                  'Quem são os leads com maior valor estimado?',
                  'Quais interações foram registradas recentemente?',
                  'Resuma o status da negociação com a Inovare Logística.',
                ].map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => setInputMessage(sug)}
                    className="rounded-lg border border-gray-200 bg-white p-2.5 text-xs text-gray-700 hover:border-[#10B981] hover:text-[#10B981] transition text-left"
                  >
                    "{sug}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isUser = msg.role === 'user'
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                  >
                    {!isUser && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0B1220] text-[#10B981] shadow-2xs">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-[#10B981] text-white rounded-br-xs font-medium'
                          : 'bg-white text-[#1F2937] border border-[#E5E7EB] rounded-bl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* Citations if available */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 border-t border-gray-100 pt-2 space-y-1">
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase">
                            <BookOpen className="h-3 w-3" />
                            Origem dos dados citados:
                          </span>
                          {msg.citations.map((c, idx) => (
                            <div
                              key={idx}
                              className="rounded-md bg-gray-50 p-2 text-[11px] text-gray-600 border border-gray-100"
                            >
                              {c.excerpt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-2xs">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Streaming in progress */}
              {isStreaming && (
                <div className="flex gap-3 justify-start animate-fade-in-up">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0B1220] text-[#10B981] shadow-2xs">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs bg-white text-[#1F2937] border border-[#E5E7EB] rounded-bl-xs">
                    {streamingDelta ? (
                      <div className="whitespace-pre-wrap">{streamingDelta}</div>
                    ) : (
                      <div className="flex items-center gap-1.5 py-1">
                        <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                        <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                        <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
                      </div>
                    )}

                    {streamingCitations.length > 0 && (
                      <div className="mt-3 border-t border-gray-100 pt-2 space-y-1">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase">
                          Fontes:
                        </span>
                        {streamingCitations.map((c, idx) => (
                          <div
                            key={idx}
                            className="rounded-md bg-gray-50 p-1.5 text-[10px] text-gray-600"
                          >
                            {c.excerpt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-[#E5E7EB] bg-white">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Pergunte sobre seus leads..."
              value={inputMessage}
              disabled={isStreaming}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 h-11 rounded-xl border border-[#D1D5DB] px-4 text-xs text-[#1F2937] placeholder:text-gray-400 focus:border-[#10B981] focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isStreaming || !inputMessage.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#10B981] text-white shadow-xs hover:bg-[#059669] transition disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
              aria-label="Enviar mensagem"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
