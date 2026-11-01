package com.sms.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeStructureDto {
    private Long id;

    @NotNull(message = "Course ID is required")
    private Long courseId;
    private String courseName;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    @NotNull(message = "Semester is required")
    private Integer semester;

    @NotBlank(message = "Fee title is required")
    private String title;

    @NotNull(message = "Total fee amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal totalAmount;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private String description;
    private LocalDateTime createdAt;
}
