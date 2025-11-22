# API Documentation

This document provides an overview of all API endpoints available in the application.

## Table of Contents

- [Authentication](#authentication)
- [Events](#events)
- [Registrations](#registrations)
- [Teams](#teams)
- [User](#user)
- [Manager Applications](#manager-applications)
- [Manager Routes](#manager-routes)
- [Statistics](#statistics)

---

## Authentication

### POST/GET `/api/auth/[...all]`

Handles all authentication-related requests using `better-auth`.

**Supported Operations:**
- Sign in
- Sign up
- Sign out
- Password reset
- Email verification

**Implementation:** Uses `better-auth` library with Next.js handler.

---

## Events

### GET `/api/events/list`

Fetches a paginated list of events with optional filtering and sorting.

**Query Parameters:**
- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 10, max: 100) - Number of events per page
- `status` (string, optional) - Filter by event status (draft, published, cancelled)
- `search` (string, optional) - Search in title and description
- `sortBy` (string, default: "createdAt") - Sort field (createdAt, startDate, title, endDate)
- `sortOrder` (string, default: "desc") - Sort order (asc, desc)
- `upcoming` (boolean, optional) - Filter only upcoming events

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5,
      "hasMore": true
    }
  },
  "message": "Events fetched successfully"
}
```

**Cache:** 60 seconds (public, s-maxage)

---

### GET `/api/events/[id]`

Fetches a single event by ID.

**Parameters:**
- `id` (string) - Event UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Event Title",
    "description": "Event description",
    "imageUrl": "url or null",
    "startDate": "ISO date",
    "endDate": "ISO date",
    "location": "Location string",
    "maxCapacity": 100,
    "registrationDeadline": "ISO date",
    "status": "published",
    "managerId": "uuid",
    "teamId": "uuid or null",
    "page": "page content",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  },
  "message": "Event fetched successfully"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid ID format
- 404: Event not found
- 500: Server error

---

### POST `/api/events/create`

Creates a new event.

**Authentication Required:** Yes (Manager or Admin)

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "imageUrl": "string (optional)",
  "maxCapacity": "number (optional)",
  "startDate": "ISO date (required)",
  "endDate": "ISO date (required)",
  "location": "string (required)",
  "registrationDeadline": "ISO date (required)",
  "status": "string (default: draft)",
  "page": "string (optional)"
}
```

**Validations:**
- End date must be after start date
- Registration deadline must be before event start date
- All required fields must be provided

**Response:**
```json
{
  "success": true,
  "event": { event object },
  "message": "Event created successfully"
}
```

**Status Codes:**
- 201: Created
- 400: Validation error
- 401: Unauthorized
- 500: Server error

---

### PATCH `/api/events/[id]`

Updates an existing event. Only the manager who created it (or admin) can update.

**Authentication Required:** Yes (Manager or Admin)

**Request Body:** (all fields optional)
```json
{
  "title": "string",
  "description": "string",
  "imageUrl": "string",
  "startDate": "ISO date",
  "endDate": "ISO date",
  "location": "string",
  "maxCapacity": "number",
  "registrationDeadline": "ISO date",
  "status": "string"
}
```

**Authorization:**
- Event manager can update their own events
- Admins can update any event

**Status Codes:**
- 200: Updated
- 400: Invalid ID
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

---

### DELETE `/api/events/[id]`

Deletes an event. Only the manager who created it (or admin) can delete.

**Authentication Required:** Yes (Manager or Admin)

**Authorization:**
- Event manager can delete their own events
- Admins can delete any event
- Cascading delete handles related registrations

**Status Codes:**
- 200: Deleted
- 400: Invalid ID
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

---

### GET `/api/events/[id]/messages`

Fetches all messages for an event.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Message title",
      "content": "Message content",
      "priority": "normal",
      "createdAt": "ISO date",
      "updatedAt": "ISO date",
      "managerId": "uuid",
      "managerName": "Manager name"
    }
  ]
}
```

---

### POST `/api/events/[id]/messages`

Creates a new event message.

**Authentication Required:** Yes (Manager or Admin)

**Request Body:**
```json
{
  "title": "string (required)",
  "content": "string (required)",
  "priority": "low | normal | high | urgent (default: normal)"
}
```

**Authorization:**
- Must be the event manager or admin

**Status Codes:**
- 200: Created
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden
- 404: Event not found
- 500: Server error

---

### POST `/api/events/[id]/initialize-qrcodes`

Initializes default QR codes for all registered teams in an event.

**Authentication Required:** Yes (Manager or Admin)

**Request Body:** (optional)
```json
{
  "qrTypes": [
    {
      "trackingType": "attendance | food_coupon | custom",
      "label": "Label text",
      "metadata": "optional metadata"
    }
  ]
}
```

**Default QR Types:**
1. Event Attendance
2. Lunch Coupon
3. Dinner Coupon

**Authorization:**
- Must be the event manager or admin

**Response:**
```json
{
  "success": true,
  "message": "QR codes initialized: X created, Y skipped",
  "data": {
    "totalTeams": 10,
    "totalCreated": 30,
    "totalSkipped": 0,
    "results": [...]
  }
}
```

---

### POST `/api/events/[id]/verify-qr`

Verifies and marks a QR code as scanned.

**Authentication Required:** Yes (Event Manager or Admin)

**Request Body:**
```json
{
  "qrData": "string (QR code data - JSON or plain tracking ID)"
}
```

**QR Data Format:**
```json
{
  "trackingId": "uuid",
  "eventId": "uuid",
  "teamId": "uuid",
  "type": "attendance",
  "label": "Event Attendance"
}
```

**Authorization:**
- Must be the event manager or admin

**Validations:**
- QR code must exist in system
- QR code must belong to this event
- QR code must not be already scanned

**Response:**
```json
{
  "success": true,
  "message": "QR code verified and marked as used successfully",
  "data": {
    "id": "uuid",
    "teamName": "Team name",
    "label": "Event Attendance",
    "trackingType": "attendance",
    "scannedAt": "ISO date",
    "scannedBy": "Scanner name"
  }
}
```

**Status Codes:**
- 200: Success
- 400: Already scanned or invalid
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

---

### POST `/api/events/[id]/notify-teams`

Sends notifications to all registered teams for an event.

**Authentication Required:** Yes (Manager or Admin)

**Authorization:**
- Must be the event manager or admin

---

### GET `/api/events/[id]/page`

Fetches the event page content.

---

### GET `/api/events/[id]/team/[teamId]/qrcodes`

Fetches QR codes for a specific team in an event.

---

### POST `/api/events/[id]/team/[teamId]/generate-qrcodes`

Generates QR codes for a specific team in an event.

**Authentication Required:** Yes (Manager or Admin)

---

## Registrations

### POST `/api/registrations`

Registers a team for an event.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "eventId": "uuid (required)",
  "teamId": "uuid (required)"
}
```

**Validations:**
- Event must exist and be published
- Registration deadline must not have passed
- Event must not have ended
- Team must exist
- User must be team creator or member
- Team must not be already registered
- Team size must meet event requirements (min/max)
- Event must not be at max capacity

**Response:**
```json
{
  "message": "Team registered successfully",
  "registration": { registration object }
}
```

**Status Codes:**
- 201: Created
- 400: Validation error
- 401: Unauthorized
- 403: Not authorized for this team
- 404: Event or team not found
- 500: Server error

---

### GET `/api/registrations`

Fetches all registrations for an event.

**Authentication Required:** Yes

**Query Parameters:**
- `eventId` (string, required) - Event UUID

**Response:**
```json
{
  "registrations": [
    {
      "id": "uuid",
      "eventId": "uuid",
      "teamId": "uuid",
      "status": "confirmed",
      "registeredAt": "ISO date",
      "checkedInAt": "ISO date or null",
      "teamName": "Team name",
      "teamDescription": "Description",
      "teamMembers": [...]
    }
  ]
}
```

---

### DELETE `/api/registrations`

Cancels a registration.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "registrationId": "uuid (required)"
}
```

**Authorization:**
- Must be the team creator

**Response:**
```json
{
  "message": "Registration cancelled successfully"
}
```

**Status Codes:**
- 200: Cancelled
- 400: Missing registration ID
- 401: Unauthorized
- 403: Not team creator
- 404: Registration or team not found
- 500: Server error

---

### GET `/api/registrations/event/[eventId]/team/[teamId]`

Fetches registration details for a specific team in an event.

---

## Teams

### GET `/api/teams`

Fetches all teams for the current user (created by user or where user is a member).

**Authentication Required:** Yes

**Response:**
```json
{
  "teams": [
    {
      "id": "uuid",
      "name": "Team name",
      "description": "Description",
      "createdBy": "uuid",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

---

### POST `/api/teams`

Creates a new team and adds the creator as a team leader.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Team created successfully",
  "team": { team object }
}
```

**Status Codes:**
- 201: Created
- 400: Missing team name
- 401: Unauthorized
- 500: Server error

---

### GET `/api/teams/[id]`

Fetches team details including members.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Team name",
    "description": "Description",
    "createdBy": "uuid",
    "createdAt": "ISO date",
    "updatedAt": "ISO date",
    "members": [
      {
        "id": "uuid",
        "name": "Member name",
        "email": "email@example.com",
        "role": "leader | member",
        "status": "pending | accepted | declined",
        "invitedAt": "ISO date",
        "joinedAt": "ISO date or null"
      }
    ]
  }
}
```

**Status Codes:**
- 200: Success
- 404: Team not found
- 500: Server error

---

### POST `/api/teams/members`

Adds or invites members to a team.

**Authentication Required:** Yes

---

## User

### GET `/api/user`

Fetches the current authenticated user's data.

**Authentication Required:** Yes

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "User name",
    "email": "email@example.com",
    "role": "user | manager | admin",
    "emailVerified": true,
    "image": "url or null",
    "createdAt": "ISO date",
    "updatedAt": "ISO date",
    "banned": false,
    "banReason": null,
    "banExpires": null
  },
  "message": "User data fetched successfully"
}
```

**Cache:** No cache (no-store, max-age=0)

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 500: Server error

---

### GET `/api/user/activity`

Fetches user activity data.

**Authentication Required:** Yes

---

### GET `/api/user/registrations`

Fetches all registrations for the current user.

**Authentication Required:** Yes

---

## Manager Applications

### POST `/api/manager-applications/submit`

Submits a new manager application.

**Authentication Required:** Yes (User role only)

**Request Body:**
```json
{
  "organizationName": "string (required)",
  "organizationType": "string (required)",
  "contactPhone": "string (required)",
  "website": "string (optional)",
  "description": "string (required)",
  "experience": "string (required)"
}
```

**Validations:**
- User must not already be a manager or admin
- User must not have a pending application

**Response:**
```json
{
  "success": true,
  "data": { application object },
  "message": "Application submitted successfully."
}
```

**Status Codes:**
- 201: Created
- 400: Validation error or already has privileges/pending application
- 401: Unauthorized
- 500: Server error

---

### GET `/api/manager-applications/submit`

Gets the current user's manager application status.

**Authentication Required:** Yes

**Response:**
```json
{
  "success": true,
  "data": { application object or null },
  "message": "Application found."
}
```

---

### GET `/api/manager-applications/admin`

Gets all manager applications (admin only).

**Authentication Required:** Yes (Admin only)

**Query Parameters:**
- `status` (string, default: "pending") - Filter by status (pending, approved, rejected, all)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "organizationName": "string",
      "organizationType": "string",
      "contactPhone": "string",
      "website": "string or null",
      "description": "string",
      "experience": "string",
      "status": "pending | approved | rejected",
      "adminNotes": "string or null",
      "reviewedBy": "uuid or null",
      "reviewedAt": "ISO date or null",
      "createdAt": "ISO date",
      "updatedAt": "ISO date",
      "user": { user object }
    }
  ],
  "message": "Found X applications."
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Forbidden (not admin)
- 500: Server error

---

### PATCH `/api/manager-applications/admin`

Approves or rejects a manager application (admin only).

**Authentication Required:** Yes (Admin only)

**Request Body:**
```json
{
  "applicationId": "string (required)",
  "action": "approve | reject (required)",
  "adminNotes": "string (optional)"
}
```

**Effects:**
- If approved: User role is updated to "manager"
- Application status is updated
- Review timestamp and reviewer are recorded

**Response:**
```json
{
  "success": true,
  "data": { updated application object },
  "message": "Application approved/rejected successfully."
}
```

**Status Codes:**
- 200: Success
- 400: Validation error or already processed
- 401: Unauthorized
- 403: Forbidden (not admin)
- 404: Application not found
- 500: Server error

---

## Manager Routes

### GET `/api/manager/events`

Fetches events created by the logged-in manager with registration counts.

**Authentication Required:** Yes (Manager or Admin)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Event title",
      "description": "Description",
      "startDate": "ISO date",
      "endDate": "ISO date",
      "location": "Location",
      "maxCapacity": 100,
      "status": "published",
      "imageUrl": "url",
      "createdAt": "ISO date",
      "registrationCount": 25
    }
  ],
  "message": "Events fetched successfully"
}
```

