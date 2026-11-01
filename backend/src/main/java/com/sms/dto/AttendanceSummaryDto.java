package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSummaryDto {
    private Long studentId;
    private String studentName;
    private String studentIdNumber;
    private long totalClasses;
    private long attendedClasses;
    private double percentage;
    private String warningStatus; // SATISFACTORY, WARNING (<75%), CRITICAL (<65%)
    private List<SubjectAttendanceDto> subjectBreakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectAttendanceDto {
        private Long subjectId;
        private String subjectName;
        private String subjectCode;
        private long total;
        private long attended;
        private double percentage;
    }
}
