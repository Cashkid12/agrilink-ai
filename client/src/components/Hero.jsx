import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Hero = () => {
  const { isAuthenticated } = useAuth()

  const features = [
    { icon: '🤖', title: 'AI Powered', desc: 'Smart price predictions and market insights' },
    { icon: '🚚', title: 'Fast Delivery', desc: 'Direct from farm to your location' },
    { icon: '💸', title: 'Fair Prices', desc: 'No middlemen, better prices for all' },
  ]

  return (
    <section className="relative gradient-primary text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                <span className="text-sm font-semibold">🌾 Connecting Kenyan Farmers & Buyers</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Fresh Produce
                <span className="block text-green-200">Direct to You</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-green-100 leading-relaxed max-w-2xl">
                AgriLink AI connects farmers directly with buyers using artificial intelligence for fair prices and better deals.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!isAuthenticated ? (
                <>
                  <Link 
                    to="/register?role=farmer" 
                    className="group bg-white text-primary-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl text-lg text-center transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-medium"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>👨‍🌾 Start Selling</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </Link>
                  <Link 
                    to="/register?role=buyer" 
                    className="group border-2 border-white text-white hover:bg-white hover:text-primary-600 font-bold py-4 px-8 rounded-xl text-lg text-center transition-all duration-200 transform hover:scale-105"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>🛒 Start Buying</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </Link>
                </>
              ) : (
                <Link 
                  to="/market" 
                  className="group bg-white text-primary-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl text-lg text-center transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-medium"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>🌱 Browse Marketplace</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8">
              {[
                { number: '500+', label: 'Active Farmers' },
                { number: '200+', label: 'Trusted Buyers' },
                { number: '1K+', label: 'Monthly Transactions' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.number}</div>
                  <div className="text-green-200 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Visual */}
          <div className="relative">
            {/* Main Card */}
            <div className="card-glass p-8 transform rotate-2 animate-float">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { emoji: '🍅', name: 'Tomatoes', price: 'KES 120' },
                  { emoji: '🥑', name: 'Avocados', price: 'KES 80' },
                  { emoji: '🌽', name: 'Maize', price: 'KES 60' },
                  { emoji: '🥦', name: 'Broccoli', price: 'KES 150' },
                ].map((item, index) => (
                  <div key={index} className="bg-white/20 rounded-xl p-4 text-center backdrop-blur-sm border border-white/30">
                    <div className="text-2xl mb-2">{item.emoji}</div>
                    <div className="font-semibold text-white text-sm">{item.name}</div>
                    <div className="text-green-200 text-xs">{item.price}</div>
                  </div>
                ))}
              </div>
              
              {/* AI Features Card */}
              <div className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-white">Live AI Insights</span>
                </div>
                <div className="space-y-2 text-sm text-green-100">
                  <div className="flex justify-between">
                    <span>Tomato demand:</span>
                    <span className="font-semibold">↑ 25% this week</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best price:</span>
                    <span className="font-semibold">KES 120-140/kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Top location:</span>
                    <span className="font-semibold">Nairobi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-green-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          </div>
        </div>

        {/* Features Bar */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="card-glass p-6 text-center group hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-200">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-green-100 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-white"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="fill-white"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-white"></path>
        </svg>
      </div>
    </section>
  )
}

export default Hero