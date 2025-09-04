const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const FormData = require('form-data');

class TexelAIService {
  constructor() {
    this.apiKey = process.env.TEXEL_AI_API_KEY;
    this.baseUrl = 'https://api.prod.texel.ai';
    this.timeout = parseInt(process.env.TEXEL_API_TIMEOUT) || 120000;
    this.maxPollAttempts = 60; // 2 minutes of polling at 2s intervals
    this.pollInterval = 2000;
    
    if (!this.apiKey) {
      console.warn('Warning: TEXEL_API_KEY not found in environment variables');
    }
  }

  // Authentication headers
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  getMultipartHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  // Text-to-Image Generation
  async generateTextToImage(options) {
    const {
      prompt,
      width = 1920,
      height = 1080,
      num_inference_steps = 50,
      guidance_scale = 7.5,
      negative_prompt = 'blurry, low quality, distorted',
      seed = null,
      batch_size = 1
    } = options;

    try {
      const response = await axios.post(`${this.baseUrl}/v1/sd_server/txt2img`, {
        prompt,
        negative_prompt,
        width,
        height,
        num_inference_steps,
        guidance_scale,
        seed,
        batch_size,
        safety_check: true,
        return_json: true
      }, {
        headers: this.getHeaders(),
        timeout: this.timeout
      });

      return {
        success: true,
        job_id: response.data.job_id,
        status: response.data.status || 'processing',
        model_type: 'txt2img',
        request_params: options,
        submitted_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Texel.ai txt2img error:', error.response?.data || error.message);
      throw new Error(`Text-to-image generation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Image-to-Image Transformation
  async generateImageToImage(imageFile, options) {
    const {
      prompt,
      strength = 0.7,
      num_inference_steps = 50,
      guidance_scale = 7.5,
      negative_prompt = 'blurry, low quality, distorted',
      seed = null
    } = options;

    try {
      const formData = new FormData();
      formData.append('init_image', imageFile);
      formData.append('prompt', prompt);
      formData.append('negative_prompt', negative_prompt);
      formData.append('strength', strength.toString());
      formData.append('num_inference_steps', num_inference_steps.toString());
      formData.append('guidance_scale', guidance_scale.toString());
      if (seed) formData.append('seed', seed.toString());

      const response = await axios.post(`${this.baseUrl}/v1/sd_server/img2img`, formData, {
        headers: {
          ...this.getMultipartHeaders(),
          ...formData.getHeaders()
        },
        timeout: this.timeout
      });

      return {
        success: true,
        job_id: response.data.job_id,
        status: response.data.status || 'processing',
        model_type: 'img2img',
        request_params: options,
        submitted_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Texel.ai img2img error:', error.response?.data || error.message);
      throw new Error(`Image-to-image generation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Text-to-Video Generation
  async generateTextToVideo(options) {
    try {
      const response = await axios.post(`${this.baseUrl}/v1/sd_server/txt2vid`, options, {
        headers: this.getHeaders(),
        timeout: this.timeout
      });

      return {
        success: true,
        job_id: response.data.job_id,
        status: response.data.status || 'processing',
        model_type: 'txt2vid',
        request_params: options,
        submitted_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Texel.ai txt2vid error:', error.response?.data || error.message);
      throw new Error(`Text-to-video generation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Image-to-Video Animation
  async generateImageToVideo(imageFile, options) {
    const {
      motion_bucket_id = 127,
      fps = 6,
      noise_aug_strength = 0.1,
      num_frames = 25,
      num_inference_steps = 25
    } = options;

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('motion_bucket_id', motion_bucket_id.toString());
      formData.append('fps', fps.toString());
      formData.append('noise_aug_strength', noise_aug_strength.toString());
      formData.append('num_frames', num_frames.toString());
      formData.append('num_inference_steps', num_inference_steps.toString());

      const response = await axios.post(`${this.baseUrl}/v1/sd_server/img2vid`, formData, {
        headers: {
          ...this.getMultipartHeaders(),
          ...formData.getHeaders()
        },
        timeout: this.timeout
      });

      return {
        success: true,
        job_id: response.data.job_id,
        status: response.data.status || 'processing',
        model_type: 'img2vid',
        request_params: options,
        submitted_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Texel.ai img2vid error:', error.response?.data || error.message);
      throw new Error(`Image-to-video generation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Lip-sync Video Generation
  async generateLipSync(videoUrl, audioUrl, options = {}) {
    const {
      output_format = 'mp4',
      quality = 'hd',
      padding_top = 0,
      padding_bottom = 0,
      padding_left = 0,
      padding_right = 0,
      resize_factor = 1
    } = options;

    try {
      const response = await axios.post(`${this.baseUrl}/v1/lipsync/run_lipsync`, {
        video_url: videoUrl,
        audio_url: audioUrl,
        output_format,
        quality,
        padding_top,
        padding_bottom,
        padding_left,
        padding_right,
        resize_factor
      }, {
        headers: this.getHeaders(),
        timeout: this.timeout
      });

      return {
        success: true,
        job_id: response.data.job_id,
        status: response.data.status || 'processing',
        estimated_time: response.data.estimated_time,
        request_params: options,
        submitted_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Texel.ai lipsync error:', error.response?.data || error.message);
      throw new Error(`Lip-sync generation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Video Encoding
  async encodeVideo(videoUrl, options = {}) {
    const {
      output_format = 'mp4',
      bitrate = '2M',
      resolution = '1920x1080',
      fps = 30,
      codec = 'h264'
    } = options;

    try {
      const response = await axios.post(`${this.baseUrl}/v1/video_encoder/encode`, {
        input_url: videoUrl,
        output_format,
        bitrate,
        resolution,
        fps,
        codec
      }, {
        headers: this.getHeaders(),
        timeout: this.timeout
      });

      return {
        success: true,
        job_id: response.data.job_id,
        status: response.data.status || 'processing',
        estimated_time: response.data.estimated_time,
        request_params: options,
        submitted_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Texel.ai video encoding error:', error.response?.data || error.message);
      throw new Error(`Video encoding failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Status checking methods
  async checkLipSyncStatus(jobId) {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/lipsync/status/${jobId}`, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      return {
        success: true,
        job_id: jobId,
        status: response.data.status,
        progress: response.data.progress,
        result: response.data.result,
        error: response.data.error,
        checked_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Texel.ai lipsync status error:', error.response?.data || error.message);
      throw new Error(`Status check failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async checkGenerationStatus(jobId, modelType) {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/sd_server/status/${jobId}/${modelType}`, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      return {
        success: true,
        job_id: jobId,
        model_type: modelType,
        status: response.data.status,
        progress: response.data.progress,
        result: response.data.result,
        error: response.data.error,
        checked_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Texel.ai generation status error:', error.response?.data || error.message);
      throw new Error(`Status check failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async checkVideoEncodingStatus(jobId, clientId = null) {
    try {
      const endpoint = clientId 
        ? `/v1/video_encoder/status_client_id/${clientId}`
        : `/v1/video_encoder/status/${jobId}`;

      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      return {
        success: true,
        job_id: jobId,
        client_id: clientId,
        status: response.data.status,
        progress: response.data.progress,
        result: response.data.result,
        error: response.data.error,
        checked_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Texel.ai video encoding status error:', error.response?.data || error.message);
      throw new Error(`Status check failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Download URL retrieval
  async getLipSyncDownloadUrl(jobId) {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/lipsync/get_url/${jobId}`, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      return {
        success: true,
        job_id: jobId,
        download_url: response.data.download_url,
        expires_at: response.data.expires_at,
        retrieved_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Texel.ai download URL error:', error.response?.data || error.message);
      throw new Error(`Download URL retrieval failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Polling utilities
  async pollJobStatus(jobId, statusCheckMethod, maxAttempts = null) {
    const attempts = maxAttempts || this.maxPollAttempts;
    
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const status = await statusCheckMethod(jobId);
        
        if (status.status === 'completed') {
          return {
            ...status,
            polling_info: {
              attempts,
              total_time: attempt * this.pollInterval,
              completed_at: new Date().toISOString()
            }
          };
        }

        if (status.status === 'failed') {
          throw new Error(`Job failed: ${status.error || 'Unknown error'}`);
        }

        if (attempt < attempts) {
          await this.sleep(this.pollInterval);
        }

      } catch (error) {
        if (attempt === attempts) {
          throw error;
        }
        await this.sleep(1000); // Shorter wait on error
      }
    }

    throw new Error(`Job polling timeout after ${attempts} attempts (${attempts * this.pollInterval / 1000}s)`);
  }

  async pollLipSyncJob(jobId, maxAttempts = null) {
    return this.pollJobStatus(jobId, (id) => this.checkLipSyncStatus(id), maxAttempts);
  }

  async pollGenerationJob(jobId, modelType, maxAttempts = null) {
    return this.pollJobStatus(jobId, (id) => this.checkGenerationStatus(id, modelType), maxAttempts);
  }

  async pollVideoEncodingJob(jobId, maxAttempts = null) {
    return this.pollJobStatus(jobId, (id) => this.checkVideoEncodingStatus(id), maxAttempts);
  }

  // Complete video generation pipeline
  async generateCompleteVideo(options) {
    const {
      script,
      actor_image_url,
      audio_url,
      background_prompt,
      lip_sync_options = {},
      encoding_options = {}
    } = options;

    const pipelineId = uuidv4();
    const results = {};

    try {
      // Step 1: Generate background image
      console.log(`[${pipelineId}] Starting background generation...`);
      const backgroundResult = await this.generateTextToImage({
        prompt: background_prompt,
        width: 1920,
        height: 1080
      });

      const backgroundStatus = await this.pollGenerationJob(backgroundResult.job_id, 'txt2img');
      results.background = backgroundStatus.result;

      // Step 2: Generate video from image (if actor image provided)
      if (actor_image_url) {
        console.log(`[${pipelineId}] Starting image-to-video generation...`);
        const actorImageResponse = await axios.get(actor_image_url, { responseType: 'stream' });
        
        const videoResult = await this.generateImageToVideo(actorImageResponse.data, {
          num_frames: 75, // 3 seconds at 25fps
          fps: 25
        });

        const videoStatus = await this.pollGenerationJob(videoResult.job_id, 'img2vid');
        results.base_video = videoStatus.result;

        // Step 3: Apply lip-sync
        if (audio_url && results.base_video?.video_url) {
          console.log(`[${pipelineId}] Starting lip-sync processing...`);
          const lipSyncResult = await this.generateLipSync(
            results.base_video.video_url,
            audio_url,
            lip_sync_options
          );

          const lipSyncStatus = await this.pollLipSyncJob(lipSyncResult.job_id);
          results.lip_synced_video = lipSyncStatus.result;

          // Step 4: Final encoding (optional)
          if (encoding_options.enabled && results.lip_synced_video?.video_url) {
            console.log(`[${pipelineId}] Starting final encoding...`);
            const encodingResult = await this.encodeVideo(
              results.lip_synced_video.video_url,
              encoding_options
            );

            const encodingStatus = await this.pollVideoEncodingJob(encodingResult.job_id);
            results.final_video = encodingStatus.result;
          }
        }
      }

      return {
        success: true,
        pipeline_id: pipelineId,
        results,
        completed_at: new Date().toISOString(),
        processing_summary: {
          background_generated: !!results.background,
          video_generated: !!results.base_video,
          lip_sync_applied: !!results.lip_synced_video,
          encoded: !!results.final_video
        }
      };

    } catch (error) {
      console.error(`[${pipelineId}] Pipeline error:`, error);
      throw new Error(`Video generation pipeline failed: ${error.message}`);
    }
  }

  // Utility methods
  async downloadFile(url, localPath) {
    try {
      const response = await axios.get(url, { responseType: 'stream' });
      const writer = require('fs').createWriteStream(localPath);
      
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(localPath));
        writer.on('error', reject);
      });

    } catch (error) {
      throw new Error(`File download failed: ${error.message}`);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health check
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        headers: this.getHeaders(),
        timeout: 5000
      });

      return {
        healthy: true,
        status: response.status,
        data: response.data
      };

    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }
}

module.exports = TexelAIService;