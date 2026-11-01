package com.sms.dto;

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
public class TeacherSubjectDto {
    private Long id;

    @NotNull(message = "Teacher ID is required")
    private Long teacherId;
    private String teacherName;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;
    private String subjectName;
    private String subjectCode;

    @NotNull(message = "Class ID is required")
    private Long classId;
    private String className;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    private LocalDateTime createdAt;
}
