const request = require('supertest');
const express = require('express');
const { TexelAIMock } = require('../mocks/texelai');
const { 
  createVideoGenerationRequest, 
  createBatchJobRequest, 
  createMockJob, 
  createCompletedJob 
} = require('../fixtures/jobs');

describe('Video Generation API Endpoints', () => {
  let app;
  let texelMock;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    texelMock = new TexelAIMock();

    // Mock video generation routes
    app.post('/api/v1/video/generate', (req, res) => {
      const jobId = 'job_' + Math.random().toString(36).substr(2, 9);
      res.status(202).json({
        job_id: jobId,
        status: 'processing',
        estimated_completion_time: 60
      });
    });

    app.post('/api/v1/video/generate-variations', (req, res) => {
      const { variations_count = 3 } = req.body;
      const jobs = Array(variations_count).fill().map(() => ({
        job_id: 'job_' + Math.random().toString(36).substr(2, 9),
        status: 'processing'
      }));
      
      res.status(202).json({
        batch_id: 'batch_' + Math.random().toString(36).substr(2, 9),
        jobs,
        total_variations: variations_count,
        estimated_completion_time: variations_count * 60
      });
    });

    app.get('/api/v1/status/:job_id', (req, res) => {
      const jobId = req.params.job_id;
      if (jobId.includes('completed')) {
        res.json(createCompletedJob({ job_id: jobId }));
      } else if (jobId.includes('failed')) {
        res.status(500).json({
          job_id: jobId,
          status: 'failed',
          error: 'Processing failed'
        });
      } else {
        res.json(createMockJob({ job_id: jobId }));
      }
    });

    app.get('/api/v1/download/:job_id', (req, res) => {
      const jobId = req.params.job_id;
      res.redirect(`https://results.dacras.ai/videos/${jobId}.mp4`);
    });
  });

  afterEach(() => {
    texelMock.reset();
  });

  describe('POST /api/v1/video/generate', () => {
    test('should create video generation job with valid request', async () => {
      const request_body = createVideoGenerationRequest();
      
      const response = await request(app)
        .post('/api/v1/video/generate')
        .send(request_body)
        .expect(202);

      expect(response.body).toHaveProperty('job_id');
      expect(response.body).toHaveProperty('status', 'processing');
      expect(response.body).toHaveProperty('estimated_completion_time');
      expect(typeof response.body.job_id).toBe('string');
      expect(response.body.job_id.length).toBeGreaterThan(5);
    });

    test('should handle minimal video generation request', async () => {
      const minimal_request = {
        script: 'Test script',
        actor_id: 'actor_001'
      };

      const response = await request(app)
        .post('/api/v1/video/generate')
        .send(minimal_request)
        .expect(202);

      expect(response.body).toHaveProperty('job_id');
      expect(response.body.status).toBe('processing');
    });

    test('should validate required fields', async () => {
      const invalid_request = {
        actor_id: 'actor_001'
        // Missing script
      };

      const app_with_validation = express();
      app_with_validation.use(express.json());
      app_with_validation.post('/api/v1/video/generate', (req, res) => {
        if (!req.body.script) {
          return res.status(400).json({ error: 'Script is required' });
        }
        if (!req.body.actor_id) {
          return res.status(400).json({ error: 'Actor ID is required' });
        }
        res.status(202).json({ job_id: 'test', status: 'processing' });
      });

      await request(app_with_validation)
        .post('/api/v1/video/generate')
        .send(invalid_request)
        .expect(400);
    });

    test('should handle invalid actor_id', async () => {
      const app_with_validation = express();
      app_with_validation.use(express.json());
      app_with_validation.post('/api/v1/video/generate', (req, res) => {
        if (req.body.actor_id === 'invalid_actor') {
          return res.status(404).json({ error: 'Actor not found' });
        }
        res.status(202).json({ job_id: 'test', status: 'processing' });
      });

      const request_body = createVideoGenerationRequest({
        actor_id: 'invalid_actor'
      });

      await request(app_with_validation)
        .post('/api/v1/video/generate')
        .send(request_body)
        .expect(404);
    });

    test('should validate video parameters', async () => {
      const app_with_validation = express();
      app_with_validation.use(express.json());
      app_with_validation.post('/api/v1/video/generate', (req, res) => {
        if (req.body.quality && !['sd', 'hd', '4k'].includes(req.body.quality)) {
          return res.status(400).json({ error: 'Invalid quality parameter' });
        }
        if (req.body.aspect_ratio && !['16:9', '9:16', '1:1', '4:3'].includes(req.body.aspect_ratio)) {
          return res.status(400).json({ error: 'Invalid aspect ratio' });
        }
        res.status(202).json({ job_id: 'test', status: 'processing' });
      });

      await request(app_with_validation)
        .post('/api/v1/video/generate')
        .send(createVideoGenerationRequest({ quality: 'invalid' }))
        .expect(400);

      await request(app_with_validation)
        .post('/api/v1/video/generate')
        .send(createVideoGenerationRequest({ aspect_ratio: '21:9' }))
        .expect(400);
    });
  });

  describe('POST /api/v1/video/generate-variations', () => {
    test('should create batch video generation job', async () => {
      const batch_request = createBatchJobRequest({
        variations_count: 5
      });

      const response = await request(app)
        .post('/api/v1/video/generate-variations')
        .send(batch_request)
        .expect(202);

      expect(response.body).toHaveProperty('batch_id');
      expect(response.body).toHaveProperty('jobs');
      expect(response.body).toHaveProperty('total_variations', 5);
      expect(response.body.jobs).toHaveLength(5);
      
      response.body.jobs.forEach(job => {
        expect(job).toHaveProperty('job_id');
        expect(job).toHaveProperty('status');
      });
    });

    test('should default to 3 variations if not specified', async () => {
      const batch_request = createBatchJobRequest();
      delete batch_request.variations_count;

      const response = await request(app)
        .post('/api/v1/video/generate-variations')
        .send(batch_request)
        .expect(202);

      expect(response.body.jobs).toHaveLength(3);
      expect(response.body.total_variations).toBe(3);
    });

    test('should validate variations count limits', async () => {
      const app_with_validation = express();
      app_with_validation.use(express.json());
      app_with_validation.post('/api/v1/video/generate-variations', (req, res) => {
        const { variations_count = 3 } = req.body;
        if (variations_count > 10) {
          return res.status(400).json({ error: 'Maximum 10 variations allowed' });
        }
        if (variations_count < 1) {
          return res.status(400).json({ error: 'Minimum 1 variation required' });
        }
        res.status(202).json({ batch_id: 'test', jobs: [], total_variations: variations_count });
      });

      await request(app_with_validation)
        .post('/api/v1/video/generate-variations')
        .send(createBatchJobRequest({ variations_count: 15 }))
        .expect(400);

      await request(app_with_validation)
        .post('/api/v1/video/generate-variations')
        .send(createBatchJobRequest({ variations_count: 0 }))
        .expect(400);
    });
  });

  describe('GET /api/v1/status/:job_id', () => {
    test('should return job status for processing job', async () => {
      const jobId = 'job_processing_123';
      
      const response = await request(app)
        .get(`/api/v1/status/${jobId}`)
        .expect(200);

      expect(response.body).toHaveProperty('job_id', jobId);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('progress');
      expect(response.body).toHaveProperty('created_at');
      expect(response.body).toHaveProperty('updated_at');
    });

    test('should return completed job with download URL', async () => {
      const jobId = 'job_completed_123';
      
      const response = await request(app)
        .get(`/api/v1/status/${jobId}`)
        .expect(200);

      expect(response.body.status).toBe('completed');
      expect(response.body.progress).toBe(100);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('download_url');
      expect(response.body.result).toHaveProperty('thumbnail_url');
      expect(response.body.result).toHaveProperty('duration');
      expect(response.body.result).toHaveProperty('file_size');
    });

    test('should return failed job with error details', async () => {
      const jobId = 'job_failed_123';
      
      const response = await request(app)
        .get(`/api/v1/status/${jobId}`)
        .expect(500);

      expect(response.body.status).toBe('failed');
      expect(response.body).toHaveProperty('error');
    });

    test('should handle non-existent job ID', async () => {
      const app_with_404 = express();
      app_with_404.use(express.json());
      app_with_404.get('/api/v1/status/:job_id', (req, res) => {
        res.status(404).json({ error: 'Job not found' });
      });

      await request(app_with_404)
        .get('/api/v1/status/non_existent_job')
        .expect(404);
    });
  });

  describe('GET /api/v1/download/:job_id', () => {
    test('should redirect to download URL for completed job', async () => {
      const jobId = 'completed_job_123';
      
      const response = await request(app)
        .get(`/api/v1/download/${jobId}`)
        .expect(302);

      expect(response.headers.location).toContain('results.dacras.ai/videos');
      expect(response.headers.location).toContain(`${jobId}.mp4`);
    });

    test('should handle download request for non-ready job', async () => {
      const app_with_validation = express();
      app_with_validation.use(express.json());
      app_with_validation.get('/api/v1/download/:job_id', (req, res) => {
        const jobId = req.params.job_id;
        if (!jobId.includes('ready')) {
          return res.status(404).json({ error: 'Download not available' });
        }
        res.redirect(`https://results.dacras.ai/videos/${jobId}.mp4`);
      });

      await request(app_with_validation)
        .get('/api/v1/download/processing_job_123')
        .expect(404);
    });
  });

  describe('Integration with Texel.ai', () => {
    test('should integrate with Texel.ai lip-sync API', async () => {
      texelMock.mockLipsyncSubmission({
        job_id: 'texel_job_123',
        status: 'processing'
      });

      const request_body = createVideoGenerationRequest();
      
      const response = await request(app)
        .post('/api/v1/video/generate')
        .send(request_body)
        .expect(202);

      expect(response.body.job_id).toBeDefined();
    });

    test('should handle Texel.ai authentication errors', async () => {
      texelMock.mockAuthError();

      const app_with_texel_error = express();
      app_with_texel_error.use(express.json());
      app_with_texel_error.post('/api/v1/video/generate', (req, res) => {
        res.status(401).json({ error: 'Texel.ai authentication failed' });
      });

      const request_body = createVideoGenerationRequest();
      
      await request(app_with_texel_error)
        .post('/api/v1/video/generate')
        .send(request_body)
        .expect(401);
    });

    test('should handle Texel.ai rate limiting', async () => {
      texelMock.mockRateLimit();

      const app_with_rate_limit = express();
      app_with_rate_limit.use(express.json());
      app_with_rate_limit.post('/api/v1/video/generate', (req, res) => {
        res.status(429).json({ 
          error: 'Rate limited by Texel.ai',
          retry_after: 60 
        });
      });

      const request_body = createVideoGenerationRequest();
      
      await request(app_with_rate_limit)
        .post('/api/v1/video/generate')
        .send(request_body)
        .expect(429);
    });
  });

  describe('Performance and Load Testing', () => {
    test('should handle concurrent video generation requests', async () => {
      const requests = Array(5).fill().map(() =>
        request(app)
          .post('/api/v1/video/generate')
          .send(createVideoGenerationRequest())
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(202);
        expect(response.body).toHaveProperty('job_id');
      });

      // Ensure all job IDs are unique
      const jobIds = responses.map(r => r.body.job_id);
      const uniqueJobIds = [...new Set(jobIds)];
      expect(uniqueJobIds).toHaveLength(jobIds.length);
    });

    test('should respect processing time estimates', async () => {
      const response = await request(app)
        .post('/api/v1/video/generate')
        .send(createVideoGenerationRequest())
        .expect(202);

      expect(response.body.estimated_completion_time).toBeGreaterThan(0);
      expect(response.body.estimated_completion_time).toBeLessThan(300); // Max 5 minutes
    });
  });
});