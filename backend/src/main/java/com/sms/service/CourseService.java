package com.sms.service;

import com.sms.dto.CourseDto;
import com.sms.dto.PagedResponse;
import com.sms.entity.Course;
import com.sms.entity.Department;
import com.sms.exception.BadRequestException;
import com.sms.exception.DuplicateResourceException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.CourseRepository;
import com.sms.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public PagedResponse<CourseDto> getAllCourses(int page, int size, String search, Long departmentId, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Course.CourseStatus courseStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                courseStatus = Course.CourseStatus.valueOf(status.toUpperCase());
            } catch (Exception ignored) {}
        }

        Page<Course> courses = courseRepository.searchCourses(
                search != null && !search.trim().isEmpty() ? search.trim() : null,
                departmentId,
                courseStatus,
                pageable
        );

        List<CourseDto> dtos = courses.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PagedResponse.of(dtos, courses.getNumber(), courses.getSize(), courses.getTotalElements(), courses.getTotalPages(), courses.isLast());
    }

    @Transactional(readOnly = true)
    public List<CourseDto> getAllActiveCourses(Long departmentId) {
        if (departmentId != null) {
            return courseRepository.findByDepartmentId(departmentId).stream()
                    .filter(c -> c.getStatus() == Course.CourseStatus.ACTIVE)
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }
        return courseRepository.findByStatus(Course.CourseStatus.ACTIVE).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CourseDto getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        return mapToDto(course);
    }

    @Transactional
    public CourseDto createCourse(CourseDto dto) {
        if (courseRepository.existsByCode(dto.getCode().trim())) {
            throw new DuplicateResourceException("Course with code '" + dto.getCode() + "' already exists");
        }

        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", dto.getDepartmentId()));

        Course course = Course.builder()
                .department(department)
                .code(dto.getCode().trim().toUpperCase())
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .durationYears(dto.getDurationYears() != null ? dto.getDurationYears() : 3)
                .totalSemesters(dto.getTotalSemesters() != null ? dto.getTotalSemesters() : 6)
                .status(Course.CourseStatus.ACTIVE)
                .build();

        return mapToDto(courseRepository.save(course));
    }

    @Transactional
    public CourseDto updateCourse(Long id, CourseDto dto) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));

        if (!course.getCode().equalsIgnoreCase(dto.getCode().trim()) && courseRepository.existsByCode(dto.getCode().trim())) {
            throw new DuplicateResourceException("Course with code '" + dto.getCode() + "' already exists");
        }

        if (dto.getDepartmentId() != null && !dto.getDepartmentId().equals(course.getDepartment().getId())) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", dto.getDepartmentId()));
            course.setDepartment(department);
        }

        course.setCode(dto.getCode().trim().toUpperCase());
        course.setName(dto.getName().trim());
        course.setDescription(dto.getDescription());
        if (dto.getDurationYears() != null) course.setDurationYears(dto.getDurationYears());
        if (dto.getTotalSemesters() != null) course.setTotalSemesters(dto.getTotalSemesters());

        if (dto.getStatus() != null) {
            course.setStatus(Course.CourseStatus.valueOf(dto.getStatus().toUpperCase()));
        }

        return mapToDto(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        try {
            courseRepository.delete(course);
        } catch (Exception e) {
            throw new BadRequestException("Cannot delete course because classes or subjects are attached to it. Please deactivate the course instead.");
        }
    }

    private CourseDto mapToDto(Course c) {
        return CourseDto.builder()
                .id(c.getId())
                .departmentId(c.getDepartment().getId())
                .departmentName(c.getDepartment().getName())
                .code(c.getCode())
                .name(c.getName())
                .description(c.getDescription())
                .durationYears(c.getDurationYears())
                .totalSemesters(c.getTotalSemesters())
                .status(c.getStatus().name())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
