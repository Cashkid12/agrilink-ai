import mongoose from 'mongoose';

const customCakeRequestSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  occasion: {
    type: String,
    required: [true, 'Occasion is required'],
    trim: true,
    enum: ['Birthday', 'Wedding', 'Anniversary', 'Graduation', 'Baby Shower', 'Corporate Event', 'Christening', 'Gender Reveal', 'Other']
  },
  cakeSize: {
    type: String,
    required: [true, 'Cake size is required'],
    trim: true,
    enum: ['small', 'medium', 'large', 'x-large']
  },
  flavor: {
    type: String,
    required: [true, 'Flavor is required'],
    trim: true
  },
  icing: {
    type: String,
    required: [true, 'Icing type is required'],
    trim: true
  },
  color: {
    type: String,
    trim: true,
    default: ''
  },
  message: {
    type: String,
    trim: true,
    default: '',
    maxlength: [200, 'Message cannot exceed 200 characters']
  },
  designDescription: {
    type: String,
    required: [true, 'Design description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative'],
    default: 0
  },
  deliveryDate: {
    type: Date
  },
  specialInstructions: {
    type: String,
    trim: true,
    default: '',
    maxlength: [500, 'Special instructions cannot exceed 500 characters']
  },
  referenceImages: [{
    type: String // Cloudinary URLs
  }],
  status: {
    type: String,
    enum: ['pending', 'quoted', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Index for better query performance
customCakeRequestSchema.index({ status: 1, createdAt: -1 });
customCakeRequestSchema.index({ phone: 1 });

export default mongoose.model('CustomCakeRequest', customCakeRequestSchema);
