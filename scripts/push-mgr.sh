#!/bin/bash

# IMC Manager Build and Push Script
# This script builds the application and pushes it to Cloud Foundry
#
# Usage:
#   ./scripts/push-mgr.sh           # Normal build and push
#   ./scripts/push-mgr.sh --dry-run # Test version detection only
#   ./scripts/push-mgr.sh --help    # Show help

set -e  # Exit on any error

# Check for command line arguments
DRY_RUN=false
if [ "$1" = "--dry-run" ]; then
    DRY_RUN=true
    echo "Running in DRY-RUN mode - no actual deployment will occur"
elif [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "IMC Manager Build and Push Script"
    echo ""
    echo "Usage:"
    echo "  $0              Build and push to Cloud Foundry"
    echo "  $0 --dry-run    Test version detection without deploying"
    echo "  $0 --help       Show this help message"
    echo ""
    echo "This script:"
    echo "  1. Builds the application with Maven"
    echo "  2. Detects the version from the built JAR file"
    echo "  3. Updates manifest.yml with the correct JAR path"
    echo "  4. Pushes to Cloud Foundry (unless --dry-run)"
    exit 0
fi

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

# Function to extract version from POM file
get_version_from_pom() {
    if [ -f "pom.xml" ]; then
        # Extract version from root POM
        version=$(grep -m1 "<version>" pom.xml | sed 's/.*<version>\(.*\)<\/version>.*/\1/' | tr -d ' ')
        echo "$version"
    else
        echo ""
    fi
}

# Skip config validation in dry-run mode
if [ "$DRY_RUN" = false ]; then
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
else
    print_status "Skipping configuration validation (dry-run mode)"
fi

# Check if we're in the right directory
if [ ! -f "pom.xml" ]; then
    print_error "pom.xml not found. Please run this script from the project root directory."
    exit 1
fi

# Skip CF CLI validation in dry-run mode
if [ "$DRY_RUN" = false ]; then
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
else
    print_status "Skipping Cloud Foundry CLI validation (dry-run mode)"
fi

# Build the application (or skip in dry-run mode if JAR exists)
if [ "$DRY_RUN" = true ]; then
    # In dry-run mode, check if JAR exists, if not build
    existing_jar=$(find imc-manager-api/target -name "imc-manager-api-*.jar" -type f 2>/dev/null | head -n 1)
    if [ -n "$existing_jar" ] && [ -f "$existing_jar" ]; then
        print_status "Existing JAR found for version detection (dry-run mode): $existing_jar"
        print_status "Skipping Maven build in dry-run mode"
    else
        print_status "No existing JAR found, building application with Maven..."
        if ! mvn clean package -DskipTests; then
            print_error "Maven build failed!"
            exit 1
        fi
        print_success "Application built successfully"
    fi
else
    print_status "Building application with Maven..."
    if ! mvn clean package -DskipTests; then
        print_error "Maven build failed!"
        exit 1
    fi
    print_success "Application built successfully"
fi

# Extract version from built JAR file
print_status "Detecting built JAR version..."
jar_pattern="imc-manager-api/target/imc-manager-api-*.jar"
jar_files=(${jar_pattern})

version=""
jar_file=""

# Try to detect version from JAR filename first
if [ -f "${jar_files[0]}" ] && [[ "${jar_files[0]}" != "${jar_pattern}" ]]; then
    jar_file="${jar_files[0]}"
    jar_filename=$(basename "$jar_file")
    version=$(echo "$jar_filename" | sed 's/imc-manager-api-\(.*\)\.jar/\1/')
    print_status "Version detected from JAR filename: $version"
else
    # Fallback to POM version
    print_warning "No JAR file found, trying to detect version from POM..."
    pom_version=$(get_version_from_pom)
    if [ -n "$pom_version" ]; then
        version="$pom_version"
        jar_file="imc-manager-api/target/imc-manager-api-${version}.jar"
        print_status "Version detected from POM: $version"
    else
        print_error "Could not detect version from JAR or POM"
        exit 1
    fi
fi

# Verify the JAR file exists with the detected version
if [ ! -f "$jar_file" ]; then
    print_error "JAR file not found at expected path: $jar_file"
    print_error "Please ensure Maven build completed successfully"
    exit 1
fi

print_status "Using JAR file: $jar_file"
print_success "Version successfully detected: $version"

# Update manifest.yml with the detected version
print_status "Updating manifest.yml with version $version..."
if [ -f "manifest.yml" ]; then
    # Backup original manifest
    cp manifest.yml manifest.yml.backup
    print_status "Created backup: manifest.yml.backup"
    
    # Update the path in manifest.yml using a more specific pattern
    if grep -q "path:.*imc-manager-api.*\.jar" manifest.yml; then
        sed -i.tmp "s|path: \./imc-manager-api/target/imc-manager-api-.*\.jar|path: ./imc-manager-api/target/imc-manager-api-${version}.jar|" manifest.yml
        rm -f manifest.yml.tmp
        print_success "manifest.yml updated with version $version"
        
        # Show the updated line for verification
        updated_line=$(grep "path:.*imc-manager-api.*\.jar" manifest.yml)
        print_status "Updated path: $updated_line"
    else
        print_warning "Could not find JAR path in manifest.yml to update"
        print_status "Will use cf push with explicit path instead"
    fi
else
    print_warning "manifest.yml not found, will use cf push with explicit path"
fi

# Exit early if dry-run mode
if [ "$DRY_RUN" = true ]; then
    print_success "DRY-RUN completed successfully!"
    print_status "Version detection and manifest update completed"
    print_status "To actually deploy, run: ./scripts/push-mgr.sh"
    exit 0
fi

# Push to Cloud Foundry
print_status "Pushing application to Cloud Foundry..."
print_status "App name: $CF_APP_NAME"

# Set environment variables for the app
export IMC_MANAGER_BASIC_USER
export IMC_MANAGER_BASIC_PASS

# Push the application (use manifest if available, otherwise explicit path)
if [ -f "manifest.yml" ]; then
    print_status "Using manifest.yml for deployment"
    push_result=$(cf push --no-start 2>&1)
else
    print_status "Using explicit JAR path for deployment"
    push_result=$(cf push "$CF_APP_NAME" -p "$jar_file" --no-start 2>&1)
fi

if echo "$push_result" | grep -q "FAILED"; then
    print_error "Push failed: $push_result"
    exit 1
fi

if true; then
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
