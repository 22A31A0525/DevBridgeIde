package com.Real_Time.Collaborative.Editor.RealTime_CodeSync.repository;

import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<Users, Long> {
    Optional<Users> findByUsername(String username);
}
