package com.parapf.eventsync.APIs;

/**
 * In-memory session manager for storing current user data
 * This data is cleared when the app is killed
 */
public class UserSessionManager {

    private static UserSessionManager INSTANCE;

    // Session data
    private String sessionToken;
    private String sessionExpiresAt;
    private String sessionCreatedAt;
    private String sessionUpdatedAt;
    private String sessionIpAddress;
    private String sessionUserAgent;
    private String sessionUserId;
    private String sessionId;

    // User data
    private String userId;
    private String userName;
    private String userEmail;
    private boolean userEmailVerified;
    private String userImage;
    private String userCreatedAt;
    private String userUpdatedAt;
    private String userRole;  // IMPORTANT: Role field
    private boolean userBanned;
    private String userBanReason;
    private String userBanExpires;

    private UserSessionManager() {
        // Private constructor for singleton
    }

    public static synchronized UserSessionManager getInstance() {
        if (INSTANCE == null) {
            INSTANCE = new UserSessionManager();
        }
        return INSTANCE;
    }

    /**
     * Save complete session data (called from Launcher.java after session validation)
     */
    public void saveSession(
            String sessionToken,
            String sessionExpiresAt,
            String sessionCreatedAt,
            String sessionUpdatedAt,
            String sessionIpAddress,
            String sessionUserAgent,
            String sessionUserId,
            String sessionId,
            String userName,
            String userEmail,
            boolean userEmailVerified,
            String userImage,
            String userCreatedAt,
            String userUpdatedAt,
            String userRole,
            boolean userBanned,
            String userBanReason,
            String userBanExpires
    ) {
        // Session
        this.sessionToken = sessionToken;
        this.sessionExpiresAt = sessionExpiresAt;
        this.sessionCreatedAt = sessionCreatedAt;
        this.sessionUpdatedAt = sessionUpdatedAt;
        this.sessionIpAddress = sessionIpAddress;
        this.sessionUserAgent = sessionUserAgent;
        this.sessionUserId = sessionUserId;
        this.sessionId = sessionId;

        // User
        this.userId = sessionUserId; // userId comes from session
        this.userName = userName;
        this.userEmail = userEmail;
        this.userEmailVerified = userEmailVerified;
        this.userImage = userImage;
        this.userCreatedAt = userCreatedAt;
        this.userUpdatedAt = userUpdatedAt;
        this.userRole = userRole;
        this.userBanned = userBanned;
        this.userBanReason = userBanReason;
        this.userBanExpires = userBanExpires;
    }

    /**
     * Save user data from UserData object (called from /api/user endpoint)
     */
    public void saveUserData(UserData userData) {
        if (userData != null) {
            this.userId = userData.getId();
            this.userName = userData.getName();
            this.userEmail = userData.getEmail();
            this.userEmailVerified = userData.isEmailVerified();
            this.userImage = userData.getImage();
            this.userCreatedAt = userData.getCreatedAt();
            this.userUpdatedAt = userData.getUpdatedAt();
            this.userRole = userData.getRole();  // IMPORTANT: Store role
            this.userBanned = userData.isBanned();
            this.userBanReason = userData.getBanReason();
            this.userBanExpires = userData.getBanExpires();
        }
    }

    /**
     * Clear all session data (logout)
     */
    public void clearSession() {
        sessionToken = null;
        sessionExpiresAt = null;
        sessionCreatedAt = null;
        sessionUpdatedAt = null;
        sessionIpAddress = null;
        sessionUserAgent = null;
        sessionUserId = null;
        sessionId = null;

        userId = null;
        userName = null;
        userEmail = null;
        userEmailVerified = false;
        userImage = null;
        userCreatedAt = null;
        userUpdatedAt = null;
        userRole = null;
        userBanned = false;
        userBanReason = null;
        userBanExpires = null;
    }

    // === GETTERS ===

    public String getSessionToken() { return sessionToken; }
    public String getSessionExpiresAt() { return sessionExpiresAt; }
    public String getSessionId() { return sessionId; }

    public String getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getUserEmail() { return userEmail; }
    public boolean isUserEmailVerified() { return userEmailVerified; }
    public String getUserImage() { return userImage; }
    public String getUserCreatedAt() { return userCreatedAt; }
    public String getUserUpdatedAt() { return userUpdatedAt; }

    // IMPORTANT: Role getter
    public String getUserRole() { return userRole; }

    public boolean isUserBanned() { return userBanned; }
    public String getUserBanReason() { return userBanReason; }
    public String getUserBanExpires() { return userBanExpires; }

    // === ROLE CHECKING HELPERS ===

    /**
     * Check if current user is an admin
     */
    public boolean isAdmin() {
        return "admin".equalsIgnoreCase(userRole);
    }

    /**
     * Check if current user is a manager
     */
    public boolean isManager() {
        return "manager".equalsIgnoreCase(userRole);
    }

    /**
     * Check if current user is a regular user
     */
    public boolean isUser() {
        return "user".equalsIgnoreCase(userRole);
    }

    /**
     * Check if user has specific role
     */
    public boolean hasRole(String role) {
        return role != null && role.equalsIgnoreCase(userRole);
    }

    /**
     * Check if user is authenticated
     */
    public boolean isAuthenticated() {
        return userId != null && sessionToken != null;
    }
}