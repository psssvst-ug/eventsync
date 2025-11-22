package com.parapf.eventsync.APIs.Responses;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.annotations.SerializedName;

import androidx.annotation.Nullable;

public class EventResponse {
    @SerializedName("success")
    private boolean success;

    @SerializedName("data")
    private EventData data;

    @SerializedName("message")
    private String message;

    @SerializedName("error")
    private String error;

    public boolean isSuccess() {
        return success;
    }

    public EventData getData() {
        return data;
    }

    public String getMessage() {
        return message;
    }

    public String getError() {
        return error;
    }

    public static class EventData {
        @SerializedName("id")
        private String id;

        @SerializedName("title")
        private String title;

        @SerializedName("description")
        private String description;

        @SerializedName("imageUrl")
        @Nullable
        private String imageUrl;

        @SerializedName("startDate")
        private String startDate;

        @SerializedName("endDate")
        private String endDate;

        @SerializedName("location")
        private String location;

        @SerializedName("maxCapacity")
        @Nullable
        private Integer maxCapacity;

        @SerializedName("registrationDeadline")
        @Nullable
        private String registrationDeadline;

        @SerializedName("status")
        private String status;

        @SerializedName("managerId")
        private String managerId;

        @SerializedName("teamId")
        @Nullable
        private String teamId;

        @SerializedName("createdAt")
        private String createdAt;

        @SerializedName("updatedAt")
        private String updatedAt;

        // Use JsonElement instead of JsonObject to handle null
        @SerializedName("page")
        @Nullable
        private JsonElement page;

        // Getters
        public String getId() { return id; }
        public String getTitle() { return title; }
        public String getDescription() { return description; }
        @Nullable
        public String getImageUrl() { return imageUrl; }
        public String getStartDate() { return startDate; }
        public String getEndDate() { return endDate; }
        public String getLocation() { return location; }
        @Nullable
        public Integer getMaxCapacity() { return maxCapacity; }
        @Nullable
        public String getRegistrationDeadline() { return registrationDeadline; }
        public String getStatus() { return status; }
        public String getManagerId() { return managerId; }
        @Nullable
        public String getTeamId() { return teamId; }
        public String getCreatedAt() { return createdAt; }
        public String getUpdatedAt() { return updatedAt; }

        /**
         * Get page as JsonObject (returns null if page is null or not an object)
         */
        @Nullable
        public JsonObject getPage() {
            if (page == null || page.isJsonNull()) {
                return null;
            }
            if (page.isJsonObject()) {
                return page.getAsJsonObject();
            }
            return null;
        }

        /**
         * Check if page exists and is not null
         */
        public boolean hasPage() {
            return page != null && !page.isJsonNull() && page.isJsonObject();
        }

        // Setters
        public void setPage(@Nullable JsonObject page) {
            this.page = page;
        }
    }
}