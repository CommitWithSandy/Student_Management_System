package com.sms.service;

import com.sms.dto.AttendanceDto;
import com.sms.dto.AttendanceRecordDto;
import com.sms.dto.AttendanceSummaryDto;
import com.sms.entity.*;
import com.sms.exception.BadRequestException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final ClassBatchRepository classBatchRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public AttendanceDto getAttendanceSession(Long classId, Long subjectId, LocalDate date) {
        ClassBatch classBatch = classBatchRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("ClassBatch", "id", classId));

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", subjectId));

        Optional<Attendance> existingOpt = attendanceRepository.findByClassBatchIdAndSubjectIdAndAttendanceDate(classId, subjectId, date);

        List<Student> studentsInClass = studentRepository.findByClassBatchId(classId);

        if (existingOpt.isPresent()) {
            Attendance existing = existingOpt.get();
            Map<Long, AttendanceRecord> recordMap = existing.getRecords().stream()
                    .collect(Collectors.toMap(r -> r.getStudent().getId(), r -> r, (a, b) -> a));

            List<AttendanceRecordDto> recordDtos = studentsInClass.stream().map(st -> {
                AttendanceRecord r = recordMap.get(st.getId());
                return AttendanceRecordDto.builder()
                        .id(r != null ? r.getId() : null)
                        .studentId(st.getId())
                        .studentName(st.getUser().getFullName())
                        .studentIdNumber(st.getStudentIdNumber())
                        .status(r != null ? r.getStatus().name() : "PRESENT")
                        .remarks(r != null ? r.getRemarks() : null)
                        .build();
            }).collect(Collectors.toList());

            return AttendanceDto.builder()
                    .id(existing.getId())
                    .classId(classBatch.getId())
                    .className(classBatch.getDisplayName())
                    .subjectId(subject.getId())
                    .subjectName(subject.getName())
                    .subjectCode(subject.getCode())
                    .teacherId(existing.getTeacher().getId())
                    .teacherName(existing.getTeacher().getUser().getFullName())
                    .attendanceDate(existing.getAttendanceDate())
                    .notes(existing.getNotes())
                    .records(recordDtos)
                    .createdAt(existing.getCreatedAt())
                    .build();
        } else {
            // New session defaults all students to PRESENT
            List<AttendanceRecordDto> defaultRecords = studentsInClass.stream().map(st ->
                    AttendanceRecordDto.builder()
                            .studentId(st.getId())
                            .studentName(st.getUser().getFullName())
                            .studentIdNumber(st.getStudentIdNumber())
                            .status("PRESENT")
                            .remarks(null)
                            .build()
            ).collect(Collectors.toList());

            return AttendanceDto.builder()
                    .classId(classBatch.getId())
                    .className(classBatch.getDisplayName())
                    .subjectId(subject.getId())
                    .subjectName(subject.getName())
                    .subjectCode(subject.getCode())
                    .attendanceDate(date)
                    .records(defaultRecords)
                    .build();
        }
    }

    @Transactional
    public AttendanceDto saveOrUpdateAttendance(AttendanceDto dto, String username) {
        ClassBatch classBatch = classBatchRepository.findById(dto.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("ClassBatch", "id", dto.getClassId()));

        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", dto.getSubjectId()));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Teacher assignedTeacher = teacherRepository.findByUserId(user.getId()).orElse(null);
        if (assignedTeacher == null) {
            // If admin is taking attendance, assign first active teacher or head
            assignedTeacher = teacherRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new BadRequestException("No faculty member found in system to record attendance"));
        }
        final Teacher teacher = assignedTeacher;

        Attendance attendance = attendanceRepository.findByClassBatchIdAndSubjectIdAndAttendanceDate(dto.getClassId(), dto.getSubjectId(), dto.getAttendanceDate())
                .orElseGet(() -> Attendance.builder()
                        .classBatch(classBatch)
                        .subject(subject)
                        .teacher(teacher)
                        .attendanceDate(dto.getAttendanceDate())
                        .notes(dto.getNotes())
                        .records(new ArrayList<>())
                        .build());

        attendance.setNotes(dto.getNotes());
        attendance.setTeacher(teacher);

        Map<Long, AttendanceRecord> existingRecords = attendance.getRecords().stream()
                .collect(Collectors.toMap(r -> r.getStudent().getId(), r -> r, (a, b) -> a));

        for (AttendanceRecordDto recordDto : dto.getRecords()) {
            Student student = studentRepository.findById(recordDto.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "id", recordDto.getStudentId()));

            AttendanceRecord record = existingRecords.get(student.getId());
            if (record != null) {
                record.setStatus(AttendanceRecord.AttendanceStatus.valueOf(recordDto.getStatus().toUpperCase()));
                record.setRemarks(recordDto.getRemarks());
            } else {
                AttendanceRecord newRecord = AttendanceRecord.builder()
                        .attendance(attendance)
                        .student(student)
                        .status(AttendanceRecord.AttendanceStatus.valueOf(recordDto.getStatus().toUpperCase()))
                        .remarks(recordDto.getRemarks())
                        .build();
                attendance.getRecords().add(newRecord);
            }
        }

        Attendance saved = attendanceRepository.save(attendance);

        auditLogService.logAction(user.getId(), username, "ATTENDANCE_RECORDED", "ATTENDANCE", saved.getId().toString(),
                "Marked roll call for " + classBatch.getDisplayName() + " - " + subject.getCode() + " on " + dto.getAttendanceDate(), null);

        return getAttendanceSession(classBatch.getId(), subject.getId(), dto.getAttendanceDate());
    }

    @Transactional(readOnly = true)
    public AttendanceSummaryDto getStudentAttendanceSummary(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        List<AttendanceRecord> records = attendanceRecordRepository.findByStudentId(studentId);
        long total = records.size();
        long attended = records.stream()
                .filter(r -> r.getStatus() == AttendanceRecord.AttendanceStatus.PRESENT || r.getStatus() == AttendanceRecord.AttendanceStatus.LATE)
                .count();

        double percentage = total > 0 ? ((double) attended / total) * 100.0 : 100.0;
        percentage = Math.round(percentage * 10.0) / 10.0;

        String warningStatus = "SATISFACTORY";
        if (percentage < 65.0) {
            warningStatus = "CRITICAL";
        } else if (percentage < 75.0) {
            warningStatus = "WARNING";
        }

        // Subject breakdown
        Map<Subject, List<AttendanceRecord>> bySubject = records.stream()
                .collect(Collectors.groupingBy(r -> r.getAttendance().getSubject()));

        List<AttendanceSummaryDto.SubjectAttendanceDto> subjectBreakdown = bySubject.entrySet().stream()
                .map(entry -> {
                    Subject sub = entry.getKey();
                    long subTotal = entry.getValue().size();
                    long subAttended = entry.getValue().stream()
                            .filter(r -> r.getStatus() == AttendanceRecord.AttendanceStatus.PRESENT || r.getStatus() == AttendanceRecord.AttendanceStatus.LATE)
                            .count();
                    double subPct = subTotal > 0 ? Math.round(((double) subAttended / subTotal) * 1000.0) / 10.0 : 100.0;
                    return AttendanceSummaryDto.SubjectAttendanceDto.builder()
                            .subjectId(sub.getId())
                            .subjectName(sub.getName())
                            .subjectCode(sub.getCode())
                            .total(subTotal)
                            .attended(subAttended)
                            .percentage(subPct)
                            .build();
                }).collect(Collectors.toList());

        return AttendanceSummaryDto.builder()
                .studentId(student.getId())
                .studentName(student.getUser().getFullName())
                .studentIdNumber(student.getStudentIdNumber())
                .totalClasses(total)
                .attendedClasses(attended)
                .percentage(percentage)
                .warningStatus(warningStatus)
                .subjectBreakdown(subjectBreakdown)
                .build();
    }
}
