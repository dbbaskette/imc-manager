# IMC Manager - Unified RAG Pipeline & Telemetry Dashboard

## Project Overview

**IMC Manager** is a comprehensive management platform that unifies **RAG Pipeline monitoring**, **Telemetry Processing**, and **Service Management** into a single, intuitive interface. Built with Spring Boot and React, it provides real-time insights into document processing, vehicle telemetry, and service health across the Insurance MegaCorp infrastructure.

### Key Features

- 🔍 **RAG Pipeline Monitoring** - Real-time document processing status
- 📊 **Telemetry Dashboard** - Vehicle data processing insights  
- 🔗 **Service Registry** - Centralized service discovery and management
- 🎨 **Modern UI/UX** - Responsive design with real-time updates
- 🔐 **Auto-login Integration** - Seamless access to bound services
- 📁 **File Management** - Document processing control and oversight

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    IMC Manager Dashboard                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   RAG       │  │ Telemetry   │  │   Service   │        │
│  │ Pipeline    │  │ Processing  │  │   Links     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│              Spring Boot Backend API                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Service     │  │ Discovery   │  │ File        │        │
│  │ Registry    │  │ Client      │  │ Management  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│              External Services Integration                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ HDFS        │  │ Text        │  │ Embedding   │        │
│  │ Watcher     │  │ Processor   │  │ Processor   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## Color Palette & Design System

### Primary Colors
- **Primary Blue** `#3B82F6` - Main actions, links, and highlights
- **Success Green** `#10B981` - Success states and positive actions
- **Warning Yellow** `#F59E0B` - Warnings and pending states
- **Error Red** `#EF4444` - Errors and critical states
- **Info Purple** `#8B5CF6` - Information and neutral states

### Status Colors
- **Processed** `#3B82F6` (Blue) - Completed tasks
- **Pending** `#F59E0B` (Yellow) - Waiting for processing
- **Processing** `#8B5CF6` (Purple) - Currently active
- **Error** `#EF4444` (Red) - Failed operations

### Service Card Colors
- **RabbitMQ** `#FF6600` (Orange) - Messaging services
- **Hadoop** `#FFD700` (Yellow) - Data processing
- **Greenplum** `#20B2AA` (Teal) - Database services
- **Tanzu** `#607D8B` (Blue-Gray) - Cloud platforms
- **PostgreSQL** `#336791` (Blue) - Database services
- **SCDF** `#6DB33F` (Green) - Data flow orchestration

---

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- Cloud Foundry CLI

### 1. Clone & Setup
```bash
git clone <repository-url>
cd imc-manager
```

### 2. Configure Services
```bash
# Copy the template
cp imc-manager-web/src/config/services.json.template \
   imc-manager-web/src/config/services.json

# Edit with your actual service URLs and credentials
nano imc-manager-web/src/config/services.json
```

### 3. Configure Deployment
```bash
# Copy the manifest template
cp manifest.yml.template manifest.yml

# Edit with your actual service names and configuration
nano manifest.yml
```

### 4. Build & Deploy
```bash
# Build the entire project
./scripts/push-mgr.sh

# Or build manually
mvn clean package -DskipTests
cf push
```

---

## Dashboard Sections

### 🔍 RAG Pipeline 
- **Real-time monitoring** of document processing
- **Service status** for HDFS Watcher, Text Processor, Embedding Processor
- **File management** with reprocessing capabilities
- **Processing statistics** and performance metrics

### 📊 Telemetry Processing
- **Vehicle event monitoring** and data flow visualization
- **Processing pipeline** status and health checks
- **Data lake integration** and storage metrics
- **Real-time updates** via Server-Sent Events

### 🔗 Service Links
- **Centralized access** to all bound services
- **Auto-login support** for RabbitMQ and SCDF
- **Dynamic service addition** with custom logos
- **Professional branding** with official service logos

### 🚀 Deployment
- **Cloud Foundry** deployment status and configuration
- **Environment variables** and service bindings
- **Health checks** and application metrics
- **Scaling and performance** monitoring

---

## Configuration

### Environment Variables
```bash
# Core Configuration
IMC_MANAGER_BASIC_USER=admin
IMC_MANAGER_BASIC_PASS=your-secure-password
LOG_LEVEL=INFO

# Cloud Foundry
CF_ORG=your-org
CF_SPACE=your-space
CF_APP_NAME=imc-manager
```

### Service Configuration
```json
{
  "id": "rabbitmq",
  "name": "RabbitMQ",
  "description": "Message Queue & Event Streaming",
  "url": "https://your-rabbitmq-url.com",
  "logo": "/assets/logos/rabbitmq-logo.svg",
  "color": "blue",
  "credentials": {
    "username": "your-username",
    "password": "your-password"
  }
}
```

### Manifest Configuration
```yaml
applications:
  - name: imc-manager
    memory: 1G
    disk_quota: 1G
    instances: 1
    buildpacks:
      - java_buildpack
    env:
      IMC_MANAGER_BASIC_USER: admin
      IMC_MANAGER_BASIC_PASS: your-secure-password
      LOG_LEVEL: INFO
    services:
      - your-rabbitmq-service-name
      - your-scdf-service-name
    health-check-type: http
    health-check-http-endpoint: /actuator/health
    timeout: 180
```

---

## Testing

### RAGmon Integration Tests
```bash
# Test service discovery and control
./scripts/test-ragmon.sh

# Test file management functionality
./scripts/test-file-management.sh
```

### API Endpoints
- `GET /api/services` - List all discovered services
- `GET /api/services/{service}/status` - Get service status
- `POST /api/services/{service}/start` - Start a service
- `POST /api/services/{service}/stop` - Stop a service
- `GET /api/services/hdfswatcher/files` - List HDFS files
- `POST /api/services/hdfswatcher/reprocess-all` - Reprocess files

---

## Documentation

- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Complete feature overview
- **[Service Configuration](imc-manager-web/src/config/README.md)** - Service setup guide
- **[Scripts Documentation](scripts/README.md)** - Deployment and testing scripts

---

## Security Features

- **Basic Authentication** - Secure access control
- **Credential Management** - Secure storage of service credentials
- **Auto-login Integration** - Seamless service access
- **Git Security** - Sensitive files excluded from version control

---

## Deployment

### Cloud Foundry
```bash
# Deploy with environment configuration
./scripts/push-mgr.sh

# Manual deployment
cf push --manifest manifest.yml
```

### Service Bindings
```yaml
services:
  - messaging-c856b29a-1c7e-4fd5-ab3b-0633b90869cc  # RabbitMQ
  - scdf-rag                                          # Spring Cloud Data Flow
```

---

## Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Implement** your changes
4. **Test** thoroughly
5. **Submit** a pull request

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Support

- **Documentation**: Check the [docs](docs/) directory
- **Issues**: Report bugs via GitHub Issues
- **Questions**: Contact the development team

---

<div align="center">

**Built with ❤️ by the Insurance MegaCorp Development Team**

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green)
![React](https://img.shields.io/badge/React-18.x-blue)
![Cloud Foundry](https://img.shields.io/badge/Cloud%20Foundry-Deployed-blue)

</div>
