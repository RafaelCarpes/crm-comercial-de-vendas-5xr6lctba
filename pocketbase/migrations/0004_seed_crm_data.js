migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const leadsCol = app.findCollectionByNameOrId('leads')
    const interactionsCol = app.findCollectionByNameOrId('interactions')
    const statusHistoryCol = app.findCollectionByNameOrId('status_history')

    // 1. Seed or find user rafaelcarpes@hotmail.com
    let userRecord
    try {
      userRecord = app.findAuthRecordByEmail('_pb_users_auth_', 'rafaelcarpes@hotmail.com')
    } catch (_) {
      userRecord = new Record(users)
      userRecord.setEmail('rafaelcarpes@hotmail.com')
      userRecord.setPassword('Skip@Pass')
      userRecord.setVerified(true)
      userRecord.set('name', 'Rafael Carpes')
      app.save(userRecord)
    }

    // 2. Seed 10 realistic leads
    const seedLeads = [
      {
        name: 'Carlos Eduardo Silva',
        email: 'carlos.silva@techprime.com.br',
        phone: '(11) 98765-4321',
        company: 'TechPrime Soluções',
        position: 'Diretor de Operações',
        origin: 'site',
        estimated_value: 35000,
        notes: 'Interesse em modernização do pipeline comercial corporativo.',
        status: 'new',
      },
      {
        name: 'Mariana Duarte',
        email: 'm.duarte@inovarelog.com',
        phone: '(21) 99123-4567',
        company: 'Inovare Logística',
        position: 'Gerente Geral',
        origin: 'social',
        estimated_value: 18500,
        notes: 'Chegou via campanha no LinkedIn. Busca controle de rotas comerciais.',
        status: 'contacted',
      },
      {
        name: 'Rodrigo Alcantara',
        email: 'rodrigo@nexofinancas.com.br',
        phone: '(31) 98456-7890',
        company: 'Nexo Serviços Financeiros',
        position: 'CFO',
        origin: 'indication',
        estimated_value: 75000,
        notes: 'Indicação do grupo Alfa. Reunião de alinhamento orçamentário agendada.',
        status: 'negotiation',
      },
      {
        name: 'Camila Fernandes',
        email: 'camila.f@biovita.com.br',
        phone: '(41) 99876-1122',
        company: 'BioVita Distribuidora',
        position: 'Coordenadora de Compras',
        origin: 'outbound',
        estimated_value: 42000,
        notes: 'Proposta comercial enviada para aprovação do conselho.',
        status: 'proposal',
      },
      {
        name: 'Guilherme Peixoto',
        email: 'guilherme@luminaengenharia.com.br',
        phone: '(19) 98234-5678',
        company: 'Lumina Engenharia',
        position: 'Sócio-Diretor',
        origin: 'events',
        estimated_value: 120000,
        notes: 'Contrato assinado após participação no Fórum de Infraestrutura.',
        status: 'client',
      },
      {
        name: 'Juliana Prado',
        email: 'juliana@horizontevarejo.com.br',
        phone: '(51) 99654-3210',
        company: 'Horizonte Varejo',
        position: 'Gerente de TI',
        origin: 'site',
        estimated_value: 28000,
        notes: 'Optaram por adiar o projeto para o próximo ano fiscal.',
        status: 'lost',
      },
      {
        name: 'Felipe Montenegro',
        email: 'felipe@agiliscorp.com',
        phone: '(61) 98112-9988',
        company: 'Agilis Tecnologia',
        position: 'CTO',
        origin: 'outbound',
        estimated_value: 58000,
        notes: 'Validação técnica de arquitetura em andamento.',
        status: 'negotiation',
      },
      {
        name: 'Beatriz Lins',
        email: 'beatriz@sollarconsultoria.com.br',
        phone: '(71) 99345-6712',
        company: 'Sollar Consultoria Empresarial',
        position: 'Head de Vendas',
        origin: 'indication',
        estimated_value: 22000,
        notes: 'Lead muito engajada, solicitou demonstração detalhada.',
        status: 'contacted',
      },
      {
        name: 'Thiago Barreto',
        email: 'thiago@apexlog.com.br',
        phone: '(81) 98877-2233',
        company: 'Apex Soluções Logísticas',
        position: 'Diretor Comercial',
        origin: 'events',
        estimated_value: 95000,
        notes: 'Proposta final em revisão pelo departamento jurídico.',
        status: 'proposal',
      },
      {
        name: 'Renata Albuquerque',
        email: 'renata@vanguardaalimentos.com.br',
        phone: '(47) 99788-3344',
        company: 'Vanguarda Alimentos',
        position: 'Diretora Executiva',
        origin: 'social',
        estimated_value: 150000,
        notes: 'Cliente ativo com contrato anual fechado e onboarding concluído.',
        status: 'client',
      },
    ]

    const createdLeadRecords = []

    for (let i = 0; i < seedLeads.length; i++) {
      const item = seedLeads[i]
      let leadRecord
      try {
        leadRecord = app.findFirstRecordByData('leads', 'email', item.email)
      } catch (_) {
        leadRecord = new Record(leadsCol)
        leadRecord.set('name', item.name)
        leadRecord.set('email', item.email)
        leadRecord.set('phone', item.phone)
        leadRecord.set('company', item.company)
        leadRecord.set('position', item.position)
        leadRecord.set('origin', item.origin)
        leadRecord.set('estimated_value', item.estimated_value)
        leadRecord.set('notes', item.notes)
        leadRecord.set('status', item.status)
        leadRecord.set('owner', userRecord.id)
        app.save(leadRecord)
      }
      createdLeadRecords.push(leadRecord)
    }

    // 3. Seed 3 interactions for distinct leads
    if (createdLeadRecords.length >= 3) {
      const seedInteractions = [
        {
          leadIndex: 1, // Mariana Duarte
          type: 'call',
          description:
            'Primeira ligação de qualificação realizada. Lead demonstrou alto interesse e solicitou apresentação executiva por email.',
        },
        {
          leadIndex: 2, // Rodrigo Alcantara
          type: 'meeting',
          description:
            'Reunião virtual realizada com o CFO e equipe contábil. Apresentamos o modelo de ROI e cronograma.',
        },
        {
          leadIndex: 3, // Camila Fernandes
          type: 'email',
          description:
            'Envio formal da proposta comercial número VF-2025-042 com tabela de preços especiais para compra anual.',
        },
      ]

      for (let j = 0; j < seedInteractions.length; j++) {
        const interData = seedInteractions[j]
        const targetLead = createdLeadRecords[interData.leadIndex]
        try {
          app.findFirstRecordByData('interactions', 'description', interData.description)
        } catch (_) {
          const interRecord = new Record(interactionsCol)
          interRecord.set('lead', targetLead.id)
          interRecord.set('type', interData.type)
          interRecord.set('description', interData.description)
          interRecord.set('author', userRecord.id)
          app.save(interRecord)
        }
      }

      // 4. Seed 3 status history records for distinct leads
      const seedStatusHistory = [
        {
          leadIndex: 1, // Mariana Duarte
          old_status: 'new',
          new_status: 'contacted',
        },
        {
          leadIndex: 2, // Rodrigo Alcantara
          old_status: 'contacted',
          new_status: 'negotiation',
        },
        {
          leadIndex: 4, // Guilherme Peixoto
          old_status: 'proposal',
          new_status: 'client',
        },
      ]

      for (let k = 0; k < seedStatusHistory.length; k++) {
        const shData = seedStatusHistory[k]
        const targetLead = createdLeadRecords[shData.leadIndex]
        // Check if already seeded by lead and statuses
        const existing = app.findRecordsByFilter(
          'status_history',
          `lead = "${targetLead.id}" && old_status = "${shData.old_status}" && new_status = "${shData.new_status}"`,
          '-created',
          1,
          0,
        )

        if (!existing || existing.length === 0) {
          const shRecord = new Record(statusHistoryCol)
          shRecord.set('lead', targetLead.id)
          shRecord.set('old_status', shData.old_status)
          shRecord.set('new_status', shData.new_status)
          shRecord.set('changed_by', userRecord.id)
          app.save(shRecord)
        }
      }
    }
  },
  (app) => {
    // down migration
  },
)
