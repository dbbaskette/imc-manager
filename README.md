# IMC Manager

Insurance MegaCorp Manager Application - A Spring Boot application with React frontend for managing insurance operations.

## Project Structure

- `imc-manager-api/` - Spring Boot backend API
- `imc-manager-web/` - React frontend application
- `scripts/` - Deployment and utility scripts
- `manifest.yml` - Cloud Foundry application manifest

## Quick Start

### Prerequisites

- Java 21+
- Maven 3.8+
- Cloud Foundry CLI (`cf`)
- Node.js 18+ (for frontend development)

### Configuration Setup

1. **Copy the configuration template:**
   ```bash
   cp scripts/config.env.template scripts/config.env
   ```

2. **Edit `scripts/config.env` with your values:**
   ```bash
   # Cloud Foundry Configuration
   CF_ORG=your-org-name
   CF_SPACE=your-space-name
   CF_APP_NAME=imc-manager
   
   # Basic Authentication
   IMC_MANAGER_BASIC_USER=admin
   IMC_MANAGER_BASIC_PASS=your-secure-password
   ```

### Development

#### Backend (Spring Boot)
```bash
cd imc-manager-api
mvn spring-boot:run
```

#### Frontend (React)
```bash
cd imc-manager-web
npm install
npm run dev
```

### Deployment

**Always use the provided deployment script for testing:**

```bash
# From the project root directory
./scripts/push-mgr.sh
```

This script will:
1. Load configuration from `scripts/config.env`
2. Build the application with Maven
3. Push to Cloud Foundry
4. Set environment variables
5. Start the application

### Manual Deployment (Not Recommended)

If you need to deploy manually:

```bash
# Build
mvn clean package -DskipTests

# Push to Cloud Foundry
cf push imc-manager -p imc-manager-api/target/imc-manager-api-1.0.0.jar

# Set environment variables
cf set-env imc-manager IMC_MANAGER_BASIC_USER admin
cf set-env imc-manager IMC_MANAGER_BASIC_PASS your-password

# Start
cf start imc-manager
```

## Configuration Files

- `application.yml` - Default Spring Boot configuration
- `application-cloud.yml` - Cloud Foundry specific configuration
- `scripts/config.env` - Environment-specific configuration (not in git)
- `scripts/config.env.template` - Configuration template (in git)

## Security

- Basic authentication is enabled by default
- Credentials are configurable via environment variables
- Change default passwords in production

## Troubleshooting

### Check Application Status
```bash
cf app imc-manager
```

### View Logs
```bash
cf logs imc-manager --recent
```

### Restart Application
```bash
cf restart imc-manager
```

## Development Notes

- The application automatically detects Cloud Foundry environment
- Profile-specific configuration is loaded automatically
- Environment variables override configuration file values
- Always use `./scripts/push-mgr.sh` for deployment to ensure consistency