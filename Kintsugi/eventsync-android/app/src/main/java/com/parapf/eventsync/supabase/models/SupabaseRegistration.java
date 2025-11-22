package com.parapf.eventsync.supabase.models;

import com.google.gson.annotations.SerializedName;

public class SupabaseRegistration {
    @SerializedName("id")
    private String id;

    @SerializedName("event_id")
    private String eventId;

    @SerializedName("user_id")
    private String userId;

    @SerializedName("team_id")
    private String teamId;

    @SerializedName("status")
    private String status;

    @SerializedName("payment_status")
    private String paymentStatus;

    @SerializedName("created_at")
    private String createdAt;

    @SerializedName("updated_at")
    private String updatedAt;

    public SupabaseRegistration() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTeamId() { return teamId; }
    public void setTeamId(String teamId) { this.teamId = teamId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
