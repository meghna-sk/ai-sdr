import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Navbar: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-white shadow-sm border-b" role="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              AI SDR
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link
              to="/leads"
              className={`text-sm font-medium transition-colors ${
                isActive('/leads')
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Leads
            </Link>
            <Link
              to="/evaluations"
              className={`text-sm font-medium transition-colors ${
                isActive('/evaluations')
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Evaluations
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
