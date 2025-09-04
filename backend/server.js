const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});



// ============================================ 
// AI ACTORS ENDPOINTS
// ============================================ 

// Get all available AI actors
app.get('/api/actors', async (req, res) => {
  const { gender, style, age_range } = req.query;
  
  try {
    let query = db.collection('actors');
    if (gender) {
      query = query.where('gender', '==', gender);
    }
    if (style) {
      query = query.where('style', '==', style);
    }
    if (age_range) {
      query = query.where('age_range', '==', age_range);
    }
    const snapshot = await query.get();
    const actors = snapshot.docs.map(doc => doc.data());
    
    res.json({
      actors,
      total: actors.length,
      filters: { gender, style, age_range }
    });
  } catch (error) {
    console.error('Error fetching actors:', error);
    res.status(500).json({ error: 'Failed to fetch actors' });
  }
});

// Get specific actor details
app.get('/api/actors/:actor_id', async (req, res) => {
  try {
    const actorRef = db.collection('actors').doc(req.params.actor_id);
    const doc = await actorRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Actor not found' });
    }
    res.json(doc.data());
  } catch (error) {
    console.error('Error fetching actor:', error);
    res.status(500).json({ error: 'Failed to fetch actor' });
  }
});

// ============================================ 
// SCRIPT GENERATION ENDPOINTS
// ============================================ 

// Generate marketing script from brief
app.post('/api/v1/script/generate', (req, res) => {
  const {
    product_name,
    target_audience,
    key_message,
    tone = 'professional',
    duration = 30,
    call_to_action
  } = req.body;

  if (!product_name || !target_audience || !key_message) {
    return res.status(400).json({
      error: 'Missing required fields: product_name, target_audience, key_message'
    });
  }

  const jobId = generateJobId();
  updateJobStatus(jobId, 'processing', 0);

  // Simulate script generation
  setTimeout(() => {
    const scripts = [
      {
        id: 'script_001',
        content: `Tired of ${key_message}? Introducing ${product_name} - the solution ${target_audience} have been waiting for! Don't miss out - ${call_to_action || 'get yours today'}!`, 
        estimated_duration: duration,
        tone,
        hook_strength: 85,
        conversion_score: 78
      },
      {
        id: 'script_002',
        content: `Hey ${target_audience}! Ready to transform your life? ${product_name} delivers exactly what you need. ${key_message} ${call_to_action || 'Try it now'}!`, 
        estimated_duration: duration - 3,
        tone,
        hook_strength: 92,
        conversion_score: 81
      },
      {
        id: 'script_003',
        content: `What if I told you ${product_name} could solve your biggest challenge? For ${target_audience}, this changes everything. ${key_message} ${call_to_action || 'Learn more today'}!`, 
        estimated_duration: duration + 2,
        tone,
        hook_strength: 88,
        conversion_score: 85
      }
    ];

    updateJobStatus(jobId, 'completed', 100, { scripts });
  }, 3000);

  res.json({
    job_id: jobId,
    status: 'processing',
    estimated_completion_time: 3
  });
});

// ============================================ 
// VIDEO GENERATION ENDPOINTS
// ============================================ 

// Generate video ad from script and actor
app.post('/api/v1/video/generate', (req, res) => {
  const {
    script,
    actor_id,
    background_style = 'professional',
    aspect_ratio = '16:9',
    quality = 'hd',
    voice_speed = 1.0,
    add_captions = true,
    brand_colors = [],
    logo_url
  } = req.body;

  if (!script || !actor_id) {
    return res.status(400).json({
      error: 'Missing required fields: script, actor_id'
    });
  }

  // Validate actor exists
  const actor = AI_ACTORS.find(a => a.id === actor_id);
  if (!actor) {
    return res.status(400).json({ error: 'Invalid actor_id' });
  }

  const jobId = generateJobId();
  updateJobStatus(jobId, 'queued', 0);

  // Start video generation process
  setTimeout(() => {
    updateJobStatus(jobId, 'processing', 5);
    simulateProcessing(jobId, 8, 45000); // 45 seconds processing time
  }, 1000);

  res.json({
    job_id: jobId,
    status: 'queued',
    actor: actor.name,
    estimated_completion_time: 45,
    config: {
      background_style,
      aspect_ratio,
      quality,
      voice_speed,
      add_captions
    }
  });
});

// Generate multiple variations
app.post('/api/v1/video/generate-variations', (req, res) => {
  const {
    base_config,
    variations_count = 3,
    vary_actors = true,
    vary_backgrounds = true,
    vary_scripts = false
  } = req.body;

  if (!base_config || !base_config.script) {
    return res.status(400).json({
      error: 'Missing base_config with script'
    });
  }

  const jobId = generateJobId();
  updateJobStatus(jobId, 'processing', 0);

  // Generate multiple jobs for variations
  const variationJobs = [];
  for (let i = 0; i < variations_count; i++) {
    const variationJobId = generateJobId();
    variationJobs.push(variationJobId);
    
    // Start each variation
    setTimeout(() => {
      updateJobStatus(variationJobId, 'processing', 0);
      simulateProcessing(variationJobId, 6, 35000);
    }, i * 2000);
  }

  setTimeout(() => {
    updateJobStatus(jobId, 'completed', 100, {
      variation_jobs: variationJobs,
      total_variations: variations_count
    });
  }, 5000);

  res.json({
    job_id: jobId,
    variation_jobs: variationJobs,
    total_variations: variations_count,
    estimated_completion_time: 40
  });
});

