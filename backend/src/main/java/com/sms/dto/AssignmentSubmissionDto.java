package com.sms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentSubmissionDto {
    private Long id;

    @NotNull(message = "Assignment ID is required")
    private Long assignmentId;
    private String assignmentTitle;

    private Long studentId;
    private String studentName;
    private String studentIdNumber;

    private String submissionText;
    private String filePath;
    private LocalDateTime submittedAt;
    private String status; // SUBMITTED, LATE, REVIEWED
    private BigDecimal marksAwarded;
    private String feedback;
    private String gradedByName;
    private LocalDateTime gradedAt;
}
