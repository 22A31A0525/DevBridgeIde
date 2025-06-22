package com.Real_Time.Collaborative.Editor.RealTime_CodeSync.repository;

import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.models.CodeSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CodeSessionRepository extends JpaRepository<CodeSession, String> {
    List<CodeSession> findByOwnerUsername(String username);
}
