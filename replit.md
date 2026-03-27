# Gestao Integrada Total

## Project Overview
A full-stack web application built with Express.js (backend) and React/Vite (frontend). The server serves both the API and client on a single port.

## Architecture
- **Frontend**: React 19, Vite, TailwindCSS v4, Radix UI, TanStack Query, Wouter (routing), Framer Motion
- **Backend**: Express.js v5, TypeScript (tsx), in-memory storage (MemStorage)
- **Database**: Drizzle ORM with PostgreSQL support (currently using MemStorage)
- **Shared**: Schema definitions in `/shared/schema.ts`

## Project Structure
```
Gestao-Integrada-Total/
├── client/          # React frontend (Vite root)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── index.html
├── server/          # Express backend
│   ├── index.ts     # Entry point, serves on port 5000
│   ├── routes.ts    # API routes
│   ├── storage.ts   # Storage interface (MemStorage)
│   ├── static.ts    # Static file serving (production)
│   └── vite.ts      # Vite dev server integration
├── shared/
│   └── schema.ts    # Drizzle schema + Zod types
├── script/
│   └── build.ts     # Build script
├── vite.config.ts   # Vite configuration
└── drizzle.config.ts
```

## Development
- Run: `cd Gestao-Integrada-Total && npm run dev`
- The server starts on port 5000 (host: 0.0.0.0)
- In dev mode, Vite is embedded in the Express server (HMR included)
- Vite config: `allowedHosts: true` (proxy-safe for Replit)

## Production Build
- Build: `cd Gestao-Integrada-Total && npm run build`
- Start: `cd Gestao-Integrada-Total && npm run start`
- Output: `Gestao-Integrada-Total/dist/`

## Database
- Uses Drizzle ORM with PostgreSQL dialect
- Requires `DATABASE_URL` env var when using real DB
- Currently configured with MemStorage (no DB needed)
- Run migrations: `npm run db:push`

## Recent Features Added
- **CRM**: Edit existing client data via "Editar" button/dialog; Lucro Total card on dashboard; mobile card-based view with all actions accessible
- **Mobile**: Full bottom navigation bar with icons for all 5 modules; dialogs sized for mobile (95vw); responsive card layout in CRM; map panels adapted with mobile heights
- **Reports**: Full financial breakdown (faturamento, lucro total, comissão, ticket médio, margem %); email export via mailto: (opens native email client); PDF/text export downloads file; pipeline potential calculation
- **Architecture Map**: "Exportar PNG" button using html-to-image; wrapped in ReactFlowProvider
- **Sales Funnel**: "Exportar PNG" button using html-to-image; wrapped in ReactFlowProvider

## Key Dependencies
- React 19, Vite 7, TailwindCSS 4
- @xyflow/react (flow diagrams)
- express-session, passport (auth-ready)
- drizzle-orm, pg (DB-ready)
