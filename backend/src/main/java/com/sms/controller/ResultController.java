package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.ResultDto;
import com.sms.service.ExamService;
import com.sms.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class ResultController {

    private final ExamService examService;
    private final StudentService studentService;

    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<ResultDto>>> getResultsForExam(@PathVariable Long examId) {
        return ResponseEntity.ok(ApiResponse.success(examService.getResultsForExam(examId)));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<ResultDto>>> getStudentResults(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(examService.getStudentResults(studentId)));
    }

    @GetMapping("/my-results")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<ResultDto>>> getMyResults(@AuthenticationPrincipal UserDetails userDetails) {
        var student = studentService.getStudentByUserId(((com.sms.entity.User) userDetails).getId());
        return ResponseEntity.ok(ApiResponse.success(examService.getStudentResults(student.getId())));
    }
}
