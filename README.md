# IMC Manager

Insurance MegaCorp System Management Dashboard - A unified interface for managing and monitoring IMC platform components and services.

## Architecture

This project uses a multi-module Maven build that combines:
- **React Frontend** (`imc-manager-web/`) - Modern React/TypeScript UI with Tailwind CSS
- **Spring Boot Backend** (`imc-manager-api/`) - REST API and static resource serving

The build process automatically:
1. Installs npm dependencies
2. Builds the React frontend 
3. Copies built assets to Spring Boot's static resources
4. Packages everything into a single executable JAR

## Development

### Prerequisites
- Java 21+
- Node.js 18+
- Maven 3.6+

### Local Development

1. **Start the React dev server:**
   ```bash
   cd imc-manager-web
   npm install
   npm run dev
   ```
   Frontend available at http://localhost:5173

2. **Start the Spring Boot API (in another terminal):**
   ```bash
   cd imc-manager-api
   mvn spring-boot:run
   ```
   API available at http://localhost:8080

### Building for Production

Build the complete application (frontend + backend):
```bash
mvn clean package
```

This creates `imc-manager-api/target/imc-manager-api-1.0.0.jar` with embedded frontend.

## Cloud Foundry Deployment

### Prerequisites
- CF CLI installed and logged in
- Access to required CF services:
  - `imc-services` (Service Registry)

### Deploy
```bash
# Build the application
mvn clean package

# Deploy to Cloud Foundry
cf push
```

### Configuration

The application uses different profiles:
- **Local**: `application.yml` 
- **Cloud Foundry**: `application-cloud.yml` (auto-activated)

Environment variables for Cloud Foundry:
- `IMC_MANAGER_BASIC_USER` - Basic auth username (default: admin)
- `IMC_MANAGER_BASIC_PASS` - Basic auth password (default: change-me)

### Service Bindings

The app expects these CF services (defined in `manifest.yml`):
- `imc-services` - Service Registry for service discovery

## Features

### Current
- 🏠 **Dashboard** - System overview with component status
- 🔧 **Services** - Service management interface
- 📊 **Monitoring** - System monitoring dashboard  
- 🚀 **Deployment** - Deployment management tools
- 🔒 **Security** - Basic authentication
- 📱 **Responsive** - Mobile-friendly dark theme UI

### Planned
- Real-time service health monitoring
- Integration with existing IMC services
- Advanced deployment workflows
- System metrics and alerting

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/info` - Application info
- `GET /actuator/health` - Spring Boot health
- `GET /` - Serves the React frontend

## Security

- Basic authentication required for all endpoints except health checks
- Credentials configurable via environment variables
- HTTPS recommended for production deployments

## Development Notes

Based on the proven architecture from `imc-ragmon`, this project provides:
- Seamless integration between React frontend and Spring Boot backend
- Cloud Foundry native deployment with service binding support
- Modern UI components with consistent theming
- Production-ready build pipeline