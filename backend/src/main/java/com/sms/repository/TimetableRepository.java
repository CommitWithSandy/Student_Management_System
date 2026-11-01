package com.sms.repository;

import com.sms.entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findByClassBatchId(Long classId);
    List<Timetable> findByTeacherId(Long teacherId);
    List<Timetable> findByClassBatchIdAndDayOfWeek(Long classId, DayOfWeek dayOfWeek);
    List<Timetable> findByTeacherIdAndDayOfWeek(Long teacherId, DayOfWeek dayOfWeek);

    // Conflict check 1: Teacher conflict
    @Query("SELECT COUNT(t) > 0 FROM Timetable t WHERE t.teacher.id = :teacherId AND t.dayOfWeek = :dayOfWeek " +
           "AND (:id IS NULL OR t.id <> :id) " +
           "AND ((:startTime >= t.startTime AND :startTime < t.endTime) OR (:endTime > t.startTime AND :endTime <= t.endTime) OR (:startTime <= t.startTime AND :endTime >= t.endTime))")
    boolean existsTeacherConflict(@Param("teacherId") Long teacherId, @Param("dayOfWeek") DayOfWeek dayOfWeek, @Param("startTime") LocalTime startTime, @Param("endTime") LocalTime endTime, @Param("id") Long id);

    // Conflict check 2: Room conflict
    @Query("SELECT COUNT(t) > 0 FROM Timetable t WHERE t.roomNumber = :roomNumber AND t.dayOfWeek = :dayOfWeek " +
           "AND (:id IS NULL OR t.id <> :id) " +
           "AND ((:startTime >= t.startTime AND :startTime < t.endTime) OR (:endTime > t.startTime AND :endTime <= t.endTime) OR (:startTime <= t.startTime AND :endTime >= t.endTime))")
    boolean existsRoomConflict(@Param("roomNumber") String roomNumber, @Param("dayOfWeek") DayOfWeek dayOfWeek, @Param("startTime") LocalTime startTime, @Param("endTime") LocalTime endTime, @Param("id") Long id);

    // Conflict check 3: Class conflict
    @Query("SELECT COUNT(t) > 0 FROM Timetable t WHERE t.classBatch.id = :classId AND t.dayOfWeek = :dayOfWeek " +
           "AND (:id IS NULL OR t.id <> :id) " +
           "AND ((:startTime >= t.startTime AND :startTime < t.endTime) OR (:endTime > t.startTime AND :endTime <= t.endTime) OR (:startTime <= t.startTime AND :endTime >= t.endTime))")
    boolean existsClassConflict(@Param("classId") Long classId, @Param("dayOfWeek") DayOfWeek dayOfWeek, @Param("startTime") LocalTime startTime, @Param("endTime") LocalTime endTime, @Param("id") Long id);
}
