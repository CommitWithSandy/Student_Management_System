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
public class AssignmentDto {
    private Long id;

    private Long teacherId;
    private String teacherName;

    @NotNull(message = "Class ID is required")
    private Long classId;
    private String className;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;
    private String subjectName;
    private String subjectCode;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Deadline is required")
    private LocalDateTime deadline;

    private String attachmentPath;
    private Integer maxPoints;
    private String status;
    private Integer submissionsCount;
    private LocalDateTime createdAt;
}
