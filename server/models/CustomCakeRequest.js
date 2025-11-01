import mongoose from 'mongoose';

const customCakeRequestSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  occasion: {
    type: String,
    required: true,
    trim: true
  },
  cakeSize: {
    type: String,
    required: true,
    trim: true
  },
  flavor: {
    type: String,
    required: true,
    trim: true
  },
  icing: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    default: '',
    trim: true
  },
  message: {
    type: String,
    default: '',
    trim: true
  },
  designDescription: {
    type: String,
    required: true,
    trim: true
  },
  budget: {
    type: Number,
    default: 0
  },
  deliveryDate: {
    type: String,
    default: ''
  },
  specialInstructions: {
    type: String,
    default: '',
    trim: true
  },
  referenceImages: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'quoted', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('CustomCakeRequest', customCakeRequestSchema);
