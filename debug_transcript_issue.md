# Transcript Review Update Issue - Debug Guide

## Problem: "Failed to update review" error on transcript status change

## Confirmed Working Components:
✅ Backend endpoint: `PUT /transcripts/review/{transcriptId}`  
✅ Service method: `TranscriptService.updateTranscriptReview()`  
✅ Database fields: reviewStatus, reviewComments, reviewedBy, reviewDate  
✅ Frontend API call structure  

## Potential Issues to Check:

### 1. Authentication & Authorization
- **Check:** User has COORDINATOR or ADMIN role
- **Verify:** JWT token is valid and being sent correctly
- **Debug:** Browser Network tab shows Authorization header

### 2. API Request Format  
- **Frontend sends:** `TranscriptReview` interface
- **Backend expects:** `TranscriptReviewDTO` class
- **Potential issue:** Type mismatch (number vs Long)

### 3. Network/Service Issues
- **Check:** Profile service is running and accessible via gateway
- **Verify:** Gateway routing is correct for /transcripts/review/*
- **Debug:** Direct API call bypassing frontend

## Debug Steps:

### Step 1: Check Browser Console
```javascript
// Open browser dev tools, check:
// 1. Network tab for failed requests
// 2. Console for JavaScript errors  
// 3. Application tab for JWT token validity
```

### Step 2: Test Direct API Call
```bash
# Test with curl (replace with actual token and transcript ID)
curl -X PUT http://localhost:8080/transcripts/review/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transcriptId": 1,
    "reviewStatus": "APPROVED", 
    "reviewComments": "Test comment"
  }'
```

### Step 3: Check Service Logs
```bash
# Check profile service logs
docker logs profile-service

# Check gateway service logs  
docker logs gateway-service
```

## Most Likely Causes:
1. **JWT Token Expired/Invalid** - Most common cause
2. **User Role Insufficient** - User lacks COORDINATOR/ADMIN role
3. **Service Communication Issue** - Gateway not routing properly
4. **Database Connection** - Profile service can't connect to MySQL

## Quick Fixes to Try:
1. Refresh the page (re-authenticate)
2. Check user role in database
3. Test with different transcript ID
4. Verify all microservices are running healthy
