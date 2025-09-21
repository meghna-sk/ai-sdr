import React, { useState } from 'react'

interface OutreachModalProps {
  isOpen: boolean
  onClose: () => void
  outreach: {
    subject: string
    body: string
    variants: Array<{ subject: string; body: string }>
  } | null
  loading: boolean
}

const OutreachModal: React.FC<OutreachModalProps> = ({
  isOpen,
  onClose,
  outreach,
  loading
}) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  if (!isOpen) return null

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(item)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const CopyButton: React.FC<{ 
    onClick: () => void
    label: string
    item: string 
  }> = ({ onClick, label, item }) => (
    <button
      onClick={onClick}
      aria-label={label}
      className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors ml-2"
    >
      {copiedItem === item ? (
        <>
          <svg className="w-3 h-3 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Generated Outreach
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
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
              <div 
                data-testid="loading-spinner" 
                className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
              ></div>
              <span className="ml-3 text-gray-600">Generating personalized outreach...</span>
            </div>
          ) : outreach ? (
            <div className="space-y-6">
              {/* Main Message */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Primary Message</h3>
                  <CopyButton
                    onClick={() => copyToClipboard(`Subject: ${outreach.subject}\n\n${outreach.body}`, 'full-message')}
                    label="Copy full message"
                    item="full-message"
                  />
                </div>
                
                {/* Subject */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Subject</label>
                    <CopyButton
                      onClick={() => copyToClipboard(outreach.subject, 'subject')}
                      label="Copy subject"
                      item="subject"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-md p-3 border">
                    <p className="text-gray-900 font-medium">{outreach.subject}</p>
                  </div>
                </div>

                {/* Body */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Message Body</label>
                    <CopyButton
                      onClick={() => copyToClipboard(outreach.body, 'body')}
                      label="Copy body"
                      item="body"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-md p-3 border">
                    <pre className="text-gray-900 whitespace-pre-wrap font-sans text-sm leading-relaxed">{outreach.body}</pre>
                  </div>
                </div>
              </div>

              {/* Variants */}
              {outreach.variants && outreach.variants.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Message Variants ({outreach.variants.length})
                  </h3>
                  <div className="space-y-4">
                    {outreach.variants.map((variant, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-md font-medium text-gray-800">Variant {index + 1}</h4>
                          <CopyButton
                            onClick={() => copyToClipboard(`Subject: ${variant.subject}\n\n${variant.body}`, `variant-${index}`)}
                            label={`Copy variant ${index + 1}`}
                            item={`variant-${index}`}
                          />
                        </div>
                        
                        <div className="mb-3">
                          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Subject</label>
                          <p className="text-gray-900 font-medium text-sm mt-1">{variant.subject}</p>
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Body</label>
                          <pre className="text-gray-800 whitespace-pre-wrap font-sans text-sm leading-relaxed mt-1">{variant.body}</pre>
                        </div>
                      </div>
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
              <p className="text-gray-500">No outreach data available</p>
            </div>
          )}
        </div>

        <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default OutreachModal