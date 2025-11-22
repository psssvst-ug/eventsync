# Admin Session API

This directory contains admin-protected authentication endpoints using Better Auth.

## Endpoints

### GET /auth/admin/getSession

Returns the current session information for authenticated admin users only.

#### Authentication Required
- Valid session cookie/token
- User role must be "admin"

#### Response

**Success (200)**
```json
{
  "success": true,
  "session": {
    "id": "session_id",
    "userId": "user_id", 
    "user": {
      "id": "user_id",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "expiresAt": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z", 
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**

**No Session (401)**
```json
{
  "error": "No active session found"
}
```

**Not Admin (403)**
```json
{
  "error": "Access denied. Admin role required."
}
```

**Server Error (500)**
```json
{
  "error": "Internal server error"
}
```

#### Usage Example

```javascript
// Client-side usage
const response = await fetch('/auth/admin/getSession', {
  method: 'GET',
  credentials: 'include', // Include cookies
});

if (response.ok) {
  const data = await response.json();
  console.log('Admin session:', data.session);
} else {
  const error = await response.json();
  console.error('Error:', error.error);
}
```

#### TypeScript Types

The endpoint uses TypeScript types defined in `@/lib/types/auth.ts`:

- `AdminSessionResponse` - Success response type
- `AdminSessionErrorResponse` - Error response type  
- `AdminSessionData` - Session data structure
- `AdminSessionUser` - User data structure

#### Utility Functions

Helper functions are available in `@/lib/utils/admin-auth.ts`:

- `validateAdminSession(request)` - Validates admin session
- `isAdminUser(headers)` - Quick admin role check
- `getUserRole(headers)` - Get user role from session
- `withAdminAuth(handler)` - HOF for protecting other endpoints

#### Security Notes

- Only users with role "admin" can access this endpoint
- Session validation is performed on every request
- Proper HTTP status codes are returned for different error cases
- All errors are logged for monitoring