const request = require('supertest');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

describe('End-to-End Complete Workflow Tests', () => {
  let browser;
  let page;
  let backendApp;
  let frontendUrl;

  beforeAll(async () => {
    // Start browser for frontend testing
    browser = await puppeteer.launch({ 
      headless: process.env.CI !== 'true',
      slowMo: 50 
    });
    page = await browser.newPage();
    
    // Configure viewport for responsive testing
    await page.setViewport({ width: 1200, height: 800 });
    
    frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    
    // Set up backend app mock for testing
    const express = require('express');
    const cors = require('cors');
    
    backendApp = express();
    backendApp.use(cors());
    backendApp.use(express.json());
    
    setupMockBackendRoutes(backendApp);
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  const setupMockBackendRoutes = (app) => {
    // Mock actors endpoint
    app.get('/api/actors', (req, res) => {
      res.json({
        actors: [
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
            name: 'David Casual',
            gender: 'male',
            age_range: '28-40',
            style: 'casual',
            avatar_url: '/actors/david.jpg',
            voice_id: 'voice_002'
          }
        ],
        total: 2
      });
    });

    // Mock image backgrounds generation
    app.post('/api/images/generate-backgrounds', (req, res) => {
      const { product_type, count = 3 } = req.body;
      
      const backgrounds = Array(count).fill().map((_, i) => ({
        id: `bg_${i + 1}`,
        url: `/api/images/background_${product_type}_${i + 1}.jpg`,
        background_type: product_type,
        index: i + 1
      }));

      res.json({
        success: true,
        backgrounds,
        count: backgrounds.length,
        product_type
      });
    });

    // Mock video generation
    app.post('/api/v1/video/generate', (req, res) => {
      const jobId = 'video_job_' + Math.random().toString(36).substr(2, 9);
      
      res.status(202).json({
        job_id: jobId,
        status: 'processing',
        estimated_completion_time: 60
      });
    });

    // Mock job status
    app.get('/api/v1/status/:job_id', (req, res) => {
      const { job_id } = req.params;
      
      // Simulate completed job after some time
      res.json({
        job_id,
        status: 'completed',
        progress: 100,
        result: {
          download_url: `https://results.dacras.ai/videos/${job_id}.mp4`,
          thumbnail_url: `https://results.dacras.ai/thumbnails/${job_id}.jpg`,
          duration: 32.5,
          file_size: 45
        }
      });
    });

    // Mock video variations
    app.post('/api/v1/video/generate-variations', (req, res) => {
      const { variations_count = 3 } = req.body;
      const batchId = 'batch_' + Math.random().toString(36).substr(2, 9);
      
      const jobs = Array(variations_count).fill().map((_, i) => ({
        job_id: `variation_${i + 1}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'processing'
      }));

      res.status(202).json({
        batch_id: batchId,
        jobs,
        total_variations: variations_count
      });
    });

    // Mock health check
    app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
  };

  describe('Complete User Journey', () => {
    test('should complete full video creation workflow', async () => {
      // Navigate to the video generator
      await page.goto(`${frontendUrl}/video-generator`);
      await page.waitForSelector('[data-testid="video-generator"]', { timeout: 10000 });

      // Step 1: Fill in product details
      await page.type('[data-testid="product-name"]', 'EcoClean Pro');
      await page.type('[data-testid="target-audience"]', 'environmentally conscious homeowners');
      await page.type('[data-testid="key-message"]', 'chemical-free cleaning solutions');
      
      // Select tone
      await page.select('[data-testid="tone-select"]', 'friendly');
      
      // Set duration
      await page.evaluate(() => {
        document.querySelector('[data-testid="duration-input"]').value = '30';
      });

      // Click Next to go to actor selection
      await page.click('[data-testid="next-step"]');
      await page.waitForSelector('[data-testid="actor-grid"]');

      // Step 2: Select an actor
      await page.waitForSelector('[data-testid="actor-card"]');
      await page.click('[data-testid="actor-card"]:first-child');
      
      // Verify actor selection
      const selectedActor = await page.$('[data-testid="actor-card"].selected');
      expect(selectedActor).toBeTruthy();

      // Click Next to go to settings
      await page.click('[data-testid="next-step"]');
      await page.waitForSelector('[data-testid="video-settings"]');

      // Step 3: Configure video settings
      // Wait for background images to load
      await page.waitForSelector('[data-testid="background-grid"]');
      
      // Select a background
      await page.click('[data-testid="background-option"]:first-child');
      
      // Configure additional settings
      await page.select('[data-testid="aspect-ratio"]', '16:9');
      await page.select('[data-testid="quality"]', 'hd');
      
      // Enable captions
      await page.check('[data-testid="add-captions"]');

      // Step 4: Generate video
      await page.click('[data-testid="generate-video"]');
      
      // Wait for generation to start
      await page.waitForSelector('[data-testid="generation-progress"]');
      
      // Verify loading state
      const progressBar = await page.$('[data-testid="progress-bar"]');
      expect(progressBar).toBeTruthy();

      // Wait for completion (mocked to complete immediately)
      await page.waitForSelector('[data-testid="video-result"]', { timeout: 15000 });
      
      // Verify video result is displayed
      const videoElement = await page.$('[data-testid="generated-video"]');
      expect(videoElement).toBeTruthy();

      // Verify download button is present
      const downloadButton = await page.$('[data-testid="download-video"]');
      expect(downloadButton).toBeTruthy();
    }, 30000);

    test('should handle video variations workflow', async () => {
      await page.goto(`${frontendUrl}/video-generator`);
      await page.waitForSelector('[data-testid="video-generator"]');

      // Quick setup (abbreviated for variations test)
      await page.type('[data-testid="product-name"]', 'Test Product');
      await page.type('[data-testid="target-audience"]', 'test audience');
      await page.type('[data-testid="key-message"]', 'test message');
      
      // Navigate through steps quickly
      await page.click('[data-testid="next-step"]');
      await page.waitForSelector('[data-testid="actor-grid"]');
      await page.click('[data-testid="actor-card"]:first-child');
      
      await page.click('[data-testid="next-step"]');
      await page.waitForSelector('[data-testid="video-settings"]');
      await page.click('[data-testid="background-option"]:first-child');

      // Configure variations
      const variationSlider = await page.$('[data-testid="variation-count"]');
      await variationSlider.evaluate(slider => slider.value = '5');
      
      // Enable variation options
      await page.check('[data-testid="vary-actors"]');
      await page.check('[data-testid="vary-backgrounds"]');

      // Generate variations
      await page.click('[data-testid="generate-variations"]');
      
      // Wait for batch generation to start
      await page.waitForSelector('[data-testid="batch-progress"]');
      
      // Wait for variations grid to appear
      await page.waitForSelector('[data-testid="variations-grid"]', { timeout: 20000 });
      
      // Verify correct number of variations
      const variationCards = await page.$$('[data-testid="variation-card"]');
      expect(variationCards.length).toBe(5);

      // Test individual variation download
      await page.click('[data-testid="variation-download"]:first-child');
    }, 45000);

    test('should handle mobile responsive workflow', async () => {
      // Set mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      
      await page.goto(`${frontendUrl}/video-generator`);
      await page.waitForSelector('[data-testid="video-generator"]');

      // Verify mobile-friendly layout
      const isMobileLayout = await page.evaluate(() => {
        const container = document.querySelector('[data-testid="video-generator"]');
        return window.getComputedStyle(container).display === 'block';
      });
      
      expect(isMobileLayout).toBe(true);

      // Test mobile navigation
      await page.type('[data-testid="product-name"]', 'Mobile Test');
      await page.type('[data-testid="target-audience"]', 'mobile users');
      await page.type('[data-testid="key-message"]', 'mobile-first design');
      
      // Verify form elements are accessible on mobile
      const formInputs = await page.$$('[data-testid] input');
      expect(formInputs.length).toBeGreaterThan(0);

      // Test mobile actor selection
      await page.click('[data-testid="next-step"]');
      await page.waitForSelector('[data-testid="actor-grid"]');
      
      // Verify mobile grid layout
      const gridColumns = await page.evaluate(() => {
        const grid = document.querySelector('[data-testid="actor-grid"]');
        return window.getComputedStyle(grid).gridTemplateColumns;
      });
      
      // Mobile should have fewer columns
      expect(gridColumns).toMatch(/repeat\([12],/);
    }, 30000);
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async () => {
      // Mock network failure
      await page.setRequestInterception(true);
      
      page.on('request', (request) => {
        if (request.url().includes('/api/actors')) {
          request.abort();
        } else {
          request.continue();
        }
      });

      await page.goto(`${frontendUrl}/video-generator`);
      await page.waitForSelector('[data-testid="video-generator"]');
      
      // Try to proceed to actor selection (should show error)
      await page.type('[data-testid="product-name"]', 'Network Test');
      await page.type('[data-testid="target-audience"]', 'test users');
      await page.type('[data-testid="key-message"]', 'network testing');
      
      await page.click('[data-testid="next-step"]');
      
      // Wait for error message
      await page.waitForSelector('[data-testid="error-message"]', { timeout: 10000 });
      
      const errorMessage = await page.textContent('[data-testid="error-message"]');
      expect(errorMessage).toContain('network');

      // Reset request interception
      await page.setRequestInterception(false);
    });

    test('should validate form inputs properly', async () => {
      await page.goto(`${frontendUrl}/video-generator`);
      await page.waitForSelector('[data-testid="video-generator"]');

      // Try to proceed without filling required fields
      await page.click('[data-testid="next-step"]');
      
      // Should show validation errors
      await page.waitForSelector('[data-testid="validation-error"]');
      
      const validationErrors = await page.$$('[data-testid="validation-error"]');
      expect(validationErrors.length).toBeGreaterThan(0);

      // Fill in required fields
      await page.type('[data-testid="product-name"]', 'Valid Product');
      await page.type('[data-testid="target-audience"]', 'valid audience');
      await page.type('[data-testid="key-message"]', 'valid message');
      
      // Now should be able to proceed
      await page.click('[data-testid="next-step"]');
      await page.waitForSelector('[data-testid="actor-grid"]');
    });

    test('should handle generation timeouts', async () => {
      // Mock slow generation response
      await page.setRequestInterception(true);
      
      page.on('request', (request) => {
        if (request.url().includes('/api/v1/video/generate')) {
          // Delay response to simulate timeout
          setTimeout(() => {
            request.respond({
              status: 408,
              contentType: 'application/json',
              body: JSON.stringify({ error: 'Request timeout' })
            });
          }, 5000);
        } else {
          request.continue();
        }
      });

      // Go through workflow quickly
      await page.goto(`${frontendUrl}/video-generator`);
      await completeQuickWorkflow(page);
      
      // Try to generate video
      await page.click('[data-testid="generate-video"]');
      
      // Wait for timeout error
      await page.waitForSelector('[data-testid="timeout-error"]', { timeout: 10000 });
      
      const timeoutMessage = await page.textContent('[data-testid="timeout-error"]');
      expect(timeoutMessage).toContain('timeout');

      await page.setRequestInterception(false);
    });
  });

  describe('Performance and Accessibility', () => {
    test('should meet performance benchmarks', async () => {
      await page.goto(`${frontendUrl}/video-generator`);
      
      // Measure page load time
      const performanceTiming = JSON.parse(
        await page.evaluate(() => JSON.stringify(window.performance.timing))
      );
      
      const pageLoadTime = performanceTiming.loadEventEnd - performanceTiming.navigationStart;
      expect(pageLoadTime).toBeLessThan(5000); // 5 seconds max

      // Test interaction responsiveness
      const startTime = Date.now();
      await page.click('[data-testid="product-name"]');
      await page.type('[data-testid="product-name"]', 'Performance Test');
      const inputTime = Date.now() - startTime;
      
      expect(inputTime).toBeLessThan(1000); // 1 second max for input response
    });

    test('should be accessible to screen readers', async () => {
      await page.goto(`${frontendUrl}/video-generator`);
      
      // Check for proper ARIA labels
      const ariaLabels = await page.$$eval('[aria-label]', elements => 
        elements.map(el => el.getAttribute('aria-label'))
      );
      
      expect(ariaLabels.length).toBeGreaterThan(5);

      // Check for semantic HTML
      const headings = await page.$$('h1, h2, h3');
      expect(headings.length).toBeGreaterThan(0);

      // Check for form labels
      const inputs = await page.$$('input');
      for (const input of inputs) {
        const hasLabel = await input.evaluate(el => {
          const id = el.id;
          return id && document.querySelector(`label[for="${id}"]`);
        });
        expect(hasLabel).toBeTruthy();
      }
    });

    test('should handle keyboard navigation', async () => {
      await page.goto(`${frontendUrl}/video-generator`);
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      let focusedElement = await page.evaluate(() => document.activeElement.tagName);
      expect(['INPUT', 'BUTTON', 'SELECT'].includes(focusedElement)).toBe(true);

      // Navigate through form with keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Test Enter key functionality
      const nextButton = await page.$('[data-testid="next-step"]');
      if (nextButton) {
        await nextButton.focus();
        await page.keyboard.press('Enter');
      }
    });
  });

  // Helper function for quick workflow completion
  const completeQuickWorkflow = async (page) => {
    await page.waitForSelector('[data-testid="video-generator"]');
    await page.type('[data-testid="product-name"]', 'Quick Test');
    await page.type('[data-testid="target-audience"]', 'test users');
    await page.type('[data-testid="key-message"]', 'quick testing');
    
    await page.click('[data-testid="next-step"]');
    await page.waitForSelector('[data-testid="actor-grid"]');
    await page.click('[data-testid="actor-card"]:first-child');
    
    await page.click('[data-testid="next-step"]');
    await page.waitForSelector('[data-testid="video-settings"]');
    await page.click('[data-testid="background-option"]:first-child');
  };
});