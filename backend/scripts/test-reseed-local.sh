#!/bin/bash

# =====================================================
# Test Script to Clear and Reseed Course Data (Local)
# =====================================================

echo "======================================"
echo "Course Data Reseed Script"
echo "======================================"
echo ""

# Configuration
API_URL="http://localhost:5041"
LOGIN_ENDPOINT="/api/auth/login"
RESEED_ENDPOINT="/api/admin/reseed-course-data"

# SuperAdmin credentials (update these)
EMAIL="superadmin@ersa-training.com"
PASSWORD="SuperAdmin123!"

echo "Step 1: Authenticating..."
echo "Email: $EMAIL"

# Login and get token
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL$LOGIN_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "✗ Authentication failed!"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✓ Authentication successful!"
echo ""

echo "Step 2: Clearing existing course data..."

# Call reseed endpoint
RESEED_RESPONSE=$(curl -s -X POST "$API_URL$RESEED_ENDPOINT" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$RESEED_RESPONSE" | jq '.' || echo "$RESEED_RESPONSE"

echo ""
echo "======================================"
echo "✓ STEP 1 COMPLETE!"
echo "======================================"
echo ""
echo "IMPORTANT: Restart the application to trigger SeedData!"

