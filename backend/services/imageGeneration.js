const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ImageGenerationService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.texelApiKey = process.env.TEXEL_API_KEY;
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.supportedFormats = ['png', 'jpeg', 'webp'];
    this.qualitySettings = {
      low: { quality: 70, compress: true },
      medium: { quality: 85, compress: false },
      high: { quality: 95, compress: false }
    };
  }

  async generateImageOpenAI(prompt, options = {}) {
    const {
      model = 'dall-e-3',
      size = '1792x1024',
      quality = 'hd',
      style = 'natural',
      n = 1
    } = options;

    try {
      const response = await axios.post('https://api.openai.com/v1/images/generations', {
        model,
        prompt: this.enhancePrompt(prompt, options),
        size,
        quality,
        style,
        n,
        response_format: 'url'
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });

      const imageUrls = response.data.data.map(img => img.url);
      
      // Download and process images
      const processedImages = await Promise.all(
        imageUrls.map(url => this.downloadAndProcessImage(url, options))
      );

      return {
        success: true,
        images: processedImages,
        usage: response.data.usage || null,
        metadata: {
          model,
          prompt,
          size,
          quality,
          style,
          generated_at: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('OpenAI image generation error:', error);
      throw new Error(`Image generation failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async generateImageTexelAI(prompt, options = {}) {
    const {
      width = 1920,
      height = 1080,
      num_inference_steps = 50,
      guidance_scale = 7.5,
      model_type = 'txt2img'
    } = options;

    try {
      const response = await axios.post(`https://api.prod.texel.ai/v1/sd_server/${model_type}`, {
        prompt: this.enhancePrompt(prompt, options),
        width,
        height,
        num_inference_steps,
        guidance_scale,
        safety_check: true,
        return_json: true
      }, {
        headers: {
          'Authorization': `Bearer ${this.texelApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000
      });

      if (response.data.job_id) {
        // Poll for completion
        const result = await this.pollTexelAIJob(response.data.job_id, model_type);
        return result;
      }

      return response.data;

    } catch (error) {
      console.error('Texel.ai image generation error:', error);
      throw new Error(`Texel.ai generation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async pollTexelAIJob(jobId, modelType, maxAttempts = 30) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await axios.get(
          `https://api.prod.texel.ai/v1/sd_server/status/${jobId}/${modelType}`,
          {
            headers: {
              'Authorization': `Bearer ${this.texelApiKey}`
            }
          }
        );

        const { status, progress, result } = response.data;

        if (status === 'completed' && result) {
          // Process the generated images
          const processedImages = await Promise.all(
            result.images.map(img => this.processTexelAIImage(img))
          );

          return {
            success: true,
            images: processedImages,
            job_id: jobId,
            status,
            progress: 100
          };
        }

        if (status === 'failed') {
          throw new Error(`Texel.ai job failed: ${result?.error || 'Unknown error'}`);
        }

        // Wait before next poll
        await this.sleep(2000);

      } catch (error) {
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        await this.sleep(1000);
      }
    }

    throw new Error('Texel.ai job timeout - max polling attempts reached');
  }

  async processTexelAIImage(imageData) {
    const imageId = uuidv4();
    const fileName = `generated_${imageId}.png`;
    const filePath = path.join(this.uploadDir, 'images', fileName);

    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    if (imageData.url) {
      // Download from URL
      const response = await axios.get(imageData.url, { responseType: 'arraybuffer' });
      await fs.writeFile(filePath, response.data);
    } else if (imageData.base64) {
      // Process base64 data
      const buffer = Buffer.from(imageData.base64, 'base64');
      await fs.writeFile(filePath, buffer);
    }

    // Get image metadata
    const metadata = await sharp(filePath).metadata();

    return {
      id: imageId,
      url: `/api/images/${fileName}`,
      local_path: filePath,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      created_at: new Date().toISOString()
    };
  }

  async downloadAndProcessImage(imageUrl, options = {}) {
    const imageId = uuidv4();
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    
    const fileName = `generated_${imageId}.png`;
    const filePath = path.join(this.uploadDir, 'images', fileName);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    let imageBuffer = Buffer.from(response.data);
    
    // Process image with Sharp
    if (options.resize || options.format || options.quality) {
      const sharpInstance = sharp(imageBuffer);
      
      if (options.resize) {
        const { width, height, fit = 'inside' } = options.resize;
        sharpInstance.resize(width, height, { fit });
      }
      
      if (options.format && this.supportedFormats.includes(options.format)) {
        const qualityConfig = this.qualitySettings[options.quality] || this.qualitySettings.medium;
        
        if (options.format === 'jpeg') {
          sharpInstance.jpeg(qualityConfig);
        } else if (options.format === 'webp') {
          sharpInstance.webp(qualityConfig);
        } else {
          sharpInstance.png({ compressionLevel: qualityConfig.compress ? 9 : 6 });
        }
      }
      
      imageBuffer = await sharpInstance.toBuffer();
    }

    await fs.writeFile(filePath, imageBuffer);

    // Get processed image metadata
    const metadata = await sharp(filePath).metadata();

    return {
      id: imageId,
      url: `/api/images/${fileName}`,
      local_path: filePath,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      created_at: new Date().toISOString()
    };
  }

  enhancePrompt(basePrompt, options = {}) {
    let enhancedPrompt = basePrompt;

    // Add style enhancements
    if (options.background_style) {
      const styleMap = {
        modern_home: 'modern minimalist home interior, clean lines, natural lighting',
        office: 'professional office environment, corporate setting, business atmosphere',
        outdoor: 'natural outdoor setting, daylight, fresh environment',
        studio: 'clean white studio background, professional lighting',
        casual: 'casual lifestyle setting, comfortable atmosphere',
        luxury: 'luxury premium environment, high-end materials, sophisticated'
      };

      const stylePrompt = styleMap[options.background_style];
      if (stylePrompt) {
        enhancedPrompt += `, ${stylePrompt}`;
      }
    }

    // Add quality and technical parameters
    const qualityPrompts = [
      'high quality',
      'professional photography',
      'sharp focus',
      '8k resolution',
      'photorealistic'
    ];

    enhancedPrompt += `, ${qualityPrompts.join(', ')}`;

    // Brand compliance
    if (options.brand_colors && Array.isArray(options.brand_colors)) {
      const colorNames = this.hexToColorNames(options.brand_colors);
      enhancedPrompt += `, color scheme: ${colorNames.join(' and ')}`;
    }

    return enhancedPrompt;
  }

  hexToColorNames(hexColors) {
    const colorMap = {
      '#6366f1': 'indigo',
      '#ec4899': 'pink',
      '#10b981': 'emerald',
      '#f59e0b': 'amber',
      '#ef4444': 'red',
      '#3b82f6': 'blue',
      '#8b5cf6': 'violet',
      '#06b6d4': 'cyan'
    };

    return hexColors.map(hex => colorMap[hex.toLowerCase()] || 'custom color');
  }

  async optimizeForWeb(imagePath, targetSize = 'medium') {
    const optimizedPath = imagePath.replace('.png', '_optimized.webp');
    const settings = this.qualitySettings[targetSize];

    await sharp(imagePath)
      .webp(settings)
      .toFile(optimizedPath);

    const stats = await fs.stat(optimizedPath);
    const originalStats = await fs.stat(imagePath);

    return {
      original_path: imagePath,
      optimized_path: optimizedPath,
      original_size: originalStats.size,
      optimized_size: stats.size,
      compression_ratio: ((originalStats.size - stats.size) / originalStats.size * 100).toFixed(2)
    };
  }

  async createImageVariations(imagePath, count = 3, options = {}) {
    const variations = [];

    for (let i = 0; i < count; i++) {
      const variationId = uuidv4();
      const outputPath = imagePath.replace('.png', `_variation_${i + 1}.png`);

      const sharpInstance = sharp(imagePath);

      // Apply different variations
      switch (i % 4) {
        case 0:
          // Brightness adjustment
          sharpInstance.modulate({ brightness: 1.1 });
          break;
        case 1:
          // Saturation adjustment
          sharpInstance.modulate({ saturation: 1.2 });
          break;
        case 2:
          // Contrast adjustment
          sharpInstance.linear(1.1, -(128 * 1.1) + 128);
          break;
        case 3:
          // Hue adjustment
          sharpInstance.modulate({ hue: 10 });
          break;
      }

      await sharpInstance.toFile(outputPath);

      const metadata = await sharp(outputPath).metadata();

      variations.push({
        id: variationId,
        url: `/api/images/${path.basename(outputPath)}`,
        local_path: outputPath,
        width: metadata.width,
        height: metadata.height,
        variation_type: ['brightness', 'saturation', 'contrast', 'hue'][i % 4],
        created_at: new Date().toISOString()
      });
    }

    return variations;
  }

  async generateBackgroundsForVideoAd(productType, count = 5) {
    const backgroundPrompts = {
      technology: [
        'modern tech office with clean computers and monitors',
        'futuristic digital workspace with holographic displays',
        'minimalist home office with latest technology',
        'sleek coworking space with modern furniture',
        'high-tech laboratory with advanced equipment'
      ],
      lifestyle: [
        'cozy living room with natural lighting',
        'modern kitchen with granite countertops',
        'beautiful outdoor patio with garden view',
        'luxury bedroom with premium bedding',
        'elegant dining room with modern decor'
      ],
      business: [
        'professional conference room with large windows',
        'modern office lobby with reception desk',
        'executive office with city skyline view',
        'contemporary meeting space with presentation screen',
        'corporate boardroom with premium furniture'
      ]
    };

    const prompts = backgroundPrompts[productType] || backgroundPrompts.lifestyle;
    const selectedPrompts = prompts.slice(0, count);

    const backgrounds = await Promise.all(
      selectedPrompts.map(async (prompt, index) => {
        const result = await this.generateImageOpenAI(prompt, {
          size: '1792x1024',
          quality: 'hd',
          style: 'natural',
          background_style: productType
        });

        return {
          ...result.images[0],
          prompt,
          background_type: productType,
          index: index + 1
        };
      })
    );

    return backgrounds;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ImageGenerationService;