import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLeads, useActivities, useScoreLead, useQualifyLead, useGenerateOutreach } from '../hooks/useLeads'
import { ScoreBreakdownItem } from '../types'
import ScoreBreakdown from '../components/ScoreBreakdown'
import ActivityLog from '../components/ActivityLog'
import QualificationModal from '../components/QualificationModal'
import OutreachModal from '../components/OutreachModal'
import MeetingSlotsModal from '../components/MeetingSlotsModal'
import { useToastContext } from '../contexts/ToastContext'

const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const leadId = id ? parseInt(id, 10) : 0
  
  const { leads, loading: leadsLoading, error: leadsError, refetch: refetchLeads } = useLeads()
  const { activities, loading: activitiesLoading, error: activitiesError, refetch: refetchActivities } = useActivities(leadId)
  const { scoreLead, scoring, error: scoringError } = useScoreLead()
  const { qualifyLead, qualifying, qualificationResult, error: qualificationError } = useQualifyLead()
  const { generateOutreach, generating, outreachResult, error: outreachError } = useGenerateOutreach()
  const { showSuccess, showError, showInfo } = useToastContext()
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [qualificationModalOpen, setQualificationModalOpen] = useState(false)
  const [outreachModalOpen, setOutreachModalOpen] = useState(false)
  const [meetingModalOpen, setMeetingModalOpen] = useState(false)

  // Find the specific lead
  const lead = leads.find(l => l.id === leadId)

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'New': return 'bg-blue-100 text-blue-800'
      case 'Qualified': return 'bg-green-100 text-green-800'
      case 'Contacted': return 'bg-yellow-100 text-yellow-800'
      case 'Meeting Scheduled': return 'bg-purple-100 text-purple-800'
      case 'Won': return 'bg-green-100 text-green-800'
      case 'Lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleScore = async () => {
    try {
      await scoreLead(leadId)
      setSuccessMessage('Lead scored successfully!')
      showSuccess('Lead Scored', 'Successfully scored the lead using AI analysis')
      // Refresh both activities and leads data after scoring
      refetchActivities()
      refetchLeads()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      showError('Scoring Failed', 'Failed to score the lead. Please try again.')
    }
  }

  const handleQualify = async () => {
    try {
      await qualifyLead(leadId)
      setQualificationModalOpen(true)
      showInfo('Qualification Complete', 'AI qualification analysis is ready for review')
      // Refresh activities to show the new qualification activity
      refetchActivities()
      // Refresh leads to show potential stage updates
      refetchLeads()
    } catch (error) {
      showError('Qualification Failed', 'Failed to qualify the lead. Please try again.')
    }
  }

  const handleGenerateOutreach = async () => {
    try {
      await generateOutreach(leadId)
      setOutreachModalOpen(true)
      showInfo('Outreach Generated', 'AI-generated outreach content is ready for review')
      // Refresh activities to show the new outreach activity
      refetchActivities()
    } catch (error) {
      showError('Outreach Generation Failed', 'Failed to generate outreach content. Please try again.')
    }
  }

  const handleProposeMeeting = () => {
    setMeetingModalOpen(true)
  }

  // Extract score breakdown from activities
  const getScoreBreakdown = (): { score: number | null; breakdown: ScoreBreakdownItem[] } => {
    const scoreActivity = activities.find(a => a.activity_type === 'ai_score')
    
    // If we have a scoring activity with data, use that (most recent score with breakdown)
    if (scoreActivity?.data?.score !== undefined) {
      return {
        score: scoreActivity.data.score,
        breakdown: scoreActivity.data.breakdown || []
      }
    }
    
    // Otherwise, fall back to the lead's score (from database) but no breakdown
    return { 
      score: lead?.score || null, 
      breakdown: [] 
    }
  }

  if (leadsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (leadsError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading lead</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{leadsError}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Lead Not Found</h1>
            <p className="text-gray-600 mb-6">The lead you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/leads')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Leads
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { score, breakdown } = getScoreBreakdown()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <button
                  onClick={() => navigate('/leads')}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  Leads
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-900">{lead.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Error Messages */}
        {(activitiesError || scoringError) && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-800">
              {activitiesError && <p>Activities error: {activitiesError}</p>}
              {scoringError && <p>Scoring error: {scoringError}</p>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lead Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(lead.stage)}`}>
                  {lead.stage}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Contact Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-900">Email</dt>
                      <dd className="text-sm text-gray-600">
                        <a href={`mailto:${lead.email}`} className="text-blue-600 hover:text-blue-800">
                          {lead.email}
                        </a>
                      </dd>
                    </div>
                    {lead.phone && (
                      <div>
                        <dt className="text-sm font-medium text-gray-900">Phone</dt>
                        <dd className="text-sm text-gray-600">
                          <a href={`tel:${lead.phone}`} className="text-blue-600 hover:text-blue-800">
                            {lead.phone}
                          </a>
                        </dd>
                      </div>
                    )}
                    {lead.linkedin_url && (
                      <div>
                        <dt className="text-sm font-medium text-gray-900">LinkedIn</dt>
                        <dd className="text-sm text-gray-600">
                          <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            View Profile
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Company Information</h3>
                  <dl className="space-y-3">
                    {lead.company && (
                      <div>
                        <dt className="text-sm font-medium text-gray-900">Company</dt>
                        <dd className="text-sm text-gray-600">{lead.company}</dd>
                      </div>
                    )}
                    {lead.title && (
                      <div>
                        <dt className="text-sm font-medium text-gray-900">Title</dt>
                        <dd className="text-sm text-gray-600">{lead.title}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-gray-900">Created</dt>
                      <dd className="text-sm text-gray-600">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {lead.notes && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded p-3">{lead.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    onClick={handleScore}
                    disabled={scoring}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {scoring ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Scoring...
                      </>
                    ) : (
                      <>
                        <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Re-score Lead
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleQualify}
                    disabled={qualifying}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {qualifying ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Qualifying...
                      </>
                    ) : (
                      <>
                        <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Qualify with AI
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleGenerateOutreach}
                    disabled={generating}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <svg 
                          data-testid="generate-loading-spinner" 
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                          fill="none" 
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Generate Outreach
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleProposeMeeting}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Propose Meeting
                  </button>
                </div>

                {/* Error Messages */}
                {(qualificationError || outreachError) && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">
                          {qualificationError || outreachError}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Log */}
            <ActivityLog 
              activities={activities} 
              loading={activitiesLoading}
              total={activities.length}
            />
          </div>

          {/* Sidebar */}
          <div>
            <ScoreBreakdown 
              score={score}
              breakdown={breakdown}
              loading={scoring}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <QualificationModal
        isOpen={qualificationModalOpen}
        onClose={() => setQualificationModalOpen(false)}
        qualification={qualificationResult}
        loading={qualifying}
      />

      <OutreachModal
        isOpen={outreachModalOpen}
        onClose={() => setOutreachModalOpen(false)}
        outreach={outreachResult}
        loading={generating}
      />

      <MeetingSlotsModal
        isOpen={meetingModalOpen}
        onClose={() => setMeetingModalOpen(false)}
        lead={lead!}
      />
    </div>
  )
}

export default LeadDetailPage
