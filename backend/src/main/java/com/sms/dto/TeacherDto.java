package com.sms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
public class TeacherDto {
    private Long id;
    private Long userId;

    private String employeeId;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;

    private String phone;

    @NotNull(message = "Department ID is required")
    private Long departmentId;
    private String departmentName;

    private String qualification;
    private String specialization;
    private LocalDate joiningDate;
    private String status;
    private String profileImage;
    private String temporaryPassword;
    private List<TeacherSubjectDto> assignedSubjects;
    private LocalDateTime createdAt;
}
