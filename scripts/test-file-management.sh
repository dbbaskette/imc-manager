#!/bin/bash

# IMC Manager File Management Test Script
# This script tests the file management functionality in the RAG Pipeline
# SECURITY: Prompts for credentials instead of hardcoding them

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
APP_URL="https://imc-manager.apps.tas-ndc.kuhn-labs.com"
LOG_FILE="file-management-test-$(date +%Y%m%d-%H%M%S).log"

# Prompt for credentials (no hardcoded passwords for security)
echo -e "${BLUE}IMC Manager File Management Test${NC}"
echo -e "${BLUE}===============================${NC}"
echo ""
read -p "Enter username (default: admin): " USERNAME
USERNAME=${USERNAME:-admin}
read -s -p "Enter password: " PASSWORD
echo ""

# Validate credentials were provided
if [ -z "$PASSWORD" ]; then
    echo -e "${RED}[ERROR] Password cannot be empty${NC}"
    exit 1
fi

echo ""

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

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

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

print_test_result() {
    local test_name="$1"
    local result="$2"
    local details="$3"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    case $result in
        "PASS")
            PASSED_TESTS=$((PASSED_TESTS + 1))
            echo -e "${GREEN}✓ PASS${NC} - $test_name"
            if [ -n "$details" ]; then
                echo -e "  ${CYAN}Details:${NC} $details"
            fi
            ;;
        "FAIL")
            FAILED_TESTS=$((FAILED_TESTS + 1))
            echo -e "${RED}✗ FAIL${NC} - $test_name"
            if [ -n "$details" ]; then
                echo -e "  ${RED}Details:${NC} $details"
            fi
            ;;
        "SKIP")
            SKIPPED_TESTS=$((SKIPPED_TESTS + 1))
            echo -e "${YELLOW}⚠ SKIP${NC} - $test_name"
            if [ -n "$details" ]; then
                echo -e "  ${YELLOW}Details:${NC} $details"
            fi
            ;;
    esac
}

# Function to make authenticated HTTP requests
make_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"

    local temp_file=$(mktemp)
    local http_code

    if [ "$method" = "POST" ]; then
        if [ -n "$data" ]; then
            http_code=$(curl -s -w "%{http_code}" -o "$temp_file" \
                -u "$USERNAME:$PASSWORD" \
                -X POST \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$APP_URL$endpoint")
        else
            http_code=$(curl -s -w "%{http_code}" -o "$temp_file" \
                -u "$USERNAME:$PASSWORD" \
                -X POST \
                "$APP_URL$endpoint")
        fi
    else
        http_code=$(curl -s -w "%{http_code}" -o "$temp_file" \
            -u "$USERNAME:$PASSWORD" \
            "$APP_URL$endpoint")
    fi

    local response=$(cat "$temp_file")
    rm "$temp_file"

    echo "$http_code:$response"
}

