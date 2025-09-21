import React, { useState, useEffect } from 'react'
import { XMarkIcon, CalendarDaysIcon, ClockIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { MeetingSlot, Lead } from '../types'
import { useMeetingSlots, useICSGeneration } from '../hooks/useMeetings'
import { useToastContext } from '../contexts/ToastContext'

interface MeetingSlotsModalProps {
  isOpen: boolean
  onClose: () => void
  lead: Lead
}

const MeetingSlotsModal: React.FC<MeetingSlotsModalProps> = ({ isOpen, onClose, lead }) => {
  const [selectedSlot, setSelectedSlot] = useState<MeetingSlot | null>(null)
  const [meetingSubject, setMeetingSubject] = useState('')
  const [meetingDescription, setMeetingDescription] = useState('')
  const [meetingLocation, setMeetingLocation] = useState('')
  
  const { getMeetingSlots, loading: slotsLoading, error: slotsError } = useMeetingSlots()
  const { generateAndDownloadICS, generating: icsGenerating, error: icsError } = useICSGeneration()
  const { showSuccess, showError } = useToastContext()
  
  const [slots, setSlots] = useState<MeetingSlot[]>([])

  // Load meeting slots when modal opens
  useEffect(() => {
    if (isOpen) {
      loadMeetingSlots()
      // Set default meeting subject
      setMeetingSubject(`Meeting with ${lead.name} - ${lead.company || 'Prospect'}`)
      setMeetingDescription(`Discussion about our AI-powered SDR solution with ${lead.name} from ${lead.company || 'their company'}.`)
    }
  }, [isOpen, lead])

  const loadMeetingSlots = async () => {
    const response = await getMeetingSlots({
      lead_id: lead.id,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      duration_minutes: 30
    })
    
    if (response) {
      setSlots(response.slots)
    }
  }

  const handleSlotSelect = (slot: MeetingSlot) => {
    setSelectedSlot(slot)
  }

  const handleDownloadICS = async () => {
    if (!selectedSlot) return

    // Calculate end time
    const startTime = new Date(selectedSlot.datetime)
    const endTime = new Date(startTime.getTime() + selectedSlot.duration_minutes * 60000)

    const icsRequest = {
      start_datetime: startTime.toISOString(),
      end_datetime: endTime.toISOString(),
      subject: meetingSubject,
      description: meetingDescription,
      location: meetingLocation,
      attendees: [lead.email],
      organizer_email: 'sdr@ai-sdr.com',
      organizer_name: 'AI SDR Team'
    }

    try {
      const success = await generateAndDownloadICS(icsRequest)
      if (success) {
        showSuccess('Calendar Invite Downloaded', 'Meeting invite has been downloaded successfully')
        // Close modal after successful download
        onClose()
      }
    } catch (error) {
      showError('Download Failed', 'Failed to download calendar invite. Please try again.')
    }
  }

  const formatSlotDisplay = (slot: MeetingSlot) => {
    return `${slot.day_of_week}, ${slot.time_formatted} (${slot.timezone})`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Propose Meeting</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Lead Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Meeting with:</h3>
            <p className="text-gray-700">{lead.name} - {lead.company || 'Prospect'}</p>
            <p className="text-sm text-gray-500">{lead.email}</p>
          </div>

          {/* Meeting Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Subject
              </label>
              <input
                type="text"
                value={meetingSubject}
                onChange={(e) => setMeetingSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter meeting subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={meetingDescription}
                onChange={(e) => setMeetingDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter meeting description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                value={meetingLocation}
                onChange={(e) => setMeetingLocation(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Conference Room A, Zoom, etc."
              />
            </div>
          </div>

          {/* Meeting Slots */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Available Time Slots</h3>
            
            {slotsLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading available time slots...</p>
              </div>
            )}

            {slotsError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">Error loading time slots: {slotsError}</p>
                <button
                  onClick={loadMeetingSlots}
                  className="mt-2 text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            )}

            {!slotsLoading && !slotsError && slots.length > 0 && (
              <div className="space-y-3">
                {slots.map((slot, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedSlot === slot
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ClockIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{formatSlotDisplay(slot)}</p>
                          <p className="text-sm text-gray-500">{slot.duration_minutes} minutes</p>
                        </div>
                      </div>
                      {selectedSlot === slot && (
                        <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ICS Error */}
          {icsError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">Error generating calendar invite: {icsError}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDownloadICS}
            disabled={!selectedSlot || icsGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {icsGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  <span>Download Calendar Invite</span>
                </>
              )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MeetingSlotsModal
