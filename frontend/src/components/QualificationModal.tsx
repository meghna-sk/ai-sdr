import React from 'react'

interface QualificationModalProps {
  isOpen: boolean
  onClose: () => void
  qualification: {
    verdict: string
    confidence: number
    reasoning: string
    factors: string[]
  } | null
  loading: boolean
}

const QualificationModal: React.FC<QualificationModalProps> = ({
  isOpen,
  onClose,
  qualification,
  loading
}) => {
  if (!isOpen) return null

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'qualified': return 'text-green-600 bg-green-100'
      case 'not_qualified': return 'text-red-600 bg-red-100'
      case 'needs_more_info': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            AI Qualification Result
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Analyzing lead with AI...</span>
            </div>
          ) : qualification ? (
            <div className="space-y-6">
              {/* Verdict and Confidence */}
              <div className="flex items-center justify-between">
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getVerdictColor(qualification.verdict)}`}>
                    {qualification.verdict.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Confidence</div>
                  <div className={`text-2xl font-bold ${getConfidenceColor(qualification.confidence)}`}>
                    {qualification.confidence}%
                  </div>
                </div>
              </div>

              {/* Reasoning */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">AI Reasoning</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{qualification.reasoning}</p>
                </div>
              </div>

              {/* Key Factors */}
              {qualification.factors && qualification.factors.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Key Factors</h3>
                  <div className="flex flex-wrap gap-2">
                    {qualification.factors.map((factor, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {factor.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-gray-500">No qualification data available</p>
            </div>
          )}
        </div>

        <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default QualificationModal
