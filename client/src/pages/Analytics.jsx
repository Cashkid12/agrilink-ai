import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { productsAPI } from '../api'

const Analytics = () => {
  const { user } = useAuth()
  const [hasData, setHasData] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userProducts, setUserProducts] = useState([])

  useEffect(() => {
    checkUserData()
  }, [user])

  const checkUserData = async () => {
    try {
      if (user?.role === 'farmer') {
        const productsResponse = await productsAPI.getAll()
        const userProducts = productsResponse.data.filter(
          product => product.farmer?._id === user.id
        )
        
        setUserProducts(userProducts)
        setHasData(userProducts.length > 0)
      } else {
        setHasData(false)
      }
    } catch (error) {
      console.error('Error checking user data:', error)
      setHasData(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // For farmers with no products
  if (user?.role === 'farmer' && !hasData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-6">📊</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Ready for Insights?
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Start by adding your first product to unlock powerful analytics and grow your farming business.
            </p>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll See After Adding Products:</h2>
              
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">💰</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Revenue Tracking</h3>
                    <p className="text-gray-600 text-sm">Monitor your earnings and sales performance</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">📈</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Product Analytics</h3>
                    <p className="text-gray-600 text-sm">See which products are most popular</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">👁️</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">View Statistics</h3>
                    <p className="text-gray-600 text-sm">Track how many buyers see your products</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🤖</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Insights</h3>
                    <p className="text-gray-600 text-sm">Get smart recommendations to improve sales</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link to="/add-product" className="btn-primary text-lg px-8 py-4">
                🚀 Add Your First Product
              </Link>
              <div>
                <p className="text-gray-500 text-sm">It only takes 2 minutes to get started</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // For buyers (no analytics yet)
  if (user?.role === 'buyer') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🛒</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Buyer Analytics Coming Soon!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              We're working on analytics features for buyers. You'll soon be able to track your purchases, favorite farmers, and shopping trends.
            </p>
            <Link to="/market" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Actual analytics data for farmers with products
  const stats = [
    { name: 'Total Products', value: userProducts.length, icon: '📦' },
    { name: 'Active Listings', value: userProducts.filter(p => p.available).length, icon: '✅' },
    { name: 'Total Views', value: userProducts.reduce((sum, p) => sum + (p.views || 0), 0).toLocaleString(), icon: '👁️' },
    { name: 'Potential Revenue', value: `KES ${userProducts.reduce((sum, p) => sum + p.price * p.quantity, 0).toLocaleString()}`, icon: '💰' },
  ]

  const popularProducts = userProducts
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your farming business performance</p>
          </div>
          <Link to="/add-product" className="btn-primary">
            Add New Product
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((item, index) => (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className="text-3xl mr-4">{item.icon}</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                  <div className="text-gray-600 text-sm">{item.name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Popular Products */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Top Products</h3>
            <div className="space-y-4">
              {popularProducts.map((product, index) => (
                <div key={product._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={`https://agrilink-ai-backend.onrender.com/uploads/${product.images[0]}`}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">🌱</span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        {product.views || 0} views • KES {product.price}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.available ? 'Active' : 'Inactive'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="font-semibold text-blue-900 mb-2">Performance Summary</div>
                <div className="text-sm text-blue-700">
                  Your products are getting {userProducts.reduce((sum, p) => sum + (p.views || 0), 0)} total views. 
                  Consider adding more product photos to increase engagement.
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="font-semibold text-green-900 mb-2">Growth Opportunity</div>
                <div className="text-sm text-green-700">
                  You have {userProducts.filter(p => p.available).length} active listings. 
                  Adding seasonal products can attract more buyers.
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="font-semibold text-purple-900 mb-2">Quick Tip</div>
                <div className="text-sm text-purple-700">
                  Respond to buyer messages within 24 hours to improve sales conversion.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics