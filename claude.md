# Services Dashboard - Claude AI Integration

## Project Context for Claude

### Purpose
You are working on a services dashboard application that aggregates analytics from multiple service businesses including nanny services, car seat installation, and home care. This is a Next.js application with TypeScript.

### Technical Stack
- **Framework**: Next.js 16 with App Router
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack React Query
- **Charts**: Recharts
- **Backend**: Multiple Strapi CMS instances (one per service)

### Architecture Patterns
- Component-based architecture with reusable UI components
- Custom hooks for data management
- Type-safe interfaces for all data structures
- Responsive design with mobile-first approach
- Service configuration system for extensibility

### Key Files and Directories
- `src/app/`: Next.js pages and routing
- `src/components/`: Reusable components organized by feature
- `src/lib/`: Business logic, hooks, utilities, and configurations
- `src/schemas/`: Strapi content type schemas

### Development Guidelines
- Always use TypeScript with strict type checking
- Follow existing naming conventions and file structure
- Use React Query for all data fetching operations
- Implement proper loading states and error handling
- Ensure components are responsive and accessible
- Add new services through the configuration system in `src/lib/config.ts`

### Common Tasks
- Adding new chart components in `src/components/charts/`
- Implementing new dashboard metrics in `src/components/dashboard/`
- Creating API integrations in `src/lib/api.ts`
- Adding new service types via configuration updates

### Best Practices
- Use the existing component patterns and styling conventions
- Maintain separation of concerns between data, presentation, and logic
- Leverage the mock data system for development and testing
- Follow the established error handling and loading patterns
- Ensure all new code passes linting and type checking