# Dacras AI - API Reference Documentation 📚

Complete API reference for the Dacras AI video ad generation platform, including Texel.ai integration.

## 🎯 API Overview

### **Dacras API Base URL**
```
Production:  https://api.dacras.ai
Development: http://localhost:3000
```

### **Texel.ai Integration API**
```
Base URL: https://api.prod.texel.ai
Documentation: https://api.prod.texel.ai/docs
Version: 0.1.0 (OAS 3.1)
```

## 🔑 Authentication

### Dacras API Authentication
```http
Authorization: Bearer YOUR_DACRAS_API_KEY
```

### Texel.ai Authentication  
```http
Authorization: Bearer YOUR_TEXEL_API_KEY
```

## 📋 Dacras API Endpoints

### **System Endpoints**

#### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

#### API Information
```http
GET /api/info
```
**Response:**
```json
{
  "name": "Dacras AI API",
  "version": "1.0.0",
  "description": "AI-powered video ad generation platform",
  "endpoints": {
    "actors": "/api/actors",
    "video_generation": "/api/v1/video/generate",
    "script_generation": "/api/v1/script/generate",
    "status": "/api/v1/status/:job_id"
  }
}
```

### **AI Actors**

#### List All AI Actors
```http
GET /api/actors
GET /api/actors?gender=female&style=professional&age_range=25-35
```
**Response:**
```json
{
  "actors": [
    {
      "id": "actor_001",
      "name": "Emma Professional",
      "gender": "female",
      "age_range": "25-35",
      "style": "professional",
      "avatar_url": "/actors/emma.jpg",
      "voice_id": "voice_001"
    }
  ],
  "total": 1,
  "filters": {
    "gender": "female",
    "style": "professional",
    "age_range": "25-35"
  }
}
```

#### Get Specific Actor
```http
GET /api/actors/:actor_id
```

### **Script Generation**

#### Generate Marketing Script
```http
POST /api/v1/script/generate
```
**Request Body:**
```json
{
  "product_name": "EcoClean Pro",
  "target_audience": "environmentally conscious homeowners",
  "key_message": "chemical-free cleaning solutions",
  "tone": "friendly",
  "duration": 30,
  "call_to_action": "Try it risk-free today!"
}
```

**Response:**
```json
{
  "job_id": "uuid-here",
  "status": "processing",
  "estimated_completion_time": 3
}
```

### **Video Generation**

#### Generate Single Video
```http
POST /api/v1/video/generate
```
**Request Body:**
```json
{
  "script": "Transform your cleaning routine with EcoClean Pro!",
  "actor_id": "actor_001",
  "background_style": "modern_home",
  "aspect_ratio": "16:9",
  "quality": "hd",
  "voice_speed": 1.0,
  "add_captions": true,
  "brand_colors": ["#6366f1", "#ec4899"],
  "logo_url": "https://example.com/logo.png"
}
```

#### Generate Multiple Variations
```http
POST /api/v1/video/generate-variations
```
**Request Body:**
```json
{
  "base_config": {
    "script": "Your base script here",
    "actor_id": "actor_001"
  },
  "variations_count": 5,
  "vary_actors": true,
  "vary_backgrounds": true,
  "vary_scripts": false
}
```

### **Status & Downloads**

#### Check Job Status
```http
GET /api/v1/status/:job_id
```
**Response:**
```json
{
  "job_id": "uuid-here",
  "status": "completed",
  "progress": 100,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:31:30Z",
  "result": {
    "download_url": "https://results.dacras.ai/videos/uuid-here.mp4",
    "thumbnail_url": "https://results.dacras.ai/thumbnails/uuid-here.jpg",
    "duration": 32.5,
    "file_size": 45
  }
}
```

#### Download Generated Video
```http
GET /api/v1/download/:job_id
```

#### Get Batch Status
```http
POST /api/v1/status/batch
```
**Request Body:**
```json
{
  "job_ids": ["uuid1", "uuid2", "uuid3"]
}
```

### **Analytics**

#### Usage Analytics
```http
GET /api/v1/analytics/usage
```
**Response:**
```json
{
  "total_videos_generated": 15420,
  "videos_this_month": 2341,
  "most_popular_actors": [
    {
      "actor_id": "actor_001",
      "name": "Emma Professional",
      "usage_count": 892
    }
  ],
  "average_processing_time": 38.5,
  "success_rate": 98.7
}
```

## 🎬 Texel.ai API Integration

### **Status Checks**

#### Get Lipsync Job Status
```http
GET https://api.prod.texel.ai/v1/lipsync/status/{job_id}
Authorization: Bearer YOUR_TEXEL_API_KEY
```

#### Check Generation Status
```http
GET https://api.prod.texel.ai/v1/sd_server/status/{job_id}/{model_type}
Authorization: Bearer YOUR_TEXEL_API_KEY
```

