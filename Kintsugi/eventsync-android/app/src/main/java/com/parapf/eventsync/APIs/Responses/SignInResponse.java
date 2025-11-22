package com.parapf.eventsync.APIs.Responses;

import com.google.gson.annotations.SerializedName;

public class SignInResponse {

    @SerializedName("token")
    private String token;

    @SerializedName("message")
    private String message; // optional

    public String getToken() { return token; }
    public String getMessage() { return message; }
}
