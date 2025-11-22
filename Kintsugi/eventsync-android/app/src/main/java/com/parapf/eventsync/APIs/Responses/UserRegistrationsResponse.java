package com.parapf.eventsync.APIs.Responses;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class UserRegistrationsResponse {

    @SerializedName("success")
    private boolean success;

    @SerializedName("data")
    private Data data;

    @SerializedName("message")
    private String message;

    // Getters
    public boolean isSuccess() {
        return success;
    }

    public Data getData() {
        return data;
    }

    public String getMessage() {
        return message;
    }

    // Setters
    public void setSuccess(boolean success) {
        this.success = success;
    }

    public void setData(Data data) {
        this.data = data;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    // Inner Data class
    public static class Data {
        @SerializedName("registrations")
        private List<Registration> registrations;

        @SerializedName("total")
        private int total;

        public List<Registration> getRegistrations() {
            return registrations;
        }

        public void setRegistrations(List<Registration> registrations) {
            this.registrations = registrations;
        }

        public int getTotal() {
            return total;
        }

        public void setTotal(int total) {
            this.total = total;
        }
    }

    // Registration class
    public static class Registration {
        @SerializedName("id")
        private String id;

        @SerializedName("status")
        private String status;

        @SerializedName("registeredAt")
        private String registeredAt;

        @SerializedName("checkedInAt")
        private String checkedInAt;

        @SerializedName("event")
        private Event event;

        @SerializedName("team")
        private Team team;

        // Getters
        public String getId() {
            return id;
        }

        public String getStatus() {
            return status;
        }

        public String getRegisteredAt() {
            return registeredAt;
        }

        public String getCheckedInAt() {
            return checkedInAt;
        }

        public Event getEvent() {
            return event;
        }

        public Team getTeam() {
            return team;
        }

        // Setters
        public void setId(String id) {
            this.id = id;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public void setRegisteredAt(String registeredAt) {
            this.registeredAt = registeredAt;
        }

        public void setCheckedInAt(String checkedInAt) {
            this.checkedInAt = checkedInAt;
        }

        public void setEvent(Event event) {
            this.event = event;
        }

        public void setTeam(Team team) {
            this.team = team;
        }
    }

    // Event class (nested in Registration)
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

        @SerializedName("imageUrl")
        private String imageUrl;

        @SerializedName("status")
        private String status;

        @SerializedName("maxCapacity")
        private int maxCapacity;

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

        public String getImageUrl() {
            return imageUrl;
        }

        public String getStatus() {
            return status;
        }

        public int getMaxCapacity() {
            return maxCapacity;
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

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public void setMaxCapacity(int maxCapacity) {
            this.maxCapacity = maxCapacity;
        }
    }

    // Team class
    public static class Team {
        @SerializedName("id")
        private String id;

        @SerializedName("name")
        private String name;

        @SerializedName("description")
        private String description;

        // Getters
        public String getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public String getDescription() {
            return description;
        }

        // Setters
        public void setId(String id) {
            this.id = id;
        }

        public void setName(String name) {
            this.name = name;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}