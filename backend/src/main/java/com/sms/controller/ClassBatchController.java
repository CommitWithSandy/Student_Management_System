package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.ClassBatchDto;
import com.sms.dto.PagedResponse;
import com.sms.service.ClassBatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassBatchController {

    private final ClassBatchService classBatchService;

    @GetMapping
    public ResponseEntity<PagedResponse<ClassBatchDto>> getAllClasses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String academicYear
    ) {
        return ResponseEntity.ok(classBatchService.getAllClasses(page, size, courseId, semester, academicYear));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<ClassBatchDto>>> getAllActiveClasses(@RequestParam(required = false) Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(classBatchService.getAllActiveClasses(courseId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClassBatchDto>> getClassById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(classBatchService.getClassById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<ClassBatchDto>> createClass(@Valid @RequestBody ClassBatchDto dto) {
        ClassBatchDto created = classBatchService.createClass(dto);
        return ResponseEntity.ok(ApiResponse.success("Class created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<ClassBatchDto>> updateClass(@PathVariable Long id, @Valid @RequestBody ClassBatchDto dto) {
        ClassBatchDto updated = classBatchService.updateClass(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Class updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteClass(@PathVariable Long id) {
        classBatchService.deleteClass(id);
        return ResponseEntity.ok(ApiResponse.success("Class deleted successfully", null));
    }
}
