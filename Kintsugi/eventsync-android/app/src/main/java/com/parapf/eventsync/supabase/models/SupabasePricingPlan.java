package com.parapf.eventsync.supabase.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class SupabasePricingPlan {
    @SerializedName("id")
    private String id;

    @SerializedName("name")
    private String name;

    @SerializedName("display_name")
    private String displayName;

    @SerializedName("description")
    private String description;

    @SerializedName("price")
    private Double price;

    @SerializedName("currency")
    private String currency;

    @SerializedName("max_events")
    private Integer maxEvents;

    @SerializedName("max_event_managers")
    private Integer maxEventManagers;

    @SerializedName("max_attendees_per_event")
    private Integer maxAttendeesPerEvent;

    @SerializedName("features")
    private List<String> features;

    @SerializedName("is_active")
    private Boolean isActive;

    @SerializedName("sort_order")
    private Integer sortOrder;

    @SerializedName("created_at")
    private String createdAt;

    @SerializedName("updated_at")
    private String updatedAt;

    public SupabasePricingPlan() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Integer getMaxEvents() { return maxEvents; }
    public void setMaxEvents(Integer maxEvents) { this.maxEvents = maxEvents; }

    public Integer getMaxEventManagers() { return maxEventManagers; }
    public void setMaxEventManagers(Integer maxEventManagers) { this.maxEventManagers = maxEventManagers; }

    public Integer getMaxAttendeesPerEvent() { return maxAttendeesPerEvent; }
    public void setMaxAttendeesPerEvent(Integer maxAttendeesPerEvent) { this.maxAttendeesPerEvent = maxAttendeesPerEvent; }

    public List<String> getFeatures() { return features; }
    public void setFeatures(List<String> features) { this.features = features; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
