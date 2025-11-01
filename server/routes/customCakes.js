import express from 'express';
import multer from 'multer';
import CustomCakeRequest from '../models/CustomCakeRequest.js';
import { cloudinary } from '../utils/cloudinary.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Cloudinary upload function
const uploadToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'valentine-cake-house-custom',
        format: 'auto',
        quality: 'auto'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    uploadStream.end(fileBuffer);
  });
};

// Create custom cake request
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    console.log('🎨 Received custom cake request');
    console.log('Body fields:', Object.keys(req.body));
    console.log('Files count:', req.files ? req.files.length : 0);

    // Extract form data
    const {
      customerName,
      phone,
      email,
      occasion,
      cakeSize,
      flavor,
      icing,
      color,
      message,
      designDescription,
      budget,
      deliveryDate,
      specialInstructions
    } = req.body;

    // Validate required fields
    if (!customerName || !phone || !occasion || !cakeSize || !flavor || !icing || !designDescription) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, phone, occasion, size, flavor, icing, and design description are required'
      });
    }

    // Prepare request data
    const requestData = {
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email?.trim() || '',
      occasion: occasion.trim(),
      cakeSize: cakeSize.trim(),
      flavor: flavor.trim(),
      icing: icing.trim(),
      color: color?.trim() || '',
      message: message?.trim() || '',
      designDescription: designDescription.trim(),
      budget: budget ? parseInt(budget) : 0,
      deliveryDate: deliveryDate || '',
      specialInstructions: specialInstructions?.trim() || '',
      status: 'pending'
    };

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      console.log('🖼️ Uploading reference images to Cloudinary...');
      const referenceImages = [];
      
      for (const file of req.files) {
        try {
          const result = await uploadToCloudinary(file.buffer);
          referenceImages.push(result.secure_url);
          console.log('✅ Reference image uploaded:', result.secure_url);
        } catch (uploadError) {
          console.error('❌ Image upload failed:', uploadError);
          // Continue with other images even if one fails
        }
      }
      
      requestData.referenceImages = referenceImages;
    }

    console.log('💾 Saving custom cake request to database...');

    // Create and save the request
    const customRequest = new CustomCakeRequest(requestData);
    const savedRequest = await customRequest.save();

    console.log('✅ Custom cake request saved:', savedRequest._id);

    res.status(201).json({
      success: true,
      message: 'Custom cake request submitted successfully! We will contact you within 24 hours.',
      requestId: savedRequest._id
    });

  } catch (error) {
    console.error('❌ Error creating custom cake request:', error);
    
    let errorMessage = 'Failed to submit request. Please try again.';
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      errorMessage = `Validation error: ${errors.join(', ')}`;
    }
    
    res.status(400).json({
      success: false,
      message: errorMessage
    });
  }
});

// Get all custom cake requests (for admin - will be protected in admin routes)
router.get('/', async (req, res) => {
  try {
    const requests = await CustomCakeRequest.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Error fetching custom requests:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single custom cake request
router.get('/:id', async (req, res) => {
  try {
    const request = await CustomCakeRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Custom cake request not found'
      });
    }

    res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Error fetching custom request:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
