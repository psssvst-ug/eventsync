package com.parapf.eventsync.models;

import com.google.gson.JsonObject;

public class PageBlock {
    private String id;
    private String type;
    private int order;
    private JsonObject style;

    // Common properties
    private String content;

    // Heading specific
    private Integer level;

    // Image specific
    private String url;
    private String alt;
    private String caption;
    private String width;
    private String height;
    private String alignment;
    private Boolean rounded;
    private Boolean border;

    // Button specific
    private String text;
    private String variant;
    private String size;

    // Video specific
    private String videoUrl;
    private String provider;
    private String thumbnail;

    // Spacer specific
    private String spacerHeight;

    // Divider specific
    private String dividerStyle;
    private String dividerColor;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public int getOrder() { return order; }
    public void setOrder(int order) { this.order = order; }

    public JsonObject getStyle() { return style; }
    public void setStyle(JsonObject style) { this.style = style; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getAlt() { return alt; }
    public void setAlt(String alt) { this.alt = alt; }

    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }

    public String getWidth() { return width; }
    public void setWidth(String width) { this.width = width; }

    public String getHeight() { return height; }
    public void setHeight(String height) { this.height = height; }

    public String getAlignment() { return alignment; }
    public void setAlignment(String alignment) { this.alignment = alignment; }

    public Boolean getRounded() { return rounded; }
    public void setRounded(Boolean rounded) { this.rounded = rounded; }

    public Boolean getBorder() { return border; }
    public void setBorder(Boolean border) { this.border = border; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getVariant() { return variant; }
    public void setVariant(String variant) { this.variant = variant; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }

    public String getSpacerHeight() { return spacerHeight; }
    public void setSpacerHeight(String spacerHeight) { this.spacerHeight = spacerHeight; }

    public String getDividerStyle() { return dividerStyle; }
    public void setDividerStyle(String dividerStyle) { this.dividerStyle = dividerStyle; }

    public String getDividerColor() { return dividerColor; }
    public void setDividerColor(String dividerColor) { this.dividerColor = dividerColor; }
}