import React from 'react'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import { useAuth } from '../contexts/AuthContext'

const Home = () => {
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: '🤝',
      title: 'Direct Connection',
      description: 'Connect directly with farmers and buyers without middlemen taking profits. Build lasting relationships with your trading partners.'
    },
    {
      icon: '💡',
      title: 'AI Price Prediction',
      description: 'Get intelligent price suggestions based on real-time market data, weather patterns, and demand trends.'
    },
    {
      icon: '🌱',
      title: 'Smart Matching',
      description: 'Our AI algorithm matches you with the best trading partners based on location, preferences, and market demand.'
    },
    {
      icon: '📱',
      title: 'Real-time Chat',
      description: 'Communicate instantly with potential buyers or farmers through our secure, built-in messaging system.'
    },
    {
      icon: '🌧️',
      title: 'Weather Insights',
      description: 'Get accurate weather forecasts and farming recommendations to help you plan and optimize your operations.'
    },
    {
      icon: '📊',
      title: 'Market Analytics',
      description: 'Access comprehensive market data, trends, and insights to make informed business decisions.'
    }
  ]

  const howItWorks = [
    {
      step: '01',
      title: 'Create Account',
      description: 'Sign up as a farmer or buyer in just 2 minutes',
      icon: '👤'
    },
    {
      step: '02',
      title: 'Set Up Profile',
      description: 'Complete your profile with details about your farm or business',
      icon: '🏪'
    },
    {
      step: '03',
      title: 'List or Browse',
      description: 'Farmers list their produce, buyers browse fresh offerings',
      icon: '📝'
    },
    {
      step: '04',
      title: 'Connect & Trade',
      description: 'Use our platform to negotiate and complete transactions',
      icon: '🤝'
    }
  ]

  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-primary-500">AgriLink AI</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're revolutionizing agricultural trade in Kenya with cutting-edge AI technology, 
              creating a fair and transparent marketplace for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group card p-8 hover:transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform duration-200">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-6 w-12 h-1 bg-primary-500 rounded-full transform group-hover:scale-x-150 transition-transform duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It <span className="text-primary-500">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting started with AgriLink AI is simple and straightforward. 
              Join thousands of farmers and buyers already benefiting from our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative text-center group">
                {/* Connecting Line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-primary-200 -z-10"></div>
                )}
                
                <div className="card p-8 group-hover:shadow-medium transition-all duration-300">
                  <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 transform group-hover:scale-110 transition-transform duration-200">
                    {step.icon}
                  </div>
                  
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Agricultural Business?
          </h2>
          <p className="text-xl text-green-100 mb-8 leading-relaxed">
            Join thousands of farmers and buyers who are already benefiting from direct, 
            fair trade powered by artificial intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link 
                  to="/register?role=farmer" 
                  className="group bg-white text-primary-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-medium"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>👨‍🌾 Join as Farmer</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </Link>
                <Link 
                  to="/register?role=buyer" 
                  className="group border-2 border-white text-white hover:bg-white hover:text-primary-600 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>🛒 Join as Buyer</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </Link>
              </>
            ) : (
              <Link 
                to="/market" 
                className="group bg-white text-primary-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-medium"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>🌱 Explore Marketplace</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
            )}
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-green-400/30">
            {[
              { number: '40%', label: 'Higher Farmer Income' },
              { number: '30%', label: 'Lower Buyer Prices' },
              { number: '24h', label: 'Average Deal Time' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-green-200 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home