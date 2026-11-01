package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDto {
    private long totalStudents;
    private long totalTeachers;
    private long totalCourses;
    private long totalDepartments;
    private double todayAttendanceRate;
    private BigDecimal pendingFeesTotal;
    private BigDecimal collectedFeesTotal;
    private long upcomingExamsCount;
    private long activeAnnouncementsCount;

    private List<MonthlyMetric> monthlyAttendanceTrend;
    private List<CategoryMetric> departmentEnrollment;
    private List<AuditLogDto> recentActivities;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyMetric {
        private String month;
        private double rate;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategoryMetric {
        private String name;
        private long value;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AuditLogDto {
        private Long id;
        private String username;
        private String action;
        private String entity;
        private String details;
        private String createdAt;
    }
}
