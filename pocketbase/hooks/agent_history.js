routerAdd(
  'GET',
  '/backend/v1/chats',
  (e) => {
    try {
      const userId = e.auth?.id
      if (!userId) {
        return e.unauthorizedError('Autenticação necessária')
      }

      const limit = parseInt(e.requestInfo().query?.limit || '30', 10) || 30
      const conversations = $ai.agent('atlas-assistente').listConversations({
        user_id: userId,
        limit: limit,
      })

      return e.json(200, conversations)
    } catch (err) {
      if (err instanceof SkipAiAgentsError) {
        const status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'Falha ao buscar conversas' : err.message })
      }
      throw err
    }
  },
  $apis.requireAuth(),
)

routerAdd(
  'GET',
  '/backend/v1/chats/{conversationId}/messages',
  (e) => {
    try {
      const userId = e.auth?.id
      if (!userId) {
        return e.unauthorizedError('Autenticação necessária')
      }

      const conversationId = e.request.pathValue('conversationId')
      const messages = $ai.agent('atlas-assistente').listMessages({
        conversation_id: conversationId,
        user_id: userId,
        limit: 100,
      })

      return e.json(200, messages)
    } catch (err) {
      if (err instanceof SkipAiAgentsError) {
        const status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'Conversa não encontrada' : err.message })
      }
      throw err
    }
  },
  $apis.requireAuth(),
)
