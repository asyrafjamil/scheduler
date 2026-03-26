#!/bin/bash

BASE_URL="http://localhost:3000"

echo "=== Testing Clinic Scheduler API with UUIDs ==="
echo ""

echo "1. Creating a clinician..."
CLINICIAN=$(curl -s -X POST $BASE_URL/clinicians \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Smith",
    "email": "smith@clinic.com",
    "specialty": "Cardiology"
  }')
echo "$CLINICIAN"
CLINICIAN_ID=$(echo $CLINICIAN | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Clinician ID: $CLINICIAN_ID"
echo ""

echo "2. Creating a patient..."
PATIENT=$(curl -s -X POST $BASE_URL/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }')
echo "$PATIENT"
PATIENT_ID=$(echo $PATIENT | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Patient ID: $PATIENT_ID"
echo ""

echo "3. Creating first appointment (should succeed)..."
APPOINTMENT1=$(curl -s -X POST $BASE_URL/appointments \
  -H "Content-Type: application/json" \
  -d "{
    \"start\": \"2026-03-27T10:00:00Z\",
    \"end\": \"2026-03-27T11:00:00Z\",
    \"clinicianId\": \"$CLINICIAN_ID\",
    \"patientId\": \"$PATIENT_ID\"
  }")
echo "$APPOINTMENT1"
echo ""

echo "4. Attempting overlapping appointment (should return 409 Conflict)..."
OVERLAP=$(curl -s -w "\nHTTP Status: %{http_code}" -X POST $BASE_URL/appointments \
  -H "Content-Type: application/json" \
  -d "{
    \"start\": \"2026-03-27T10:30:00Z\",
    \"end\": \"2026-03-27T11:30:00Z\",
    \"clinicianId\": \"$CLINICIAN_ID\",
    \"patientId\": \"$PATIENT_ID\"
  }")
echo "$OVERLAP"
echo ""

echo "5. Testing invalid times (start >= end, should return 400)..."
INVALID=$(curl -s -w "\nHTTP Status: %{http_code}" -X POST $BASE_URL/appointments \
  -H "Content-Type: application/json" \
  -d "{
    \"start\": \"2026-03-27T11:00:00Z\",
    \"end\": \"2026-03-27T10:00:00Z\",
    \"clinicianId\": \"$CLINICIAN_ID\",
    \"patientId\": \"$PATIENT_ID\"
  }")
echo "$INVALID"
echo ""

echo "6. Creating non-overlapping appointment (should succeed)..."
APPOINTMENT2=$(curl -s -X POST $BASE_URL/appointments \
  -H "Content-Type: application/json" \
  -d "{
    \"start\": \"2026-03-27T14:00:00Z\",
    \"end\": \"2026-03-27T15:00:00Z\",
    \"clinicianId\": \"$CLINICIAN_ID\",
    \"patientId\": \"$PATIENT_ID\"
  }")
echo "$APPOINTMENT2"
echo ""

echo "7. Creating a past appointment..."
PAST_APPT=$(curl -s -X POST $BASE_URL/appointments \
  -H "Content-Type: application/json" \
  -d "{
    \"start\": \"2026-01-15T09:00:00Z\",
    \"end\": \"2026-01-15T10:00:00Z\",
    \"clinicianId\": \"$CLINICIAN_ID\",
    \"patientId\": \"$PATIENT_ID\"
  }")
echo "$PAST_APPT"
echo ""

echo "8. Listing clinician's upcoming appointments (no params - from now)..."
curl -s -X GET "$BASE_URL/clinicians/$CLINICIAN_ID/appointments"
echo ""
echo ""

echo "9. Listing appointments with date range (from/to params)..."
curl -s -X GET "$BASE_URL/clinicians/$CLINICIAN_ID/appointments?from=2026-03-27T00:00:00Z&to=2026-03-28T00:00:00Z"
echo ""
echo ""

echo "10. Listing all appointments (requires x-role: admin)..."
curl -s -X GET $BASE_URL/appointments \
  -H "x-role: admin"
echo ""
echo ""

echo "=== Test Complete ==="


