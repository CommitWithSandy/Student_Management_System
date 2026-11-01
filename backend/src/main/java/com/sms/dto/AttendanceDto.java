package com.sms.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDto {
    private Long id;

    @NotNull(message = "Class ID is required")
    private Long classId;
    private String className;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;
    private String subjectName;
    private String subjectCode;

    private Long teacherId;
    private String teacherName;

    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;

    private String notes;

    @NotEmpty(message = "Attendance records cannot be empty")
    private List<AttendanceRecordDto> records;

    private LocalDateTime createdAt;
}