# Function to validate JSON response
validate_json_response() {
    local response="$1"
    if echo "$response" | jq . >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to check if service is available
check_service_availability() {
    print_status "Checking if IMC Manager is accessible..."
    
    local response=$(make_request "GET" "/api/services")
    local http_code=$(echo "$response" | cut -d: -f1)
    local response_body=$(echo "$response" | cut -d: -f2-)
    
    if [ "$http_code" = "200" ]; then
        print_success "IMC Manager is accessible"
        return 0
    else
        print_error "IMC Manager is not accessible (HTTP $http_code)"
        print_error "Response: $response_body"
        return 1
    fi
}

# Test 1: Get HDFS Watcher Files
test_get_hdfs_watcher_files() {
    print_status "Testing: Get HDFS Watcher Files"
    
    local response=$(make_request "GET" "/api/services/hdfswatcher/files")
    local http_code=$(echo "$response" | cut -d: -f1)
    local response_body=$(echo "$response" | cut -d: -f2-)
    
    if [ "$http_code" = "200" ]; then
        if validate_json_response "$response_body"; then
            local file_count=$(echo "$response_body" | jq '.files | length' 2>/dev/null || echo "0")
            print_test_result "Get HDFS Watcher Files" "PASS" "Retrieved $file_count files"
        else
            print_test_result "Get HDFS Watcher Files" "FAIL" "Invalid JSON response"
        fi
    else
        print_test_result "Get HDFS Watcher Files" "FAIL" "HTTP $http_code: $response_body"
    fi
}

# Test 2: Reprocess All Files
test_reprocess_all_files() {
    print_status "Testing: Reprocess All Files"
    
    local response=$(make_request "POST" "/api/services/hdfswatcher/reprocess-all")
    local http_code=$(echo "$response" | cut -d: -f1)
    local response_body=$(echo "$response" | cut -d: -f2-)
    
    if [ "$http_code" = "200" ]; then
        if validate_json_response "$response_body"; then
            local status=$(echo "$response_body" | jq -r '.status' 2>/dev/null || echo "unknown")
            if [ "$status" = "success" ]; then
                print_test_result "Reprocess All Files" "PASS" "Successfully initiated reprocessing"
            else
                print_test_result "Reprocess All Files" "FAIL" "Unexpected status: $status"
            fi
        else
            print_test_result "Reprocess All Files" "FAIL" "Invalid JSON response"
        fi
    else
        print_test_result "Reprocess All Files" "FAIL" "HTTP $http_code: $response_body"
    fi
}

# Test 3: Clear Processed Files
test_clear_processed_files() {
    print_status "Testing: Clear Processed Files"
    
    local response=$(make_request "POST" "/api/services/hdfswatcher/clear")
    local http_code=$(echo "$response" | cut -d: -f1)
    local response_body=$(echo "$response" | cut -d: -f2-)
    
    if [ "$http_code" = "200" ]; then
        if validate_json_response "$response_body"; then
            local status=$(echo "$response_body" | jq -r '.status' 2>/dev/null || echo "unknown")
            if [ "$status" = "success" ]; then
                print_test_result "Clear Processed Files" "PASS" "Successfully cleared processed files"
            else
                print_test_result "Clear Processed Files" "FAIL" "Unexpected status: $status"
            fi
        else
            print_test_result "Clear Processed Files" "FAIL" "Invalid JSON response"
        fi
    else
        print_test_result "Clear Processed Files" "FAIL" "HTTP $http_code: $response_body"
    fi
}

# Test 4: Process Now
test_process_now() {
    print_status "Testing: Process Now"
    
    local response=$(make_request "POST" "/api/services/hdfswatcher/process-now")
    local http_code=$(echo "$response" | cut -d: -f1)
    local response_body=$(echo "$response" | cut -d: -f2-)
    
    if [ "$http_code" = "200" ]; then
        if validate_json_response "$response_body"; then
            local status=$(echo "$response_body" | jq -r '.status' 2>/dev/null || echo "unknown")
            if [ "$status" = "success" ]; then
                print_test_result "Process Now" "PASS" "Successfully initiated immediate processing"
            else
                print_test_result "Process Now" "FAIL" "Unexpected status: $status"
            fi
        else
            print_test_result "Process Now" "FAIL" "Invalid JSON response"
        fi
    else
        print_test_result "Process Now" "FAIL" "HTTP $http_code: $response_body"
    fi
}

# Test 5: Authentication Test
test_authentication() {
    print_status "Testing: Authentication"
    
    local response=$(curl -s -w "%{http_code}" -o /dev/null \
        -u "$USERNAME:wrongpassword" \
        "$APP_URL/api/services")
    
    if [ "$response" = "401" ]; then
        print_test_result "Authentication" "PASS" "Proper authentication required"
    else
        print_test_result "Authentication" "FAIL" "Expected HTTP 401, got $response"
    fi
}

# Main test execution
main() {
    print_header "IMC Manager File Management Test Suite"
    print_status "Starting tests against: $APP_URL"
    print_status "Username: $USERNAME"
    print_status "Log file: $LOG_FILE"
    echo ""
    
    # Log start
    echo "$(date): Starting IMC Manager File Management Tests" >> "$LOG_FILE"
    echo "Target: $APP_URL" >> "$LOG_FILE"
    echo "Username: $USERNAME" >> "$LOG_FILE"
    echo "========================================" >> "$LOG_FILE"
    
    # Check service availability first
    if ! check_service_availability; then
        print_error "Service is not available. Exiting tests."
        exit 1
    fi
    
    # Run tests
    test_authentication
    test_get_hdfs_watcher_files
    test_reprocess_all_files
    test_clear_processed_files
    test_process_now
    
    # Print summary
    echo ""
    print_header "Test Summary"
    echo -e "Total Tests: ${CYAN}$TOTAL_TESTS${NC}"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
    echo -e "Skipped: ${YELLOW}$SKIPPED_TESTS${NC}"
    
    # Log summary
    echo "" >> "$LOG_FILE"
    echo "========================================" >> "$LOG_FILE"
    echo "$(date): Test Summary" >> "$LOG_FILE"
    echo "Total: $TOTAL_TESTS, Passed: $PASSED_TESTS, Failed: $FAILED_TESTS, Skipped: $SKIPPED_TESTS" >> "$LOG_FILE"
    
    # Exit with appropriate code
    if [ $FAILED_TESTS -eq 0 ]; then
        print_success "All tests passed!"
        exit 0
    else
        print_error "Some tests failed!"
        exit 1
    fi
}

# Run main function
main "$@"
