package com.sms.repository;

import com.sms.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByIsActiveTrueOrderByPublishDateDesc();

    @Query("SELECT a FROM Announcement a WHERE a.isActive = true " +
           "AND (a.expiryDate IS NULL OR a.expiryDate >= :currentDate) " +
           "AND (a.targetAudience = 'ALL' " +
           "OR (:role = 'ROLE_TEACHER' AND a.targetAudience = 'TEACHERS') " +
           "OR (:role = 'ROLE_STUDENT' AND (a.targetAudience = 'STUDENTS' OR a.course.id = :courseId OR a.classBatch.id = :classId))) " +
           "ORDER BY a.publishDate DESC")
    List<Announcement> findTargetedAnnouncements(
            @Param("role") String role,
            @Param("courseId") Long courseId,
            @Param("classId") Long classId,
            @Param("currentDate") LocalDate currentDate
    );

    Page<Announcement> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByIsActiveTrue();
}
