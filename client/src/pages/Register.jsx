import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
    profile: {
      farmName: '',
      businessName: '',
      location: {
        county: '',
        subcounty: ''
      },
      phone: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const counties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 
    'Machakos', 'Meru', 'Nyeri', 'Kakamega', 'Kisii', 'Garissa'
  ]

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
    
    // Set role from URL parameter
    const role = searchParams.get('role')
    if (role && ['farmer', 'buyer'].includes(role)) {
      setFormData(prev => ({ ...prev, role }))
    }
  }, [isAuthenticated, navigate, searchParams])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('profile.')) {
      const profileField = name.replace('profile.', '')
      if (profileField.startsWith('location.')) {
        const locationField = profileField.replace('location.', '')
        setFormData(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            location: {
              ...prev.profile.location,
              [locationField]: value
            }
          }
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            [profileField]: value
          }
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...submitData } = formData
      const result = await register(submitData)
      
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center space-x-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold">A</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">AgriLink AI</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join as a {formData.role} and start trading today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to join as:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'farmer' }))}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    formData.role === 'farmer'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-300 text-gray-700 hover:border-primary'
                  }`}
                >
                  <div className="text-2xl mb-2">👨‍🌾</div>
                  <div className="font-semibold">Farmer</div>
                  <div className="text-sm text-gray-500 mt-1">Sell your produce</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'buyer' }))}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    formData.role === 'buyer'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-300 text-gray-700 hover:border-primary'
                  }`}
                >
                  <div className="text-2xl mb-2">👨‍💼</div>
                  <div className="font-semibold">Buyer</div>
                  <div className="text-sm text-gray-500 mt-1">Buy fresh produce</div>
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Enter your email"
              />
            </div>

            {/* Role-specific fields */}
            {formData.role === 'farmer' && (
              <div>
                <label htmlFor="farmName" className="block text-sm font-medium text-gray-700">
                  Farm Name *
                </label>
                <input
                  id="farmName"
                  name="profile.farmName"
                  type="text"
                  required
                  value={formData.profile.farmName}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="Enter your farm name"
                />
              </div>
            )}

            {formData.role === 'buyer' && (
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                  Business Name *
                </label>
                <input
                  id="businessName"
                  name="profile.businessName"
                  type="text"
                  required
                  value={formData.profile.businessName}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="Enter your business name"
                />
              </div>
            )}

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="county" className="block text-sm font-medium text-gray-700">
                  County *
                </label>
                <select
                  id="county"
                  name="profile.location.county"
                  required
                  value={formData.profile.location.county}
                  onChange={handleChange}
                  className="input-field mt-1"
                >
                  <option value="">Select County</option>
                  {counties.map(county => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="subcounty" className="block text-sm font-medium text-gray-700">
                  Sub-county *
                </label>
                <input
                  id="subcounty"
                  name="profile.location.subcounty"
                  type="text"
                  required
                  value={formData.profile.location.subcounty}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="Enter sub-county"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                id="phone"
                name="profile.phone"
                type="tel"
                required
                value={formData.profile.phone}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="e.g., +254 700 000 000"
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center">
              <span className="text-gray-600">Already have an account? </span>
              <Link to="/login" className="text-primary hover:text-primary-dark font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register