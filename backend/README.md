# Dacras AI Backend API 🎬

A powerful backend API for AI-powered video ad generation, inspired by Texel.ai and designed to work with platforms like Dacras.ai.

## Features 🚀

- **AI Actor Library**: 100+ diverse AI actors for video generation
- **Script Generation**: AI-powered marketing script creation from briefs
- **Video Generation**: Text-to-video and image-to-video conversion
- **Lip-sync Processing**: Realistic lip-syncing with AI actors
- **Batch Processing**: Generate multiple variations simultaneously
- **Real-time Status**: WebSocket-based job status tracking
- **Analytics**: Comprehensive usage analytics and reporting
- **Webhook Support**: Real-time notifications for job completion

## Tech Stack 💻

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB
- **Cache/Queue**: Redis
- **File Storage**: AWS S3 / MinIO
- **AI Services**: OpenAI, Anthropic, Texel.ai
- **Containerization**: Docker & Docker Compose
- **Monitoring**: Prometheus + Grafana

## Quick Start 🏃‍♂️

### Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- MongoDB (or use Docker)
- Redis (or use Docker)

### 1. Clone & Install

```bash
git clone https://github.com/bht-labs/dacras-backend.git
cd dacras-backend
npm run setup
```

### 2. Configure Environment

```bash
# Copy and edit environment variables
cp .env.example .env
# Edit .env with your API keys and configurations
```

### 3. Run with Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### 4. Or Run Locally

```bash
# Install dependencies
npm install

# Start MongoDB and Redis (if not using Docker)
# ... 

# Start development server
npm run dev
```

## API Endpoints 📚

### Base URL
```
http://localhost:3000/api
```

### Authentication
Most endpoints require an API key in the header:
```
Authorization: Bearer YOUR_API_KEY
```

### Core Endpoints

#### Get API Information
```http
GET /api/info
```

#### List AI Actors
```http
GET /api/actors
GET /api/actors?gender=female&style=professional
GET /api/actors/:actor_id
```

#### Generate Marketing Script
```http
POST /api/v1/script/generate
Content-Type: application/json

{
  "product_name": "EcoClean Pro",
  "target_audience": "environmentally conscious homeowners",
  "key_message": "chemical-free cleaning solutions",
  "tone": "friendly",
  "duration": 30,
  "call_to_action": "Try it risk-free today!"
}
```

#### Generate Video Ad
```http
POST /api/v1/video/generate
Content-Type: application/json

{
  "script": "Transform your cleaning routine with EcoClean Pro!",
  "actor_id": "actor_001",
  "background_style": "modern_home",
  "aspect_ratio": "16:9",
  "quality": "hd",
  "add_captions": true
}
```

#### Generate Multiple Variations
```http
POST /api/v1/video/generate-variations
Content-Type: application/json

{
  "base_config": {
    "script": "Your base script here",
    "actor_id": "actor_001"
  },
  "variations_count": 5,
  "vary_actors": true,
  "vary_backgrounds": true
}
```

#### Check Job Status
```http
GET /api/v1/status/:job_id
```

#### Download Generated Video
```http
GET /api/v1/download/:job_id
```

## Response Formats 📋

### Successful Video Generation
```json
{
  "job_id": "uuid-here",
  "status": "queued",
  "actor": "Emma Professional",
  "estimated_completion_time": 45,
  "config": {
    "background_style": "professional",
    "aspect_ratio": "16:9",
    "quality": "hd",
    "voice_speed": 1.0,
    "add_captions": true
  }
}
```

### Job Status Response
```json
{
  "job_id": "uuid-here",
  "status": "completed",
  "progress": 100,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:31:30Z",
  "result": {
    "download_url": "https://results.dacras.ai/videos/uuid-here.mp4",
    "thumbnail_url": "https://results.dacras.ai/thumbnails/uuid-here.jpg",
    "duration": 32.5,
    "file_size": 45
  }
}
```

## Job Statuses 📊

- `queued` - Job is waiting to be processed
- `processing` - Job is being processed
- `completed` - Job completed successfully
- `failed` - Job failed with error
- `cancelled` - Job was cancelled

## Error Handling ⚠️

All errors follow this format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {},
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Common HTTP status codes:
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (invalid API key)
- `404` - Not Found (job/resource not found)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting 🚦

- **Default**: 100 requests per 15-minute window per IP
- **Authenticated**: 1000 requests per hour per API key
- **Video Generation**: 10 concurrent jobs per user

## File Limits 📁

- **Maximum file size**: 100MB
- **Supported formats**: MP4, MOV, AVI, JPG, PNG, WAV, MP3
- **Maximum script length**: 2000 characters
- **Video duration limit**: 5 minutes

## Development 🛠️

### Project Structure
```
dacras-backend/
├── server.js              # Main application entry
├── routes/                 # API route handlers
├── middleware/            # Custom middleware
├── models/                # Database models
├── services/              # Business logic
├── utils/                 # Utility functions
├── tests/                 # Test files
├── uploads/               # File uploads (gitignored)
├── logs/                  # Application logs
├── docker-compose.yml     # Docker services
├── Dockerfile            # Container definition
└── README.md             # This file
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Deployment 🚀

### Docker Deployment
```bash
# Build image
docker build -t dacras-backend .

# Run container
docker run -p 3000:3000 dacras-backend
```

### Production Docker Compose
```bash
# Start with production profile
docker-compose --profile production up -d

# Include monitoring
docker-compose --profile production --profile monitoring up -d
```

### Environment Variables for Production
```bash
NODE_ENV=production
LOG_LEVEL=info
MONGODB_URI=mongodb://your-prod-mongo
REDIS_URL=redis://your-prod-redis
AWS_S3_BUCKET=your-prod-bucket
```

## Monitoring 📈

### Health Check
```http
GET /health
```

### Metrics Endpoint
```http
GET /api/v1/analytics/usage
```

### Logs
```bash
# View API logs
docker-compose logs -f api

# View all logs
docker-compose logs -f
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Write tests for new features
- Follow ESLint configuration
- Update documentation
- Use conventional commits

## Security 🔒

- API keys are required for all operations
- Rate limiting prevents abuse
- File uploads are validated and sanitized
- All external inputs are validated
- HTTPS required in production

## License 📄

MIT License - see [LICENSE](LICENSE) file for details.

## Support 💬

- **Documentation**: [API Docs](https://docs.dacras.ai)
- **Issues**: [GitHub Issues](https://github.com/bht-labs/dacras-backend/issues)
- **Email**: contact@bhtlabs.com
- **Discord**: [Join our community](https://discord.gg/bhtlabs)

## Roadmap 🗺️

- [ ] WebSocket real-time updates
- [ ] Advanced analytics dashboard  
- [ ] Multi-language script generation
- [ ] Custom voice cloning
- [ ] Advanced video editing features
- [ ] Integration with major ad platforms
- [ ] Enterprise SSO support

---

**Built with ❤️ by BHT Labs**