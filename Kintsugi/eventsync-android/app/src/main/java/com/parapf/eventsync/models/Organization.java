package com.parapf.eventsync.models;

public class Organization {
    private String id;
    private String name;
    private String description;
    private String type;
    private String website;
    private String logo;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private String subscriptionStatus;
    private boolean isActive;
    private String createdAt;
    private String updatedAt;
    private String memberRole;
    private String memberStatus;
    private PricingPlan pricingPlan;

    // Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getType() { return type; }
    public String getWebsite() { return website; }
    public String getLogo() { return logo; }
    public String getContactEmail() { return contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public String getAddress() { return address; }
    public String getSubscriptionStatus() { return subscriptionStatus; }
    public boolean isActive() { return isActive; }
    public String getCreatedAt() { return createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public String getMemberRole() { return memberRole; }
    public String getMemberStatus() { return memberStatus; }
    public PricingPlan getPricingPlan() { return pricingPlan; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setType(String type) { this.type = type; }
    public void setWebsite(String website) { this.website = website; }
    public void setLogo(String logo) { this.logo = logo; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public void setAddress(String address) { this.address = address; }
    public void setSubscriptionStatus(String subscriptionStatus) { this.subscriptionStatus = subscriptionStatus; }
    public void setActive(boolean active) { isActive = active; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    public void setMemberRole(String memberRole) { this.memberRole = memberRole; }
    public void setMemberStatus(String memberStatus) { this.memberStatus = memberStatus; }
    public void setPricingPlan(PricingPlan pricingPlan) { this.pricingPlan = pricingPlan; }

    public static class PricingPlan {
        private String id;
        private String name;
        private String displayName;

        public String getId() { return id; }
        public String getName() { return name; }
        public String getDisplayName() { return displayName; }

        public void setId(String id) { this.id = id; }
        public void setName(String name) { this.name = name; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
    }
}
