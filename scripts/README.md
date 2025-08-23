# IMC Manager Scripts

This directory contains deployment and utility scripts for the IMC Manager application.

## Files

- `config.env.template` - Configuration template (committed to git)
- `config.env` - Actual configuration values (NOT committed to git)
- `push-mgr.sh` - Main deployment script

## Quick Deployment

**Always use this script for deployment:**

```bash
./scripts/push-mgr.sh
```

## Configuration Setup

1. **Copy the template:**
   ```bash
   cp scripts/config.env.template scripts/config.env
   ```

2. **Edit with your values:**
   ```bash
   # Edit scripts/config.env with your Cloud Foundry details
   CF_ORG=your-org
   CF_SPACE=your-space
   CF_APP_NAME=imc-manager
   IMC_MANAGER_BASIC_USER=admin
   IMC_MANAGER_BASIC_PASS=your-password
   ```

## What the Script Does

1. ✅ Loads configuration from `scripts/config.env`
2. ✅ Validates required environment variables
3. ✅ Checks Cloud Foundry login status
4. ✅ Sets target org/space
5. ✅ Builds application with Maven
6. ✅ Pushes to Cloud Foundry
7. ✅ Sets environment variables
8. ✅ Starts the application
9. ✅ Shows deployment status

## Troubleshooting

### Script Fails to Run
- Make sure it's executable: `chmod +x scripts/push-mgr.sh`
- Run from project root directory
- Check that `scripts/config.env` exists

### Configuration Issues
- Verify all required variables are set in `scripts/config.env`
- Check Cloud Foundry login: `cf target`
- Ensure org/space values are correct

### Build Issues
- Check Java version: `java -version`
- Check Maven: `mvn -version`
- Clean and rebuild: `mvn clean package`

### Deployment Issues
- Check app status: `cf app imc-manager`
- View logs: `cf logs imc-manager --recent`
- Restart if needed: `cf restart imc-manager`

## Security Notes

- `config.env` contains sensitive data and is NOT committed to git
- `config.env.template` is safe to commit (contains placeholders only)
- Always change default passwords in production
- Use strong, unique passwords for each environment
