package com.parapf.eventsync.APIs.Responses;

import com.parapf.eventsync.models.Organization;
import java.util.List;

public class OrganizationsResponse {
    private boolean success;
    private List<Organization> data;
    private String message;

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public List<Organization> getData() {
        return data;
    }

    public void setData(List<Organization> data) {
        this.data = data;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
