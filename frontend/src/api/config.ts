// Shared API configuration utility
export const getApiBaseUrl = () => {
  let baseUrl = ''
  
  // First priority: Check for environment variable (this should work in Render)
  if (import.meta.env.VITE_API_BASE_URL) {
    baseUrl = import.meta.env.VITE_API_BASE_URL
  }
  // Fallback: Check if we're in production (deployed on Render)
  else if (window.location.hostname.includes('onrender.com')) {
    baseUrl = 'https://ai-sdr-k9ml.onrender.com'
  }
  // Default to localhost for local development
  else {
    baseUrl = 'http://localhost:8000'
    
  }
  
  // Ensure HTTPS is used in production (fix mixed content issues)
  if (window.location.protocol === 'https:' && baseUrl.startsWith('http:')) {
    baseUrl = baseUrl.replace('http:', 'https:')
  }
  
  return baseUrl
}

export const API_BASE_URL = getApiBaseUrl()

// Debug logging
console.log('API Base URL:', API_BASE_URL)
console.log('Current hostname:', window.location.hostname)
console.log('Current protocol:', window.location.protocol)
console.log('Environment variable:', import.meta.env.VITE_API_BASE_URL)
