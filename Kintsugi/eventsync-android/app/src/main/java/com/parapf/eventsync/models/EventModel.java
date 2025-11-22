package com.parapf.eventsync.models;

public class EventModel {
    private String id;  // ADD THIS
    private String title;
    private String description;
    private String timeline;
    private String venue;
    private String imageUrl;  // ADD THIS for bottom sheet
    private String startDate;  // ADD THIS
    private String endDate;    // ADD THIS
    private String location;   // ADD THIS
    private Integer maxCapacity; // ADD THIS
    private String registrationDeadline; // ADD THIS
    private String status;     // ADD THIS

    // Updated constructor
    public EventModel(String id, String title, String description, String timeline, String venue) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.timeline = timeline;
        this.venue = venue;
    }

    // Full constructor for API response
    public EventModel(String id, String title, String description, String imageUrl,
                      String startDate, String endDate, String location,
                      Integer maxCapacity, String registrationDeadline, String status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.startDate = startDate;
        this.endDate = endDate;
        this.location = location;
        this.maxCapacity = maxCapacity;
        this.registrationDeadline = registrationDeadline;
        this.status = status;
    }

    // Getters
    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getTimeline() { return timeline; }
    public String getVenue() { return venue; }
    public String getImageUrl() { return imageUrl; }
    public String getStartDate() { return startDate; }
    public String getEndDate() { return endDate; }
    public String getLocation() { return location; }
    public Integer getMaxCapacity() { return maxCapacity; }
    public String getRegistrationDeadline() { return registrationDeadline; }
    public String getStatus() { return status; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public void setLocation(String location) { this.location = location; }
    public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }
    public void setRegistrationDeadline(String registrationDeadline) { this.registrationDeadline = registrationDeadline; }
    public void setStatus(String status) { this.status = status; }
}