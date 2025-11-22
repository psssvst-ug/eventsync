package com.parapf.eventsync.models;

public class RegistrationModel {
    private String registrationId;
    private String eventId;
    private String eventTitle;
    private String eventDescription;
    private String timeline;
    private String location;
    private String imageUrl;
    private String status;
    private String teamName;
    private String teamDescription;
    private String registeredAt;
    private String checkedInAt;
    private boolean isCheckedIn;

    // Constructor for display in RecyclerView
    public RegistrationModel(String registrationId, String eventId, String eventTitle,
                             String eventDescription, String timeline, String location,
                             String status, String teamName) {
        this.registrationId = registrationId;
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.eventDescription = eventDescription;
        this.timeline = timeline;
        this.location = location;
        this.status = status;
        this.teamName = teamName;
    }

    // Full constructor
    public RegistrationModel(String registrationId, String eventId, String eventTitle,
                             String eventDescription, String timeline, String location,
                             String imageUrl, String status, String teamName,
                             String teamDescription, String registeredAt,
                             String checkedInAt, boolean isCheckedIn) {
        this.registrationId = registrationId;
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.eventDescription = eventDescription;
        this.timeline = timeline;
        this.location = location;
        this.imageUrl = imageUrl;
        this.status = status;
        this.teamName = teamName;
        this.teamDescription = teamDescription;
        this.registeredAt = registeredAt;
        this.checkedInAt = checkedInAt;
        this.isCheckedIn = isCheckedIn;
    }

    // Getters
    public String getRegistrationId() { return registrationId; }
    public String getEventId() { return eventId; }
    public String getEventTitle() { return eventTitle; }
    public String getEventDescription() { return eventDescription; }
    public String getTimeline() { return timeline; }
    public String getLocation() { return location; }
    public String getImageUrl() { return imageUrl; }
    public String getStatus() { return status; }
    public String getTeamName() { return teamName; }
    public String getTeamDescription() { return teamDescription; }
    public String getRegisteredAt() { return registeredAt; }
    public String getCheckedInAt() { return checkedInAt; }
    public boolean isCheckedIn() { return isCheckedIn; }

    // Setters
    public void setRegistrationId(String registrationId) { this.registrationId = registrationId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }
    public void setEventDescription(String eventDescription) { this.eventDescription = eventDescription; }
    public void setTimeline(String timeline) { this.timeline = timeline; }
    public void setLocation(String location) { this.location = location; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setStatus(String status) { this.status = status; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public void setTeamDescription(String teamDescription) { this.teamDescription = teamDescription; }
    public void setRegisteredAt(String registeredAt) { this.registeredAt = registeredAt; }
    public void setCheckedInAt(String checkedInAt) { this.checkedInAt = checkedInAt; }
    public void setCheckedIn(boolean checkedIn) { isCheckedIn = checkedIn; }
}