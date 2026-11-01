package com.sms.repository;

import com.sms.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByStudentIdNumber(String studentIdNumber);
    boolean existsByStudentIdNumber(String studentIdNumber);

    List<Student> findByClassBatchId(Long classId);
    List<Student> findByCourseIdAndCurrentSemester(Long courseId, Integer currentSemester);

    @Query("SELECT s FROM Student s WHERE (:courseId IS NULL OR s.course.id = :courseId) " +
           "AND (:classId IS NULL OR s.classBatch.id = :classId) " +
           "AND (:departmentId IS NULL OR s.department.id = :departmentId) " +
           "AND (:status IS NULL OR s.status = :status) " +
           "AND (:search IS NULL OR LOWER(s.user.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.user.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.studentIdNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.user.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Student> searchStudents(
            @Param("search") String search,
            @Param("departmentId") Long departmentId,
            @Param("courseId") Long courseId,
            @Param("classId") Long classId,
            @Param("status") Student.StudentStatus status,
            Pageable pageable
    );

    long countByStatus(Student.StudentStatus status);
}
