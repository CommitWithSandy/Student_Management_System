package com.sms.repository;

import com.sms.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByAttendanceId(Long attendanceId);
    List<AttendanceRecord> findByStudentId(Long studentId);
    Optional<AttendanceRecord> findByAttendanceIdAndStudentId(Long attendanceId, Long studentId);

    @Query("SELECT COUNT(ar) FROM AttendanceRecord ar WHERE ar.student.id = :studentId")
    long countTotalClassesForStudent(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(ar) FROM AttendanceRecord ar WHERE ar.student.id = :studentId AND ar.status = 'PRESENT'")
    long countPresentClassesForStudent(@Param("studentId") Long studentId);
}
