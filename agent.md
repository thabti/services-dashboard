# Services Dashboard - Agent Instructions

## Project Overview
This is a comprehensive analytics dashboard for managing and monitoring multiple service businesses, specifically designed to aggregate and visualize data from nanny services, car seat installation services, and home care services. The dashboard provides real-time insights into revenue, orders, customer behavior, and service performance across all integrated services.

## Architecture
- **Frontend Framework**: Next.js 16 with App Router
- **Language**: TypeScript for type safety
- **UI Framework**: React 19 with custom components
- **Data Layer**: TanStack React Query for efficient data fetching and caching
- **Backend Integration**: Designed to connect with multiple Strapi CMS instances (one per service)
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts library for data visualization

## Key Technologies
- Next.js 16, React 19, TypeScript
- @tanstack/react-query
- Recharts
- Tailwind CSS
- Lucide React
- Class Variance Authority

## Agent Responsibilities
When working on this project, agents should:
1. Maintain type safety and follow existing TypeScript patterns
2. Use React Query for data fetching
3. Follow the component structure in `src/components/`
4. Ensure responsive design with Tailwind CSS
5. Add new services by extending the config in `src/lib/config.ts`
6. Use mock data during development when `USE_MOCK_DATA` is enabled
7. Run linting and type checking after changes

## Common Commands
- Development: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Type check: `pnpm typecheck`
- Test: (if available)

## File Structure
```
src/
├── app/           # Next.js App Router pages
├── components/    # Reusable UI components
│   ├── charts/    # Chart components
│   ├── dashboard/ # Dashboard-specific components
│   └── layout/    # Layout components
├── lib/           # Business logic and utilities
└── schemas/       # Strapi content schemas
```