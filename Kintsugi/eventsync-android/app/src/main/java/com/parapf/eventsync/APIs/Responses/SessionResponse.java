package com.parapf.eventsync.APIs.Responses;

public class SessionResponse {

    public Session session;
    public User user;

    public static class Session {
        public String expiresAt;
        public String token;
        public String createdAt;
        public String updatedAt;
        public String ipAddress;
        public String userAgent;
        public String userId;
        public String id;
    }

    public static class User {
        public String name;
        public String email;
        public boolean emailVerified;
        public String image;
        public String createdAt;
        public String updatedAt;
        public String role;
        public boolean banned;
        public String banReason;
        public String banExpires;
        public String id;
    }
}
