import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
        {text && (
          <p className="text-sm text-gray-600">{text}</p>
        )}
      </div>
    </div>
  )
}

interface SkeletonProps {
  className?: string
  lines?: number
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', lines = 1 }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="h-4 bg-gray-200 rounded mb-2"></div>
      ))}
    </div>
  )
}

interface LoadingCardProps {
  title?: string
  lines?: number
}

const LoadingCard: React.FC<LoadingCardProps> = ({ title, lines = 3 }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      {title && (
        <div className="mb-4">
          <Skeleton className="h-6 w-48" lines={1} />
        </div>
      )}
      <Skeleton lines={lines} />
    </div>
  )
}

export { LoadingSpinner, Skeleton, LoadingCard }
