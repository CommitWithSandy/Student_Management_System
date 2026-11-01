package com.sms.repository;

import com.sms.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCode(String code);
    boolean existsByCode(String code);
    List<Course> findByDepartmentId(Long departmentId);
    List<Course> findByStatus(Course.CourseStatus status);

    @Query("SELECT c FROM Course c WHERE (:search IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.code) LIKE LOWER(CONCAT('%', :search, '%'))) AND (:departmentId IS NULL OR c.department.id = :departmentId) AND (:status IS NULL OR c.status = :status)")
    Page<Course> searchCourses(@Param("search") String search, @Param("departmentId") Long departmentId, @Param("status") Course.CourseStatus status, Pageable pageable);
}
