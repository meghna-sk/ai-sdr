// Lead types
export interface Lead {
  id: number
  name: string
  email: string
  company: string | null
  title: string | null
  stage: string
  score: number | null
  created_at: string
  updated_at: string
  phone: string | null
  linkedin_url: string | null
  notes: string | null
  company_profile_id: number | null
}

// API response types
export interface LeadsResponse {
  leads: Lead[]
  total: number
}

// Component prop types
export interface LeadsTableProps {
  leads: Lead[]
  loading: boolean
}

// Stage types for better type safety
export type LeadStage = 'New' | 'Qualified' | 'Contacted' | 'Meeting Scheduled' | 'Won' | 'Lost'

// Update the Lead interface to use the LeadStage type
export interface TypedLead extends Omit<Lead, 'stage'> {
  stage: LeadStage
}

// Activity types
export interface Activity {
  id: number
  lead_id: number
  activity_type: string
  description: string
  data: any
  created_at: string
}

export interface ActivitiesResponse {
  activities: Activity[]
  total: number
  lead_id: number
  limit?: number
  offset?: number
}

export interface ScoreBreakdownItem {
  factor: string
  score: number
  weight: number
  weighted_score: number
  reasoning: string
}

// Meeting types
export interface MeetingSlot {
  datetime: string
  timezone: string
  duration_minutes: number
  day_of_week: string
  time_formatted: string
}

export interface MeetingSlotsResponse {
  slots: MeetingSlot[]
  total_slots: number
  timezone: string
  generated_at: string
}

export interface MeetingSlotsRequest {
  timezone?: string
  lead_id?: number
  duration_minutes?: number
}

export interface ICSRequest {
  start_datetime: string
  end_datetime: string
  subject: string
  description?: string
  location?: string
  attendees?: string[]
  organizer_email?: string
  organizer_name?: string
}