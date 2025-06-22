package com.Real_Time.Collaborative.Editor.RealTime_CodeSync.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users") // Assuming your table name is 'users'
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // IMPORTANT: This tells the DB to auto-generate the ID
    private Long id; // Use Long for ID, or Integer if you prefer

    private String username;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    private String password; // Remember to handle this securely in production!

    private String email;
    // Default constructor (required by JPA)
    public Users() {}

    // Constructor for creating new users (optional, but convenient)
    public Users(String username, String password,String email) {
        this.username = username;
        this.password = password;
        this.email=email;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) { // You need this setter, but ensure you don't send ID in POST requests
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "User [id=" + id + ", username=" + username + "]";
    }
}