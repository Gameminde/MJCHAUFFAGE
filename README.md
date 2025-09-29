# MJ CHAUFFAGE E-commerce Platform

## Overview
A comprehensive e-commerce platform for MJ CHAUFFAGE, specializing in heating equipment, installation services, and maintenance solutions.

## Business Focus
- **Product Sales**: Heating equipment, boilers, and spare parts
- **Installation Services**: Professional boiler and heating system installation  
- **Maintenance Services**: Ongoing boiler maintenance and repair services

## Target Audiences
- **B2B Customers**: Contractors, plumbers, and heating professionals
- **B2C Customers**: Homeowners seeking heating solutions and maintenance
- **Service Clients**: Existing customers requiring ongoing maintenance support

## Technology Stack

### Frontend
- React/Next.js with TypeScript
- Tailwind CSS for responsive design
- PWA capabilities for enhanced user experience
- Server-side rendering for SEO optimization

### Backend
- Node.js with Express and TypeScript
- RESTful API with microservices architecture
- PostgreSQL database for complex business data
- Redis for caching and session management

### Analytics & Tracking
- Real-time business intelligence dashboard
- Customer behavior tracking and analytics
- Inventory management with demand forecasting
- Performance monitoring and metrics

## Key Features

### Core Functionality
- Dynamic product catalog with advanced filtering
- Intelligent shopping cart with save-for-later
- Multi-step checkout with multiple payment options
- Real-time order tracking and notifications

### Service Management
- Installation and maintenance appointment scheduling
- Technician dashboard for service management
- Complete service history tracking
- Automated maintenance reminders

### Business Intelligence
- Comprehensive sales and customer analytics
- Inventory tracking with predictive analytics
- Service performance metrics
- Executive dashboard with KPIs

### Security & Compliance
- Multi-factor authentication
- Role-based access control
- GDPR compliance for data protection
- PCI DSS compliance for payment processing

## Project Structure
```
SITEWEB/
├── frontend/          # React/Next.js application
├── backend/           # Node.js API server
├── shared/           # Shared types and utilities
├── database/         # Database schemas and migrations
├── docs/            # Documentation and specifications
├── tests/           # Test suites and configurations
└── deployment/     # Docker and deployment configurations
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Git

### Quick Start (No Database Required)
```bash
# Start everything with mock data
npm run dev:simple
```

### Full Installation (With Database)
```bash
# Clone the repository
git clone <repository-url>
cd SITEWEB

# Install all dependencies
npm run install:all

# Set up environment variables in both frontend and backend directories

# Start development servers
npm run dev
```

### Development Scripts
- `npm run dev` - Start both frontend and backend with database
- `npm run dev:simple` - Start both frontend and backend with mock data (no database)
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend with database
- `npm run dev:backend:simple` - Start only backend with mock data

## Development Workflow

### Frontend Development
```bash
cd frontend
npm run dev     # Start development server
npm run build   # Build for production
npm run test    # Run test suite
```

### Backend Development
```bash
cd backend
npm run dev     # Start API server with hot reload
npm run build   # Build TypeScript
npm run test    # Run API tests
```

## API Documentation
- REST API endpoints documented with Swagger/OpenAPI
- Authentication required for protected routes
- Comprehensive error handling and validation

## Testing Strategy
- Unit tests for components and business logic
- Integration tests for API endpoints
- End-to-end tests for user journeys
- Performance testing for scalability

## Deployment
- Docker containerization for consistent environments
- CI/CD pipeline with automated testing
- Production monitoring and logging
- Scalable cloud infrastructure

## Contributing
1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

## License
Proprietary - MJ CHAUFFAGE

## Contact
For technical questions or support, contact the development team.