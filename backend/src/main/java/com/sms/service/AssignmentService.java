package com.sms.service;

import com.sms.dto.AssignmentDto;
import com.sms.dto.AssignmentSubmissionDto;
import com.sms.dto.PagedResponse;
import com.sms.entity.*;
import com.sms.exception.BadRequestException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final ClassBatchRepository classBatchRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PagedResponse<AssignmentDto> getAssignmentsForClass(Long classId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Assignment> assignments = assignmentRepository.findByClassBatchIdOrderByDeadlineDesc(classId, pageable);

        List<AssignmentDto> dtos = assignments.getContent().stream()
                .map(this::mapAssignmentToDto)
                .collect(Collectors.toList());

        return PagedResponse.of(dtos, assignments.getNumber(), assignments.getSize(), assignments.getTotalElements(), assignments.getTotalPages(), assignments.isLast());
    }

    @Transactional(readOnly = true)
    public List<AssignmentDto> getAssignmentsByTeacher(Long teacherId) {
        return assignmentRepository.findByTeacherId(teacherId).stream()
                .map(this::mapAssignmentToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AssignmentDto createAssignment(AssignmentDto dto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Teacher teacher = teacherRepository.findByUserId(user.getId()).orElse(null);
        if (teacher == null) {
            teacher = teacherRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new BadRequestException("No faculty member found"));
        }

        ClassBatch classBatch = classBatchRepository.findById(dto.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("ClassBatch", "id", dto.getClassId()));

        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", dto.getSubjectId()));

        Assignment assignment = Assignment.builder()
                .teacher(teacher)
                .classBatch(classBatch)
                .subject(subject)
                .title(dto.getTitle().trim())
                .description(dto.getDescription())
                .deadline(dto.getDeadline())
                .attachmentPath(dto.getAttachmentPath())
                .maxPoints(dto.getMaxPoints() != null ? dto.getMaxPoints() : 100)
                .status(Assignment.AssignmentStatus.PUBLISHED)
                .build();

        return mapAssignmentToDto(assignmentRepository.save(assignment));
    }

    @Transactional
    public AssignmentSubmissionDto submitAssignment(Long assignmentId, Long studentId, String text, String filePath) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", "id", assignmentId));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        LocalDateTime now = LocalDateTime.now();
        AssignmentSubmission.SubmissionStatus status = now.isAfter(assignment.getDeadline())
                ? AssignmentSubmission.SubmissionStatus.LATE
                : AssignmentSubmission.SubmissionStatus.SUBMITTED;

        AssignmentSubmission submission = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId)
                .orElseGet(() -> AssignmentSubmission.builder()
                        .assignment(assignment)
                        .student(student)
                        .build());

        submission.setSubmissionText(text);
        submission.setFilePath(filePath);
        submission.setSubmittedAt(now);
        submission.setStatus(status);

        return mapSubmissionToDto(submissionRepository.save(submission));
    }

    @Transactional
    public AssignmentSubmissionDto gradeSubmission(Long submissionId, BigDecimal marks, String feedback, String graderUsername) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("AssignmentSubmission", "id", submissionId));

        User user = userRepository.findByUsername(graderUsername).orElse(null);
        Teacher grader = user != null ? teacherRepository.findByUserId(user.getId()).orElse(null) : null;

        submission.setMarksAwarded(marks);
        submission.setFeedback(feedback);
        submission.setGradedBy(grader);
        submission.setGradedAt(LocalDateTime.now());
        submission.setStatus(AssignmentSubmission.SubmissionStatus.REVIEWED);

        return mapSubmissionToDto(submissionRepository.save(submission));
    }

    @Transactional(readOnly = true)
    public List<AssignmentSubmissionDto> getSubmissionsForAssignment(Long assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId).stream()
                .map(this::mapSubmissionToDto)
                .collect(Collectors.toList());
    }

    private AssignmentDto mapAssignmentToDto(Assignment a) {
        int count = submissionRepository.findByAssignmentId(a.getId()).size();
        return AssignmentDto.builder()
                .id(a.getId())
                .teacherId(a.getTeacher().getId())
                .teacherName(a.getTeacher().getUser().getFullName())
                .classId(a.getClassBatch().getId())
                .className(a.getClassBatch().getDisplayName())
                .subjectId(a.getSubject().getId())
                .subjectName(a.getSubject().getName())
                .subjectCode(a.getSubject().getCode())
                .title(a.getTitle())
                .description(a.getDescription())
                .deadline(a.getDeadline())
                .attachmentPath(a.getAttachmentPath())
                .maxPoints(a.getMaxPoints())
                .status(a.getStatus().name())
                .submissionsCount(count)
                .createdAt(a.getCreatedAt())
                .build();
    }

    private AssignmentSubmissionDto mapSubmissionToDto(AssignmentSubmission s) {
        return AssignmentSubmissionDto.builder()
                .id(s.getId())
                .assignmentId(s.getAssignment().getId())
                .assignmentTitle(s.getAssignment().getTitle())
                .studentId(s.getStudent().getId())
                .studentName(s.getStudent().getUser().getFullName())
                .studentIdNumber(s.getStudent().getStudentIdNumber())
                .submissionText(s.getSubmissionText())
                .filePath(s.getFilePath())
                .submittedAt(s.getSubmittedAt())
                .status(s.getStatus().name())
                .marksAwarded(s.getMarksAwarded())
                .feedback(s.getFeedback())
                .gradedByName(s.getGradedBy() != null ? s.getGradedBy().getUser().getFullName() : null)
                .gradedAt(s.getGradedAt())
                .build();
    }
}
