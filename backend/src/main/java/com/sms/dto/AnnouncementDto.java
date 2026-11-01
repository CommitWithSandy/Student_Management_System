package com.sms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementDto {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Target audience is required")
    private String targetAudience; // ALL, STUDENTS, TEACHERS, COURSE, CLASS

    private Long departmentId;
    private Long courseId;
    private String courseName;
    private Long classId;
    private String className;

    @NotNull(message = "Publish date is required")
    private LocalDate publishDate;

    private LocalDate expiryDate;
    private String attachmentPath;
    private String createdByName;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
