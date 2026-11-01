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
public class SubjectDto {
    private Long id;

    @NotNull(message = "Course ID is required")
    private Long courseId;

    private String courseName;
    private String courseCode;

    @NotBlank(message = "Subject code is required")
    private String code;

    @NotBlank(message = "Subject name is required")
    private String name;

    @NotNull(message = "Semester is required")
    @Min(value = 1, message = "Semester must be at least 1")
    private Integer semester;

    @Min(value = 1, message = "Credits must be at least 1")
    private Integer credits;

    @Min(value = 1, message = "Max marks must be at least 1")
    private Integer maxMarks;

    @Min(value = 0, message = "Passing marks cannot be negative")
    private Integer passingMarks;

    private String type; // THEORY, PRACTICAL
    private String status;
    private LocalDateTime createdAt;
}
