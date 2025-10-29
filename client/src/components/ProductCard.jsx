import React from 'react'
import { Link } from 'react-router-dom'

const ProductCard = ({ product }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(price)
  }

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        {product.images && product.images.length > 0 ? (
          <img
            src={`http://localhost:5000/${product.images[0]}`}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
            {product.category}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </div>
            {product.suggestedPrice && (
              <div className="text-xs text-gray-500">
                AI Suggested: {formatPrice(product.suggestedPrice)}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              {product.quantity} {product.unit}
            </div>
            <div className="text-xs text-gray-500">
              {product.location?.county}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {product.farmer?.profile?.profileImage ? (
              <img
                src={`http://localhost:5000/${product.farmer.profile.profileImage}`}
                alt={product.farmer.name}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs">
                  {product.farmer?.name?.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-sm text-gray-600">
              {product.farmer?.name}
            </span>
            {product.farmer?.profile?.verified && (
              <span className="text-blue-500 text-xs">✓ Verified</span>
            )}
          </div>
          <span className="text-yellow-500 text-sm">
            ⭐ {product.farmer?.profile?.rating || 'New'}
          </span>
        </div>

        <Link
          to={`/product/${product._id}`}
          className="mt-4 w-full btn-primary block text-center"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}

export default ProductCard