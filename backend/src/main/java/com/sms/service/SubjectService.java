package com.sms.service;

import com.sms.dto.PagedResponse;
import com.sms.dto.SubjectDto;
import com.sms.entity.Course;
import com.sms.entity.Subject;
import com.sms.exception.BadRequestException;
import com.sms.exception.DuplicateResourceException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.CourseRepository;
import com.sms.repository.SubjectRepository;
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
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public PagedResponse<SubjectDto> getAllSubjects(int page, int size, String search, Long courseId, Integer semester) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Subject> subjects = subjectRepository.searchSubjects(
                search != null && !search.trim().isEmpty() ? search.trim() : null,
                courseId,
                semester,
                pageable
        );

        List<SubjectDto> dtos = subjects.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PagedResponse.of(dtos, subjects.getNumber(), subjects.getSize(), subjects.getTotalElements(), subjects.getTotalPages(), subjects.isLast());
    }

    @Transactional(readOnly = true)
    public List<SubjectDto> getSubjectsByCourseAndSemester(Long courseId, Integer semester) {
        if (semester != null) {
            return subjectRepository.findByCourseIdAndSemester(courseId, semester).stream()
                    .filter(s -> s.getStatus() == Subject.SubjectStatus.ACTIVE)
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }
        return subjectRepository.findByCourseId(courseId).stream()
                .filter(s -> s.getStatus() == Subject.SubjectStatus.ACTIVE)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubjectDto getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));
        return mapToDto(subject);
    }

    @Transactional
    public SubjectDto createSubject(SubjectDto dto) {
        if (subjectRepository.existsByCode(dto.getCode().trim())) {
            throw new DuplicateResourceException("Subject with code '" + dto.getCode() + "' already exists");
        }

        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", dto.getCourseId()));

        Subject subject = Subject.builder()
                .course(course)
                .code(dto.getCode().trim().toUpperCase())
                .name(dto.getName().trim())
                .semester(dto.getSemester())
                .credits(dto.getCredits() != null ? dto.getCredits() : 4)
                .maxMarks(dto.getMaxMarks() != null ? dto.getMaxMarks() : 100)
                .passingMarks(dto.getPassingMarks() != null ? dto.getPassingMarks() : 40)
                .type(dto.getType() != null ? Subject.SubjectType.valueOf(dto.getType().toUpperCase()) : Subject.SubjectType.THEORY)
                .status(Subject.SubjectStatus.ACTIVE)
                .build();

        return mapToDto(subjectRepository.save(subject));
    }

    @Transactional
    public SubjectDto updateSubject(Long id, SubjectDto dto) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));

        if (!subject.getCode().equalsIgnoreCase(dto.getCode().trim()) && subjectRepository.existsByCode(dto.getCode().trim())) {
            throw new DuplicateResourceException("Subject with code '" + dto.getCode() + "' already exists");
        }

        if (dto.getCourseId() != null && !dto.getCourseId().equals(subject.getCourse().getId())) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course", "id", dto.getCourseId()));
            subject.setCourse(course);
        }

        subject.setCode(dto.getCode().trim().toUpperCase());
        subject.setName(dto.getName().trim());
        subject.setSemester(dto.getSemester());
        if (dto.getCredits() != null) subject.setCredits(dto.getCredits());
        if (dto.getMaxMarks() != null) subject.setMaxMarks(dto.getMaxMarks());
        if (dto.getPassingMarks() != null) subject.setPassingMarks(dto.getPassingMarks());

        if (dto.getType() != null) {
            subject.setType(Subject.SubjectType.valueOf(dto.getType().toUpperCase()));
        }
        if (dto.getStatus() != null) {
            subject.setStatus(Subject.SubjectStatus.valueOf(dto.getStatus().toUpperCase()));
        }

        return mapToDto(subjectRepository.save(subject));
    }

    @Transactional
    public void deleteSubject(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));
        try {
            subjectRepository.delete(subject);
        } catch (Exception e) {
            throw new BadRequestException("Cannot delete subject because timetable or exam schedules reference it. Please deactivate the subject instead.");
        }
    }

    private SubjectDto mapToDto(Subject s) {
        return SubjectDto.builder()
                .id(s.getId())
                .courseId(s.getCourse().getId())
                .courseName(s.getCourse().getName())
                .courseCode(s.getCourse().getCode())
                .code(s.getCode())
                .name(s.getName())
                .semester(s.getSemester())
                .credits(s.getCredits())
                .maxMarks(s.getMaxMarks())
                .passingMarks(s.getPassingMarks())
                .type(s.getType().name())
                .status(s.getStatus().name())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
