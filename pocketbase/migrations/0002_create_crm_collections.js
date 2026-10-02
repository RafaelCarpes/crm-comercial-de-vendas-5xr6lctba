migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // 1. Collection: leads
    const leadsCollection = new Collection({
      name: 'leads',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'company', type: 'text' },
        { name: 'position', type: 'text' },
        {
          name: 'origin',
          type: 'select',
          required: true,
          values: ['site', 'social', 'indication', 'outbound', 'events'],
          maxSelect: 1,
        },
        { name: 'estimated_value', type: 'number' },
        { name: 'notes', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['new', 'contacted', 'negotiation', 'proposal', 'client', 'lost'],
          maxSelect: 1,
        },
        {
          name: 'owner',
          type: 'relation',
          collectionId: users.id,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_leads_status ON leads (status)',
        'CREATE INDEX idx_leads_created ON leads (created DESC)',
      ],
    })
    app.save(leadsCollection)

    const savedLeadsCol = app.findCollectionByNameOrId('leads')

    // 2. Collection: interactions
    const interactionsCollection = new Collection({
      name: 'interactions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'lead',
          type: 'relation',
          required: true,
          collectionId: savedLeadsCol.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['call', 'email', 'meeting', 'note'],
          maxSelect: 1,
        },
        { name: 'description', type: 'text', required: true },
        {
          name: 'author',
          type: 'relation',
          collectionId: users.id,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_interactions_lead ON interactions (lead)'],
    })
    app.save(interactionsCollection)

    // 3. Collection: status_history
    const statusHistoryCollection = new Collection({
      name: 'status_history',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'lead',
          type: 'relation',
          required: true,
          collectionId: savedLeadsCol.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'old_status',
          type: 'select',
          required: true,
          values: ['new', 'contacted', 'negotiation', 'proposal', 'client', 'lost'],
          maxSelect: 1,
        },
        {
          name: 'new_status',
          type: 'select',
          required: true,
          values: ['new', 'contacted', 'negotiation', 'proposal', 'client', 'lost'],
          maxSelect: 1,
        },
        {
          name: 'changed_by',
          type: 'relation',
          collectionId: users.id,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_status_history_lead ON status_history (lead)'],
    })
    app.save(statusHistoryCollection)
  },
  (app) => {
    try {
      const sh = app.findCollectionByNameOrId('status_history')
      app.delete(sh)
    } catch (_) {}
    try {
      const inter = app.findCollectionByNameOrId('interactions')
      app.delete(inter)
    } catch (_) {}
    try {
      const leads = app.findCollectionByNameOrId('leads')
      app.delete(leads)
    } catch (_) {}
  },
)
