package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardDto {
    private String studentName;
    private String studentIdNumber;
    private String courseName;
    private String className;
    private int currentSemester;
    private double overallAttendancePercentage;
    private String attendanceWarningStatus;
    private BigDecimal currentGpa;
    private BigDecimal pendingFeeAmount;
    private List<TimetableDto> todayTimetable;
    private List<ExamDto> upcomingExams;
    private List<AssignmentDto> pendingAssignments;
    private List<ResultDto> recentResults;
    private List<AnnouncementDto> announcements;
}
