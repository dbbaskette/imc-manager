# Service Configuration

This directory contains the service configuration for the IMC Manager application.

## Files

- `services.json.template` - Template file with placeholder values (safe for version control)
- `services.json` - Actual configuration with real URLs and credentials (ignored by git)

## Setup Instructions

1. **Copy the template** to create your actual configuration:
   ```bash
   cp services.json.template services.json
   ```

2. **Update the configuration** with your actual service URLs and credentials:
   - Replace placeholder URLs with your actual service endpoints
   - Add real credentials for services that support auto-login
   - Update service names and descriptions as needed

3. **Service Types**:
   - **Messaging**: RabbitMQ, Kafka, etc.
   - **Data Processing**: Hadoop, Spark, etc.
   - **Database**: PostgreSQL, Greenplum, etc.
   - **Cloud Platform**: Tanzu, Kubernetes, etc.
   - **Data Flow**: Spring Cloud Data Flow, etc.

## Credentials Format

### RabbitMQ
```json
"credentials": {
  "username": "your-username",
  "password": "your-password"
}
```

### Spring Cloud Data Flow
```json
"credentials": {
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret"
}
```

## Security Notes

- **Never commit** `services.json` to version control
- The file is already added to `.gitignore`
- Use environment variables or secure credential management in production
- Rotate credentials regularly

## Adding New Services

1. Add the service entry to `services.json`
2. Create a logo file in `../assets/logos/`
3. Choose an appropriate color from the available palette
4. Test the service link and auto-login functionality
