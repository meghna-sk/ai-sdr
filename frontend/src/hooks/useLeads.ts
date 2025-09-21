import { useState, useEffect } from 'react'
import { Lead, Activity } from '../types'
import { leadsApi, ApiError } from '../api/leadsApi'

interface UseLeadsReturn {
  leads: Lead[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useLeads = (): UseLeadsReturn => {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeads = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await leadsApi.getLeads()
      setLeads(data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Failed to fetch leads: ${err.message}`)
      } else {
        setError('An unexpected error occurred')
      }
      console.error('Error fetching leads:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  return {
    leads,
    loading,
    error,
    refetch: fetchLeads,
  }
}

// Hook for creating a new lead
interface UseCreateLeadReturn {
  createLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'score' | 'company_profile_id'>) => Promise<Lead | null>
  creating: boolean
  error: string | null
}

export const useCreateLead = (): UseCreateLeadReturn => {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'score' | 'company_profile_id'>): Promise<Lead | null> => {
    try {
      setCreating(true)
      setError(null)
      const newLead = await leadsApi.createLead(leadData)
      return newLead
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Failed to create lead: ${err.message}`)
      } else {
        setError('An unexpected error occurred')
      }
      console.error('Error creating lead:', err)
      return null
    } finally {
      setCreating(false)
    }
  }

  return {
    createLead,
    creating,
    error,
  }
}

// Hook for seeding database with sample data
interface UseSeedLeadsReturn {
  seedLeads: () => Promise<void>
  seeding: boolean
  error: string | null
}

export const useSeedLeads = (): UseSeedLeadsReturn => {
  const [seeding, setSeeding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const seedLeads = async (): Promise<void> => {
    try {
      setSeeding(true)
      setError(null)
      await leadsApi.seedLeads()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Failed to seed leads: ${err.message}`)
      } else {
        setError('An unexpected error occurred')
      }
      console.error('Error seeding leads:', err)
    } finally {
      setSeeding(false)
    }
  }

  return {
    seedLeads,
    seeding,
    error,
  }
}

// Hook for importing CSV files
interface UseImportLeadsReturn {
  importLeads: (file: File) => Promise<{ success: boolean; message: string; imported_count?: number; failed_count?: number }>
  importing: boolean
  error: string | null
}

export const useImportLeads = (): UseImportLeadsReturn => {
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const importLeads = async (file: File): Promise<{ success: boolean; message: string; imported_count?: number; failed_count?: number }> => {
    try {
      setImporting(true)
      setError(null)
      const result = await leadsApi.importLeads(file)
      return {
        success: true,
        message: result.message,
        imported_count: result.imported_count,
        failed_count: result.failed_count,
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'An unexpected error occurred'
      setError(`Failed to import leads: ${errorMessage}`)
      return {
        success: false,
        message: errorMessage,
      }
    } finally {
      setImporting(false)
    }
  }

  return {
    importLeads,
    importing,
    error,
  }
}

// Hook for getting activities for a specific lead
interface UseActivitiesReturn {
  activities: Activity[]
  loading: boolean
  error: string | null
  total: number
  refetch: () => void
}

export const useActivities = (leadId: number, params?: {
  type?: string
  limit?: number
  offset?: number
}): UseActivitiesReturn => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchActivities = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await leadsApi.getActivities(leadId, params)
      setActivities(response.activities)
      setTotal(response.total)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'An unexpected error occurred'
      setError(`Failed to fetch activities: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (leadId) {
      fetchActivities()
    }
  }, [leadId, params?.type, params?.limit, params?.offset])

  return {
    activities,
    loading,
    error,
    total,
    refetch: fetchActivities,
  }
}

// Hook for scoring a lead
interface UseScoreLeadReturn {
  scoreLead: (leadId: number) => Promise<void>
  scoring: boolean
  error: string | null
  lastScoreResult: any | null
}

export const useScoreLead = (): UseScoreLeadReturn => {
  const [scoring, setScoring] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastScoreResult, setLastScoreResult] = useState<any | null>(null)

  const scoreLead = async (leadId: number) => {
    try {
      setScoring(true)
      setError(null)
      const result = await leadsApi.scoreLead(leadId)
      setLastScoreResult(result)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'An unexpected error occurred'
      setError(`Failed to score lead: ${errorMessage}`)
      throw err
    } finally {
      setScoring(false)
    }
  }

  return {
    scoreLead,
    scoring,
    error,
    lastScoreResult,
  }
}

// Hook for qualifying a lead with AI
interface UseQualifyLeadReturn {
  qualifyLead: (leadId: number) => Promise<void>
  qualifying: boolean
  error: string | null
  qualificationResult: any | null
}

export const useQualifyLead = (): UseQualifyLeadReturn => {
  const [qualifying, setQualifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qualificationResult, setQualificationResult] = useState<any | null>(null)

  const qualifyLead = async (leadId: number) => {
    try {
      setQualifying(true)
      setError(null)
      const result = await leadsApi.qualifyLead(leadId)
      setQualificationResult(result)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'An unexpected error occurred'
      setError(`Failed to qualify lead: ${errorMessage}`)
      throw err
    } finally {
      setQualifying(false)
    }
  }

  return {
    qualifyLead,
    qualifying,
    error,
    qualificationResult,
  }
}

// Hook for generating outreach with AI
interface UseGenerateOutreachReturn {
  generateOutreach: (leadId: number, context?: string) => Promise<void>
  generating: boolean
  error: string | null
  outreachResult: any | null
}

export const useGenerateOutreach = (): UseGenerateOutreachReturn => {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [outreachResult, setOutreachResult] = useState<any | null>(null)

  const generateOutreach = async (leadId: number, context?: string) => {
    try {
      setGenerating(true)
      setError(null)
      const result = await leadsApi.generateOutreach(leadId, context)
      setOutreachResult(result)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'An unexpected error occurred'
      setError(`Failed to generate outreach: ${errorMessage}`)
      throw err
    } finally {
      setGenerating(false)
    }
  }

  return {
    generateOutreach,
    generating,
    error,
    outreachResult,
  }
}
