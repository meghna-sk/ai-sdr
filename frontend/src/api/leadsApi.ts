import { Lead, ActivitiesResponse } from '../types'

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  let baseUrl = ''
  
  // First priority: Check for environment variable (this should work in Render)
  if (import.meta.env.VITE_API_BASE_URL) {
    baseUrl = import.meta.env.VITE_API_BASE_URL
  }
  // Fallback: Check if we're in production (deployed on Render)
  else if (window.location.hostname.includes('onrender.com')) {
    baseUrl = 'https://ai-sdr-k9ml.onrender.com'
  }
  // Default to localhost for local development
  else {
    baseUrl = 'http://localhost:8000'
  }
  
  // Ensure HTTPS is used in production (fix mixed content issues)
  if (window.location.protocol === 'https:' && baseUrl.startsWith('http:')) {
    baseUrl = baseUrl.replace('http:', 'https:')
  }
  
  return baseUrl
}

const API_BASE_URL = getApiBaseUrl()

// Debug logging
console.log('API Base URL:', API_BASE_URL)
console.log('Current hostname:', window.location.hostname)
console.log('Current protocol:', window.location.protocol)
console.log('Environment variable:', import.meta.env.VITE_API_BASE_URL)

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
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
