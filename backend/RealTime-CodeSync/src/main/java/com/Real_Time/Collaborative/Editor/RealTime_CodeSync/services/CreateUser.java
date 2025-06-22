package com.Real_Time.Collaborative.Editor.RealTime_CodeSync.services;

import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.models.Users;
import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class CreateUser {

    @Autowired
    private UserRepository repository;


    @Autowired
    private PasswordEncoder passwordEncoder;

    public Users createUser(Users user) { // Changed return type to Users


        Optional<Users> existingUser = repository.findByUsername(user.getUsername());
        if (existingUser.isPresent()) {
            System.out.println("Registration failed: Username '" + user.getUsername() + "' already exists.");

            return null; // Or throw an exception for clearer error handling in controller
        }


        user.setId(null);


         user.setPassword(passwordEncoder.encode(user.getPassword()));

         System.out.println(user.getPassword());

        Users savedUser = repository.save(user); // This saves the new user
        System.out.println("User '" + savedUser.getUsername() + "' registered successfully with ID: " + savedUser.getId());
        return savedUser; // Return the newly saved user with its generated ID
    }
}