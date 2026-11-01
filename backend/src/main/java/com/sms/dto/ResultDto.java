package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultDto {
    private Long id;
    private Long examId;
    private String examTitle;
    private String examType;
    private Long studentId;
    private String studentName;
    private String studentIdNumber;
    private String courseName;
    private Integer semester;
    private BigDecimal totalMaxMarks;
    private BigDecimal totalMarksObtained;
    private BigDecimal percentage;
    private BigDecimal gpa;
    private String grade;
    private String status; // PASS, FAIL, PENDING
    private Boolean isPublished;
    private LocalDateTime publishedDate;
    private List<SubjectScoreDto> subjectScores;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectScoreDto {
        private String subjectCode;
        private String subjectName;
        private Integer maxMarks;
        private Integer passingMarks;
        private BigDecimal marksObtained;
        private Boolean isAbsent;
        private String status; // PASS, FAIL, ABSENT
    }
}
