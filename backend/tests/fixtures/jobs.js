const { v4: uuidv4 } = require('uuid');

const mockJobStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled'];

const createMockJob = (overrides = {}) => ({
  job_id: uuidv4(),
  status: 'processing',
  progress: 45,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  job_type: 'video_generation',
  user_id: 'test_user_001',
  estimated_completion_time: 60,
  ...overrides
});

const createCompletedJob = (overrides = {}) => createMockJob({
  status: 'completed',
  progress: 100,
  result: {
    download_url: `https://results.dacras.ai/videos/${uuidv4()}.mp4`,
    thumbnail_url: `https://results.dacras.ai/thumbnails/${uuidv4()}.jpg`,
    duration: 32.5,
    file_size: 45,
    format: 'mp4',
    resolution: '1920x1080',
    quality: 'hd'
  },
  processing_time: 87.3,
  ...overrides
});

const createFailedJob = (overrides = {}) => createMockJob({
  status: 'failed',
  progress: 25,
  error: {
    code: 'PROCESSING_ERROR',
    message: 'Failed to process video generation request',
    details: 'Texel.ai API returned error during lip-sync processing'
  },
  ...overrides
});

const createScriptGenerationRequest = (overrides = {}) => ({
  product_name: 'EcoClean Pro',
  target_audience: 'environmentally conscious homeowners',
  key_message: 'chemical-free cleaning solutions',
  tone: 'friendly',
  duration: 30,
  call_to_action: 'Try it risk-free today!',
  additional_context: 'Eco-friendly household cleaning product',
  brand_voice: 'trustworthy and caring',
  ...overrides
});

const createVideoGenerationRequest = (overrides = {}) => ({
  script: 'Transform your cleaning routine with EcoClean Pro! Our chemical-free formula cleans effectively while protecting your family and the environment.',
  actor_id: 'actor_001',
  background_style: 'modern_home',
  aspect_ratio: '16:9',
  quality: 'hd',
  voice_speed: 1.0,
  add_captions: true,
  brand_colors: ['#6366f1', '#ec4899'],
  logo_url: 'https://example.com/logo.png',
  music_style: 'upbeat',
  fade_effects: true,
  ...overrides
});

const createBatchJobRequest = (overrides = {}) => ({
  base_config: createVideoGenerationRequest(),
  variations_count: 5,
  vary_actors: true,
  vary_backgrounds: true,
  vary_scripts: false,
  priority: 'normal',
  ...overrides
});

module.exports = {
  mockJobStatuses,
  createMockJob,
  createCompletedJob,
  createFailedJob,
  createScriptGenerationRequest,
  createVideoGenerationRequest,
  createBatchJobRequest
};