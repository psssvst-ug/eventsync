package com.parapf.eventsync.APIs;

import com.parapf.eventsync.APIs.Requests.SignInRequest;
import com.parapf.eventsync.APIs.Requests.SignUpRequest;
import com.parapf.eventsync.APIs.Responses.EventResponse;
import com.parapf.eventsync.APIs.Responses.EventsListResponse;
import com.parapf.eventsync.APIs.Responses.MyEventsResponse;
import com.parapf.eventsync.APIs.Responses.SessionResponse;
import com.parapf.eventsync.APIs.Responses.SignInResponse;
import com.parapf.eventsync.APIs.Responses.SignUpResponse;
import com.parapf.eventsync.APIs.Responses.UserRegistrationsResponse;
import com.parapf.eventsync.APIs.Responses.UserResponse;

import retrofit2.Call; // <--- Import Call
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ApiService {

    /**
     * Endpoint to sign up a new user via email.
     * Corresponds to: POST /api/auth/sign-up/email
     * @param signUpRequest The request body containing email, password, and name.
     * @return A Call object that resolves to a SignUpResponse.
     */
    @POST("api/auth/sign-up/email")
    Call<SignUpResponse> signUp(@Body SignUpRequest signUpRequest);

    @POST("api/auth/sign-in/email")
    Call<SignInResponse> signIn(@Body SignInRequest body);

    @GET("api/auth/get-session")
    Call<SessionResponse> getSession(@Header("Cookie") String cookieHeader);

    @POST("api/auth/sign-out")
    Call<Void> signOut(@Header("Cookie") String cookieHeader);

    @GET("api/events/list")
    Call<EventsListResponse> getEventsList(
            @Query("page") int page,
            @Query("limit") int limit,
//            @Query("status") String status,
//            @Query("upcoming") boolean upcoming,
            @Query("sortBy") String sortBy,
            @Query("sortOrder") String sortOrder
    );

    @GET("api/events/{id}")
    Call<EventResponse> getEventById(@Path("id") String eventId);


    @GET("api/manager/events")
    Call<MyEventsResponse> getMyEvents(@Header("Cookie") String cookieHeader);
    @GET("api/user/registrations")
    Call<UserRegistrationsResponse> getUserRegistrations(@Header("Cookie") String cookieHeader);


    @GET("api/user")
    Call<UserResponse> getCurrentUser(@Header("Cookie") String cookieHeader);
}