package com.parapf.eventsync.supabase.models;

import com.google.gson.annotations.SerializedName;

public class SupabaseAuthRequest {
    @SerializedName("email")
    private String email;

    @SerializedName("password")
    private String password;

    @SerializedName("data")
    private UserMetadata data;

    public static class UserMetadata {
        @SerializedName("name")
        private String name;

        public UserMetadata(String name) {
            this.name = name;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public SupabaseAuthRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public SupabaseAuthRequest(String email, String password, String name) {
        this.email = email;
        this.password = password;
        if (name != null) {
            this.data = new UserMetadata(name);
        }
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public UserMetadata getData() { return data; }
    public void setData(UserMetadata data) { this.data = data; }
}
