import React, { createContext, useContext } from 'react'
import ToastContainer from '../components/Toast'
import { useToast } from '../hooks/useToast'
import { Toast } from '../components/Toast'

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearAllToasts: () => void
  showSuccess: (title: string, message?: string, duration?: number) => void
  showError: (title: string, message?: string, duration?: number) => void
  showWarning: (title: string, message?: string, duration?: number) => void
  showInfo: (title: string, message?: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToastContext = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toastHook = useToast()

  return (
    <ToastContext.Provider value={toastHook}>
      {children}
      <ToastContainer toasts={toastHook.toasts} onRemove={toastHook.removeToast} />
    </ToastContext.Provider>
  )
}
