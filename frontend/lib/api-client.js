const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class DacrasAPIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  setAuthToken(token) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Health and system endpoints
  async healthCheck() {
    return this.request('/health');
  }

  async getAPIInfo() {
    return this.request('/api/info');
  }

  // Actor endpoints
  async getActors(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    const endpoint = `/api/actors${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getActor(actorId) {
    return this.request(`/api/actors/${actorId}`);
  }

  // Script generation endpoints
  async generateScript(scriptOptions) {
    return this.request('/api/v1/script/generate', {
      method: 'POST',
      body: JSON.stringify(scriptOptions),
    });
  }

  // Video generation endpoints
  async generateVideo(videoOptions) {
    return this.request('/api/v1/video/generate', {
      method: 'POST',
      body: JSON.stringify(videoOptions),
    });
  }

  async generateVideoVariations(variationOptions) {
    return this.request('/api/v1/video/generate-variations', {
      method: 'POST',
      body: JSON.stringify(variationOptions),
    });
  }

  // Job status and management
  async getJobStatus(jobId) {
    return this.request(`/api/v1/status/${jobId}`);
  }

  async getBatchJobStatus(jobIds) {
    return this.request('/api/v1/status/batch', {
      method: 'POST',
      body: JSON.stringify({ job_ids: jobIds }),
    });
  }

  async downloadVideo(jobId) {
    const endpoint = `/api/v1/download/${jobId}`;
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: this.defaultHeaders,
    });
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }
    
    return response;
  }

  // Image generation endpoints
  async generateImage(imageOptions) {
    return this.request('/api/images/generate', {
      method: 'POST',
      body: JSON.stringify(imageOptions),
    });
  }

  async generateBackgrounds(productType, count = 5) {
    return this.request('/api/images/generate-backgrounds', {
      method: 'POST',
      body: JSON.stringify({ product_type: productType, count }),
    });
  }

  async uploadImage(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.request('/api/images/upload', {
      method: 'POST',
      body: formData,
      headers: { Authorization: this.defaultHeaders.Authorization }, // Only auth header for multipart
    });
  }

  async createImageVariations(imageId, count = 3) {
    return this.request(`/api/images/${imageId}/variations`, {
      method: 'POST',
      body: JSON.stringify({ count }),
    });
  }

  async optimizeImage(imageId, targetSize = 'medium') {
    return this.request(`/api/images/${imageId}/optimize`, {
      method: 'POST',
      body: JSON.stringify({ target_size: targetSize }),
    });
  }

  async getImages(options = {}) {
    const { page = 1, limit = 20, type = 'all' } = options;
    const queryString = new URLSearchParams({ page, limit, type }).toString();
    return this.request(`/api/images?${queryString}`);
  }

  async deleteImage(filename) {
    return this.request(`/api/images/${filename}`, {
      method: 'DELETE',
    });
  }

  // Analytics endpoints
  async getUsageAnalytics() {
    return this.request('/api/v1/analytics/usage');
  }

  // Polling utilities for job status
  async pollJobStatus(jobId, options = {}) {
    const {
      maxAttempts = 60,
      interval = 2000,
      onProgress = null,
      onStatusChange = null
    } = options;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const status = await this.getJobStatus(jobId);
        
        if (onProgress) {
          onProgress({
            attempt,
            maxAttempts,
            status: status.status,
            progress: status.progress,
            jobId
          });
        }

        if (onStatusChange) {
          onStatusChange(status);
        }

        if (status.status === 'completed') {
          return status;
        }

        if (status.status === 'failed') {
          throw new Error(`Job failed: ${status.error?.message || 'Unknown error'}`);
        }

        if (attempt < maxAttempts) {
          await this.sleep(interval);
        }

      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
        await this.sleep(Math.min(interval, 1000));
      }
    }

    throw new Error(`Job polling timeout after ${maxAttempts} attempts`);
  }

  async pollMultipleJobs(jobIds, options = {}) {
    const {
      maxAttempts = 60,
      interval = 3000,
      onProgress = null
    } = options;

    const jobStatuses = new Map();
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const batchStatus = await this.getBatchJobStatus(jobIds);
        
        let allCompleted = true;
        let anyFailed = false;
        
        for (const status of batchStatus.jobs) {
          jobStatuses.set(status.job_id, status);
          
          if (status.status !== 'completed') {
            allCompleted = false;
          }
          
          if (status.status === 'failed') {
            anyFailed = true;
          }
        }

        if (onProgress) {
          onProgress({
            attempt,
            maxAttempts,
            completedJobs: Array.from(jobStatuses.values()).filter(s => s.status === 'completed').length,
            totalJobs: jobIds.length,
            jobStatuses: Object.fromEntries(jobStatuses)
          });
        }

        if (anyFailed) {
          const failedJobs = Array.from(jobStatuses.values()).filter(s => s.status === 'failed');
          throw new Error(`${failedJobs.length} jobs failed: ${failedJobs.map(j => j.job_id).join(', ')}`);
        }

        if (allCompleted) {
          return Object.fromEntries(jobStatuses);
        }

        if (attempt < maxAttempts) {
          await this.sleep(interval);
        }

      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
        await this.sleep(Math.min(interval, 2000));
      }
    }

    throw new Error(`Batch job polling timeout after ${maxAttempts} attempts`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Retry logic for failed requests
  async requestWithRetry(endpoint, options = {}, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.request(endpoint, options);
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        
        // Exponential backoff
        await this.sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }
}

export default DacrasAPIClient;