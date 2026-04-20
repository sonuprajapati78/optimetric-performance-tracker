const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../src/app');
const Agent = require('../../src/models/Agent');

// Mock MongoDB connection for testing
jest.mock('mongoose');

describe('Performance API Integration Tests', () => {
  beforeAll(async () => {
    // Setup test database connection
  });

  afterAll(async () => {
    // Cleanup
    await mongoose.disconnect();
  });

  describe('GET /health', () => {
    test('should return 200 and health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/v1/performance/top-performers', () => {
    test('should return top performers', async () => {
      const response = await request(app)
        .get('/api/v1/performance/top-performers')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should respect limit query parameter', async () => {
      const response = await request(app)
        .get('/api/v1/performance/top-performers?limit=10')
        .expect(200);

      expect(response.body.limit).toBe(10);
    });

    test('should reject invalid limit', async () => {
      const response = await request(app)
        .get('/api/v1/performance/top-performers?limit=999')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/performance/upload', () => {
    test('should reject request without file', async () => {
      const response = await request(app)
        .post('/api/v1/performance/upload')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should reject invalid file types', async () => {
      const response = await request(app)
        .post('/api/v1/performance/upload')
        .attach('file', Buffer.from('invalid'), 'test.txt')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/v1/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
    });
  });
});
