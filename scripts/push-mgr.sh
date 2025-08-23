#!/bin/bash

# IMC Manager Build and Push Script
# This script builds the application and pushes it to Cloud Foundry

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if config.env exists
if [ ! -f "scripts/config.env" ]; then
    print_error "config.env not found in scripts directory!"
    print_status "Please copy scripts/config.env.template to scripts/config.env and fill in your values"
    exit 1
fi

# Source the configuration
print_status "Loading configuration from scripts/config.env"
source scripts/config.env

# Validate required environment variables
required_vars=("CF_ORG" "CF_SPACE" "CF_APP_NAME" "IMC_MANAGER_BASIC_USER" "IMC_MANAGER_BASIC_PASS")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set in config.env"
        exit 1
    fi
done

print_status "Configuration loaded successfully"
print_status "CF Org: $CF_ORG"
print_status "CF Space: $CF_SPACE"
print_status "CF App: $CF_APP_NAME"

# Check if we're in the right directory
if [ ! -f "pom.xml" ]; then
    print_error "pom.xml not found. Please run this script from the project root directory."
    exit 1
fi

# Check if cf CLI is installed
if ! command -v cf &> /dev/null; then
    print_error "Cloud Foundry CLI (cf) is not installed or not in PATH"
    exit 1
fi

# Check if logged into Cloud Foundry
print_status "Checking Cloud Foundry login status..."
if ! cf target &> /dev/null; then
    print_error "Not logged into Cloud Foundry. Please run 'cf login' first."
    exit 1
fi

# Set target org and space
print_status "Setting target to org: $CF_ORG, space: $CF_SPACE"
cf target -o "$CF_ORG" -s "$CF_SPACE"

# Build the application
print_status "Building application with Maven..."
if ! mvn clean package -DskipTests; then
    print_error "Maven build failed!"
    exit 1
fi

print_success "Application built successfully"

# Check if the JAR file was created
jar_file="imc-manager-api/target/imc-manager-api-1.0.0.jar"
if [ ! -f "$jar_file" ]; then
    print_error "JAR file not found at $jar_file"
    exit 1
fi

print_status "JAR file found: $jar_file"

# Push to Cloud Foundry
print_status "Pushing application to Cloud Foundry..."
print_status "App name: $CF_APP_NAME"

# Set environment variables for the app
export IMC_MANAGER_BASIC_USER
export IMC_MANAGER_BASIC_PASS

# Push the application
if cf push "$CF_APP_NAME" -p "$jar_file" --no-start; then
    print_success "Application pushed successfully"
    
    # Set environment variables
    print_status "Setting environment variables..."
    cf set-env "$CF_APP_NAME" IMC_MANAGER_BASIC_USER "$IMC_MANAGER_BASIC_USER"
    cf set-env "$CF_APP_NAME" IMC_MANAGER_BASIC_PASS "$IMC_MANAGER_BASIC_PASS"
    
    # Start the application
    print_status "Starting application..."
    if cf start "$CF_APP_NAME"; then
        print_success "Application started successfully!"
        
        # Show app status
        print_status "Application status:"
        cf app "$CF_APP_NAME"
        
        # Show app URL
        print_status "Application URL:"
        cf app "$CF_APP_NAME" | grep "urls:" | awk '{print $2}'
        
    else
        print_error "Failed to start application"
        print_status "Check logs with: cf logs $CF_APP_NAME --recent"
        exit 1
    fi
else
    print_error "Failed to push application to Cloud Foundry"
    exit 1
fi

print_success "Deployment completed successfully!"
