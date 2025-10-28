import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productsAPI } from '../api'
import { useAuth } from '../contexts/AuthContext'

const AddProduct = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    category: 'vegetables',
    description: '',
    price: '',
    quantity: '',
    unit: 'kg',
    location: {
      county: '',
      subcounty: ''
    }
  })
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  const categories = ['vegetables', 'fruits', 'flowers', 'grains', 'herbs', 'other']
  const units = ['kg', 'g', 'pieces', 'bunches', 'crates']
  const counties = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika']

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('location.')) {
      const locationField = name.replace('location.', '')
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (user?.role !== 'farmer') {
      alert('Only farmers can add products')
      return
    }

    setLoading(true)
    try {
      const productData = new FormData()
      
      // Append form data
      Object.keys(formData).forEach(key => {
        if (key === 'location') {
          productData.append('location[county]', formData.location.county)
          productData.append('location[subcounty]', formData.location.subcounty)
        } else {
          productData.append(key, formData[key])
        }
      })

      // Append images
      images.forEach(image => {
        productData.append('images', image)
      })

      await productsAPI.create(productData)
      alert('Product added successfully!')
      navigate('/market')
    } catch (error) {
      alert('Error adding product: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Product</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images *
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="input-field"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload up to 5 images of your product
              </p>
              {images.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Fresh Tomatoes"
                required
              />
            </div>

            {/* Category and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (KES) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 150"
                  required
                />
              </div>
            </div>

            {/* Quantity and Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit *
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  County *
                </label>
                <select
                  name="location.county"
                  value={formData.location.county}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub-county *
                </label>
                <input
                  type="text"
                  name="location.subcounty"
                  value={formData.location.subcounty}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Westlands"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="input-field"
                placeholder="Describe your product (quality, freshness, etc.)"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/market')}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {loading ? 'Adding Product...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddProduct