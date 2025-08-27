# API Testing Configuration

This document provides testing specifications for the API Testing Agent.

## 🎯 Testing Scope

### **Dacras API Endpoints (18 total)**
1. `GET /health` - System health check
2. `GET /api/info` - API information
3. `GET /api/actors` - List all AI actors
4. `GET /api/actors?filters` - Filtered actor search
5. `GET /api/actors/:id` - Get specific actor
6. `POST /api/v1/script/generate` - Generate marketing script
7. `POST /api/v1/video/generate` - Generate single video
8. `POST /api/v1/video/generate-variations` - Generate video variations
9. `GET /api/v1/status/:job_id` - Check job status
10. `POST /api/v1/status/batch` - Batch status check
11. `GET /api/v1/download/:job_id` - Download video
12. `GET /api/v1/analytics/usage` - Usage analytics
13. `POST /api/v1/webhooks/job-completed` - Webhook endpoint

### **Texel.ai Integration Points (8 core endpoints)**
1. `GET /v1/lipsync/status/:job_id` - Lipsync status
2. `POST /v1/lipsync/run_lipsync` - Run lip-sync
3. `GET /v1/lipsync/get_url/:job_id` - Get lipsync download URL
4. `GET /v1/sd_server/status/:job_id/:model_type` - Generation status
5. `POST /v1/sd_server/txt2img` - Text to image
6. `POST /v1/sd_server/img2img` - Image to image
7. `POST /v1/sd_server/txt2vid` - Text to video
8. `POST /v1/sd_server/img2vid` - Image to video

## 🧪 Test Categories

### **Unit Tests**
- Individual endpoint functionality
- Request/response validation
- Error handling
- Input sanitization
- Rate limiting

### **Integration Tests**
- Dacras API ↔ Database interactions
- Dacras API ↔ Texel.ai integration
- File upload/download workflows
- Job queue processing
- Webhook delivery

### **End-to-End Tests**
- Complete video generation pipeline
- Multi-step workflows (script → video → lipsync)
- Error recovery scenarios
- Performance under load

## 📊 Test Data Requirements

### **Mock Actors Data**
```json
[
  {
    "id": "test_actor_001",
    "name": "Test Emma",
    "gender": "female",
    "age_range": "25-35",
    "style": "professional",
    "avatar_url": "/test/actors/emma.jpg",
    "voice_id": "test_voice_001"
  },
  {
    "id": "test_actor_002", 
    "name": "Test Marcus",
    "gender": "male",
    "age_range": "28-40",
    "style": "creative",
    "avatar_url": "/test/actors/marcus.jpg",
    "voice_id": "test_voice_002"
  }
]
```

### **Mock Script Generation Requests**
```json
[
  {
    "product_name": "TestProduct Pro",
    "target_audience": "test users",
    "key_message": "amazing test results",
    "tone": "professional",
    "duration": 30,
    "call_to_action": "Try it now!"
  },
  {
    "product_name": "Invalid",
    "target_audience": "",
    "key_message": null,
    "tone": "invalid_tone",
    "duration": -5
  }
]
```

### **Mock Video Generation Requests**
```json
[
  {
    "script": "Test video script content here",
    "actor_id": "test_actor_001",
    "background_style": "modern_office",
    "aspect_ratio": "16:9",
    "quality": "hd",
    "add_captions": true
  },
  {
    "script": "",
    "actor_id": "invalid_actor",
    "background_style": "invalid_style",
    "aspect_ratio": "invalid_ratio"
  }
]
```

## 🔍 Test Scenarios

### **Happy Path Tests**
1. **Complete Video Generation**
   ```
   POST /api/v1/script/generate → job_id
   GET /api/v1/status/:job_id → completed
   POST /api/v1/video/generate → job_id  
   GET /api/v1/status/:job_id → processing
   GET /api/v1/download/:job_id → video_url
   ```

2. **Actor Management**
   ```
   GET /api/actors → full list
   GET /api/actors?gender=female → filtered list
   GET /api/actors/actor_001 → specific actor
   ```

3. **Texel.ai Integration**
   ```
   POST texel.ai/v1/sd_server/txt2img → job_id
   GET texel.ai/v1/sd_server/status/:job_id → completed
   POST texel.ai/v1/lipsync/run_lipsync → job_id
   GET texel.ai/v1/lipsync/status/:job_id → completed
   ```

### **Error Handling Tests**
1. **Invalid Authentication**
   - Missing API keys
   - Expired tokens
   - Invalid key formats

2. **Bad Request Data**
   - Missing required fields
   - Invalid data types
   - Out-of-range values
   - SQL injection attempts

3. **Rate Limiting**
   - Exceed request limits
   - Concurrent request handling
   - Proper 429 responses

4. **External Service Failures**
   - Texel.ai API timeouts
   - Network connectivity issues
   - Service unavailable responses

5. **File Handling Errors**
   - Invalid file formats
   - File size limits
   - Corrupted uploads
   - Storage failures

### **Edge Case Tests**
1. **Boundary Conditions**
   - Maximum script length (2000 chars)
   - Minimum/maximum video duration
   - Large batch requests
   - Empty responses

2. **Concurrent Operations**
   - Multiple simultaneous jobs
   - Race conditions
   - Resource contention
   - Job queue overflow

3. **Data Validation**
   - XSS prevention
   - CSRF protection  
   - Input encoding
   - Output sanitization

## ⚡ Performance Tests

### **Load Testing Scenarios**
1. **Baseline Performance**
   - 10 RPS for 1 minute
   - 95th percentile < 500ms
   - Zero errors

2. **Peak Load**
   - 100 RPS for 5 minutes
   - 95th percentile < 1000ms
   - Error rate < 0.1%

3. **Stress Testing**
   - Gradually increase to 500 RPS
   - Find breaking point
   - Graceful degradation

### **Video Processing Load**
1. **Concurrent Jobs**
   - 10 simultaneous video generations
   - Monitor memory/CPU usage
   - Ensure completion within SLA

2. **Large File Handling**
   - Upload 100MB+ files
   - Monitor disk I/O
   - Test cleanup processes

## 🔧 Test Environment Setup

### **Required Environment Variables**
```bash
# Test Database
TEST_MONGODB_URI=mongodb://localhost:27017/dacras_test
TEST_REDIS_URL=redis://localhost:6379/1

# API Keys for Testing
TEST_DACRAS_API_KEY=test_key_here
TEST_TEXEL_API_KEY=test_texel_key_here

# Test Configuration
NODE_ENV=test
LOG_LEVEL=error
RATE_LIMIT_SKIP=true
```

### **Mock Services**
1. **Texel.ai Mock Server**
   - Mirror all Texel.ai endpoints
   - Configurable response delays
   - Error injection capabilities
   - Request/response logging

2. **File Storage Mock**
   - S3-compatible interface
   - Local file system storage
   - Upload/download simulation
   - Failure injection

### **Test Database**
1. **Setup/Teardown**
   - Clean database before each test suite
   - Seed with test data
   - Reset after tests complete

2. **Test Data Management**
   - Factories for creating test objects
   - Fixtures for consistent test data
   - Data cleanup utilities

## 📋 Test Coverage Requirements

### **Minimum Coverage Targets**
- **Unit Tests**: 95%+ line coverage
- **Integration Tests**: 90%+ endpoint coverage
- **Error Scenarios**: 100% error code coverage
- **Texel.ai Integration**: 90%+ integration points

### **Quality Gates**
- All tests must pass
- No memory leaks detected
- Performance benchmarks met
- Security scans pass
- Code quality metrics green

## 🎯 Success Criteria

### **Functional Requirements**
- ✅ All API endpoints respond correctly
- ✅ Error handling works as expected
- ✅ Integration with Texel.ai functions
- ✅ File upload/download operates properly
- ✅ Job queue processing works reliably

### **Non-Functional Requirements**
- ✅ Response times meet SLA (< 500ms)
- ✅ System handles concurrent load
- ✅ Memory usage stays within bounds
- ✅ No security vulnerabilities found
- ✅ Documentation matches implementation

### **Integration Requirements**
- ✅ Texel.ai API calls succeed
- ✅ Authentication works for both APIs
- ✅ File format compatibility verified
- ✅ Error handling across services
- ✅ Retry logic functions correctly

---

**Use this configuration as the foundation for creating comprehensive test suites that ensure the Dacras AI platform is production-ready.**