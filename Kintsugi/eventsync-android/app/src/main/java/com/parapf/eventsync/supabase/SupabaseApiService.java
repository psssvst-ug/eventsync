package com.parapf.eventsync.supabase;

import com.parapf.eventsync.supabase.models.*;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.*;

public interface SupabaseApiService {
    
    // Events endpoints
    @GET("event")
    Call<List<SupabaseEvent>> getEvents(
            @Query("select") String select,
            @Query("status") String status,
            @Query("order") String order,
            @Query("limit") Integer limit,
            @Query("offset") Integer offset
    );

    @GET("event")
    Call<List<SupabaseEvent>> searchEvents(
            @Query("select") String select,
            @Query("title") String titleSearch,
            @Query("order") String order,
            @Query("limit") Integer limit
    );

    @POST("event")
    Call<SupabaseEvent> createEvent(@Body SupabaseEvent event);

    @PATCH("event")
    Call<SupabaseEvent> updateEvent(
            @Query("id") String eventId,
            @Body SupabaseEvent event
    );

    @DELETE("event")
    Call<Void> deleteEvent(@Query("id") String eventId);

    // Organizations endpoints
    @GET("organization")
    Call<List<SupabaseOrganization>> getOrganizations(
            @Query("select") String select
    );

    @POST("organization")
    Call<SupabaseOrganization> createOrganization(@Body SupabaseOrganization org);

    // Teams endpoints
    @GET("team")
    Call<List<SupabaseTeam>> getTeams(
            @Query("select") String select,
            @Query("event_id") String eventId
    );

    @POST("team")
    Call<SupabaseTeam> createTeam(@Body SupabaseTeam team);

    // Registrations endpoints
    @GET("registration")
    Call<List<SupabaseRegistration>> getRegistrations(
            @Query("select") String select,
            @Query("user_id") String userId,
            @Query("event_id") String eventId
    );

    @POST("registration")
    Call<SupabaseRegistration> createRegistration(@Body SupabaseRegistration registration);

    // Pricing Plans
    @GET("pricing_plan")
    Call<List<SupabasePricingPlan>> getPricingPlans(
            @Query("select") String select,
            @Query("is_active") Boolean isActive
    );

    // User Profile
    @GET("user_profile")
    Call<List<SupabaseUserProfile>> getUserProfile(
            @Query("select") String select,
            @Query("id") String userId
    );

    @PATCH("user_profile")
    Call<SupabaseUserProfile> updateUserProfile(
            @Query("id") String userId,
            @Body SupabaseUserProfile profile
    );
}
