import { Lead, ActivitiesResponse } from '../types'
import { API_BASE_URL } from './config'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  console.log('Local base url:', url)
  console.log('HERE')
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    // Network or other errors
    throw new ApiError(0, error instanceof Error ? error.message : 'Unknown error')
  }
}

export const leadsApi = {
  // Get all leads
  async getLeads(): Promise<Lead[]> {
    console.log('HERE')
    return apiRequest<Lead[]>('/api/leads')
  },

  // Create a new lead
  async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'score' | 'company_profile_id'>): Promise<Lead> {
    return apiRequest<Lead>('/api/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    })
  },

  // Update a lead
  async updateLead(id: number, updates: Partial<Lead>): Promise<Lead> {
    return apiRequest<Lead>(`/api/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  // Delete a lead
  async deleteLead(id: number): Promise<void> {
    await apiRequest<void>(`/api/leads/${id}`, {
      method: 'DELETE',
    })
  },

  // Import leads from CSV
  async importLeads(file: File): Promise<{ message: string; imported_count: number; failed_count: number }> {
    const formData = new FormData()
    formData.append('file', file)

    return apiRequest<{ message: string; imported_count: number; failed_count: number }>('/api/leads/import', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    })
  },

  // Seed database with sample leads
  async seedLeads(): Promise<{ message: string; total_leads: number }> {
    return apiRequest<{ message: string; total_leads: number }>('/api/leads/seed', {
      method: 'POST',
    })
  },

  async getActivities(leadId: number, params?: {
    type?: string
    limit?: number
    offset?: number
  }): Promise<ActivitiesResponse> {
    const url = new URL(`${API_BASE_URL}/api/leads/${leadId}/activities`)
    
    if (params?.type) {
      url.searchParams.append('type', params.type)
    }
    if (params?.limit) {
      url.searchParams.append('limit', params.limit.toString())
    }
    if (params?.offset) {
      url.searchParams.append('offset', params.offset.toString())
    }
    
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new ApiError(response.status, `Failed to fetch activities: ${response.statusText}`)
    }
    
    return response.json()
  },

  async scoreLead(leadId: number): Promise<{
    message: string
    lead_id: number
    total_score: number
    breakdown: any[]
    factors: string[]
  }> {
    const response = await fetch(`${API_BASE_URL}/api/leads/${leadId}/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new ApiError(response.status, `Failed to score lead: ${response.statusText}`)
    }
    
    return response.json()
  },

  async qualifyLead(leadId: number): Promise<{
    message: string
    lead_id: number
    verdict: string
    confidence: number
    reasoning: string
    factors: string[]
  }> {
    const response = await fetch(`${API_BASE_URL}/api/leads/${leadId}/qualify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new ApiError(response.status, `Failed to qualify lead: ${response.statusText}`)
    }
    
    return response.json()
  },

  async generateOutreach(leadId: number, context?: string): Promise<{
    message: string
    lead_id: number
    subject: string
    body: string
    variants: Array<{ subject: string; body: string }>
  }> {
    const requestBody = context ? { context } : undefined
    
    const response = await fetch(`${API_BASE_URL}/api/leads/${leadId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    })
    
    if (!response.ok) {
      throw new ApiError(response.status, `Failed to generate outreach: ${response.statusText}`)
    }
    
    return response.json()
  }
}