#### Video Processing Status
```http
GET https://api.prod.texel.ai/v1/video_encoder/status/{job_id}
GET https://api.prod.texel.ai/v1/video_encoder/status_client_id/{client_id}
Authorization: Bearer YOUR_TEXEL_API_KEY
```

### **Video Processing**

#### Generate Lip-synced Video
```http
POST https://api.prod.texel.ai/v1/lipsync/run_lipsync
Authorization: Bearer YOUR_TEXEL_API_KEY
Content-Type: application/json
```
**Request Body Example:**
```json
{
  "video_url": "https://example.com/input-video.mp4",
  "audio_url": "https://example.com/audio.wav",
  "output_format": "mp4",
  "quality": "hd"
}
```

#### Get Lipsync Download URL
```http
GET https://api.prod.texel.ai/v1/lipsync/get_url/{job_id}
Authorization: Bearer YOUR_TEXEL_API_KEY
```

#### Process Video with Encoding
```http
POST https://api.prod.texel.ai/v1/video_encoder/encode
Authorization: Bearer YOUR_TEXEL_API_KEY
Content-Type: application/json
```

### **Image Generation**

#### Text-to-Image Generation
```http
POST https://api.prod.texel.ai/v1/sd_server/txt2img
Authorization: Bearer YOUR_TEXEL_API_KEY
Content-Type: application/json
```
**Request Body Example:**
```json
{
  "prompt": "Professional business office background, clean modern design",
  "width": 1920,
  "height": 1080,
  "num_inference_steps": 50,
  "guidance_scale": 7.5
}
```

#### Image-to-Image Transformation
```http
POST https://api.prod.texel.ai/v1/sd_server/img2img
Authorization: Bearer YOUR_TEXEL_API_KEY
Content-Type: application/json
```

### **Video Generation**

#### Text-to-Video
```http
POST https://api.prod.texel.ai/v1/sd_server/txt2vid
Authorization: Bearer YOUR_TEXEL_API_KEY
Content-Type: application/json
```

#### Image-to-Video Animation
```http
POST https://api.prod.texel.ai/v1/sd_server/img2vid
Authorization: Bearer YOUR_TEXEL_API_KEY
Content-Type: application/json
```

## 🔄 Integration Workflow

### **Complete Video Generation Pipeline**

1. **Script Generation** (Dacras API)
   ```http
   POST /api/v1/script/generate
   ```

2. **Background Generation** (Texel.ai)
   ```http
   POST https://api.prod.texel.ai/v1/sd_server/txt2img
   ```

3. **Video Generation** (Texel.ai)
   ```http
   POST https://api.prod.texel.ai/v1/sd_server/txt2vid
   ```

4. **Lip-sync Processing** (Texel.ai)
   ```http
   POST https://api.prod.texel.ai/v1/lipsync/run_lipsync
   ```

5. **Final Processing** (Dacras API)
   ```http
   POST /api/v1/video/generate
   ```

### **Status Monitoring**
- Poll Dacras API: `GET /api/v1/status/:job_id`
- Poll Texel.ai: `GET https://api.prod.texel.ai/v1/lipsync/status/:job_id`

## 📊 Status Codes

### **Success Codes**
- `200` - OK
- `201` - Created
- `202` - Accepted (Async processing started)

### **Error Codes**
- `400` - Bad Request (Invalid parameters)
- `401` - Unauthorized (Invalid API key)
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error
- `503` - Service Unavailable

## 🔒 Rate Limits

### **Dacras API**
- **Default**: 100 requests/15min per IP
- **Authenticated**: 1000 requests/hour per API key
- **Video Generation**: 10 concurrent jobs per user

### **Texel.ai API**
- Check Texel.ai documentation for current limits
- Implement exponential backoff for retries

## 🧪 Testing Considerations

### **Required Test Coverage**
1. **All Dacras API endpoints** (18 endpoints)
2. **Texel.ai integration points** (8 core endpoints)
3. **Error handling and edge cases**
4. **Rate limiting behavior**
5. **Authentication flows**
6. **File upload/download processes**
7. **Job status polling and webhooks**

### **Mock Data Requirements**
- AI actor library with diverse profiles
- Script generation test cases
- Video processing job simulations
- Error scenario responses
- Performance benchmarking data

## 📚 Additional Resources

- **Texel.ai Documentation**: https://api.prod.texel.ai/docs
- **OpenAPI Spec**: Available at `/openapi.json` endpoints
- **Postman Collection**: Import from project `/docs` folder
- **SDK Examples**: Check `/examples` directory

---

**This API reference should be used by the API Testing Agent to create comprehensive test suites covering all integration points and edge cases.**