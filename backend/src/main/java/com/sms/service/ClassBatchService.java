package com.sms.service;

import com.sms.dto.ClassBatchDto;
import com.sms.dto.PagedResponse;
import com.sms.entity.ClassBatch;
import com.sms.entity.Course;
import com.sms.entity.User;
import com.sms.exception.BadRequestException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.ClassBatchRepository;
import com.sms.repository.CourseRepository;
import com.sms.repository.StudentRepository;
import com.sms.repository.UserRepository;
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
public class ClassBatchService {

    private final ClassBatchRepository classBatchRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    @Transactional(readOnly = true)
    public PagedResponse<ClassBatchDto> getAllClasses(int page, int size, Long courseId, Integer semester, String academicYear) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<ClassBatch> classes = classBatchRepository.filterClasses(courseId, semester, academicYear, pageable);

        List<ClassBatchDto> dtos = classes.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PagedResponse.of(dtos, classes.getNumber(), classes.getSize(), classes.getTotalElements(), classes.getTotalPages(), classes.isLast());
    }

    @Transactional(readOnly = true)
    public List<ClassBatchDto> getAllActiveClasses(Long courseId) {
        if (courseId != null) {
            return classBatchRepository.findByCourseId(courseId).stream()
                    .filter(c -> c.getStatus() == ClassBatch.ClassStatus.ACTIVE)
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }
        return classBatchRepository.findByStatus(ClassBatch.ClassStatus.ACTIVE).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClassBatchDto getClassById(Long id) {
        ClassBatch cb = classBatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ClassBatch", "id", id));
        return mapToDto(cb);
    }

    @Transactional
    public ClassBatchDto createClass(ClassBatchDto dto) {
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", dto.getCourseId()));

        User classTeacher = null;
        if (dto.getClassTeacherId() != null) {
            classTeacher = userRepository.findById(dto.getClassTeacherId()).orElse(null);
        }

        ClassBatch cb = ClassBatch.builder()
                .course(course)
                .academicYear(dto.getAcademicYear().trim())
                .semester(dto.getSemester())
                .division(dto.getDivision().trim().toUpperCase())
                .section(dto.getSection())
                .classTeacher(classTeacher)
                .roomNumber(dto.getRoomNumber())
                .maxCapacity(dto.getMaxCapacity() != null ? dto.getMaxCapacity() : 60)
                .status(ClassBatch.ClassStatus.ACTIVE)
                .build();

        return mapToDto(classBatchRepository.save(cb));
    }

    @Transactional
    public ClassBatchDto updateClass(Long id, ClassBatchDto dto) {
        ClassBatch cb = classBatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ClassBatch", "id", id));

        if (dto.getCourseId() != null && !dto.getCourseId().equals(cb.getCourse().getId())) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course", "id", dto.getCourseId()));
            cb.setCourse(course);
        }

        User classTeacher = null;
        if (dto.getClassTeacherId() != null) {
            classTeacher = userRepository.findById(dto.getClassTeacherId()).orElse(null);
        }

        cb.setAcademicYear(dto.getAcademicYear().trim());
        cb.setSemester(dto.getSemester());
        cb.setDivision(dto.getDivision().trim().toUpperCase());
        cb.setSection(dto.getSection());
        cb.setClassTeacher(classTeacher);
        cb.setRoomNumber(dto.getRoomNumber());
        if (dto.getMaxCapacity() != null) cb.setMaxCapacity(dto.getMaxCapacity());

        if (dto.getStatus() != null) {
            cb.setStatus(ClassBatch.ClassStatus.valueOf(dto.getStatus().toUpperCase()));
        }

        return mapToDto(classBatchRepository.save(cb));
    }

    @Transactional
    public void deleteClass(Long id) {
        ClassBatch cb = classBatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ClassBatch", "id", id));
        try {
            classBatchRepository.delete(cb);
        } catch (Exception e) {
            throw new BadRequestException("Cannot delete class because enrolled students or timetables reference it. Please deactivate the class instead.");
        }
    }

    private ClassBatchDto mapToDto(ClassBatch cb) {
        int studentCount = studentRepository.findByClassBatchId(cb.getId()).size();
        return ClassBatchDto.builder()
                .id(cb.getId())
                .courseId(cb.getCourse().getId())
                .courseName(cb.getCourse().getName())
                .courseCode(cb.getCourse().getCode())
                .academicYear(cb.getAcademicYear())
                .semester(cb.getSemester())
                .division(cb.getDivision())
                .section(cb.getSection())
                .classTeacherId(cb.getClassTeacher() != null ? cb.getClassTeacher().getId() : null)
                .classTeacherName(cb.getClassTeacher() != null ? cb.getClassTeacher().getFullName() : null)
                .roomNumber(cb.getRoomNumber())
                .maxCapacity(cb.getMaxCapacity())
                .studentCount(studentCount)
                .status(cb.getStatus().name())
                .displayName(cb.getDisplayName())
                .createdAt(cb.getCreatedAt())
                .build();
    }
}
