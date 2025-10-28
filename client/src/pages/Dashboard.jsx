import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { productsAPI } from '../api'

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
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
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

        // Check if user has any data
        setHasData(userProducts.length > 0)
      } else {
        // For buyers, we don't have analytics yet
        setHasData(false)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setHasData(false)
    } finally {
      setLoading(false)
    }
  }

  const farmerStats = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: '📦',
      color: 'blue',
      link: '/market'
    },
    {
      title: 'Active Listings',
      value: stats.activeProducts,
      icon: '✅',
      color: 'green',
      link: '/market'
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: '👁️',
      color: 'purple',
      link: hasData ? '/analytics' : '/market'
    },
    {
      title: 'Potential Revenue',
      value: `KES ${stats.monthlyRevenue.toLocaleString()}`,
      icon: '💰',
      color: 'yellow',
      link: hasData ? '/analytics' : '/add-product'
    }
  ]

  const buyerStats = [
    {
      title: 'Browse Products',
      value: 'Explore',
      icon: '🛒',
      color: 'primary',
      link: '/market'
    },
    {
      title: 'Find Farmers',
      value: 'Connect',
      icon: '👨‍🌾',
      color: 'green',
      link: '/market'
    },
    {
      title: 'Start Chat',
      value: 'Message',
      icon: '💬',
      color: 'blue',
      link: '/messages'
    },
    {
      title: 'Your Profile',
      value: 'Setup',
      icon: '👤',
      color: 'purple',
      link: '/profile'
    }
  ]

  const farmerQuickActions = [
    { icon: '➕', label: 'Add New Product', link: '/add-product', color: 'primary' },
    { icon: '🛒', label: 'Browse Marketplace', link: '/market', color: 'blue' },
    { icon: '💬', label: 'Messages', link: '/messages', color: 'green' },
    { icon: '👤', label: 'My Profile', link: '/profile', color: 'purple' }
  ]

  const buyerQuickActions = [
    { icon: '🛒', label: 'Browse Products', link: '/market', color: 'primary' },
    { icon: '💬', label: 'Messages', link: '/messages', color: 'blue' },
    { icon: '👨‍🌾', label: 'Find Farmers', link: '/market', color: 'green' },
    { icon: '👤', label: 'My Profile', link: '/profile', color: 'purple' }
  ]

  const quickActions = user?.role === 'farmer' ? farmerQuickActions : buyerQuickActions
  const currentStats = user?.role === 'farmer' ? farmerStats : buyerStats

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
            Welcome to AgriLink AI, {user?.name}! 🌾
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'farmer' 
              ? 'Start your farming business and connect directly with buyers'
              : 'Discover fresh produce directly from Kenyan farmers'
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {currentStats.map((stat, index) => (
            <Link key={index} to={stat.link} className="block">
              <div className="card hover:shadow-lg transition-all duration-300 hover:scale-105">
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
                <div className="mt-2 text-xs text-primary-600 font-medium">
                  Click to {stat.title.toLowerCase()}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions & Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Get Started
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className={`p-4 border-2 border-${action.color}-200 bg-${action.color}-50 rounded-xl hover:shadow-md transition-all duration-200 text-center group hover:scale-105`}
                  >
                    <div className="text-2xl mb-2 transform group-hover:scale-110 transition-transform">
                      {action.icon}
                    </div>
                    <div className="font-medium text-gray-900">
                      {action.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Products (Farmers) */}
            {user?.role === 'farmer' && (
              <div className="card">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Your Products
                  </h2>
                  <Link to="/add-product" className="btn-primary text-sm">
                    Add New
                  </Link>
                </div>
                {recentProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">🌱</div>
                    <p className="text-gray-600 mb-4">You haven't added any products yet</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Start by adding your first product to connect with buyers
                    </p>
                    <Link to="/add-product" className="btn-primary">
                      Add Your First Product
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentProducts.map(product => (
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
            {/* Welcome Message for New Users */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🎉 Welcome to AgriLink AI!
              </h2>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-900 mb-1">
                    Next Steps
                  </div>
                  <div className="text-sm text-blue-700">
                    {user?.role === 'farmer' 
                      ? '1. Add your products 2. Set competitive prices 3. Connect with buyers'
                      : '1. Browse products 2. Contact farmers 3. Get fresh produce'
                    }
                  </div>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-900 mb-1">
                    How It Works
                  </div>
                  <div className="text-sm text-green-700">
                    {user?.role === 'farmer'
                      ? 'List your produce → Buyers contact you → Negotiate prices → Deliver'
                      : 'Browse farmers → Send messages → Negotiate prices → Receive delivery'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🤖 AI Insights
              </h2>
              <div className="space-y-3">
                {user?.role === 'farmer' && !hasData ? (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="font-medium text-yellow-900 mb-1">
                      Ready to Start?
                    </div>
                    <div className="text-sm text-yellow-700">
                      Add your first product to get personalized AI recommendations!
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-900 mb-1">
                        Market Trend
                      </div>
                      <div className="text-sm text-blue-700">
                        High demand for fresh produce in Kenya
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-900 mb-1">
                        Quick Tip
                      </div>
                      <div className="text-sm text-green-700">
                        {user?.role === 'farmer' 
                          ? 'Upload clear photos for 40% more buyer interest'
                          : 'Contact farmers directly for the best prices'
                        }
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                💡 Quick Tips
              </h2>
              <ul className="space-y-2 text-sm text-gray-600">
                {user?.role === 'farmer' ? (
                  <>
                    <li className="flex items-center space-x-2">
                      <span>•</span>
                      <span>Upload clear photos of your produce</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span>•</span>
                      <span>Set competitive prices using AI suggestions</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span>•</span>
                      <span>Respond to messages quickly</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span>•</span>
                      <span>Update product availability regularly</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center space-x-2">
                      <span>•</span>
                      <span>Compare prices from different farmers</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span>•</span>
                      <span>Check farmer ratings and reviews</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span>•</span>
                      <span>Discuss delivery options clearly</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span>•</span>
                      <span>Build relationships with trusted farmers</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
