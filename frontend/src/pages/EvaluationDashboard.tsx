import React, { useState } from 'react'
import { useEvaluations, useRunEvaluation } from '../hooks/useEvaluations'
import { formatDistanceToNow } from 'date-fns'
import { 
  PlayIcon, 
  ChevronDownIcon, 
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const EvaluationDashboard: React.FC = () => {
  const { data: evaluations, isLoading, error } = useEvaluations()
  const { mutate: runEvaluation, isPending: isRunning, error: runError } = useRunEvaluation()
  const [expandedEvaluations, setExpandedEvaluations] = useState<Set<number>>(new Set())

  const toggleExpanded = (evaluationId: number) => {
    const newExpanded = new Set(expandedEvaluations)
    if (newExpanded.has(evaluationId)) {
      newExpanded.delete(evaluationId)
    } else {
      newExpanded.add(evaluationId)
    }
    setExpandedEvaluations(newExpanded)
  }

  const handleRunEvaluation = () => {
    runEvaluation({})
  }

  console.log('HERE')
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'running':
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-spin" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getPassRateColor = (passRate: number) => {
    if (passRate >= 80) return 'text-green-600'
    if (passRate >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading evaluations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <XCircleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading evaluations</h3>
            <p className="mt-2 text-sm text-red-700">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  const latestEvaluation = evaluations?.[0]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Evaluation Dashboard</h1>
            <p className="mt-2 text-gray-600">Monitor AI qualification system performance</p>
          </div>
          <button
            onClick={handleRunEvaluation}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md font-medium flex items-center space-x-2 transition-colors"
          >
            <PlayIcon className="h-4 w-4" />
            <span>{isRunning ? 'Running...' : 'Run New Evaluation'}</span>
          </button>
        </div>
        
        {runError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-700">Failed to run evaluation: {runError.message}</p>
          </div>
        )}
      </div>

      {/* Empty State */}
      {!evaluations || evaluations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <PlayIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No evaluations found</h3>
          <p className="text-gray-500 mb-4">Run your first evaluation to see results here.</p>
          <button
            onClick={handleRunEvaluation}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            {isRunning ? 'Running...' : 'Run First Evaluation'}
          </button>
        </div>
      ) : (
        <>
          {/* Latest Evaluation Overview */}
          {latestEvaluation && (
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Latest Evaluation Results</h2>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(latestEvaluation.timestamp), { addSuffix: true })}
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getPassRateColor(latestEvaluation.pass_rate)}`}>
                      {latestEvaluation.pass_rate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Pass Rate</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{latestEvaluation.total_tests}</div>
                    <div className="text-sm text-gray-500">Total Tests</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{latestEvaluation.passed_tests}</div>
                    <div className="text-sm text-gray-500">Passed</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {latestEvaluation.schema_compliance_rate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Schema Compliance</div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-lg font-semibold text-gray-900">
                      {latestEvaluation.verdict_accuracy.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Verdict Accuracy</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-lg font-semibold text-gray-900">
                      {latestEvaluation.confidence_accuracy.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Confidence Accuracy</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-lg font-semibold text-gray-900">
                      {latestEvaluation.avg_prompt_completeness.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Prompt Completeness</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Evaluation History */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Evaluation History</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {evaluations.map((evaluation) => (
                <div key={evaluation.evaluation_id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(evaluation.status)}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Evaluation #{evaluation.evaluation_id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(evaluation.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${getPassRateColor(evaluation.pass_rate)}`}>
                          {evaluation.pass_rate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {evaluation.passed_tests}/{evaluation.total_tests} passed
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleExpanded(evaluation.evaluation_id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {expandedEvaluations.has(evaluation.evaluation_id) ? (
                          <ChevronDownIcon className="h-5 w-5" />
                        ) : (
                          <ChevronRightIcon className="h-5 w-5" />
                        )}
                        <span className="sr-only">View Details</span>
                      </button>
                    </div>
                  </div>
                  
                  {expandedEvaluations.has(evaluation.evaluation_id) && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-semibold text-gray-900">
                            {evaluation.verdict_accuracy.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">Verdict Accuracy</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-semibold text-gray-900">
                            {evaluation.confidence_accuracy.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">Confidence Accuracy</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-semibold text-gray-900">
                            {evaluation.schema_compliance_rate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">Schema Compliance</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-semibold text-gray-900">
                            {evaluation.total_schema_errors}
                          </div>
                          <div className="text-xs text-gray-500">Schema Errors</div>
                        </div>
                      </div>
                      
                      {evaluation.results.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Test Results</h4>
                          <div className="space-y-2">
                            {evaluation.results.map((result, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded-md border ${
                                  result.overall_pass
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">
                                    {result.lead_id}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    {result.overall_pass ? (
                                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <XCircleIcon className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className="text-xs text-gray-500">
                                      {result.actual_verdict}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default EvaluationDashboard
