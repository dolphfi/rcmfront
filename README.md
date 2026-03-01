# KOLABO POS

Sistèm Pwen de Vant (Point of Sale) pou vann pwodwi ak sèvis.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS v3 + shadcn/ui
- **Backend**: NestJS 11 + Fastify + TypeORM + MySQL
- **Deployment**: Netlify (frontend) / Railway (backend)

## Scripts

### Frontend (`kolabopos/`)

```bash
npm start    # Dev server (http://localhost:3000)
npm run build  # Production build
npm test     # Run tests
```

### Backend (`kolabopos-backend/`)

```bash
npm run start:dev   # Dev server ak watch mode
npm run build       # Build production
npm run start:prod  # Run production
```

## Kont Tès

| Role | Email | Password |
|---|---|---|
| Admin | admin@kolabotech.com | Admin@123 |
| Cashier | cashier@kolabotech.com | Cashier@123 |