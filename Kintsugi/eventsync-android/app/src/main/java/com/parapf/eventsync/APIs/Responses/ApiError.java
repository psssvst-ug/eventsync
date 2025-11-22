package com.parapf.eventsync.APIs.Responses;

import com.google.gson.annotations.SerializedName;

public class ApiError {
    @SerializedName("code")
    String code;

    @SerializedName("message")
    String message;

    public String getCode() { return code; }
    public String getMessage() { return message; }
}
