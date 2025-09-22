import { useState } from 'react'
import { MeetingSlotsRequest, MeetingSlotsResponse, ICSRequest } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-sdr-k9ml.onrender.com'

// Hook for meeting slots
export const useMeetingSlots = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getMeetingSlots = async (request: MeetingSlotsRequest = {}): Promise<MeetingSlotsResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/meetings/slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch meeting slots: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch meeting slots'
      setError(errorMessage)
      console.error('Error fetching meeting slots:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    getMeetingSlots,
    loading,
    error,
  }
}

// Hook for ICS file generation and download
export const useICSGeneration = () => {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateAndDownloadICS = async (request: ICSRequest): Promise<boolean> => {
    setGenerating(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/meetings/ics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate ICS file: ${response.statusText}`)
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('content-disposition')
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : 'meeting.ics'

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate ICS file'
      setError(errorMessage)
      console.error('Error generating ICS file:', err)
      return false
    } finally {
      setGenerating(false)
    }
  }

  return {
    generateAndDownloadICS,
    generating,
    error,
  }
}
