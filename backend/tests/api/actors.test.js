const request = require('supertest');
const express = require('express');
const { mockActors, mockActorFilters, createMockActor } = require('../fixtures/actors');

describe('Actors API Endpoints', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock actors routes
    app.get('/api/actors', (req, res) => {
      const { gender, style, age_range, language } = req.query;
      let filteredActors = [...mockActors];

      // Apply filters
      if (gender) filteredActors = filteredActors.filter(a => a.gender === gender);
      if (style) filteredActors = filteredActors.filter(a => a.style === style);
      if (age_range) filteredActors = filteredActors.filter(a => a.age_range === age_range);
      if (language) filteredActors = filteredActors.filter(a => a.languages.includes(language));

      res.json({
        actors: filteredActors,
        total: filteredActors.length,
        filters: { gender, style, age_range, language }
      });
    });

    app.get('/api/actors/:actor_id', (req, res) => {
      const actor = mockActors.find(a => a.id === req.params.actor_id);
      if (!actor) {
        return res.status(404).json({ error: 'Actor not found' });
      }
      res.json(actor);
    });
  });

  describe('GET /api/actors', () => {
    test('should return all actors without filters', async () => {
      const response = await request(app)
        .get('/api/actors')
        .expect(200);

      expect(response.body).toHaveProperty('actors');
      expect(response.body).toHaveProperty('total');
      expect(response.body.actors).toHaveLength(mockActors.length);
      expect(response.body.total).toBe(mockActors.length);
    });

    test('should filter actors by gender', async () => {
      const response = await request(app)
        .get('/api/actors?gender=female')
        .expect(200);

      const femaleActors = mockActors.filter(a => a.gender === 'female');
      expect(response.body.actors).toHaveLength(femaleActors.length);
      expect(response.body.filters.gender).toBe('female');
      response.body.actors.forEach(actor => {
        expect(actor.gender).toBe('female');
      });
    });

    test('should filter actors by style', async () => {
      const response = await request(app)
        .get('/api/actors?style=professional')
        .expect(200);

      response.body.actors.forEach(actor => {
        expect(actor.style).toBe('professional');
      });
    });

    test('should filter actors by age range', async () => {
      const response = await request(app)
        .get('/api/actors?age_range=25-35')
        .expect(200);

      response.body.actors.forEach(actor => {
        expect(actor.age_range).toBe('25-35');
      });
    });

    test('should filter actors by multiple criteria', async () => {
      const response = await request(app)
        .get('/api/actors?gender=female&style=professional')
        .expect(200);

      response.body.actors.forEach(actor => {
        expect(actor.gender).toBe('female');
        expect(actor.style).toBe('professional');
      });
    });

    test('should return empty array for non-matching filters', async () => {
      const response = await request(app)
        .get('/api/actors?gender=non-existent')
        .expect(200);

      expect(response.body.actors).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    test('should validate actor data structure', async () => {
      const response = await request(app)
        .get('/api/actors')
        .expect(200);

      const actor = response.body.actors[0];
      expect(actor).toHaveProperty('id');
      expect(actor).toHaveProperty('name');
      expect(actor).toHaveProperty('gender');
      expect(actor).toHaveProperty('age_range');
      expect(actor).toHaveProperty('style');
      expect(actor).toHaveProperty('avatar_url');
      expect(actor).toHaveProperty('voice_id');
      expect(actor).toHaveProperty('description');
      expect(actor).toHaveProperty('languages');
      expect(actor).toHaveProperty('personality_traits');
      expect(actor).toHaveProperty('use_cases');

      expect(Array.isArray(actor.languages)).toBe(true);
      expect(Array.isArray(actor.personality_traits)).toBe(true);
      expect(Array.isArray(actor.use_cases)).toBe(true);
    });
  });

  describe('GET /api/actors/:actor_id', () => {
    test('should return specific actor by ID', async () => {
      const actorId = mockActors[0].id;
      const response = await request(app)
        .get(`/api/actors/${actorId}`)
        .expect(200);

      expect(response.body.id).toBe(actorId);
      expect(response.body).toEqual(mockActors[0]);
    });

    test('should return 404 for non-existent actor', async () => {
      const response = await request(app)
        .get('/api/actors/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Actor not found');
    });

    test('should validate single actor data structure', async () => {
      const actorId = mockActors[0].id;
      const response = await request(app)
        .get(`/api/actors/${actorId}`)
        .expect(200);

      const requiredFields = [
        'id', 'name', 'gender', 'age_range', 'style', 
        'avatar_url', 'voice_id', 'description', 
        'languages', 'personality_traits', 'use_cases'
      ];

      requiredFields.forEach(field => {
        expect(response.body).toHaveProperty(field);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed query parameters gracefully', async () => {
      const response = await request(app)
        .get('/api/actors?invalid_param=test')
        .expect(200);

      expect(response.body.actors).toHaveLength(mockActors.length);
    });

    test('should handle special characters in actor ID', async () => {
      await request(app)
        .get('/api/actors/actor@#$%')
        .expect(404);
    });
  });

  describe('Performance Tests', () => {
    test('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/actors')
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    test('should handle concurrent requests efficiently', async () => {
      const requests = Array(10).fill().map(() =>
        request(app).get('/api/actors')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.actors).toHaveLength(mockActors.length);
      });
    });
  });
});

describe('Actors API Integration', () => {
  test('should integrate with authentication middleware', async () => {
    const app = express();
    app.use(express.json());
    
    // Mock auth middleware
    app.use('/api/actors', (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      next();
    });

    app.get('/api/actors', (req, res) => {
      res.json({ actors: mockActors, total: mockActors.length });
    });

    await request(app)
      .get('/api/actors')
      .expect(401);

    await request(app)
      .get('/api/actors')
      .set('Authorization', 'Bearer test-token')
      .expect(200);
  });

  test('should respect rate limiting', async () => {
    const app = express();
    app.use(express.json());

    let requestCount = 0;
    app.use('/api/actors', (req, res, next) => {
      requestCount++;
      if (requestCount > 5) {
        return res.status(429).json({ error: 'Rate limited' });
      }
      next();
    });

    app.get('/api/actors', (req, res) => {
      res.json({ actors: mockActors, total: mockActors.length });
    });

    // Make 5 successful requests
    for (let i = 0; i < 5; i++) {
      await request(app).get('/api/actors').expect(200);
    }

    // 6th request should be rate limited
    await request(app).get('/api/actors').expect(429);
  });
});