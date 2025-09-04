const express = require('express');
const cors = require('cors');
const ImageGenerationService = require('./services/imageGeneration');
const TexelAIService = require('./services/texelai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const imageService = new ImageGenerationService();
const texelService = new TexelAIService();

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      image_generation: 'ready',
      texel_ai: 'ready'
    }
  });
});

// API Info
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Dacras AI API',
    version: '1.0.0',
    description: 'AI-powered video ad generation platform',
    endpoints: {
      actors: '/api/actors',
      video_generation: '/api/v1/video/generate',
      script_generation: '/api/v1/script/generate',
      status: '/api/v1/status/:job_id'
    }
  });
});

// Mock actors endpoint
app.get('/api/actors', (req, res) => {
  const { gender, style, age_range } = req.query;
  
  let actors = [
    {
      id: 'actor_001',
      name: 'Emma Professional',
      gender: 'female',
      age_range: '25-35',
      style: 'professional',
      avatar_url: '/actors/emma.jpg',
      voice_id: 'voice_001',
      description: 'Professional businesswoman with confident presentation style',
      languages: ['en-US', 'en-GB'],
      personality_traits: ['confident', 'articulate', 'trustworthy'],
      use_cases: ['corporate', 'financial', 'healthcare']
    },
    {
      id: 'actor_002',
      name: 'David Casual',
      gender: 'male',
      age_range: '28-40',
      style: 'casual',
      avatar_url: '/actors/david.jpg',
      voice_id: 'voice_002',
      description: 'Friendly and approachable casual presenter',
      languages: ['en-US'],
      personality_traits: ['friendly', 'relatable', 'energetic'],
      use_cases: ['lifestyle', 'tech', 'entertainment']
    },
    {
      id: 'actor_003',
      name: 'Sarah Creative',
      gender: 'female',
      age_range: '22-30',
      style: 'creative',
      avatar_url: '/actors/sarah.jpg',
      voice_id: 'voice_003',
      description: 'Artistic and expressive creative presenter',
      languages: ['en-US', 'es-US'],
      personality_traits: ['artistic', 'expressive', 'innovative'],
      use_cases: ['fashion', 'design', 'arts']
    }
  ];

  // Apply filters
  if (gender) actors = actors.filter(a => a.gender === gender);
  if (style) actors = actors.filter(a => a.style === style);
  if (age_range) actors = actors.filter(a => a.age_range === age_range);

  res.json({
    actors,
    total: actors.length,
    filters: { gender, style, age_range }
  });
});

// Mock script generation
app.post('/api/v1/script/generate', (req, res) => {
  const { product_name, target_audience, key_message, tone = 'friendly', duration = 30 } = req.body;
  
  if (!product_name || !target_audience || !key_message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const jobId = 'script_' + Math.random().toString(36).substr(2, 9);
  const script = `Transform your ${product_name} experience! Perfect for ${target_audience}. ${key_message} - the solution you've been waiting for!`;

  res.json({
    job_id: jobId,
    script,
    status: 'completed',
    metadata: {
      word_count: script.split(' ').length,
      estimated_duration: duration,
      tone,
      generated_at: new Date().toISOString()
    }
  });
});

// Mock video generation  
app.post('/api/v1/video/generate', (req, res) => {
  const { script, actor_id } = req.body;
  
  if (!script || !actor_id) {
    return res.status(400).json({ error: 'Script and actor_id are required' });
  }

  const jobId = 'video_' + Math.random().toString(36).substr(2, 9);
  
  res.status(202).json({
    job_id: jobId,
    status: 'processing',
    estimated_completion_time: 60,
    submitted_at: new Date().toISOString()
  });
});

// Mock job status
app.get('/api/v1/status/:job_id', (req, res) => {
  const { job_id } = req.params;
  
  // Simulate completed job
  res.json({
    job_id,
    status: 'completed',
    progress: 100,
    created_at: new Date(Date.now() - 90000).toISOString(), // 1.5 min ago
    updated_at: new Date().toISOString(),
    result: {
      download_url: `https://results.dacras.ai/videos/${job_id}.mp4`,
      thumbnail_url: `https://results.dacras.ai/thumbnails/${job_id}.jpg`,
      duration: 32.5,
      file_size: 45,
      format: 'mp4',
      resolution: '1920x1080'
    },
    processing_time: 87.3
  });
});

// Mock image generation
app.post('/api/images/generate', (req, res) => {
  const { prompt, provider = 'openai' } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const imageId = 'img_' + Math.random().toString(36).substr(2, 9);
  
  res.status(201).json({
    success: true,
    images: [{
      id: imageId,
      url: `/api/images/${imageId}.jpg`,
      width: 1920,
      height: 1080,
      created_at: new Date().toISOString()
    }],
    provider,
    request_id: 'req_' + Math.random().toString(36).substr(2, 9)
  });
});

// Test service endpoints
app.get('/test/services', async (req, res) => {
  try {
    // Test image service
    const imageTest = imageService.enhancePrompt('test prompt', { background_style: 'office' });
    
    // Test texel service  
    const texelHealth = await texelService.healthCheck();
    
    res.json({
      success: true,
      services: {
        image_generation: {
          status: 'working',
          test: 'prompt enhancement successful',
          enhanced_length: imageTest.length
        },
        texel_ai: {
          status: 'configured',
          base_url: texelService.baseUrl,
          health_check: texelHealth.healthy || 'connection_test'
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handler
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Dacras AI Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎭 Actors API: http://localhost:${PORT}/api/actors`);
  console.log(`🧪 Service test: http://localhost:${PORT}/test/services`);
});

module.exports = { app, server };