import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { productsAPI } from '../api'
import { useAuth } from '../contexts/AuthContext'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showChatModal, setShowChatModal] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(id)
      setProduct(response.data)
    } catch (error) {
      console.error('Error fetching product:', error)
      navigate('/market')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setShowChatModal(true)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link to="/market" className="btn-primary">
            Back to Marketplace
          </Link>
        </div>
      </div>
    )
  }

  const isOwner = user && product.farmer?._id === user.id

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link to="/" className="text-gray-400 hover:text-gray-500">Home</Link>
            </li>
            <li>
              <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <Link to="/market" className="text-gray-400 hover:text-gray-500">Marketplace</Link>
            </li>
            <li>
              <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <span className="text-gray-500">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
              {product.images && product.images.length > 0 ? (
                <>
                  <img
                    src={`http://localhost:5000/${product.images[activeImage]}`}
                    alt={product.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  
                  {product.images.length > 1 && (
                    <div className="flex space-x-2 mt-4 overflow-x-auto">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImage(index)}
                          className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden ${
                            activeImage === index ? 'border-primary' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={`http://localhost:5000/${image}`}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-4xl">🌱</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <div className="card">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h1>
                    <div className="flex items-center space-x-4">
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                        {product.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.available 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.available ? 'Available' : 'Sold Out'}
                      </span>
                    </div>
                  </div>
                  
                  {isOwner && (
                    <Link
                      to={`/edit-product/${product._id}`}
                      className="btn-secondary text-sm"
                    >
                      Edit Product
                    </Link>
                  )}
                </div>

                <p className="text-gray-600 text-lg">
                  {product.description}
                </p>
              </div>

              {/* Pricing */}
              <div className="border-t border-b border-gray-200 py-6 mb-6">
                <div className="flex items-baseline space-x-4 mb-2">
                  <div className="text-4xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </div>
                  <div className="text-lg text-gray-500">
                    per {product.unit}
                  </div>
                </div>
                
                {product.suggestedPrice && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      AI Suggested Price:
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {formatPrice(product.suggestedPrice)}
                    </span>
                  </div>
                )}
              </div>

              {/* Quantity & Availability */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Quantity
                    </label>
                    <div className="text-2xl font-bold text-gray-900">
                      {product.quantity} {product.unit}
                    </div>
                  </div>
                  
                  {!isOwner && product.available && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order Quantity
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-medium">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                          className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {!isOwner && (
                <div className="space-y-4 mb-6">
                  {product.available ? (
                    <>
                      <button
                        onClick={handleSendMessage}
                        className="w-full btn-primary py-3 text-lg font-semibold"
                      >
                        💬 Contact Farmer
                      </button>
                      <button className="w-full btn-secondary py-3">
                        ❤️ Save for Later
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      This product is currently not available
                    </div>
                  )}
                </div>
              )}

              {/* Farmer Info */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  About the Farmer
                </h3>
                
                <div className="flex items-center space-x-4">
                  {product.farmer?.profile?.profileImage ? (
                    <img
                      src={`http://localhost:5000/${product.farmer.profile.profileImage}`}
                      alt={product.farmer.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {product.farmer?.name?.charAt(0)}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {product.farmer?.name}
                      </h4>
                      {product.farmer?.profile?.verified && (
                        <span className="text-blue-500 text-sm">✓ Verified</span>
                      )}
                    </div>
                    
                    <div className="text-gray-600 text-sm mb-2">
                      {product.farmer?.profile?.farmName || product.farmer?.profile?.businessName}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>📍 {product.location?.county}</span>
                      <span>⭐ {product.farmer?.profile?.rating || 'New'}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            {product.aiRecommendation && (
              <div className="card mt-6 bg-blue-50 border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🤖</div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">
                      AI Recommendation
                    </h3>
                    <p className="text-blue-800">
                      {product.aiRecommendation.message}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(product.aiRecommendation.score || 0) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-blue-700">
                        {Math.round((product.aiRecommendation.score || 0) * 100)}% Match
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Contact {product.farmer?.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  className="input-field h-32"
                  placeholder={`Hi ${product.farmer?.name}, I'm interested in your ${product.name}...`}
                  defaultValue={`Hi ${product.farmer?.name}, I'm interested in your ${product.name}. Could you tell me more about availability and delivery options?`}
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowChatModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Implement send message logic
                    setShowChatModal(false)
                    alert('Message sent! The farmer will contact you soon.')
                  }}
                  className="flex-1 btn-primary"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail