const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const ImageGenerationService = require('../services/imageGeneration');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const imageService = new ImageGenerationService();

// Rate limiting for image generation
const imageGenerationLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 image generation requests per windowMs
  message: 'Too many image generation requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.env.UPLOAD_DIR || './uploads', 'images');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `upload_${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

// Input validation middleware
const validateImageGeneration = [
  body('prompt')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Prompt must be between 10 and 1000 characters'),
  body('provider')
    .optional()
    .isIn(['openai', 'texelai'])
    .withMessage('Provider must be either "openai" or "texelai"'),
  body('size')
    .optional()
    .isIn(['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792'])
    .withMessage('Invalid image size'),
  body('quality')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Quality must be low, medium, or high'),
  body('background_style')
    .optional()
    .isIn(['modern_home', 'office', 'outdoor', 'studio', 'casual', 'luxury'])
    .withMessage('Invalid background style'),
  body('brand_colors')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Brand colors must be an array with maximum 5 colors'),
  body('brand_colors.*')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Each brand color must be a valid hex color')
];

// POST /api/images/generate - Generate new image
router.post('/generate', imageGenerationLimit, validateImageGeneration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      prompt,
      provider = 'openai',
      size = '1792x1024',
      quality = 'hd',
      style = 'natural',
      background_style,
      brand_colors,
      count = 1
    } = req.body;

    let result;
    
    if (provider === 'openai') {
      result = await imageService.generateImageOpenAI(prompt, {
        size,
        quality,
        style,
        background_style,
        brand_colors,
        n: Math.min(count, 4) // OpenAI max 4 images
      });
    } else if (provider === 'texelai') {
      const [width, height] = size.split('x').map(Number);
      result = await imageService.generateImageTexelAI(prompt, {
        width,
        height,
        background_style,
        brand_colors
      });
    }

    res.status(201).json({
      success: true,
      ...result,
      request_id: req.id,
      provider
    });

  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Image generation failed',
      message: error.message
    });
  }
});

// POST /api/images/generate-backgrounds - Generate multiple backgrounds for video ads
router.post('/generate-backgrounds', imageGenerationLimit, [
  body('product_type')
    .isIn(['technology', 'lifestyle', 'business', 'fashion', 'healthcare'])
    .withMessage('Invalid product type'),
  body('count')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Count must be between 1 and 10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { product_type, count = 5 } = req.body;

    const backgrounds = await imageService.generateBackgroundsForVideoAd(product_type, count);

    res.status(201).json({
      success: true,
      backgrounds,
      count: backgrounds.length,
      product_type,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Background generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Background generation failed',
      message: error.message
    });
  }
});

// POST /api/images/upload - Upload image for processing
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded'
      });
    }

    const imageUrl = `/api/images/${req.file.filename}`;
    
    res.status(201).json({
      success: true,
      image: {
        id: req.file.filename.split('.')[0],
        url: imageUrl,
        local_path: req.file.path,
        original_name: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploaded_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Image upload failed',
      message: error.message
    });
  }
});

// POST /api/images/:imageId/variations - Create variations of existing image
router.post('/:imageId/variations', [
  body('count')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Count must be between 1 and 8'),
  body('variation_types')
    .optional()
    .isArray()
    .withMessage('Variation types must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { imageId } = req.params;
    const { count = 3 } = req.body;

    // Find original image path
    const uploadDir = path.join(process.env.UPLOAD_DIR || './uploads', 'images');
    const files = await fs.readdir(uploadDir);
    const originalFile = files.find(file => file.includes(imageId));

    if (!originalFile) {
      return res.status(404).json({
        success: false,
        error: 'Original image not found'
      });
    }

    const originalPath = path.join(uploadDir, originalFile);
    const variations = await imageService.createImageVariations(originalPath, count);

    res.json({
      success: true,
      original_image_id: imageId,
      variations,
      count: variations.length,
      created_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Image variations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create image variations',
      message: error.message
    });
  }
});

// POST /api/images/:imageId/optimize - Optimize image for web
router.post('/:imageId/optimize', [
  body('target_size')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Target size must be low, medium, or high'),
  body('format')
    .optional()
    .isIn(['webp', 'jpeg', 'png'])
    .withMessage('Format must be webp, jpeg, or png')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { imageId } = req.params;
    const { target_size = 'medium' } = req.body;

    // Find original image
    const uploadDir = path.join(process.env.UPLOAD_DIR || './uploads', 'images');
    const files = await fs.readdir(uploadDir);
    const originalFile = files.find(file => file.includes(imageId));

    if (!originalFile) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    const originalPath = path.join(uploadDir, originalFile);
    const optimizationResult = await imageService.optimizeForWeb(originalPath, target_size);

    res.json({
      success: true,
      image_id: imageId,
      optimization: optimizationResult,
      optimized_url: `/api/images/${path.basename(optimizationResult.optimized_path)}`,
      optimized_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Image optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Image optimization failed',
      message: error.message
    });
  }
});

// GET /api/images/:filename - Serve image files
router.get('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.env.UPLOAD_DIR || './uploads', 'images', filename);

    // Check if file exists
    await fs.access(filePath);

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    const contentType = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp'
    }[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    res.sendFile(path.resolve(filePath));

  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Image not found'
    });
  }
});

// GET /api/images - List generated images with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, type = 'all' } = req.query;
    const uploadDir = path.join(process.env.UPLOAD_DIR || './uploads', 'images');

    const files = await fs.readdir(uploadDir);
    const imageFiles = files.filter(file => 
      ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(file).toLowerCase())
    );

    // Filter by type if specified
    let filteredFiles = imageFiles;
    if (type !== 'all') {
      filteredFiles = imageFiles.filter(file => {
        if (type === 'generated') return file.startsWith('generated_');
        if (type === 'uploaded') return file.startsWith('upload_');
        if (type === 'variations') return file.includes('_variation_');
        if (type === 'optimized') return file.includes('_optimized');
        return true;
      });
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

    // Get file details
    const images = await Promise.all(
      paginatedFiles.map(async (filename) => {
        const filePath = path.join(uploadDir, filename);
        const stats = await fs.stat(filePath);
        
        return {
          filename,
          url: `/api/images/${filename}`,
          size: stats.size,
          created_at: stats.birthtime.toISOString(),
          type: filename.startsWith('generated_') ? 'generated' : 
                filename.startsWith('upload_') ? 'uploaded' : 'processed'
        };
      })
    );

    res.json({
      success: true,
      images,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total_items: filteredFiles.length,
        total_pages: Math.ceil(filteredFiles.length / limit)
      },
      filter_type: type
    });

  } catch (error) {
    console.error('Image listing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list images',
      message: error.message
    });
  }
});

// DELETE /api/images/:filename - Delete image
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.env.UPLOAD_DIR || './uploads', 'images', filename);

    await fs.unlink(filePath);

    res.json({
      success: true,
      message: 'Image deleted successfully',
      filename,
      deleted_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(404).json({
      success: false,
      error: 'Image not found or could not be deleted',
      message: error.message
    });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: 'Image must be smaller than 10MB'
      });
    }
  }

  console.error('Images route error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

module.exports = router;