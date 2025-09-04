const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Redis = require('redis');

// Global test configuration
global.testConfig = {
  timeout: 30000,
  retries: 2
};

// MongoDB Memory Server
let mongoServer;
let redisClient;

beforeAll(async () => {
  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Mock Redis for testing
  redisClient = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    expire: jest.fn(),
    disconnect: jest.fn()
  };
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.TEXEL_API_KEY = 'test-texel-key';
  process.env.OPENAI_API_KEY = 'test-openai-key';
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  if (redisClient && redisClient.disconnect) {
    await redisClient.disconnect();
  }
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
  
  // Clear all mocks
  jest.clearAllMocks();
});

// Global error handler for tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = {
  mongoServer,
  redisClient
};