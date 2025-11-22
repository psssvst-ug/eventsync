package com.parapf.eventsync.supabase.models;

import com.google.gson.annotations.SerializedName;

public class SupabaseEvent {
    @SerializedName("id")
    private String id;

    @SerializedName("title")
    private String title;

    @SerializedName("description")
    private String description;

    @SerializedName("start_date")
    private String startDate;

    @SerializedName("end_date")
    private String endDate;

    @SerializedName("location")
    private String location;

    @SerializedName("max_participants")
    private Integer maxParticipants;

    @SerializedName("registration_fee")
    private Double registrationFee;

    @SerializedName("status")
    private String status; // draft, published, cancelled

    @SerializedName("organization_id")
    private String organizationId;

    @SerializedName("created_by")
    private String createdBy;

    @SerializedName("created_at")
    private String createdAt;

    @SerializedName("updated_at")
    private String updatedAt;

    @SerializedName("image_url")
    private String imageUrl;

    @SerializedName("registration_start_date")
    private String registrationStartDate;

    @SerializedName("registration_end_date")
    private String registrationEndDate;

    // Constructors
    public SupabaseEvent() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }

    public Double getRegistrationFee() { return registrationFee; }
    public void setRegistrationFee(Double registrationFee) { this.registrationFee = registrationFee; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOrganizationId() { return organizationId; }
    public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getRegistrationStartDate() { return registrationStartDate; }
    public void setRegistrationStartDate(String registrationStartDate) { this.registrationStartDate = registrationStartDate; }

    public String getRegistrationEndDate() { return registrationEndDate; }
    public void setRegistrationEndDate(String registrationEndDate) { this.registrationEndDate = registrationEndDate; }
}
