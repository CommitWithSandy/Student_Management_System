package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.FeePaymentDto;
import com.sms.dto.FeeStructureDto;
import com.sms.dto.PagedResponse;
import com.sms.dto.StudentFeeDto;
import com.sms.service.FeeService;
import com.sms.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fees")
@RequiredArgsConstructor
public class FeeController {

    private final FeeService feeService;
    private final StudentService studentService;

    @GetMapping("/structures")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<PagedResponse<FeeStructureDto>> getAllStructures(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(feeService.getAllFeeStructures(page, size));
    }

    @PostMapping("/structures")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<FeeStructureDto>> createStructure(@Valid @RequestBody FeeStructureDto dto) {
        FeeStructureDto created = feeService.createFeeStructure(dto);
        return ResponseEntity.ok(ApiResponse.success("Fee structure defined and invoiced to eligible students", created));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<StudentFeeDto>>> getStudentFees(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(feeService.getFeesForStudent(studentId)));
    }

    @GetMapping("/my-fees")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<StudentFeeDto>>> getMyFees(@AuthenticationPrincipal UserDetails userDetails) {
        var student = studentService.getStudentByUserId(((com.sms.entity.User) userDetails).getId());
        return ResponseEntity.ok(ApiResponse.success(feeService.getFeesForStudent(student.getId())));
    }

    @PostMapping("/pay")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<FeePaymentDto>> recordPayment(@Valid @RequestBody FeePaymentDto dto, @AuthenticationPrincipal UserDetails userDetails) {
        FeePaymentDto recorded = feeService.recordPayment(dto, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Payment recorded and official receipt generated", recorded));
    }
}
