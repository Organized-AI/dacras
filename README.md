# Dacras AI - Video Ad Generation Platform 🎬

A full-stack AI-powered video advertisement generation platform inspired by Texel.ai and Arcads.ai. Transform text into compelling video ads with realistic AI actors, professional scripts, and scalable batch processing.

![Dacras Logo](https://via.placeholder.com/400x100/6366f1/ffffff?text=Dacras+AI)

## 🚀 Features

### Frontend
- **Modern React UI** with Tailwind CSS styling
- **Responsive Design** optimized for all devices  
- **Interactive Components** with smooth animations
- **Real-time Status Updates** for video generation
- **Professional Landing Page** with testimonials

### Backend API
- **AI Actor Library** - 100+ diverse AI actors
- **Script Generation** - AI-powered marketing copy
- **Video Generation** - Text-to-video with lip-sync
- **Batch Processing** - Generate multiple variations
- **Job Status Tracking** - Real-time progress updates
- **Analytics Dashboard** - Usage metrics and insights

## 🏗️ Project Structure

```
dacras/
├── backend/                    # Node.js Express API
│   ├── server.js              # Main server entry point
│   ├── package.json           # Backend dependencies
│   ├── docker-compose.yml     # Full stack deployment
│   ├── Dockerfile             # Container definition
│   ├── .env.example           # Environment variables
│   └── README.md              # Backend documentation
├── frontend/                  # React/Next.js Frontend  
│   ├── components/            # React components
│   │   └── DacrasLanding.jsx  # Main landing page
│   ├── package.json           # Frontend dependencies
│   └── README.md              # Frontend documentation
└── README.md                  # This file
```

## 💻 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB
- **Cache/Queue**: Redis
- **AI Services**: OpenAI, Anthropic, Texel.ai
- **File Storage**: AWS S3 / MinIO
- **Containerization**: Docker & Docker Compose

### Frontend  
- **Framework**: React 18 / Next.js 14
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Animations**: CSS Transitions + Transforms

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (recommended)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/bht-labs/dacras.git
cd dacras
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

### 3. Frontend Setup  
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Docker Setup (Recommended)
```bash
cd backend
docker-compose up -d
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Key Endpoints

#### Get AI Actors
```http
GET /api/actors
GET /api/actors?gender=female&style=professional
```

#### Generate Script
```http
POST /api/v1/script/generate
{
  "product_name": "EcoClean Pro",
  "target_audience": "homeowners", 
  "key_message": "chemical-free cleaning",
  "tone": "friendly"
}
```

#### Generate Video
```http
POST /api/v1/video/generate
{
  "script": "Transform your cleaning routine!",
  "actor_id": "actor_001",
  "background_style": "modern_home",
  "quality": "hd"
}
```

#### Check Status
```http
GET /api/v1/status/{job_id}
```

## 🎨 Frontend Components

### DacrasLanding Component
- **Hero Section** - Eye-catching headline and CTA
- **Video Demo** - Interactive preview player  
- **Features Grid** - Key platform capabilities
- **Process Steps** - 3-step workflow explanation
- **Testimonials** - Auto-rotating customer reviews
- **Call-to-Action** - Free trial signup

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Start dev server
npm test            # Run tests
npm run lint        # Lint code
docker-compose up   # Run with Docker
```

### Frontend Development
```bash
cd frontend
npm run dev         # Start Next.js dev server
npm run build       # Build for production
npm run lint        # Lint code
```

## 🚢 Deployment

### Docker Production
```bash
cd backend
docker-compose --profile production up -d
```

### Environment Variables
Key variables for production:
```bash
NODE_ENV=production
MONGODB_URI=mongodb://your-mongo-url
REDIS_URL=redis://your-redis-url  
AWS_S3_BUCKET=your-s3-bucket
OPENAI_API_KEY=your-openai-key
TEXEL_AI_API_KEY=your-texel-key
```

## 📊 Monitoring

- **Health Checks**: `/health` endpoint
- **Metrics**: Prometheus integration
- **Logging**: Winston structured logs
- **Analytics**: Usage tracking and reporting

## 🔒 Security

- **Rate Limiting**: Prevents API abuse
- **Input Validation**: All endpoints validated
- **File Upload Security**: Type and size restrictions
- **Environment Secrets**: Secure credential management

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`  
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Development Guidelines
- Write tests for new features
- Follow ESLint configuration
- Update documentation
- Use conventional commits
- Ensure Docker builds succeed

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🛣️ Roadmap

- [ ] **WebSocket Integration** - Real-time status updates
- [ ] **Advanced Analytics** - Detailed usage dashboard
- [ ] **Multi-language Support** - International markets
- [ ] **Custom Voice Cloning** - Personalized AI voices  
- [ ] **Advanced Editing** - Post-generation video editing
- [ ] **Platform Integrations** - Facebook, Google, TikTok Ads
- [ ] **Enterprise Features** - SSO, advanced permissions
- [ ] **Mobile App** - iOS and Android applications

## 💬 Support

- **Email**: contact@bhtlabs.com
- **Issues**: [GitHub Issues](https://github.com/bht-labs/dacras/issues)
- **Documentation**: [docs.dacras.ai](https://docs.dacras.ai)
- **Discord**: [Join Community](https://discord.gg/bhtlabs)

## 🎯 Use Cases

- **Performance Marketing** - High-converting video ads
- **E-commerce** - Product demonstration videos
- **SaaS Marketing** - Feature explainer videos
- **Agency Work** - Client video ad creation
- **Social Media** - Platform-specific content
- **A/B Testing** - Multiple ad variations

## 🏆 Key Differentiators

- **Texel.ai Integration** - Professional lip-sync quality
- **Batch Processing** - Generate variations at scale
- **Real-time Monitoring** - Live job status tracking
- **Professional UI/UX** - Intuitive, modern interface
- **Full-stack Solution** - Complete platform in one repo
- **Docker Ready** - Easy deployment and scaling

---

**Built with ❤️ by BHT Labs**

*Transforming ideas into captivating video advertisements with the power of AI*

---

Maintained by Jordaaan Hill ([LinkedIn](https://www.linkedin.com/in/jordaaanhill)).
