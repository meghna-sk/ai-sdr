// Shared API configuration utility - Localhost Only
export const getApiBaseUrl = () => {
  // Always use localhost for local development
  return 'http://localhost:8000'
}

export const API_BASE_URL = getApiBaseUrl()

// Debug logging
console.log('API Base URL:', API_BASE_URL)
console.log('Current hostname:', window.location.hostname)
console.log('Current protocol:', window.location.protocol)
