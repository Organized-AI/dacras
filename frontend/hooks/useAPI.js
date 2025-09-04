import { useState, useEffect, useCallback } from 'react';
import DacrasAPIClient from '../lib/api-client';

// Initialize API client
const apiClient = new DacrasAPIClient();

// Custom hook for API state management
export const useAPIState = (initialState = null) => {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reset = () => {
    setData(initialState);
    setLoading(false);
    setError(null);
  };

  return { data, setData, loading, setLoading, error, setError, reset };
};

// Hook for fetching actors
export const useActors = (filters = {}) => {
  const { data, setData, loading, setLoading, error, setError } = useAPIState([]);

  const fetchActors = useCallback(async (newFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getActors({ ...filters, ...newFilters });
      setData(response.actors || []);
      return response;
    } catch (err) {
      setError(err.message);
      setData([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchActors();
  }, [fetchActors]);

  return { 
    actors: data, 
    loading, 
    error, 
    refetch: fetchActors,
    fetchWithFilters: fetchActors
  };
};

// Hook for video generation
export const useVideoGeneration = () => {
  const { data, setData, loading, setLoading, error, setError, reset } = useAPIState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [progress, setProgress] = useState(0);

  const generateVideo = useCallback(async (videoOptions) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      const response = await apiClient.generateVideo(videoOptions);
      setData(response);
      
      // Start polling for status
      if (response.job_id) {
        pollJobStatus(response.job_id);
      }
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateVariations = useCallback(async (variationOptions) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.generateVideoVariations(variationOptions);
      setData(response);
      
      // Start polling for batch status
      if (response.jobs && response.jobs.length > 0) {
        const jobIds = response.jobs.map(job => job.job_id);
        pollMultipleJobs(jobIds);
      }
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const pollJobStatus = useCallback(async (jobId) => {
    try {
      const status = await apiClient.pollJobStatus(jobId, {
        onProgress: ({ attempt, maxAttempts, status, progress: jobProgress }) => {
          setProgress(jobProgress || 0);
          setJobStatus(status);
        },
        onStatusChange: (statusData) => {
          setJobStatus(statusData);
          if (statusData.status === 'completed') {
            setProgress(100);
            setData(prev => ({ ...prev, result: statusData.result }));
          }
        }
      });
      
      return status;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [setData]);

  const pollMultipleJobs = useCallback(async (jobIds) => {
    try {
      const statuses = await apiClient.pollMultipleJobs(jobIds, {
        onProgress: ({ completedJobs, totalJobs, jobStatuses }) => {
          const overallProgress = (completedJobs / totalJobs) * 100;
          setProgress(overallProgress);
          setJobStatus(jobStatuses);
        }
      });
      
      setData(prev => ({ ...prev, results: statuses }));
      return statuses;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [setData]);

  return {
    videoData: data,
    loading,
    error,
    jobStatus,
    progress,
    generateVideo,
    generateVariations,
    pollJobStatus,
    reset
  };
};

// Hook for script generation
export const useScriptGeneration = () => {
  const { data, setData, loading, setLoading, error, setError, reset } = useAPIState(null);

  const generateScript = useCallback(async (scriptOptions) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.generateScript(scriptOptions);
      setData(response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    scriptData: data,
    loading,
    error,
    generateScript,
    reset
  };
};

// Hook for image generation and management
export const useImageGeneration = () => {
  const { data, setData, loading, setLoading, error, setError, reset } = useAPIState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const generateImage = useCallback(async (imageOptions) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.generateImage(imageOptions);
      setData(prev => [...prev, ...response.images]);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateBackgrounds = useCallback(async (productType, count = 5) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.generateBackgrounds(productType, count);
      setData(response.backgrounds);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadImage = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    setUploadProgress(0);
    
    // Simulate upload progress (in real implementation, you'd use proper progress tracking)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 100);
    
    try {
      const response = await apiClient.uploadImage(file);
      setData(prev => [...prev, response.image]);
      setUploadProgress(100);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  const createVariations = useCallback(async (imageId, count = 3) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.createImageVariations(imageId, count);
      setData(prev => [...prev, ...response.variations]);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const optimizeImage = useCallback(async (imageId, targetSize = 'medium') => {
    try {
      const response = await apiClient.optimizeImage(imageId, targetSize);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    images: data,
    loading,
    error,
    uploadProgress,
    generateImage,
    generateBackgrounds,
    uploadImage,
    createVariations,
    optimizeImage,
    reset
  };
};

// Hook for job status monitoring
export const useJobStatus = (jobId) => {
  const { data, setData, loading, setLoading, error, setError } = useAPIState(null);
  const [isPolling, setIsPolling] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!jobId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getJobStatus(jobId);
      setData(response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const startPolling = useCallback(() => {
    if (!jobId || isPolling) return;
    
    setIsPolling(true);
    
    const poll = async () => {
      try {
        const status = await checkStatus();
        
        if (status.status === 'completed' || status.status === 'failed') {
          setIsPolling(false);
          return;
        }
        
        if (isPolling) {
          setTimeout(poll, 2000);
        }
      } catch (err) {
        setIsPolling(false);
      }
    };
    
    poll();
  }, [jobId, isPolling, checkStatus]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  useEffect(() => {
    if (jobId) {
      checkStatus();
    }
  }, [jobId, checkStatus]);

  return {
    status: data,
    loading,
    error,
    isPolling,
    checkStatus,
    startPolling,
    stopPolling
  };
};

// Hook for analytics data
export const useAnalytics = () => {
  const { data, setData, loading, setLoading, error, setError } = useAPIState(null);

  const fetchUsageAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getUsageAnalytics();
      setData(response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsageAnalytics();
  }, [fetchUsageAnalytics]);

  return {
    analytics: data,
    loading,
    error,
    refetch: fetchUsageAnalytics
  };
};

// Hook for downloading videos
export const useVideoDownload = () => {
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState(null);

  const downloadVideo = useCallback(async (jobId, filename) => {
    setDownloading(true);
    setDownloadProgress(0);
    setError(null);
    
    try {
      const response = await apiClient.downloadVideo(jobId);
      
      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `dacras-video-${jobId}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setDownloadProgress(100);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setDownloading(false);
      setTimeout(() => setDownloadProgress(0), 2000);
    }
  }, []);

  return {
    downloading,
    downloadProgress,
    error,
    downloadVideo
  };
};

// Authentication hook (for future use)
export const useAuth = () => {
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dacras_token');
    }
    return null;
  });

  const login = useCallback((newToken) => {
    setToken(newToken);
    localStorage.setItem('dacras_token', newToken);
    apiClient.setAuthToken(newToken);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('dacras_token');
    apiClient.setAuthToken(null);
  }, []);

  useEffect(() => {
    if (token) {
      apiClient.setAuthToken(token);
    }
  }, [token]);

  return {
    token,
    isAuthenticated: !!token,
    login,
    logout
  };
};