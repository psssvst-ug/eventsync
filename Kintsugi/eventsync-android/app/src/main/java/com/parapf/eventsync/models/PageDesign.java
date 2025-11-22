package com.parapf.eventsync.models;

import java.util.List;

public class PageDesign {
    private String version;
    private List<PageBlock> blocks;
    private String createdAt;
    private String updatedAt;

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public List<PageBlock> getBlocks() {
        return blocks;
    }

    public void setBlocks(List<PageBlock> blocks) {
        this.blocks = blocks;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}