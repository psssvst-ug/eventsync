package com.parapf.eventsync.APIs;

import android.content.Context;
import androidx.annotation.NonNull;

import java.io.IOException;

import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;

public class AuthInterceptor implements Interceptor {

    private final TokenManager tokenManager;

    // The constructor now takes a Context to initialize the TokenManager
    public AuthInterceptor(Context context) {
        this.tokenManager = TokenManager.getInstance(context);
    }

    @NonNull
    @Override
    public Response intercept(@NonNull Chain chain) throws IOException {
        Request.Builder requestBuilder = chain.request().newBuilder();

        // Fetch the LATEST token from SharedPreferences for EACH request
        final String token = tokenManager.getToken();

        // If a token exists, add the Authorization header
        if (token != null && !token.isEmpty()) {
            requestBuilder.addHeader("Authorization", "Bearer " + token);
            requestBuilder.addHeader("Cookie", "better-auth.session_token=" + token);
        }

        return chain.proceed(requestBuilder.build());
    }
}
