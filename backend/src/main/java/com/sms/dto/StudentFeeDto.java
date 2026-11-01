package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentFeeDto {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentIdNumber;
    private Long feeStructureId;
    private String feeTitle;
    private String courseName;
    private Integer semester;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal pendingAmount;
    private String status;
    private LocalDate dueDate;
    private List<FeePaymentDto> payments;
    private LocalDateTime createdAt;
}
