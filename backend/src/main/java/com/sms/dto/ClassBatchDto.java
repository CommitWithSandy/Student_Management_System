package com.sms.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassBatchDto {
    private Long id;

    @NotNull(message = "Course ID is required")
    private Long courseId;

    private String courseName;
    private String courseCode;

    @NotBlank(message = "Academic year is required (e.g., 2026-2028)")
    private String academicYear;

    @NotNull(message = "Semester is required")
    @Min(value = 1, message = "Semester must be at least 1")
    private Integer semester;

    @NotBlank(message = "Division is required (e.g., A)")
    private String division;

    private String section;
    private Long classTeacherId;
    private String classTeacherName;
    private String roomNumber;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer maxCapacity;

    private Integer studentCount;
    private String status;
    private String displayName;
    private LocalDateTime createdAt;
}
