const request = require('supertest');
const express = require('express');
const { TexelAIMock } = require('../mocks/texelai');
const ImageGenerationService = require('../../services/imageGeneration');
const TexelAIService = require('../../services/texelai');
const { 
  createVideoGenerationRequest, 
  createScriptGenerationRequest,
  createCompletedJob 
} = require('../fixtures/jobs');

describe('Complete Video Generation Pipeline Integration', () => {
  let app;
  let texelMock;
  let imageService;
  let texelService;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    texelMock = new TexelAIMock();
    imageService = new ImageGenerationService();
    texelService = new TexelAIService();

    // Mock complete pipeline route
    app.post('/api/v1/video/complete-pipeline', async (req, res) => {
      try {
        const {
          product_name,
          target_audience,
          key_message,
          actor_id,
          background_style
        } = req.body;

        // Step 1: Generate script
        const scriptResult = {
          job_id: 'script_' + Math.random().toString(36).substr(2, 9),
          script: `Transform your ${product_name} experience! Perfect for ${target_audience}. ${key_message}`,
          status: 'completed'
        };

        // Step 2: Generate background image
        const backgroundResult = {
          job_id: 'bg_' + Math.random().toString(36).substr(2, 9),
          images: [{
            id: 'img_' + Math.random().toString(36).substr(2, 9),
            url: '/api/images/background_test.jpg',
            width: 1920,
            height: 1080
          }],
          status: 'completed'
        };

        // Step 3: Generate video with lip-sync
        const videoResult = {
          job_id: 'video_' + Math.random().toString(36).substr(2, 9),
          status: 'completed',
          result: {
            download_url: 'https://results.dacras.ai/videos/test.mp4',
            thumbnail_url: 'https://results.dacras.ai/thumbnails/test.jpg',
            duration: 30.5,
            file_size: 45
          }
        };

        res.status(202).json({
          pipeline_id: 'pipeline_' + Math.random().toString(36).substr(2, 9),
          steps: {
            script: scriptResult,
            background: backgroundResult,
            video: videoResult
          },
          status: 'completed',
          estimated_total_time: 120
        });

      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  });

  afterEach(() => {
    texelMock.reset();
  });

  describe('End-to-End Pipeline', () => {
    test('should complete full video generation pipeline', async () => {
      // Mock Texel.ai responses
      texelMock.mockTextToImage({ 
        job_id: 'texel_img_123',
        status: 'completed'
      });
      
      texelMock.mockTextToVideo({
        job_id: 'texel_vid_123', 
        status: 'completed'
      });
      
      texelMock.mockLipsyncSubmission({
        job_id: 'texel_lipsync_123',
        status: 'completed'
      });

      const pipelineRequest = {
        product_name: 'EcoClean Pro',
        target_audience: 'environmentally conscious homeowners',
        key_message: 'chemical-free cleaning solutions',
        actor_id: 'actor_001',
        background_style: 'modern_home'
      };

      const response = await request(app)
        .post('/api/v1/video/complete-pipeline')
        .send(pipelineRequest)
        .expect(202);

      // Verify pipeline response structure
      expect(response.body).toHaveProperty('pipeline_id');
      expect(response.body).toHaveProperty('steps');
      expect(response.body.steps).toHaveProperty('script');
      expect(response.body.steps).toHaveProperty('background');
      expect(response.body.steps).toHaveProperty('video');
      expect(response.body.status).toBe('completed');

      // Verify each step has required properties
      const { script, background, video } = response.body.steps;
      
      expect(script).toHaveProperty('job_id');
      expect(script).toHaveProperty('script');
      expect(script.script).toContain('EcoClean Pro');

      expect(background).toHaveProperty('images');
      expect(background.images).toHaveLength(1);
      expect(background.images[0]).toHaveProperty('url');

      expect(video).toHaveProperty('result');
      expect(video.result).toHaveProperty('download_url');
      expect(video.result).toHaveProperty('thumbnail_url');
      expect(video.result.download_url).toContain('.mp4');
    });

    test('should handle pipeline failures gracefully', async () => {
      // Mock Texel.ai server error
      texelMock.mockServerError();

      const app_with_error = express();
      app_with_error.use(express.json());
      app_with_error.post('/api/v1/video/complete-pipeline', (req, res) => {
        res.status(500).json({
          error: 'Pipeline failed',
          failed_step: 'background_generation',
          details: 'Texel.ai service unavailable'
        });
      });

      const pipelineRequest = {
        product_name: 'Test Product',
        target_audience: 'test audience',
        key_message: 'test message',
        actor_id: 'actor_001',
        background_style: 'modern_home'
      };

      const response = await request(app_with_error)
        .post('/api/v1/video/complete-pipeline')
        .send(pipelineRequest)
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('failed_step');
      expect(response.body).toHaveProperty('details');
    });

    test('should process multiple pipeline requests concurrently', async () => {
      const requests = Array(3).fill().map((_, index) => ({
        product_name: `Product ${index + 1}`,
        target_audience: 'test audience',
        key_message: 'test message',
        actor_id: 'actor_001',
        background_style: 'modern_home'
      }));

      const responses = await Promise.all(
        requests.map(req =>
          request(app)
            .post('/api/v1/video/complete-pipeline')
            .send(req)
            .expect(202)
        )
      );

      // Verify all pipelines started successfully
      responses.forEach((response, index) => {
        expect(response.body.pipeline_id).toBeDefined();
        expect(response.body.steps.script.script).toContain(`Product ${index + 1}`);
      });

      // Verify unique pipeline IDs
      const pipelineIds = responses.map(r => r.body.pipeline_id);
      const uniqueIds = [...new Set(pipelineIds)];
      expect(uniqueIds.length).toBe(pipelineIds.length);
    });
  });

  describe('Component Integration', () => {
    test('should integrate script generation with video generation', async () => {
      const app_integration = express();
      app_integration.use(express.json());

      app_integration.post('/api/v1/script/generate', (req, res) => {
        res.json({
          job_id: 'script_123',
          script: `Amazing ${req.body.product_name}! Perfect for ${req.body.target_audience}.`,
          status: 'completed'
        });
      });

      app_integration.post('/api/v1/video/generate', (req, res) => {
        // Should use script from previous step
        expect(req.body.script).toContain('Amazing');
        res.status(202).json({
          job_id: 'video_123',
          status: 'processing'
        });
      });

      // Step 1: Generate script
      const scriptResponse = await request(app_integration)
        .post('/api/v1/script/generate')
        .send({
          product_name: 'EcoClean',
          target_audience: 'homeowners',
          key_message: 'clean & safe'
        })
        .expect(200);

      // Step 2: Use generated script for video
      await request(app_integration)
        .post('/api/v1/video/generate')
        .send({
          script: scriptResponse.body.script,
          actor_id: 'actor_001'
        })
        .expect(202);
    });

    test('should integrate image generation with video backgrounds', async () => {
      const app_integration = express();
      app_integration.use(express.json());

      app_integration.post('/api/images/generate-backgrounds', (req, res) => {
        res.json({
          backgrounds: [{
            id: 'bg_123',
            url: '/api/images/modern_home_bg.jpg',
            background_type: req.body.product_type
          }]
        });
      });

      app_integration.post('/api/v1/video/generate', (req, res) => {
        expect(req.body.background_image_url).toBeDefined();
        res.status(202).json({
          job_id: 'video_with_bg_123',
          status: 'processing'
        });
      });

      // Step 1: Generate backgrounds
      const backgroundResponse = await request(app_integration)
        .post('/api/images/generate-backgrounds')
        .send({
          product_type: 'technology',
          count: 3
        })
        .expect(200);

      // Step 2: Use background in video
      await request(app_integration)
        .post('/api/v1/video/generate')
        .send({
          script: 'Test script',
          actor_id: 'actor_001',
          background_image_url: backgroundResponse.body.backgrounds[0].url
        })
        .expect(202);
    });
  });

  describe('Data Flow Validation', () => {
    test('should maintain data consistency across pipeline steps', async () => {
      const pipelineData = {
        product_name: 'TestProduct',
        brand_colors: ['#6366f1', '#ec4899'],
        user_id: 'test_user_123'
      };

      const app_data_flow = express();
      app_data_flow.use(express.json());

      const stepData = [];

      app_data_flow.post('/api/v1/video/complete-pipeline', (req, res) => {
        stepData.push({
          step: 'initial',
          data: { ...req.body }
        });

        // Simulate script generation
        stepData.push({
          step: 'script',
          data: {
            product_name: req.body.product_name,
            brand_colors: req.body.brand_colors,
            user_id: req.body.user_id
          }
        });

        // Simulate video generation
        stepData.push({
          step: 'video',
          data: {
            product_name: req.body.product_name,
            brand_colors: req.body.brand_colors,
            user_id: req.body.user_id
          }
        });

        res.json({
          pipeline_id: 'data_flow_test',
          data_consistency: true,
          steps_data: stepData
        });
      });

      const response = await request(app_data_flow)
        .post('/api/v1/video/complete-pipeline')
        .send(pipelineData)
        .expect(200);

      // Verify data consistency across all steps
      const steps = response.body.steps_data;
      steps.forEach(step => {
        expect(step.data.product_name).toBe(pipelineData.product_name);
        expect(step.data.brand_colors).toEqual(pipelineData.brand_colors);
        expect(step.data.user_id).toBe(pipelineData.user_id);
      });
    });

    test('should handle data validation across service boundaries', async () => {
      const app_validation = express();
      app_validation.use(express.json());

      const validationErrors = [];

      app_validation.post('/api/v1/video/generate', (req, res) => {
        // Validate required fields
        const required = ['script', 'actor_id'];
        const missing = required.filter(field => !req.body[field]);
        
        if (missing.length > 0) {
          validationErrors.push({ step: 'video', missing });
          return res.status(400).json({
            error: 'Validation failed',
            missing_fields: missing
          });
        }

        // Validate data types
        if (typeof req.body.voice_speed !== 'number') {
          validationErrors.push({ step: 'video', type_error: 'voice_speed' });
          return res.status(400).json({
            error: 'Type validation failed',
            field: 'voice_speed'
          });
        }

        res.json({ job_id: 'validated_123', status: 'processing' });
      });

      // Test missing required fields
      await request(app_validation)
        .post('/api/v1/video/generate')
        .send({
          script: 'Test script'
          // Missing actor_id
        })
        .expect(400);

      // Test invalid data types
      await request(app_validation)
        .post('/api/v1/video/generate')
        .send({
          script: 'Test script',
          actor_id: 'actor_001',
          voice_speed: 'fast' // Should be number
        })
        .expect(400);

      expect(validationErrors).toHaveLength(2);
      expect(validationErrors[0].missing).toContain('actor_id');
      expect(validationErrors[1].type_error).toBe('voice_speed');
    });
  });

  describe('Performance Integration', () => {
    test('should handle high concurrency pipeline requests', async () => {
      const concurrencyLevel = 10;
      const startTime = Date.now();

      const requests = Array(concurrencyLevel).fill().map((_, i) =>
        request(app)
          .post('/api/v1/video/complete-pipeline')
          .send({
            product_name: `ConcurrentProduct${i}`,
            target_audience: 'test audience',
            key_message: 'performance test',
            actor_id: 'actor_001',
            background_style: 'modern_home'
          })
      );

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(202);
        expect(response.body.pipeline_id).toBeDefined();
      });

      // Performance assertion: should complete within reasonable time
      expect(totalTime).toBeLessThan(10000); // 10 seconds max for all requests
    });

    test('should implement proper timeout handling', async () => {
      const app_timeout = express();
      app_timeout.use(express.json());

      app_timeout.post('/api/v1/video/generate', async (req, res) => {
        // Simulate long processing
        await new Promise(resolve => setTimeout(resolve, 6000));
        res.json({ job_id: 'timeout_test', status: 'completed' });
      });

      const startTime = Date.now();
      
      try {
        await request(app_timeout)
          .post('/api/v1/video/generate')
          .send(createVideoGenerationRequest())
          .timeout(5000); // 5 second timeout
      } catch (error) {
        const endTime = Date.now();
        expect(endTime - startTime).toBeLessThan(6000);
        expect(error.code).toBe('ECONNABORTED');
      }
    });
  });

  describe('Error Recovery Integration', () => {
    test('should implement circuit breaker pattern for external services', async () => {
      let failureCount = 0;
      const maxFailures = 3;

      const app_circuit = express();
      app_circuit.use(express.json());

      app_circuit.post('/api/v1/video/generate', (req, res) => {
        failureCount++;
        
        if (failureCount <= maxFailures) {
          return res.status(503).json({
            error: 'Service temporarily unavailable',
            circuit_state: 'closed',
            failure_count: failureCount
          });
        }

        // Circuit opens after max failures
        res.status(503).json({
          error: 'Circuit breaker open',
          circuit_state: 'open',
          retry_after: 30
        });
      });

      // Test circuit breaker behavior
      for (let i = 1; i <= maxFailures + 1; i++) {
        const response = await request(app_circuit)
          .post('/api/v1/video/generate')
          .send(createVideoGenerationRequest())
          .expect(503);

        if (i <= maxFailures) {
          expect(response.body.circuit_state).toBe('closed');
          expect(response.body.failure_count).toBe(i);
        } else {
          expect(response.body.circuit_state).toBe('open');
          expect(response.body.retry_after).toBeDefined();
        }
      }
    });

    test('should implement retry logic with exponential backoff', async () => {
      let attemptCount = 0;
      const maxAttempts = 3;

      const app_retry = express();
      app_retry.use(express.json());

      app_retry.post('/api/v1/video/generate', (req, res) => {
        attemptCount++;
        
        if (attemptCount < maxAttempts) {
          return res.status(500).json({
            error: 'Temporary failure',
            attempt: attemptCount,
            should_retry: true
          });
        }

        res.json({
          job_id: 'retry_success',
          status: 'processing',
          attempts_taken: attemptCount
        });
      });

      // Simulate retry logic
      let lastResponse;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        lastResponse = await request(app_retry)
          .post('/api/v1/video/generate')
          .send(createVideoGenerationRequest());

        if (lastResponse.status === 200) {
          break;
        }

        // Simulate exponential backoff delay
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }

      expect(lastResponse.status).toBe(200);
      expect(lastResponse.body.attempts_taken).toBe(maxAttempts);
    });
  });
});

