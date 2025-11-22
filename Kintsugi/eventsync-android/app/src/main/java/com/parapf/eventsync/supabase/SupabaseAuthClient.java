package com.parapf.eventsync.supabase;

import com.parapf.eventsync.supabase.models.SupabaseAuthRequest;
import com.parapf.eventsync.supabase.models.SupabaseAuthResponse;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Call;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.POST;

import java.util.concurrent.TimeUnit;

/**
 * Supabase Auth Client for Android
 * Handles authentication operations with Supabase Auth API
 */
public class SupabaseAuthClient {
    private static final String SUPABASE_URL = "https://uismdijzbczptlhonmmz.supabase.co";
    private static final String SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpc21kaWp6YmN6cHRsaG9ubW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDY5ODUsImV4cCI6MjA3OTMyMjk4NX0.iiucqJYgrsiCwtzyElkJo39uSUUczzq-Yf05IGlhLhY";
    private static SupabaseAuthService authService;

    public interface SupabaseAuthService {
        @POST("auth/v1/signup")
        Call<SupabaseAuthResponse> signUp(@Body SupabaseAuthRequest request);

        @POST("auth/v1/token?grant_type=password")
        Call<SupabaseAuthResponse> signIn(@Body SupabaseAuthRequest request);

        @POST("auth/v1/logout")
        Call<Void> signOut();
    }

    public static SupabaseAuthService getAuthService() {
        if (authService == null) {
            HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
            logging.setLevel(HttpLoggingInterceptor.Level.BODY);

            OkHttpClient client = new OkHttpClient.Builder()
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .addInterceptor(logging)
                    .addInterceptor(chain -> {
                        Request original = chain.request();
                        Request request = original.newBuilder()
                                .header("apikey", SUPABASE_ANON_KEY)
                                .header("Content-Type", "application/json")
                                .build();
                        return chain.proceed(request);
                    })
                    .build();

            Retrofit retrofit = new Retrofit.Builder()
                    .baseUrl(SUPABASE_URL + "/")
                    .addConverterFactory(GsonConverterFactory.create())
                    .client(client)
                    .build();

            authService = retrofit.create(SupabaseAuthService.class);
        }
        return authService;
    }
}
