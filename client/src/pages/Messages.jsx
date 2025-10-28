import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { usersAPI } from '../api'

const Messages = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [message, setMessage] = useState('')
  const [farmers, setFarmers] = useState([])
  const [buyers, setBuyers] = useState([])

  useEffect(() => {
    fetchUsers()
  }, [user])

  const fetchUsers = async () => {
    try {
      // For farmers: show buyers, for buyers: show farmers
      if (user?.role === 'farmer') {
        const response = await usersAPI.getFarmers()
        // Filter out current user and get buyers (users with different role)
        const buyersList = response.data.filter(u => u._id !== user.id && u.role === 'buyer')
        setBuyers(buyersList)
      } else {
        const response = await usersAPI.getFarmers()
        setFarmers(response.data.filter(u => u._id !== user.id))
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const startConversation = (user) => {
    setSelectedUser(user)
    // In a real app, this would load existing messages
  }

  const sendMessage = () => {
    if (!message.trim() || !selectedUser) return

    // In a real app, this would send via Socket.io
    const newMessage = {
      id: Date.now(),
      content: message,
      sender: user.id,
      receiver: selectedUser._id,
      timestamp: new Date(),
      isCurrentUser: true
    }

    // Add to conversations (mock implementation)
    const conversation = conversations.find(c => c.user._id === selectedUser._id)
    if (conversation) {
      conversation.messages.push(newMessage)
      setConversations([...conversations])
    } else {
      setConversations([
        ...conversations,
        {
          user: selectedUser,
          messages: [newMessage]
        }
      ])
    }

    setMessage('')
    
    // Show success message
    alert(`Message sent to ${selectedUser.name}!`)
  }

  const getCurrentConversation = () => {
    if (!selectedUser) return null
    return conversations.find(c => c.user._id === selectedUser._id)
  }

  const currentConversation = getCurrentConversation()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>
        
        <div className="card p-0 overflow-hidden">
          <div className="grid grid-cols-4 h-96">
            {/* Users List */}
            <div className="col-span-1 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">
                  {user?.role === 'farmer' ? 'Buyers' : 'Farmers'}
                </h2>
              </div>
              <div className="overflow-y-auto h-80">
                {(user?.role === 'farmer' ? buyers : farmers).length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No {user?.role === 'farmer' ? 'buyers' : 'farmers'} found
                  </div>
                ) : (
                  (user?.role === 'farmer' ? buyers : farmers).map(person => (
                    <div
                      key={person._id}
                      onClick={() => startConversation(person)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedUser?._id === person._id ? 'bg-primary-50 border-primary-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                          {person.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {person.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {person.profile?.farmName || person.profile?.businessName}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="col-span-3 flex flex-col">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                      {selectedUser.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedUser.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedUser.profile?.farmName || selectedUser.profile?.businessName}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {currentConversation?.messages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-4">💬</div>
                        <p>No messages yet</p>
                        <p className="text-sm mt-2">Start a conversation with {selectedUser.name}</p>
                      </div>
                    ) : (
                      currentConversation?.messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${
                            msg.isCurrentUser ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              msg.isCurrentUser
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder={`Message ${selectedUser.name}...`}
                        className="input-field flex-1"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!message.trim()}
                        className="btn-primary disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-4">💭</div>
                    <h3 className="text-xl font-semibold mb-2">Start a Conversation</h3>
                    <p>Select a {user?.role === 'farmer' ? 'buyer' : 'farmer'} to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Chat Tips</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Be clear about product details and pricing</li>
            <li>• Discuss delivery options and timelines</li>
            <li>• Negotiate respectfully</li>
            <li>• Confirm orders before proceeding</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Messages