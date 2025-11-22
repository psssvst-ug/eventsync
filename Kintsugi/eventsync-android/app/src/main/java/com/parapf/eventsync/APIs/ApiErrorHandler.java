package com.parapf.eventsync.APIs;

import android.util.Log;

import retrofit2.Response;

public class ApiErrorHandler {

    public static void handleError(Response<?> response) {
        int code = response.code();

        switch (code) {
            case 400:
                Log.e("API_ERROR", "Bad Request (400)");
                break;
            case 401:
                Log.e("API_ERROR", "Unauthorized! Token invalid or expired (401)");
                break;
            case 403:
                Log.e("API_ERROR", "Forbidden (403)");
                break;
            case 404:
                Log.e("API_ERROR", "Not Found (404)");
                break;
            case 500:
                Log.e("API_ERROR", "Server Error (500)");
                break;
            default:
                Log.e("API_ERROR", "Unexpected Error: " + code);
        }
    }

    public static void handleFailure(Throwable t) {
        if (t instanceof java.net.SocketTimeoutException) {
            Log.e("API_FAIL", "Timeout — Slow connection");
        } else if (t instanceof java.net.UnknownHostException) {
            Log.e("API_FAIL", "No Internet Connection");
        } else {
            Log.e("API_FAIL", "Error: " + t.getMessage());
        }
    }
}
