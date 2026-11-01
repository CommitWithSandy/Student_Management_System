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
public class TeacherDashboardDto {
    private String teacherName;
    private String employeeId;
    private String departmentName;
    private int assignedClassesCount;
    private int assignedSubjectsCount;
    private int activeAssignmentsCount;
    private List<TimetableDto> todaySchedule;
    private List<TeacherSubjectDto> myClassesAndSubjects;
    private List<AnnouncementDto> recentAnnouncements;
}
