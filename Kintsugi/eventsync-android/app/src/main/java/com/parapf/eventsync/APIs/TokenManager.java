package com.parapf.eventsync.APIs;

import android.content.Context;
import android.content.SharedPreferences;

public class TokenManager {

    private static final String PREFS_NAME = "auth_prefs";

    private static final String KEY_AUTH_TOKEN = "auth_token";          // existing
    private static final String KEY_SESSION_COOKIE = "session_cookie";  // new

    private static TokenManager INSTANCE;
    private final SharedPreferences prefs;

    private TokenManager(Context context) {
        prefs = context.getApplicationContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public static synchronized TokenManager getInstance(Context context) {
        if (INSTANCE == null) {
            INSTANCE = new TokenManager(context);
        }
        return INSTANCE;
    }

    // =====================
    // ALREADY EXISTING (unchanged)
    // =====================

    /** Saves authentication token */
    public void saveToken(String token) {
        prefs.edit().putString(KEY_AUTH_TOKEN, token).apply();
    }

    /** Retrieves authentication token */
    public String getToken() {
        return prefs.getString(KEY_AUTH_TOKEN, null);
    }

    /** Deletes authentication token */
    public void deleteToken() {
        prefs.edit().remove(KEY_AUTH_TOKEN).apply();
    }

    // =====================
    // NEW COOKIE FEATURES (Sign-In / Session)
    // =====================

    /** Stores the session cookie from Sign-In */
    public void saveSessionCookie(String cookie) {
        prefs.edit().putString(KEY_SESSION_COOKIE, cookie).apply();
    }

    /** Retrieves the session cookie for session & sign-out */
    public String getSessionCookie() {
        return prefs.getString(KEY_SESSION_COOKIE, null);
    }

    /** Clears session cookie (logout) */
    public void deleteSessionCookie() {
        prefs.edit().remove(KEY_SESSION_COOKIE).apply();
    }

    /** Clear everything */
    public void clearAll() {
        prefs.edit().clear().apply();
    }
}