// ============================================ 
// STATUS CHECK ENDPOINTS
// ============================================ 

// Get job status
app.get('/api/v1/status/:job_id', (req, res) => {
  const { job_id } = req.params;
  const job = jobStore.get(job_id);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  res.json(job);
});

// Get multiple job statuses
app.post('/api/v1/status/batch', (req, res) => {
  const { job_ids } = req.body;
  
  if (!Array.isArray(job_ids)) {
    return res.status(400).json({ error: 'job_ids must be an array' });
  }
  
  const statuses = job_ids.map(job_id => {
    const job = jobStore.get(job_id);
    return job || { job_id, status: 'not_found' };
  });
  
  res.json({ statuses });
});

// ============================================ 
// DOWNLOAD ENDPOINTS
// ============================================ 

// Get download URL for completed video
app.get('/api/v1/download/:job_id', (req, res) => {
  const { job_id } = req.params;
  const job = jobStore.get(job_id);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  if (job.status !== 'completed') {
    return res.status(400).json({
      error: 'Job not completed',
      current_status: job.status,
      progress: job.progress 
    });
  }
  
  res.json({
    job_id,
    download_url: job.result.download_url,
    thumbnail_url: job.result.thumbnail_url,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    file_info: {
      duration: job.result.duration,
      file_size: job.result.file_size,
      format: 'mp4'
    }
  });
});

// ============================================ 
// ANALYTICS ENDPOINTS
// ============================================ 

// Get generation analytics
app.get('/api/v1/analytics/usage', (req, res) => {
  // In production, this would query a database
  const mockAnalytics = {
    total_videos_generated: 15420,
    videos_this_month: 2341,
    most_popular_actors: [
      { actor_id: 'actor_001', name: 'Emma Professional', usage_count: 892 },
      { actor_id: 'actor_002', name: 'Marcus Creative', usage_count: 743 },
      { actor_id: 'actor_003', name: 'Sofia Energetic', usage_count: 651 }
    ],
    average_processing_time: 38.5,
    success_rate: 98.7
  };
  
  res.json(mockAnalytics);
});

// ============================================ 
// WEBHOOK ENDPOINTS
// ============================================ 

// Webhook for job completion notifications
app.post('/api/v1/webhooks/job-completed', (req, res) => {
  const { job_id, callback_url, event } = req.body;
  
  // In production, you'd validate the webhook and send notifications
  console.log(`Webhook received for job ${job_id}: ${event}`);
  
  res.json({
    message: 'Webhook received',
    job_id,
    event
  });
});

// ============================================ 
// ERROR HANDLING
// ============================================ 

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    available_endpoints: [
      '/api/info',
      '/api/actors',
      '/api/v1/script/generate',
      '/api/v1/video/generate',
      '/api/v1/status/:job_id'
    ]
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// ============================================ 
// SERVER START
// ============================================ 

// Cleanup job store periodically (remove old jobs)
setInterval(() => {
  const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
  
  for (const [jobId, job] of jobStore.entries()) {
    if (new Date(job.created_at).getTime() < cutoff) {
      jobStore.delete(jobId);
    }
  }
}, 60 * 60 * 1000); // Run every hour

const seedActors = async () => {
  const actorsCollection = db.collection('actors');
  const snapshot = await actorsCollection.get();
  if (snapshot.empty) {
    console.log('Seeding actors...');
    const AI_ACTORS = [
      {
        id: 'actor_001',
        name: 'Emma Professional',
        gender: 'female',
        age_range: '25-35',
        style: 'professional',
        avatar_url: '/actors/emma.jpg',
        voice_id: 'voice_001'
      },
      {
        id: 'actor_002',
        name: 'Marcus Creative',
        gender: 'male',
        age_range: '28-40',
        style: 'creative',
        avatar_url: '/actors/marcus.jpg',
        voice_id: 'voice_002'
      },
      {
        id: 'actor_003',
        name: 'Sofia Energetic',
        gender: 'female',
        age_range: '22-30',
        style: 'energetic',
        avatar_url: '/actors/sofia.jpg',
        voice_id: 'voice_003'
      }
    ];
    for (const actor of AI_ACTORS) {
      await actorsCollection.doc(actor.id).set(actor);
    }
    console.log('Seeding complete.');
  }
};

seedActors().catch(console.error);

app.listen(PORT, () => {
  console.log(`🚀 Dacras API Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/info`);
  console.log(`🎭 Available AI Actors: ${AI_ACTORS.length}`);
  console.log(`💾 In-memory job storage initialized`);
});

module.exports = app;
