const nock = require('nock');
const { v4: uuidv4 } = require('uuid');

const TEXEL_API_BASE = 'https://api.prod.texel.ai';

class TexelAIMock {
  constructor() {
    this.scope = nock(TEXEL_API_BASE);
    this.defaultResponses = {
      lipsyncJob: {
        job_id: uuidv4(),
        status: 'processing',
        estimated_time: 45
      },
      lipsyncComplete: {
        job_id: uuidv4(),
        status: 'completed',
        download_url: 'https://api.prod.texel.ai/download/lipsync/test.mp4',
        duration: 30.5,
        quality: 'hd'
      },
      imageGeneration: {
        job_id: uuidv4(),
        status: 'completed',
        images: [
          {
            url: 'https://api.prod.texel.ai/download/img/test.jpg',
            width: 1920,
            height: 1080,
            format: 'jpeg'
          }
        ]
      },
      videoGeneration: {
        job_id: uuidv4(),
        status: 'processing',
        estimated_time: 120
      }
    };
  }

  // Mock lip-sync endpoints
  mockLipsyncSubmission(customResponse = {}) {
    return this.scope
      .post('/v1/lipsync/run_lipsync')
      .reply(202, { ...this.defaultResponses.lipsyncJob, ...customResponse });
  }

  mockLipsyncStatus(jobId, customResponse = {}) {
    return this.scope
      .get(`/v1/lipsync/status/${jobId}`)
      .reply(200, { ...this.defaultResponses.lipsyncComplete, job_id: jobId, ...customResponse });
  }

  mockLipsyncDownload(jobId, customResponse = {}) {
    return this.scope
      .get(`/v1/lipsync/get_url/${jobId}`)
      .reply(200, { 
        download_url: `https://api.prod.texel.ai/download/lipsync/${jobId}.mp4`,
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        ...customResponse 
      });
  }

  // Mock image generation endpoints
  mockTextToImage(customResponse = {}) {
    return this.scope
      .post('/v1/sd_server/txt2img')
      .reply(201, { ...this.defaultResponses.imageGeneration, ...customResponse });
  }

  mockImageToImage(customResponse = {}) {
    return this.scope
      .post('/v1/sd_server/img2img')
      .reply(201, { ...this.defaultResponses.imageGeneration, ...customResponse });
  }

  mockImageGenerationStatus(jobId, modelType = 'txt2img', customResponse = {}) {
    return this.scope
      .get(`/v1/sd_server/status/${jobId}/${modelType}`)
      .reply(200, { job_id: jobId, status: 'completed', ...customResponse });
  }

  // Mock video generation endpoints
  mockTextToVideo(customResponse = {}) {
    return this.scope
      .post('/v1/sd_server/txt2vid')
      .reply(202, { ...this.defaultResponses.videoGeneration, ...customResponse });
  }

  mockImageToVideo(customResponse = {}) {
    return this.scope
      .post('/v1/sd_server/img2vid')
      .reply(202, { ...this.defaultResponses.videoGeneration, ...customResponse });
  }

  // Mock video encoding endpoints
  mockVideoEncoding(customResponse = {}) {
    return this.scope
      .post('/v1/video_encoder/encode')
      .reply(202, { 
        job_id: uuidv4(), 
        status: 'processing',
        estimated_time: 30,
        ...customResponse 
      });
  }

  mockVideoEncodingStatus(jobId, customResponse = {}) {
    return this.scope
      .get(`/v1/video_encoder/status/${jobId}`)
      .reply(200, { 
        job_id: jobId, 
        status: 'completed',
        output_url: `https://api.prod.texel.ai/download/encoded/${jobId}.mp4`,
        ...customResponse 
      });
  }

  // Mock error responses
  mockAuthError() {
    return this.scope
      .post(/.*/)
      .reply(401, { error: 'Unauthorized', message: 'Invalid API key' });
  }

  mockRateLimit() {
    return this.scope
      .post(/.*/)
      .reply(429, { error: 'Rate Limited', message: 'Too many requests' });
  }

  mockServerError() {
    return this.scope
      .post(/.*/)
      .reply(500, { error: 'Internal Server Error', message: 'Texel.ai service unavailable' });
  }

  // Utility methods
  reset() {
    this.scope = nock(TEXEL_API_BASE);
  }

  done() {
    this.scope.done();
  }

  isDone() {
    return this.scope.isDone();
  }
}

// Helper function to create mock responses for testing
const createTexelMockResponse = (endpoint, statusCode = 200, customData = {}) => {
  const baseResponses = {
    lipsync: { job_id: uuidv4(), status: 'processing' },
    txt2img: { job_id: uuidv4(), status: 'completed' },
    txt2vid: { job_id: uuidv4(), status: 'processing' },
    status: { status: 'completed', progress: 100 }
  };

  return {
    statusCode,
    data: { ...baseResponses[endpoint], ...customData }
  };
};

module.exports = {
  TexelAIMock,
  createTexelMockResponse,
  TEXEL_API_BASE
};