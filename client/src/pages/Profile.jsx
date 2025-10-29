import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { usersAPI } from '../api'

const Profile = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
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
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const counties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 
    'Machakos', 'Meru', 'Nyeri', 'Kakamega', 'Kisii', 'Garissa'
  ]

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        profile: {
          farmName: user.profile?.farmName || '',
          businessName: user.profile?.businessName || '',
          location: {
            county: user.profile?.location?.county || '',
            subcounty: user.profile?.location?.subcounty || ''
          },
          phone: user.profile?.phone || ''
        }
      })
    }
  }, [user])

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
    setSaving(true)
    setMessage('')

    try {
      await usersAPI.updateProfile(user.id, formData)
      setMessage('Profile updated successfully!')
      
      // Update local storage
      const updatedUser = { ...user, ...formData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Reload to reflect changes
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      setMessage('Error updating profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <form onSubmit={handleSubmit} className="space-y-6">
                {message && (
                  <div className={`p-4 rounded-lg ${
                    message.includes('Error') 
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    {message}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Basic Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        className="input-field bg-gray-100"
                        disabled
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Type
                      </label>
                      <input
                        type="text"
                        value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        className="input-field bg-gray-100"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                {/* Role-specific Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {user.role === 'farmer' ? 'Farm Information' : 'Business Information'}
                  </h3>
                  
                  <div className="space-y-4">
                    {user.role === 'farmer' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Farm Name *
                        </label>
                        <input
                          type="text"
                          name="profile.farmName"
                          value={formData.profile.farmName}
                          onChange={handleChange}
                          className="input-field"
                          required
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Name *
                        </label>
                        <input
                          type="text"
                          name="profile.businessName"
                          value={formData.profile.businessName}
                          onChange={handleChange}
                          className="input-field"
                          required
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          County *
                        </label>
                        <select
                          name="profile.location.county"
                          value={formData.profile.location.county}
                          onChange={handleChange}
                          className="input-field"
                          required
                        >
                          <option value="">Select County</option>
                          {counties.map(county => (
                            <option key={county} value={county}>{county}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sub-county *
                        </label>
                        <input
                          type="text"
                          name="profile.location.subcounty"
                          value={formData.profile.location.subcounty}
                          onChange={handleChange}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="profile.phone"
                        value={formData.profile.phone}
                        onChange={handleChange}
                        className="input-field"
                        required
                        placeholder="+254 700 000 000"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Profile Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Member since:</span>
                  <span className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    user.profile?.verified ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {user.profile?.verified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>

                {user.profile?.rating && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <span className="font-medium text-yellow-600">
                      ⭐ {user.profile.rating}/5
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Status */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Verification Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Profile Completion</span>
                  <span className="font-medium text-green-600">80%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>

                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Email verified
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    Phone verification pending
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    ID verification available
                  </div>
                </div>

                <button className="w-full btn-secondary text-sm">
                  Complete Verification
                </button>
              </div>
            </div>

            {/* Account Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Actions
              </h3>
              
              <div className="space-y-3">
                <button className="w-full text-left p-3 text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors">
                  Change Password
                </button>
                <button className="w-full text-left p-3 text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors">
                  Privacy Settings
                </button>
                <button className="w-full text-left p-3 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile