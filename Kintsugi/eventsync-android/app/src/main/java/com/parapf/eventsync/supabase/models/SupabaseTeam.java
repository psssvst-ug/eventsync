package com.parapf.eventsync.supabase.models;

import com.google.gson.annotations.SerializedName;

public class SupabaseTeam {
    @SerializedName("id")
    private String id;

    @SerializedName("name")
    private String name;

    @SerializedName("event_id")
    private String eventId;

    @SerializedName("captain_id")
    private String captainId;

    @SerializedName("max_members")
    private Integer maxMembers;

    @SerializedName("description")
    private String description;

    @SerializedName("created_at")
    private String createdAt;

    @SerializedName("updated_at")
    private String updatedAt;

    public SupabaseTeam() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getCaptainId() { return captainId; }
    public void setCaptainId(String captainId) { this.captainId = captainId; }

    public Integer getMaxMembers() { return maxMembers; }
    public void setMaxMembers(Integer maxMembers) { this.maxMembers = maxMembers; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
