package com.sms.controller;

import com.sms.dto.*;
import com.sms.service.ExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    @GetMapping
    public ResponseEntity<PagedResponse<ExamDto>> getAllExams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(examService.getAllExams(page, size));
    }

    @GetMapping("/by-course/{courseId}")
    public ResponseEntity<ApiResponse<List<ExamDto>>> getExamsByCourse(
            @PathVariable Long courseId,
            @RequestParam(required = false) Integer semester
    ) {
        return ResponseEntity.ok(ApiResponse.success(examService.getExamsByCourse(courseId, semester)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExamDto>> getExamById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(examService.getExamById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<ExamDto>> createExam(@Valid @RequestBody ExamDto dto, @AuthenticationPrincipal UserDetails userDetails) {
        ExamDto created = examService.createExam(dto, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Exam scheduled successfully", created));
    }

    @GetMapping("/subjects/{examSubjectId}/marks")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<MarkEntryDto>>> getMarksRoster(@PathVariable Long examSubjectId) {
        return ResponseEntity.ok(ApiResponse.success(examService.getMarksRoster(examSubjectId)));
    }

    @PostMapping("/subjects/{examSubjectId}/marks")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> submitMarks(
            @PathVariable Long examSubjectId,
            @RequestBody List<MarkEntryDto> entries,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        examService.submitMarks(examSubjectId, entries, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Marks saved successfully", null));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> publishResults(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        examService.publishResults(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Results calculated and published successfully", null));
    }
}
