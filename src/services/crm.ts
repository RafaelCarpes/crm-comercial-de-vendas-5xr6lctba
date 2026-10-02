import pb from '@/lib/pocketbase/client'
import { LeadRecord, InteractionRecord, StatusHistoryRecord, UserRecord } from '@/types/crm'

export const leadsService = {
  async getLeads(): Promise<LeadRecord[]> {
    return pb.collection('leads').getFullList<LeadRecord>({
      sort: '-created',
      expand: 'owner',
    })
  },

  async getLeadById(id: string): Promise<LeadRecord> {
    return pb.collection('leads').getOne<LeadRecord>(id, {
      expand: 'owner',
    })
  },

  async createLead(data: Partial<LeadRecord>): Promise<LeadRecord> {
    const record = await pb.collection('leads').create<LeadRecord>(data, {
      expand: 'owner',
    })
    return record
  },

  async updateLead(id: string, data: Partial<LeadRecord>): Promise<LeadRecord> {
    const record = await pb.collection('leads').update<LeadRecord>(id, data, {
      expand: 'owner',
    })
    return record
  },

  async deleteLead(id: string): Promise<boolean> {
    return pb.collection('leads').delete(id)
  },

  async updateLeadStatus(
    id: string,
    newStatus: LeadRecord['status'],
    oldStatus: LeadRecord['status'],
  ): Promise<LeadRecord> {
    const updatedLead = await pb.collection('leads').update<LeadRecord>(
      id,
      { status: newStatus },
      {
        expand: 'owner',
      },
    )

    try {
      const currentUserId = pb.authStore.record?.id
      await pb.collection('status_history').create({
        lead: id,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: currentUserId || null,
      })
    } catch (e) {
      console.error('Erro ao registrar histórico de status:', e)
    }

    return updatedLead
  },
}

export const interactionsService = {
  async getByLead(leadId: string): Promise<InteractionRecord[]> {
    return pb.collection('interactions').getFullList<InteractionRecord>({
      filter: `lead = "${leadId}"`,
      sort: '-created',
      expand: 'author',
    })
  },

  async getAllInteractions(): Promise<InteractionRecord[]> {
    return pb.collection('interactions').getFullList<InteractionRecord>({
      sort: '-created',
      expand: 'author,lead',
    })
  },

  async create(data: {
    lead: string
    type: InteractionRecord['type']
    description: string
    author?: string
  }): Promise<InteractionRecord> {
    return pb.collection('interactions').create<InteractionRecord>(
      {
        ...data,
        author: data.author || pb.authStore.record?.id,
      },
      {
        expand: 'author',
      },
    )
  },

  async delete(id: string): Promise<boolean> {
    return pb.collection('interactions').delete(id)
  },
}

export const statusHistoryService = {
  async getByLead(leadId: string): Promise<StatusHistoryRecord[]> {
    return pb.collection('status_history').getFullList<StatusHistoryRecord>({
      filter: `lead = "${leadId}"`,
      sort: '-created',
      expand: 'changed_by',
    })
  },
}

export const usersService = {
  async getUsers(): Promise<UserRecord[]> {
    return pb.collection('users').getFullList<UserRecord>({
      sort: 'name',
    })
  },
}
