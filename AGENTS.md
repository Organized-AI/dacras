# AGENTS.md for Dacras AI Video Ad Platform

This document provides guidelines and context for AI coding agents working on the Dacras AI video ad generation platform. It complements the `README.md` by offering detailed instructions for automated development workflows.

## 1. Project Overview and Purpose

The Dacras AI video ad generation platform aims to automate the creation of video advertisements using AI.

## 2. Setup and Environment

### Setup Commands

To set up the project, run the `setup.sh` script from the root directory. This script will install necessary dependencies for both the frontend and backend.

```bash
sh setup.sh
```

### Dependencies

The project relies on Node.js (version 18+) and Docker. Ensure these are installed and configured in your environment.

## 3. Code Style and Conventions

Agents should adhere to the existing code style and conventions found within the project. For JavaScript/TypeScript, refer to the `package.json` scripts for linting and formatting commands (e.g., `npm run lint`, `npm run format`).

## 4. Testing and Quality Assurance

### Testing Instructions

The project includes various testing mechanisms:

*   **Service Tests:** The `test-services.cjs` script provides basic tests for backend services.
*   **API Testing:** The `API Testing Agent` is responsible for creating comprehensive test suites for all API endpoints using Jest, Supertest, and other tools.
*   **End-to-End Testing:** The `Integration & QA Agent` handles end-to-end testing workflows using Playwright/Cypress.

To run the health check for the application, use the `run-checks.sh` script:

```bash
sh run-checks.sh
```

### Quality Standards

Each specialized agent has specific quality standards it adheres to:

*   **Frontend Integration Agent:** All components must be fully functional, proper TypeScript types for API responses, comprehensive error handling, mobile-responsive design, performance optimization, accessibility compliance.
*   **API Testing Agent:** 90%+ test coverage on all endpoints, test all HTTP status codes, validate request/response schemas, test rate limiting functionality, mock external API dependencies.
*   **Video Processing Agent:** Handle concurrent video processing jobs, implement proper resource cleanup, add comprehensive logging and monitoring, support multiple video formats and qualities, ensure secure file handling and access control.
*   **Image Generation Agent:** High-resolution output (minimum 1080p), fast generation times (<30 seconds), consistent brand styling, comprehensive error handling, efficient storage and caching.
*   **Integration & QA Agent:** 95%+ uptime requirement, <3 second page load times, WCAG 2.1 AA accessibility compliance, zero critical security vulnerabilities, 90%+ test coverage across all components.
*   **DevOps & Monitoring Agent:** 99.9% uptime SLA, <500ms API response times, auto-scaling based on demand, cost optimization recommendations, zero-downtime deployments.

## 5. Agent Specializations and Workflows

### Specialized Claude Code Agents

The Dacras AI platform utilizes specialized Claude Code agents, each focusing on specific aspects of the full-stack application:

*   **Frontend Integration Agent** 🖥️: Focuses on Frontend/Backend connectivity, React components, UI/UX testing.
*   **API Testing Agent** 🧪: Focuses on Backend API testing, endpoint validation, test automation.
*   **Video Processing Agent** 🎬: Focuses on Video generation, processing workflows, job management.
*   **Image Generation Agent** 🖼️: Focuses on AI image generation, image processing, visual assets.
*   **Integration & QA Agent** 🔗: Focuses on End-to-end testing, system integration, quality assurance.
*   **DevOps & Monitoring Agent** 🚀: Focuses on Deployment, monitoring, infrastructure, performance optimization.

For detailed prompts and tasks for each agent, refer to the `CLAUDE_CODE_AGENTS.md` file.

### Parallel Agent Execution Strategy

The agents can be executed in parallel across three phases for rapid development:

#### Phase 1: Independent Foundation (Parallel)
Agents that can run simultaneously without conflicts:
*   **API Testing Agent**
*   **DevOps & Monitoring Agent**
*   **Image Generation Agent**

#### Phase 2: Integration Layer (After Phase 1 completes)
Agents that build on the work from Phase 1:
*   **Video Processing Agent**
*   **Frontend Integration Agent**

#### Phase 3: Quality Assurance (Final)
Comprehensive testing and validation:
*   **Integration & QA Agent**

For detailed prompts and parallel safety guidelines for each agent in these phases, refer to the `PARALLEL_EXECUTION.md` file.

### Execution Checklist

Before starting any agent execution:
*   Ensure 6 terminal windows are ready.
*   Commit the latest code to git.
*   Configure environment variables.
*   Install dependencies (Node.js, Docker).

Refer to `PARALLEL_EXECUTION.md` for a detailed execution checklist for each phase.

### Conflict Prevention Strategy

To prevent conflicts during parallel execution:
*   **File Ownership by Agent:** Each agent has designated directories or files it primarily works on.
    *   **API Testing**: `backend/tests/`, test configurations
    *   **DevOps**: `docker-compose.yml`, `k8s/`, `.github/`, `infrastructure/`
    *   **Image Generation**: `backend/services/imageGeneration.js`, `backend/routes/images.js`
    *   **Video Processing**: `backend/services/texelai.js`, extends image services
    *   **Frontend**: `frontend/` directory, extends existing components
    *   **Integration QA**: Read-only testing, creates reports
*   **Git Management:** Regular commits before and after each phase.
*   **Monitor Progress:** Use `watch -n 5 'git status --porcelain'` in a separate terminal to monitor changes.

### Expected Timeline and Success Indicators

*   **Expected Timeline:**
    *   Phase 1: 15-20 minutes
    *   Phase 2: 20-25 minutes
    *   Phase 3: 15-20 minutes
    *   Total: ~60 minutes for complete build

*   **Success Indicators:**
    *   **Phase 1 Complete:** Comprehensive test suites created, Docker/K8s configurations ready, image generation services implemented.
    *   **Phase 2 Complete:** Video processing pipeline working, frontend connected to backend APIs, real-time job status updates.
    *   **Phase 3 Complete:** End-to-end workflows tested, performance benchmarks met, production deployment ready.

## 6. Pull Request and Contribution Guidelines

For pull requests and contributions, ensure that all tests pass and adhere to the established code style. Refer to the `.github/workflows/ci-cd.yml` for CI/CD pipeline details.
