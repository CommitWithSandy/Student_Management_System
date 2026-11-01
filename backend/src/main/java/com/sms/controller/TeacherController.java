package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.PagedResponse;
import com.sms.dto.TeacherDto;
import com.sms.dto.TeacherSubjectDto;
import com.sms.service.TeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<PagedResponse<TeacherDto>> getAllTeachers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(teacherService.getAllTeachers(page, size, search, departmentId, status));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<TeacherDto>>> getAllActiveTeachers() {
        return ResponseEntity.ok(ApiResponse.success(teacherService.getAllActiveTeachers()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TeacherDto>> getTeacherById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.getTeacherById(id)));
    }

    @GetMapping("/profile/me")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<TeacherDto>> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        TeacherDto profile = teacherService.getTeacherByUserId(((com.sms.entity.User) userDetails).getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<TeacherDto>> createTeacher(@Valid @RequestBody TeacherDto dto) {
        TeacherDto created = teacherService.createTeacher(dto);
        return ResponseEntity.ok(ApiResponse.success("Teacher added successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<TeacherDto>> updateTeacher(@PathVariable Long id, @Valid @RequestBody TeacherDto dto) {
        TeacherDto updated = teacherService.updateTeacher(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Teacher updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTeacher(@PathVariable Long id) {
        teacherService.deleteTeacher(id);
        return ResponseEntity.ok(ApiResponse.success("Teacher deactivated successfully", null));
    }

    @PostMapping("/assign-subject")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<TeacherSubjectDto>> assignSubject(@Valid @RequestBody TeacherSubjectDto dto) {
        TeacherSubjectDto assigned = teacherService.assignSubjectToTeacher(dto);
        return ResponseEntity.ok(ApiResponse.success("Subject assigned to teacher successfully", assigned));
    }

    @GetMapping("/{id}/assignments")
    public ResponseEntity<ApiResponse<List<TeacherSubjectDto>>> getTeacherAssignments(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(teacherService.getTeacherAssignments(id)));
    }
}
