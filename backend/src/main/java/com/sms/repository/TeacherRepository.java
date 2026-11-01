package com.sms.repository;

import com.sms.entity.Teacher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByUserId(Long userId);
    Optional<Teacher> findByEmployeeId(String employeeId);
    boolean existsByEmployeeId(String employeeId);
    List<Teacher> findByDepartmentId(Long departmentId);

    @Query("SELECT t FROM Teacher t WHERE (:departmentId IS NULL OR t.department.id = :departmentId) AND (:status IS NULL OR t.status = :status) AND (:search IS NULL OR LOWER(t.user.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.user.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.employeeId) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Teacher> searchTeachers(@Param("search") String search, @Param("departmentId") Long departmentId, @Param("status") Teacher.TeacherStatus status, Pageable pageable);
}