**Limit:** Returns last 10 events

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Forbidden (not manager/admin)
- 500: Server error

---

### GET `/api/manager/registrations`

Fetches registrations for the manager's events.

**Authentication Required:** Yes (Manager or Admin)

---

## Statistics

### GET `/api/stats`

Fetches dashboard statistics based on user role.

**Authentication Required:** Yes

**Response varies by role:**

#### User Role
```json
{
  "success": true,
  "data": {
    "registeredEvents": 5,
    "attendedEvents": 3,
    "upcomingEvents": 2
  },
  "message": "User stats fetched successfully"
}
```

#### Manager Role
```json
{
  "success": true,
  "data": {
    "activeEvents": 8,
    "totalRegistrations": 150,
    "totalCheckIns": 120,
    "avgCapacity": 75
  },
  "message": "Manager stats fetched successfully"
}
```

#### Admin Role
```json
{
  "success": true,
  "data": {
    "totalUsers": 500,
    "totalEvents": 50,
    "pendingApplications": 5,
    "regularUsers": 450,
    "managers": 45,
    "admins": 5,
    "activeEvents": 25,
    "systemHealth": 99.9
  },
  "message": "Admin stats fetched successfully"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid role
- 401: Unauthorized
- 500: Server error

---

## Error Response Format

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "data": null,
  "message": "Human-readable error message",
  "error": "ERROR_CODE"
}
```

**Common Error Codes:**
- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User doesn't have permission
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input
- `INVALID_ID` - Invalid UUID format
- `ALREADY_PROCESSED` - Action already completed
- `INTERNAL_SERVER_ERROR` - Server error

---

## Authentication & Authorization

### Roles
- **user**: Default role, can register for events, create/join teams
- **manager**: Can create and manage events, view registrations
- **admin**: Full access to all resources, can approve manager applications

### Protected Routes
Most endpoints require authentication. Include session cookies with requests.

### Permission Hierarchy
- Admins can perform all manager actions
- Managers can only manage their own events
- Users can only manage their own teams and registrations

---

## Best Practices

1. **Always check response status codes** before processing data
2. **Handle pagination** for list endpoints
3. **Validate dates** before submission (use ISO 8601 format)
4. **Cache static data** appropriately (respect Cache-Control headers)
5. **Implement proper error handling** for all API calls
6. **Use UUIDs** for all ID parameters
7. **Follow rate limiting** guidelines (if implemented)

---

## Rate Limiting

Rate limiting may be implemented on a per-endpoint basis. Check response headers for:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

---

## Versioning

Current API version: **v1** (implicit, no version prefix required)

Future versions will be prefixed with `/api/v2/`, etc.

---

## Support

For API issues or questions, please contact the development team or create an issue in the project repository.
