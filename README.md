# ODOO

A production-grade monorepo scaffold combining a React frontend with a polyglot microservices backend.

## Overview

This repository is organized as a monorepo with a clear separation between the client application and independently deployable backend services. The API contract is described in a shared OpenAPI specification, allowing every service and client to stay in sync.

## Repository Structure

```
.
├── README.md               Project documentation
├── openapi.yml             Shared OpenAPI 3.1 contract for all services
├── frontend/               React + Vite + Tailwind CSS single-page application
│   ├── src/                Application source
│   ├── public/             Static assets
│   ├── index.html          Application entry point
│   ├── vite.config.js      Vite build configuration
│   └── package.json        Frontend dependencies and scripts
└── services/               Backend microservices
    ├── java-microservice/    Java service
    ├── js-microservice/      JavaScript service
    └── python-microservice/  Python service
```

## Prerequisites

- Node.js 20 or later
- npm 10 or later

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The development server starts on http://localhost:5173.

### Available Scripts

Run these from within the `frontend/` directory.

| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the Vite development server            |
| `npm run build`   | Produce an optimized production build        |
| `npm run preview` | Preview the production build locally         |

## Services

Each directory under `services/` is an independent microservice with its own
lifecycle, build tooling, and deployment target. They communicate over the
contract defined in `openapi.yml`.

| Service               | Language   | Responsibility |
| --------------------- | ---------- | -------------- |
| `java-microservice`   | Java       | To be defined  |
| `js-microservice`     | JavaScript | To be defined  |
| `python-microservice` | Python     | To be defined  |

## API Contract

The `openapi.yml` file at the repository root is the single source of truth for
the HTTP API exposed across services. Keep it updated as endpoints evolve.

## License

Proprietary. All rights reserved.
