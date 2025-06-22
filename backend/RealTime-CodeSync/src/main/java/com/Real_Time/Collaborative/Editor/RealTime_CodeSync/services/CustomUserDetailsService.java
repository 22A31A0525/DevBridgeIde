package com.Real_Time.Collaborative.Editor.RealTime_CodeSync.services;

import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.models.Users;
import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {


        Users userFromDb = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    System.out.println("User not found: " + username);
                    return new UsernameNotFoundException("User not found with username: " + username);
                });


        return org.springframework.security.core.userdetails.User.builder()
                .username(userFromDb.getUsername())
                .password(userFromDb.getPassword())
                .roles("USER")
                .build();
    }
}