import React from 'react'
import { ScoreBreakdownItem } from '../types'

interface ScoreBreakdownProps {
  score: number | null
  breakdown: ScoreBreakdownItem[]
  loading?: boolean
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ score, breakdown, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Score</h3>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (score === null || breakdown.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Score</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500">No score available</p>
          <p className="text-sm text-gray-400 mt-1">Score this lead to see breakdown</p>
        </div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Score</h3>
      
      {/* Main Score Display */}
      <div className={`rounded-lg p-4 mb-6 ${getScoreBgColor(score)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Overall Score</p>
            <p className={`text-3xl font-bold ${getScoreColor(score)}`}>
              {score.toFixed(1)}
              <span className="text-lg text-gray-500">/100</span>
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full border-4 border-current flex items-center justify-center">
              <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                {Math.round(score)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Score Breakdown</h4>
        {breakdown.map((item, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-medium text-gray-900">{item.factor}</h5>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Weight: {item.weight}%</span>
                <span className={`text-sm font-medium ${getScoreColor(item.score)}`}>
                  {item.score}/100
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full ${
                  item.score >= 80 ? 'bg-green-500' : 
                  item.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${item.score}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Weighted Score: {item.weighted_score.toFixed(1)}</span>
            </div>
            
            {item.reasoning && (
              <p className="text-xs text-gray-600 mt-2 italic">{item.reasoning}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ScoreBreakdown
