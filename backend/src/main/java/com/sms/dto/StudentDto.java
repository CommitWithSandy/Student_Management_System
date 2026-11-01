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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDto {
    private Long id;
    private Long userId;

    private String studentIdNumber;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;

    private String phone;

    @NotNull(message = "Department is required")
    private Long departmentId;
    private String departmentName;

    @NotNull(message = "Course is required")
    private Long courseId;
    private String courseName;

    private Long classId;
    private String className;

    private Integer currentSemester;

    @NotNull(message = "Admission date is required")
    private LocalDate admissionDate;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Gender is required (MALE, FEMALE, OTHER)")
    private String gender;

    private String bloodGroup;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String profileImage;
    private String status;
    private String temporaryPassword; // Optional, set when created
    private LocalDateTime createdAt;
}
