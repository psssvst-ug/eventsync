package com.parapf.eventsync.APIs;

import android.content.Context;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ApiClient {

    private static final String BASE_URL = "https://eventsync-1998.vercel.app/";
    private static Retrofit retrofit = null;

    public static ApiService getService(Context context) {
        // Return existing instance if it's already built to avoid re-creating the client
        if (retrofit == null) {
            HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
            logging.setLevel(HttpLoggingInterceptor.Level.BODY);

            // Create the client with our dynamic AuthInterceptor
            OkHttpClient okHttpClient = new OkHttpClient.Builder()
                    .addInterceptor(new AuthInterceptor(context)) // Pass context
                    .addInterceptor(logging)
                    .build();

            // Configure Gson to handle nulls properly
            Gson gson = new GsonBuilder()
                    .serializeNulls()  // Serialize null values
                    .setLenient()      // Be lenient with JSON parsing
                    .create();

            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .client(okHttpClient)
                    .addConverterFactory(GsonConverterFactory.create(gson))
                    .build();
        }
        return retrofit.create(ApiService.class);
    }
}