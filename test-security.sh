#!/bin/bash

echo "=================================="
echo "Testing Security Features"
echo "=================================="
echo ""

echo "1. Testing MongoDB Connection..."
curl -s http://localhost:3001/api/health | jq .
echo ""

echo "2. Testing 2FA Code Generation..."
CODE_RESPONSE=$(curl -s http://localhost:3001/api/2fa/current)
echo $CODE_RESPONSE | jq .
CURRENT_CODE=$(echo $CODE_RESPONSE | jq -r '.code')
echo ""

echo "3. Testing 2FA Verification with correct code ($CURRENT_CODE)..."
curl -s -X POST http://localhost:3001/api/2fa/verify \
  -H "Content-Type: application/json" \
  -d "{\"code\": \"$CURRENT_CODE\"}" | jq .
echo ""

echo "4. Testing 2FA Verification with incorrect code (000000)..."
curl -s -X POST http://localhost:3001/api/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{"code": "000000"}' | jq .
echo ""

echo "5. Testing Visitor Tracking..."
curl -s -X POST http://localhost:3001/api/visit \
  -H "Content-Type: application/json" \
  -d '{"page": "/test", "userAgent": "TestBot/1.0"}' | jq '.success, .stats.today'
echo ""

echo "6. Testing Analytics Stats..."
curl -s http://localhost:3001/api/stats | jq '.stats.today | {uniqueVisitors, totalVisits}'
echo ""

echo "7. Testing Rate Limiting (5 rapid 2FA attempts)..."
for i in {1..6}; do
  RESPONSE=$(curl -s -X POST http://localhost:3001/api/2fa/verify \
    -H "Content-Type: application/json" \
    -d '{"code": "999999"}')
  echo "Attempt $i: $(echo $RESPONSE | jq -r '.message // .error')"
done
echo ""

echo "=================================="
echo "All tests completed!"
echo "=================================="
