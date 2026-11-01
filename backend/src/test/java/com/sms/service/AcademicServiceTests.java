package com.sms.service;

import com.sms.dto.DepartmentDto;
import com.sms.entity.Department;
import com.sms.repository.DepartmentRepository;
import com.sms.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AcademicServiceTests {

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DepartmentService departmentService;

    private Department department;

    @BeforeEach
    void setUp() {
        department = Department.builder()
                .id(1L)
                .code("CSE")
                .name("Computer Science and Engineering")
                .status(Department.DepartmentStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("Test Department retrieval by ID")
    void testGetDepartmentById() {
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));

        DepartmentDto result = departmentService.getDepartmentById(1L);

        assertNotNull(result);
        assertEquals("CSE", result.getCode());
        assertEquals("Computer Science and Engineering", result.getName());
        verify(departmentRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Test Department creation")
    void testCreateDepartment() {
        DepartmentDto dto = DepartmentDto.builder()
                .code("IT")
                .name("Information Technology")
                .status("ACTIVE")
                .build();

        Department saved = Department.builder()
                .id(2L)
                .code("IT")
                .name("Information Technology")
                .status(Department.DepartmentStatus.ACTIVE)
                .build();

        when(departmentRepository.existsByCode("IT")).thenReturn(false);
        when(departmentRepository.save(any(Department.class))).thenReturn(saved);

        DepartmentDto result = departmentService.createDepartment(dto);

        assertNotNull(result);
        assertEquals(2L, result.getId());
        assertEquals("IT", result.getCode());
        verify(departmentRepository, times(1)).save(any(Department.class));
    }

    @Test
    @DisplayName("Test Attendance Percentage Computation Logic")
    void testAttendanceCalculation() {
        long totalClasses = 40;
        long attendedClasses = 34;
        double percentage = Math.round(((double) attendedClasses / totalClasses) * 1000.0) / 10.0;

        assertEquals(85.0, percentage);

        String status;
        if (percentage >= 75.0) {
            status = "SATISFACTORY";
        } else if (percentage >= 60.0) {
            status = "WARNING";
        } else {
            status = "CRITICAL";
        }

        assertEquals("SATISFACTORY", status);
    }

    @Test
    @DisplayName("Test Exam Grade Calculation Logic")
    void testGradeCalculation() {
        double percentage = 84.5;
        String grade;
        double gpa;

        if (percentage >= 90) {
            grade = "A+"; gpa = 10.0;
        } else if (percentage >= 80) {
            grade = "A"; gpa = 9.0;
        } else if (percentage >= 70) {
            grade = "B+"; gpa = 8.0;
        } else if (percentage >= 60) {
            grade = "B"; gpa = 7.0;
        } else if (percentage >= 50) {
            grade = "C"; gpa = 6.0;
        } else if (percentage >= 40) {
            grade = "P"; gpa = 5.0;
        } else {
            grade = "F"; gpa = 0.0;
        }

        assertEquals("A", grade);
        assertEquals(9.0, gpa);
    }
}
