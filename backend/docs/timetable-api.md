# Timetable API Documentation

## Endpoints

### GET /api/timetable
- Description: Retrieves all timetable entries
- Authentication: Required
- Authorization: Any authenticated user
- Response: Array of timetable entries

### GET /api/timetable/:id
- Description: Retrieves a specific timetable entry by ID
- Authentication: Required
- Authorization: Any authenticated user
- Response: Timetable entry object

### POST /api/timetable
- Description: Creates a new timetable entry
- Authentication: Required
- Authorization: Admin or Academic Manager only
- Request Body:
  ```json
  {
    "lectureName": "Advanced Grammar Session",
    "startTime": "10:00",
    "endTime": "11:30",
    "classType": "physical",  // or "online"
    "venue": "Room 301",      // required if classType is "physical"
    "onlineLink": ""          // required if classType is "online"
  }
  ```
- Response: Created timetable entry

### PUT /api/timetable/:id
- Description: Updates an existing timetable entry
- Authentication: Required
- Authorization: Admin or Academic Manager only
- Request Body: Same as POST, with fields to update
- Response: Updated timetable entry

### DELETE /api/timetable/:id
- Description: Deletes a timetable entry
- Authentication: Required
- Authorization: Admin or Academic Manager only
- Response: Success message
