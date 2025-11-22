package com.parapf.eventsync.APIs.Responses;


import com.google.gson.annotations.SerializedName;

public class SignUpResponse {
    // Assuming the response looks like: { "accessToken": "...", "user": {...} }
    // Adjust the fields based on your actual API response.
    @SerializedName("token")
    private String token;

    @SerializedName("message")
    private String error;

    // You can add more fields if your API returns them, e.g., a User object
    // @SerializedName("user")
    // private User user;

    public String getToken() {
        return token;
    }
    public String getError() {
        return error;
    }
}