package com.sms.repository;

import com.sms.entity.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByClassBatchIdAndSubjectIdAndAttendanceDate(Long classId, Long subjectId, LocalDate date);
    List<Attendance> findByClassBatchId(Long classId);
    Page<Attendance> findByClassBatchIdOrderByAttendanceDateDesc(Long classId, Pageable pageable);
    long countByAttendanceDate(LocalDate date);
}
