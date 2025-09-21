import React from 'react'
import { Activity } from '../types'

interface ActivityLogProps {
  activities: Activity[]
  loading?: boolean
  total?: number
}

const ActivityLog: React.FC<ActivityLogProps> = ({ activities, loading = false, total = 0 }) => {
  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'created':
        return (
          <div className="bg-blue-100 rounded-full p-2">
            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        )
      case 'ai_score':
        return (
          <div className="bg-purple-100 rounded-full p-2">
            <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        )
      case 'qualified':
        return (
          <div className="bg-green-100 rounded-full p-2">
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'contacted':
        return (
          <div className="bg-yellow-100 rounded-full p-2">
            <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        )
      case 'updated':
        return (
          <div className="bg-gray-100 rounded-full p-2">
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="bg-gray-100 rounded-full p-2">
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const renderActivityData = (activity: Activity) => {
    if (!activity.data) return null

    switch (activity.activity_type) {
      case 'ai_score':
        return (
          <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
            <div className="flex items-center justify-between">
              <span>Score: {activity.data.score}/100</span>
              <span>{activity.data.factors?.length || 0} factors analyzed</span>
            </div>
          </div>
        )
      case 'qualified':
        return activity.data.reason ? (
          <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
            Reason: {activity.data.reason}
          </div>
        ) : null
      case 'contacted':
        return activity.data.email_subject ? (
          <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
            Subject: "{activity.data.email_subject}"
          </div>
        ) : null
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Log</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Log</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500">No activities yet</p>
          <p className="text-sm text-gray-400 mt-1">Activities will appear here as they happen</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Activity Log</h3>
        {total > 0 && (
          <span className="text-sm text-gray-500">{total} total activities</span>
        )}
      </div>
      
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, index) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {index !== activities.length - 1 && (
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900 capitalize">
                          {activity.activity_type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>{activity.description}</p>
                      {renderActivityData(activity)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ActivityLog
