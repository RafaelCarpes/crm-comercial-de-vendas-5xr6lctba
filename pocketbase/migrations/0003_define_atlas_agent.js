migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'atlas-assistente',
      name: 'Atlas',
      description: 'Assistente interno de inteligência e vendas do VendaForte CRM.',
      systemPrompt:
        'Você é o Atlas, o assistente de vendas interno do VendaForte CRM. Fale português do Brasil, seja profissional, claro e direto. Ajude o usuário a consultar informações sobre leads, interações, status do pipeline e métricas de vendas. Sempre cite a origem das informações mencionando o nome do lead, empresa ou dados relevantes para dar total contexto às respostas.',
      tier: 'fast',
      tools: [
        {
          collection: 'leads',
          perms: { read: true, list: true },
        },
        {
          collection: 'interactions',
          perms: { read: true, list: true },
        },
        {
          collection: 'status_history',
          perms: { read: true, list: true },
        },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text: 'VendaForte CRM é um sistema focado em acompanhamento de pipeline de vendas, histórico de interações e métricas com os status: Novo (new), Contato Realizado (contacted), Em Negociação (negotiation), Proposta Enviada (proposal), Cliente (client) e Perdido (lost).',
          },
        },
      ],
    })
  },
  (app) => {
    try {
      $ai.agents.delete(app, 'atlas-assistente')
    } catch (_) {}
  },
)
