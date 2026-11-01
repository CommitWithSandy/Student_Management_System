package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.AssignmentDto;
import com.sms.dto.AssignmentSubmissionDto;
import com.sms.dto.PagedResponse;
import com.sms.service.AssignmentService;
import com.sms.service.StudentService;
import com.sms.service.TeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final TeacherService teacherService;
    private final StudentService studentService;

    @GetMapping("/class/{classId}")
    public ResponseEntity<PagedResponse<AssignmentDto>> getAssignmentsForClass(
            @PathVariable Long classId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(assignmentService.getAssignmentsForClass(classId, page, size));
    }

    @GetMapping("/my-assignments")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getMyAssignments(@AuthenticationPrincipal UserDetails userDetails) {
        com.sms.entity.User user = (com.sms.entity.User) userDetails;
        if ("ROLE_TEACHER".equals(user.getRole().getName())) {
            var teacher = teacherService.getTeacherByUserId(user.getId());
            return ResponseEntity.ok(ApiResponse.success(assignmentService.getAssignmentsByTeacher(teacher.getId())));
        } else if ("ROLE_STUDENT".equals(user.getRole().getName())) {
            var student = studentService.getStudentByUserId(user.getId());
            if (student.getClassId() != null) {
                var paged = assignmentService.getAssignmentsForClass(student.getClassId(), 0, 50);
                return ResponseEntity.ok(ApiResponse.success(paged.getData()));
            }
        }
        return ResponseEntity.ok(ApiResponse.success(Collections.emptyList()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<AssignmentDto>> createAssignment(
            @Valid @RequestBody AssignmentDto dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        AssignmentDto created = assignmentService.createAssignment(dto, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Assignment published successfully", created));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<AssignmentSubmissionDto>> submitAssignment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        var student = studentService.getStudentByUserId(((com.sms.entity.User) userDetails).getId());
        AssignmentSubmissionDto submission = assignmentService.submitAssignment(
                id,
                student.getId(),
                body.get("text"),
                body.get("filePath")
        );
        return ResponseEntity.ok(ApiResponse.success("Assignment submitted successfully", submission));
    }

    @GetMapping("/{id}/submissions")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<AssignmentSubmissionDto>>> getSubmissions(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getSubmissionsForAssignment(id)));
    }

    @PostMapping("/submissions/{submissionId}/grade")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<AssignmentSubmissionDto>> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        BigDecimal marks = new BigDecimal(body.get("marks").toString());
        String feedback = body.getOrDefault("feedback", "").toString();
        AssignmentSubmissionDto graded = assignmentService.gradeSubmission(submissionId, marks, feedback, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Submission evaluated successfully", graded));
    }
}