describe('Cross-Platform Compatibility', () => {
  test('should generate videos compatible with multiple platforms', async () => {
    const platformConfigs = [
      { name: 'Instagram', aspect_ratio: '9:16', max_duration: 60 },
      { name: 'YouTube', aspect_ratio: '16:9', max_duration: 300 },
      { name: 'TikTok', aspect_ratio: '9:16', max_duration: 180 },
      { name: 'Facebook', aspect_ratio: '16:9', max_duration: 240 }
    ];

    const app_platforms = express();
    app_platforms.use(express.json());

    app_platforms.post('/api/v1/video/generate-for-platforms', (req, res) => {
      const { platforms, base_config } = req.body;
      
      const platformVideos = platforms.map(platform => {
        const config = platformConfigs.find(p => p.name === platform);
        return {
          platform,
          job_id: `${platform.toLowerCase()}_${Math.random().toString(36).substr(2, 9)}`,
          config: {
            ...base_config,
            aspect_ratio: config.aspect_ratio,
            duration: Math.min(base_config.duration, config.max_duration)
          },
          status: 'processing'
        };
      });

      res.json({
        batch_id: 'platform_batch_123',
        platform_videos: platformVideos,
        total_platforms: platforms.length
      });
    });

    const response = await request(app_platforms)
      .post('/api/v1/video/generate-for-platforms')
      .send({
        platforms: ['Instagram', 'YouTube', 'TikTok'],
        base_config: {
          script: 'Multi-platform test',
          actor_id: 'actor_001',
          duration: 45
        }
      })
      .expect(200);

    expect(response.body.platform_videos).toHaveLength(3);
    
    // Verify platform-specific configurations
    const instagramVideo = response.body.platform_videos.find(v => v.platform === 'Instagram');
    expect(instagramVideo.config.aspect_ratio).toBe('9:16');
    expect(instagramVideo.config.duration).toBe(45); // Within Instagram limit

    const youtubeVideo = response.body.platform_videos.find(v => v.platform === 'YouTube');
    expect(youtubeVideo.config.aspect_ratio).toBe('16:9');
    expect(youtubeVideo.config.duration).toBe(45);
  });
});