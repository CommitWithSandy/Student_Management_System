package com.sms.controller;

import com.sms.dto.AdminDashboardDto;
import com.sms.dto.ApiResponse;
import com.sms.dto.StudentDashboardDto;
import com.sms.dto.TeacherDashboardDto;
import com.sms.service.DashboardService;
import com.sms.service.StudentService;
import com.sms.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final TeacherService teacherService;
    private final StudentService studentService;

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getAdminDashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getAdminDashboardMetrics()));
    }

    @GetMapping("/teacher")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<TeacherDashboardDto>> getTeacherDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        var teacher = teacherService.getTeacherByUserId(((com.sms.entity.User) userDetails).getId());
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getTeacherDashboardMetrics(teacher.getId())));
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentDashboardDto>> getStudentDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        var student = studentService.getStudentByUserId(((com.sms.entity.User) userDetails).getId());
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getStudentDashboardMetrics(student.getId())));
    }
}
