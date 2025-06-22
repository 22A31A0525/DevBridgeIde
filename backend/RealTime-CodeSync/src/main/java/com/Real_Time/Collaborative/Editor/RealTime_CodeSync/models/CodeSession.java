package com.Real_Time.Collaborative.Editor.RealTime_CodeSync.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity // Marks this class as a JPA entity
@Table(name = "code_sessions") // Recommended: Explicitly name your database table
public class CodeSession {

    @Id // Marks this field as the primary key
    @Column(name = "session_id", nullable = false, unique = true, length = 36) // Good practice for UUIDs
    private String sessionId;

    @Column(name = "session_name", nullable = false, length = 255) // Example constraints
    private String sessionName;


    @Column(name = "owner_username", nullable = false, length = 100)

    private String ownerUsername;



    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getCode() {
        return code;
    }

    @Column(name = "language") // To store the selected language
    private String language;

    public void setCode(String code) {
        this.code = code;
    }

    @Column(name = "created_at", nullable = false, updatable = false) // updatable=false means it won't be updated on subsequent saves
    private LocalDateTime createdAt;

    @Column(name = "code", columnDefinition = "TEXT") // Use TEXT for potentially large code
    private String code;
    // --- Constructors ---

    // JPA requires a no-argument constructor for instantiation
    public CodeSession() {
        // Default values will be handled by @PrePersist for new entities
        // or by JPA for entities loaded from the database.
    }

    public CodeSession(String sessionId, String s, String language) {
        this.sessionId=sessionId;
        this.code=s;
        this.language=language;
    }

    // Optional: A constructor for creating new sessions more easily
    public CodeSession(String sessionName, String ownerUsername) {
        this.sessionName = sessionName;
        this.ownerUsername = ownerUsername;
        // sessionId and createdAt will be handled automatically by @PrePersist
    }

    // --- Lifecycle Callbacks ---

    // This method will be called automatically before the entity is first persisted (inserted) into the database
    @PrePersist
    protected void onCreate() {
        // Generate a unique ID if not already set (e.g., if assigned manually for specific cases)
        if (this.sessionId == null || this.sessionId.isEmpty()) {
            this.sessionId = UUID.randomUUID().toString();
        }
        // Set creation timestamp only if it's not already set
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();

        }
        if(this.language==null || this.language.isEmpty()){
            this.language="JavaScript";
        }
        if(this.code==null || this.code.isEmpty()){
            this.code="";
        }

    }

    // --- Getters and Setters ---

    public String getSessionId() {
        return sessionId;
    }

    // Keep this setter public for JPA's internal use and potential deserialization from JSON
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getSessionName() {
        return sessionName;
    }

    public void setSessionName(String sessionName) {
        this.sessionName = sessionName;
    }

    public String getOwnerUsername() {
        return ownerUsername;
    }

    public void setOwnerUsername(String ownerUsername) {
        this.ownerUsername = ownerUsername;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // Keep this setter public for JPA's internal use and potential deserialization
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // --- hashCode() and equals() for proper object comparison (crucial for JPA entities) ---
    @Override
    public int hashCode() {
        // Use Objects.hash for null-safe hashing if sessionId can be null, otherwise simple hash
        return sessionId != null ? sessionId.hashCode() : 0;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        CodeSession other = (CodeSession) o;
        return sessionId != null && sessionId.equals(other.sessionId);
    }

    // --- toString() for easy debugging ---
    @Override
    public String toString() {
        return "CodeSession{" +
                "sessionId='" + sessionId + '\'' +
                ", sessionName='" + sessionName + '\'' +
                ", ownerUsername='" + ownerUsername + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}