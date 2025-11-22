package com.parapf.eventsync.APIs.Responses;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class MyEventsResponse {

    @SerializedName("success")
    private boolean success;

    @SerializedName("data")
    private List<Event> data;

    @SerializedName("message")
    private String message;

    // Getters
    public boolean isSuccess() {
        return success;
    }

    public List<Event> getData() {
        return data;
    }

    public String getMessage() {
        return message;
    }

    // Setters
    public void setSuccess(boolean success) {
        this.success = success;
    }

    public void setData(List<Event> data) {
        this.data = data;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    // Inner Event class
    public static class Event {
        @SerializedName("id")
        private String id;

        @SerializedName("title")
        private String title;

        @SerializedName("description")
        private String description;

        @SerializedName("startDate")
        private String startDate;

        @SerializedName("endDate")
        private String endDate;

        @SerializedName("location")
        private String location;

        @SerializedName("maxCapacity")
        private int maxCapacity;

        @SerializedName("status")
        private String status;

        @SerializedName("imageUrl")
        private String imageUrl;

        @SerializedName("createdAt")
        private String createdAt;

        @SerializedName("registrationCount")
        private int registrationCount;

        // Getters
        public String getId() {
            return id;
        }

        public String getTitle() {
            return title;
        }

        public String getDescription() {
            return description;
        }

        public String getStartDate() {
            return startDate;
        }

        public String getEndDate() {
            return endDate;
        }

        public String getLocation() {
            return location;
        }

        public int getMaxCapacity() {
            return maxCapacity;
        }

        public String getStatus() {
            return status;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public String getCreatedAt() {
            return createdAt;
        }

        public int getRegistrationCount() {
            return registrationCount;
        }

        // Setters
        public void setId(String id) {
            this.id = id;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public void setStartDate(String startDate) {
            this.startDate = startDate;
        }

        public void setEndDate(String endDate) {
            this.endDate = endDate;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public void setMaxCapacity(int maxCapacity) {
            this.maxCapacity = maxCapacity;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public void setCreatedAt(String createdAt) {
            this.createdAt = createdAt;
        }

        public void setRegistrationCount(int registrationCount) {
            this.registrationCount = registrationCount;
        }
    }
}