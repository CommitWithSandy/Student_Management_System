package com.sms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamSubjectDto {
    private Long id;
    private Long examId;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;
    private String subjectName;
    private String subjectCode;

    @NotNull(message = "Exam date is required")
    private LocalDate examDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private String roomNumber;
    private Integer maxMarks;
    private Integer passingMarks;
}
