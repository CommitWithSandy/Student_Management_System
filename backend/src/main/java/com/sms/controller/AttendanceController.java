package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.AttendanceDto;
import com.sms.dto.AttendanceSummaryDto;
import com.sms.service.AttendanceService;
import com.sms.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final StudentService studentService;

    @GetMapping("/session")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<AttendanceDto>> getSession(
            @RequestParam Long classId,
            @RequestParam Long subjectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        AttendanceDto session = attendanceService.getAttendanceSession(classId, subjectId, date);
        return ResponseEntity.ok(ApiResponse.success(session));
    }

    @PostMapping("/submit")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<AttendanceDto>> submitAttendance(
            @Valid @RequestBody AttendanceDto dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        AttendanceDto saved = attendanceService.saveOrUpdateAttendance(dto, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Attendance recorded successfully", saved));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<ApiResponse<AttendanceSummaryDto>> getStudentAttendance(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getStudentAttendanceSummary(studentId)));
    }

    @GetMapping("/my-attendance")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<AttendanceSummaryDto>> getMyAttendance(@AuthenticationPrincipal UserDetails userDetails) {
        var student = studentService.getStudentByUserId(((com.sms.entity.User) userDetails).getId());
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getStudentAttendanceSummary(student.getId())));
    }
}
