#!/bin/bash

# IMC Manager RAGmon Integration Test Script
# This script tests the RAGmon service integration functionality
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
LOG_FILE="ragmon-test-$(date +%Y%m%d-%H%M%S).log"

# Prompt for credentials (no hardcoded passwords for security)
echo -e "${BLUE}IMC Manager RAGmon Integration Test${NC}"
echo -e "${BLUE}====================================${NC}"
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

# Test 1: List Services
test_list_services() {
    print_status "Testing: List Services"
    
    local response=$(make_request "GET" "/api/services")
    local http_code=$(echo "$response" | cut -d: -f1)
    local response_body=$(echo "$response" | cut -d: -f2-)
    
    if [ "$http_code" = "200" ]; then
        if validate_json_response "$response_body"; then
            local service_count=$(echo "$response_body" | jq '.services | length' 2>/dev/null || echo "0")
            print_test_result "List Services" "PASS" "Retrieved $service_count services"
        else
            print_test_result "List Services" "FAIL" "Invalid JSON response"
        fi
    else
        print_test_result "List Services" "FAIL" "HTTP $http_code: $response_body"
    fi
}

# Test 2: Get Service Status
test_get_service_status() {
    print_status "Testing: Get Service Status"
    
    local response=$(make_request "GET" "/api/services/hdfswatcher/status")
    local http_code=$(echo "$response" | cut -d: -f1)
    local response_body=$(echo "$response" | cut -d: -f2-)
    
    if [ "$http_code" = "200" ]; then
        if validate_json_response "$response_body"; then
            local status=$(echo "$response_body" | jq -r '.status' 2>/dev/null || echo "unknown")
            print_test_result "Get Service Status" "PASS" "Service status: $status"
        else
            print_test_result "Get Service Status" "FAIL" "Invalid JSON response"
        fi
    else
        print_test_result "Get Service Status" "FAIL" "HTTP $http_code: $response_body"
    fi
}

# Test 3: Get Service State
test_get_service_state() {
    print_status "Testing: Get Service State"
    
    local response=$(make_request "GET" "/api/services/hdfswatcher/state")
    local http_code=$(echo "$response" | cut -d: -f1)
    local response_body=$(echo "$response" | cut -d: -f2-)
    
    if [ "$http_code" = "200" ]; then
        if validate_json_response "$response_body"; then
            local state=$(echo "$response_body" | jq -r '.state' 2>/dev/null || echo "unknown")
            print_test_result "Get Service State" "PASS" "Service state: $state"
        else
            print_test_result "Get Service State" "FAIL" "Invalid JSON response"
        fi
    else
        print_test_result "Get Service State" "FAIL" "HTTP $http_code: $response_body"
    fi
}

# Test 4: Start Service
test_start_service() {
    print_status "Testing: Start Service"
    
    local response=$(make_request "POST" "/api/services/hdfswatcher/start")
    local http_code=$(echo "$response" | cut -d: -f1)
    local response_body=$(echo "$response" | cut -d: -f2-)
    
    if [ "$http_code" = "200" ]; then
        if validate_json_response "$response_body"; then
            local status=$(echo "$response_body" | jq -r '.status' 2>/dev/null || echo "unknown")
            if [ "$status" = "success" ]; then
                print_test_result "Start Service" "PASS" "Successfully started service"
            else
                print_test_result "Start Service" "FAIL" "Unexpected status: $status"
            fi
        else
            print_test_result "Start Service" "FAIL" "Invalid JSON response"
        fi
    else
        print_test_result "Start Service" "FAIL" "HTTP $http_code: $response_body"
    fi
}

# Test 5: Stop Service
test_stop_service() {
    print_status "Testing: Stop Service"
    
    local response=$(make_request "POST" "/api/services/hdfswatcher/stop")
    local http_code=$(echo "$response" | cut -d: -f1)
    local response_body=$(echo "$response" | cut -d: -f2-)
    
    if [ "$http_code" = "200" ]; then
        if validate_json_response "$response_body"; then
            local status=$(echo "$response_body" | jq -r '.status' 2>/dev/null || echo "unknown")
            if [ "$status" = "success" ]; then
                print_test_result "Stop Service" "PASS" "Successfully stopped service"
            else
                print_test_result "Stop Service" "FAIL" "Unexpected status: $status"
            fi
        else
            print_test_result "Stop Service" "FAIL" "Invalid JSON response"
        fi
    else
        print_test_result "Stop Service" "FAIL" "HTTP $http_code: $response_body"
    fi
}

# Test 6: Toggle Service
test_toggle_service() {
    print_status "Testing: Toggle Service"
    
    local response=$(make_request "POST" "/api/services/hdfswatcher/toggle")
    local http_code=$(echo "$response" | cut -d: -f1)
    local response_body=$(echo "$response" | cut -d: -f2-)
    
    if [ "$http_code" = "200" ]; then
        if validate_json_response "$response_body"; then
            local status=$(echo "$response_body" | jq -r '.status' 2>/dev/null || echo "unknown")
            if [ "$status" = "success" ]; then
                print_test_result "Toggle Service" "PASS" "Successfully toggled service"
            else
                print_test_result "Toggle Service" "FAIL" "Unexpected status: $status"
            fi
        else
            print_test_result "Toggle Service" "FAIL" "Invalid JSON response"
        fi
    else
        print_test_result "Toggle Service" "FAIL" "HTTP $http_code: $response_body"
    fi
}

# Test 7: Get RAG Pipeline Overview
test_rag_pipeline_overview() {
    print_status "Testing: Get RAG Pipeline Overview"
    
    local response=$(make_request "GET" "/api/services/rag-pipeline/overview")
    local http_code=$(echo "$response" | cut -d: -f1)
    local response_body=$(echo "$response" | cut -d: -f2-)
    
    if [ "$http_code" = "200" ]; then
        if validate_json_response "$response_body"; then
            local service_count=$(echo "$response_body" | jq '.services | length' 2>/dev/null || echo "0")
            print_test_result "Get RAG Pipeline Overview" "PASS" "Retrieved overview with $service_count services"
        else
            print_test_result "Get RAG Pipeline Overview" "FAIL" "Invalid JSON response"
        fi
    else
        print_test_result "Get RAG Pipeline Overview" "FAIL" "HTTP $http_code: $response_body"
    fi
}

# Test 8: Authentication Test
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
    print_header "IMC Manager RAGmon Integration Test Suite"
    print_status "Starting tests against: $APP_URL"
    print_status "Username: $USERNAME"
    print_status "Log file: $LOG_FILE"
    echo ""
    
    # Log start
    echo "$(date): Starting IMC Manager RAGmon Integration Tests" >> "$LOG_FILE"
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
    test_list_services
    test_get_service_status
    test_get_service_state
    test_start_service
    test_stop_service
    test_toggle_service
    test_rag_pipeline_overview
    
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
