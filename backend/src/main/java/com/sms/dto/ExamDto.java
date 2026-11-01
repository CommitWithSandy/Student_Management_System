package com.sms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamDto {
    private Long id;

    @NotBlank(message = "Exam title is required")
    private String title;

    @NotBlank(message = "Exam type is required (INTERNAL, MIDTERM, PRACTICAL, SEMESTER, FINAL)")
    private String examType;

    @NotNull(message = "Course ID is required")
    private Long courseId;
    private String courseName;

    private Long classId;
    private String className;

    @NotNull(message = "Semester is required")
    private Integer semester;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private Boolean isPublished;
    private List<ExamSubjectDto> subjects;
    private LocalDateTime createdAt;
}
