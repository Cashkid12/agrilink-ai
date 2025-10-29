import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { productsAPI, usersAPI } from '../api'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalViews: 0,
    monthlyRevenue: 0
  })
  const [recentProducts, setRecentProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch user's products if farmer
      if (user?.role === 'farmer') {
        const productsResponse = await productsAPI.getAll()
        const userProducts = productsResponse.data.filter(
          product => product.farmer?._id === user.id
        )
        
        setRecentProducts(userProducts.slice(0, 5))
        setStats({
          totalProducts: userProducts.length,
          activeProducts: userProducts.filter(p => p.available).length,
          totalViews: userProducts.reduce((sum, p) => sum + (p.views || 0), 0),
          monthlyRevenue: userProducts.reduce((sum, p) => sum + p.price * p.quantity, 0)
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const farmerStats = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: '📦',
      color: 'blue'
    },
    {
      title: 'Active Listings',
      value: stats.activeProducts,
      icon: '✅',
      color: 'green'
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      icon: '👁️',
      color: 'purple'
    },
    {
      title: 'Potential Revenue',
      value: `KES ${stats.monthlyRevenue.toLocaleString()}`,
      icon: '💰',
      color: 'yellow'
    }
  ]

  const buyerStats = [
    {
      title: 'Saved Products',
      value: '12',
      icon: '❤️',
      color: 'red'
    },
    {
      title: 'Active Chats',
      value: '5',
      icon: '💬',
      color: 'blue'
    },
    {
      title: 'Orders This Month',
      value: '8',
      icon: '📦',
      color: 'green'
    },
    {
      title: 'Favorite Farmers',
      value: '7',
      icon: '👨‍🌾',
      color: 'yellow'
    }
  ]

  const quickActions = user?.role === 'farmer' ? [
    { icon: '➕', label: 'Add New Product', link: '/market?add=new', color: 'primary' },
    { icon: '📊', label: 'View Analytics', link: '/analytics', color: 'blue' },
    { icon: '💬', label: 'Messages', link: '/messages', color: 'green' },
    { icon: '👥', label: 'My Customers', link: '/customers', color: 'purple' }
  ] : [
    { icon: '🛒', label: 'Browse Products', link: '/market', color: 'primary' },
    { icon: '💬', label: 'My Chats', link: '/messages', color: 'blue' },
    { icon: '❤️', label: 'Saved Items', link: '/saved', color: 'red' },
    { icon: '👨‍🌾', label: 'Find Farmers', link: '/farmers', color: 'green' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'farmer' 
              ? 'Manage your farm products and track your performance'
              : 'Discover fresh produce and connect with farmers'
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(user?.role === 'farmer' ? farmerStats : buyerStats).map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className="text-3xl mr-4">{stat.icon}</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {stat.title}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className={`p-4 border-2 border-${action.color}-200 bg-${action.color}-50 rounded-lg hover:shadow-md transition-shadow text-center`}
                  >
                    <div className="text-2xl mb-2">{action.icon}</div>
                    <div className="font-medium text-gray-900">
                      {action.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            {user?.role === 'farmer' && (
              <div className="card mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Recent Products
                </h2>
                {recentProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">🌱</div>
                    <p className="text-gray-600 mb-4">No products listed yet</p>
                    <Link to="/market?add=new" className="btn-primary">
                      Add Your First Product
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentProducts.map(product => (
                      <div key={product._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={`http://localhost:5000/${product.images[0]}`}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-500 text-sm">📷</span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              KES {product.price} • {product.quantity} {product.unit}
                            </div>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.available 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.available ? 'Active' : 'Sold'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* AI Recommendations */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🤖 AI Insights
              </h2>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-900 mb-1">
                    Market Trend
                  </div>
                  <div className="text-sm text-blue-700">
                    High demand for tomatoes in Nairobi this week
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-900 mb-1">
                    Price Suggestion
                  </div>
                  <div className="text-sm text-green-700">
                    Consider increasing avocado prices by 15%
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-900 mb-1">
                    Weather Alert
                  </div>
                  <div className="text-sm text-purple-700">
                    Expected rainfall in Central region next week
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Messages Preview */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Messages
              </h2>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                      U{i}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        Potential Customer {i}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        Interested in your maize produce...
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">2h ago</div>
                  </div>
                ))}
              </div>
              <Link to="/messages" className="block text-center text-primary hover:text-primary-dark font-medium mt-4">
                View All Messages
              </Link>
            </div>

            {/* Quick Tips */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                💡 Quick Tips
              </h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Upload clear photos of your produce</li>
                <li>• Respond to messages within 24 hours</li>
                <li>• Update product availability regularly</li>
                <li>• Use AI price suggestions for better sales</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard