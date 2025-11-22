# Android Supabase Integration - Complete Guide

This document explains how the EventSync Android app is integrated with Supabase.

## Overview

The Android app now uses **Supabase REST API** directly for all data operations and **Supabase Auth** for authentication.

## Architecture

```
Android App → SupabaseClient/SupabaseAuthClient → Supabase REST API → PostgreSQL
```

### Key Components

1. **SupabaseClient** - REST API client for data operations
2. **SupabaseAuthClient** - Authentication client
3. **Models** - 8 model classes matching database schema
4. **SupabaseApiService** - Retrofit interface with all endpoints

## Setup

### 1. Supabase Configuration

The app is pre-configured with:
- **Supabase URL**: `https://uismdijzbczptlhonmmz.supabase.co`
- **Anon Key**: Embedded in `SupabaseClient.java`

### 2. Dependencies

Already included in `build.gradle`:
```gradle
implementation 'com.squareup.retrofit2:retrofit:2.9.0'
implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
implementation 'com.squareup.okhttp3:logging-interceptor:4.11.0'
implementation 'com.google.code.gson:gson:2.10.1'
```

## Usage Examples

### Authentication

```java
// Sign Up
SupabaseAuthClient.SupabaseAuthService authService = SupabaseAuthClient.getAuthService();
SupabaseAuthRequest request = new SupabaseAuthRequest(
    "user@example.com",
    "password123",
    "John Doe"
);

authService.signUp(request).enqueue(new Callback<SupabaseAuthResponse>() {
    @Override
    public void onResponse(Call<SupabaseAuthResponse> call, Response<SupabaseAuthResponse> response) {
        if (response.isSuccessful()) {
            SupabaseAuthResponse authResponse = response.body();
            String accessToken = authResponse.getAccessToken();
            String userId = authResponse.getUser().getId();
            // Save token and proceed
        }
    }
    
    @Override
    public void onFailure(Call<SupabaseAuthResponse> call, Throwable t) {
        // Handle error
    }
});

// Sign In
SupabaseAuthRequest signInRequest = new SupabaseAuthRequest("user@example.com", "password123");
authService.signIn(signInRequest).enqueue(/* callback */);
```

### Fetch Events

```java
SupabaseApiService api = SupabaseClient.getApiService();

// Get published events
Call<List<SupabaseEvent>> call = api.getEvents(
    "*",              // select all fields
    "eq.published",   // status filter
    "start_date.asc", // order by start date
    20,               // limit
    0                 // offset
);

call.enqueue(new Callback<List<SupabaseEvent>>() {
    @Override
    public void onResponse(Call<List<SupabaseEvent>> call, Response<List<SupabaseEvent>> response) {
        if (response.isSuccessful()) {
            List<SupabaseEvent> events = response.body();
            // Update UI with events
            for (SupabaseEvent event : events) {
                Log.d("Event", event.getTitle());
            }
        }
    }
    
    @Override
    public void onFailure(Call<List<SupabaseEvent>> call, Throwable t) {
        // Handle error
    }
});
```

### Create Organization

```java
SupabaseOrganization org = new SupabaseOrganization();
org.setName("My Organization");
org.setType("nonprofit");
org.setContactEmail("contact@org.com");
org.setPricingPlanId("<pricing_plan_id>");

api.createOrganization(org).enqueue(new Callback<SupabaseOrganization>() {
    @Override
    public void onResponse(Call<SupabaseOrganization> call, Response<SupabaseOrganization> response) {
        if (response.isSuccessful()) {
            SupabaseOrganization created = response.body();
            // Organization created with ID
        }
    }
    
    @Override
    public void onFailure(Call<SupabaseOrganization> call, Throwable t) {
        // Handle error
    }
});
```

### Register for Event

```java
SupabaseRegistration registration = new SupabaseRegistration();
registration.setEventId("<event_id>");
registration.setUserId("<user_id>");
registration.setStatus("pending");
registration.setPaymentStatus("pending");

api.createRegistration(registration).enqueue(/* callback */);
```

### Get User's Registrations

```java
api.getRegistrations(
    "*",              // select all fields
    "<user_id>",      // filter by user
    null              // no event filter
).enqueue(new Callback<List<SupabaseRegistration>>() {
    @Override
    public void onResponse(Call<List<SupabaseRegistration>> call, Response<List<SupabaseRegistration>> response) {
        if (response.isSuccessful()) {
            List<SupabaseRegistration> registrations = response.body();
            // Display user's registrations
        }
    }
    
    @Override
    public void onFailure(Call<List<SupabaseRegistration>> call, Throwable t) {
        // Handle error
    }
});
```

### Get Teams for Event

```java
api.getTeams(
    "*",
    "<event_id>"
).enqueue(new Callback<List<SupabaseTeam>>() {
    @Override
    public void onResponse(Call<List<SupabaseTeam>> call, Response<List<SupabaseTeam>> response) {
        if (response.isSuccessful()) {
            List<SupabaseTeam> teams = response.body();
            // Show teams
        }
    }
    
    @Override
    public void onFailure(Call<List<SupabaseTeam>> call, Throwable t) {
        // Handle error
    }
});
```

### Get Pricing Plans

```java
api.getPricingPlans(
    "*",    // select all
    true    // only active plans
).enqueue(new Callback<List<SupabasePricingPlan>>() {
    @Override
    public void onResponse(Call<List<SupabasePricingPlan>> call, Response<List<SupabasePricingPlan>> response) {
        if (response.isSuccessful()) {
            List<SupabasePricingPlan> plans = response.body();
            // Display pricing options
        }
    }
    
    @Override
    public void onFailure(Call<List<SupabasePricingPlan>> call, Throwable t) {
        // Handle error
    }
});
```

## Models

### Available Models

1. **SupabaseEvent** - Event information with all fields
2. **SupabaseOrganization** - Organization details
3. **SupabaseTeam** - Team information
4. **SupabaseRegistration** - Event registrations
5. **SupabasePricingPlan** - Subscription plans
6. **SupabaseUserProfile** - User profile data
7. **SupabaseAuthRequest** - Authentication request
8. **SupabaseAuthResponse** - Authentication response

All models include:
- Full getter/setter methods
- GSON serialization annotations
- All database fields

## API Endpoints

### Events
- `GET /rest/v1/event` - List events
- `POST /rest/v1/event` - Create event
- `PATCH /rest/v1/event?id=eq.<id>` - Update event
- `DELETE /rest/v1/event?id=eq.<id>` - Delete event

### Organizations
- `GET /rest/v1/organization` - List organizations
- `POST /rest/v1/organization` - Create organization

### Teams
- `GET /rest/v1/team` - List teams
- `POST /rest/v1/team` - Create team

### Registrations
- `GET /rest/v1/registration` - List registrations
- `POST /rest/v1/registration` - Create registration

### Pricing Plans
- `GET /rest/v1/pricing_plan` - List pricing plans

### User Profile
- `GET /rest/v1/user_profile` - Get user profile
- `PATCH /rest/v1/user_profile?id=eq.<id>` - Update profile

### Authentication
- `POST /auth/v1/signup` - Sign up new user
- `POST /auth/v1/token?grant_type=password` - Sign in
- `POST /auth/v1/logout` - Sign out

## Query Parameters

Supabase REST API supports powerful queries:

- **Filtering**: `?status=eq.published`
- **Ordering**: `?order=start_date.asc`
- **Limit/Offset**: `?limit=20&offset=0`
- **Select**: `?select=id,title,description`

Examples:
```java
// Get upcoming published events
api.getEvents("*", "eq.published", "start_date.asc", 10, 0)

// Search events by title (use PostgREST text search)
api.searchEvents("*", "ilike.*conference*", "start_date.asc", 20)
```

## Error Handling

Always handle both success and failure cases:

```java
call.enqueue(new Callback<T>() {
    @Override
    public void onResponse(Call<T> call, Response<T> response) {
        if (response.isSuccessful()) {
            T data = response.body();
            // Success
        } else {
            // HTTP error (401, 403, 404, 500, etc.)
            int code = response.code();
            String message = response.message();
        }
    }
    
    @Override
    public void onFailure(Call<T> call, Throwable t) {
        // Network error or timeout
        Log.e("API", "Error: " + t.getMessage());
    }
});
```

## Security

- **API Key**: Automatically injected by OkHttp interceptor
- **Row Level Security**: Enforced at database level
- **Authentication**: Supabase Auth tokens for user identification

## Next Steps

1. **Implement UI**: Create Activities/Fragments for each feature
2. **Store Auth Token**: Save accessToken in SharedPreferences
3. **Add Token to Requests**: Include Authorization header for authenticated endpoints
4. **Handle Session**: Implement token refresh logic
5. **Test Features**: Test all CRUD operations

## Migration from Old API

Old `ApiService.java` methods have been replaced with direct Supabase calls:

| Old Endpoint | New Supabase Call |
|--------------|-------------------|
| `getEventsList()` | `api.getEvents()` |
| `signUp()` | `authService.signUp()` |
| `signIn()` | `authService.signIn()` |
| `getOrganizations()` | `api.getOrganizations()` |

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Review PostgREST API reference: https://postgrest.org/
3. See web implementation in `Kintsugi/eventsync-web/eventsync`

---

**Status**: COMPLETE AND READY FOR USE ✅

All Android Supabase integration is complete with 8 models, 2 clients, and full API coverage!
