package com.Real_Time.Collaborative.Editor.RealTime_CodeSync.models;

public class EditPayload {
    private MonacoRange range;
    private String text;

    public MonacoRange getRange() {
        return range;
    }

    public void setRange(MonacoRange range) {
        this.range = range;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}