# NEXORA System Architecture

## 1. High-Level Architecture
NEXORA follows a modular monolith architecture organized via an NPM Workspace Monorepo. This allows us to share domain models and constants between the backend services and frontend applications without complex microservice orchestration overhead in the early stages, while preserving the boundaries required to scale into microservices later.

## 2. Monorepo Strategy
- **`packages/shared-schemas`**: Single source of truth for Mongoose Data Models.
- **`packages/shared-constants`**: Enums, RBAC role definitions, Statuses.
- **`apps/backend`**: Express Node.js application.
- **`apps/frontend`**: Vite-powered React SPA.

## 3. Backend Core Design
- **Middlewares**: Robust security pipeline including `helmet`, `cors`, `express-rate-limit`, and custom JWT/RBAC handlers.
- **Routing**: API routes are encapsulated into domain modules (e.g., `src/modules/students`, `src/modules/auth`, `src/modules/ai`).
- **AI Services**: Integrates directly with the `GoogleGenerativeAI` SDK to parse unstructured text (resumes) and generate dynamic evaluation logic (interviews).

## 4. Frontend Design System
- **Feature-Sliced Design**: Logic is contained within `src/features/*` to prevent bloated global stores.
- **UI Framework**: Bootstrap 5.3 tailored with a highly customized `globals.css` and `glassmorphism.css` to achieve a "startup-grade" aesthetic.
- **Animations**: Page transitions and component micro-interactions are managed globally via `framer-motion`.
