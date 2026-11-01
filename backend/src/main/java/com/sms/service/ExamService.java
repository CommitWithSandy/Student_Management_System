package com.sms.service;

import com.sms.dto.*;
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
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamSubjectRepository examSubjectRepository;
    private final CourseRepository courseRepository;
    private final ClassBatchRepository classBatchRepository;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final MarkRepository markRepository;
    private final ResultRepository resultRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public PagedResponse<ExamDto> getAllExams(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Exam> exams = examRepository.findAllByOrderByStartDateDesc(pageable);

        List<ExamDto> dtos = exams.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PagedResponse.of(dtos, exams.getNumber(), exams.getSize(), exams.getTotalElements(), exams.getTotalPages(), exams.isLast());
    }

    @Transactional(readOnly = true)
    public List<ExamDto> getExamsByCourse(Long courseId, Integer semester) {
        if (semester != null) {
            return examRepository.findByCourseIdAndSemester(courseId, semester).stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }
        return examRepository.findByCourseId(courseId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExamDto getExamById(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", id));
        return mapToDto(exam);
    }

    @Transactional
    public ExamDto createExam(ExamDto dto, String username) {
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", dto.getCourseId()));

        ClassBatch classBatch = null;
        if (dto.getClassId() != null) {
            classBatch = classBatchRepository.findById(dto.getClassId()).orElse(null);
        }

        User user = userRepository.findByUsername(username).orElse(null);

        Exam exam = Exam.builder()
                .title(dto.getTitle().trim())
                .examType(Exam.ExamType.valueOf(dto.getExamType().toUpperCase()))
                .course(course)
                .classBatch(classBatch)
                .semester(dto.getSemester())
                .academicYear(dto.getAcademicYear().trim())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .isPublished(false)
                .createdBy(user)
                .build();

        Exam savedExam = examRepository.save(exam);

        if (dto.getSubjects() != null && !dto.getSubjects().isEmpty()) {
            for (ExamSubjectDto sDto : dto.getSubjects()) {
                Subject sub = subjectRepository.findById(sDto.getSubjectId())
                        .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", sDto.getSubjectId()));

                ExamSubject es = ExamSubject.builder()
                        .exam(savedExam)
                        .subject(sub)
                        .examDate(sDto.getExamDate())
                        .startTime(sDto.getStartTime())
                        .endTime(sDto.getEndTime())
                        .roomNumber(sDto.getRoomNumber())
                        .maxMarks(sDto.getMaxMarks() != null ? sDto.getMaxMarks() : sub.getMaxMarks())
                        .passingMarks(sDto.getPassingMarks() != null ? sDto.getPassingMarks() : sub.getPassingMarks())
                        .build();

                examSubjectRepository.save(es);
            }
        }

        return getExamById(savedExam.getId());
    }

    @Transactional(readOnly = true)
    public List<MarkEntryDto> getMarksRoster(Long examSubjectId) {
        ExamSubject es = examSubjectRepository.findById(examSubjectId)
                .orElseThrow(() -> new ResourceNotFoundException("ExamSubject", "id", examSubjectId));

        Exam exam = es.getExam();
        List<Student> students;
        if (exam.getClassBatch() != null) {
            students = studentRepository.findByClassBatchId(exam.getClassBatch().getId());
        } else {
            students = studentRepository.findByCourseIdAndCurrentSemester(exam.getCourse().getId(), exam.getSemester());
        }

        Map<Long, Mark> existingMarks = markRepository.findByExamSubjectId(examSubjectId).stream()
                .collect(Collectors.toMap(m -> m.getStudent().getId(), m -> m, (a, b) -> a));

        return students.stream().map(st -> {
            Mark m = existingMarks.get(st.getId());
            return MarkEntryDto.builder()
                    .id(m != null ? m.getId() : null)
                    .examSubjectId(examSubjectId)
                    .studentId(st.getId())
                    .studentName(st.getUser().getFullName())
                    .studentIdNumber(st.getStudentIdNumber())
                    .marksObtained(m != null ? m.getMarksObtained() : BigDecimal.ZERO)
                    .isAbsent(m != null ? m.getIsAbsent() : false)
                    .remarks(m != null ? m.getRemarks() : null)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public void submitMarks(Long examSubjectId, List<MarkEntryDto> entries, String username) {
        ExamSubject es = examSubjectRepository.findById(examSubjectId)
                .orElseThrow(() -> new ResourceNotFoundException("ExamSubject", "id", examSubjectId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Teacher teacher = teacherRepository.findByUserId(user.getId()).orElse(null);
        if (teacher == null) {
            teacher = teacherRepository.findAll().stream().findFirst().orElse(null);
        }
        final Teacher assignedTeacher = teacher;

        for (MarkEntryDto entry : entries) {
            if (entry.getMarksObtained().compareTo(BigDecimal.valueOf(es.getMaxMarks())) > 0) {
                throw new BadRequestException("Marks entered (" + entry.getMarksObtained() + ") cannot exceed maximum marks (" + es.getMaxMarks() + ")");
            }

            Student student = studentRepository.findById(entry.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "id", entry.getStudentId()));

            Mark mark = markRepository.findByExamSubjectIdAndStudentId(examSubjectId, student.getId())
                    .orElseGet(() -> Mark.builder()
                            .examSubject(es)
                            .student(student)
                            .teacher(assignedTeacher)
                            .build());

            mark.setTeacher(assignedTeacher);
            mark.setMarksObtained(entry.getMarksObtained());
            mark.setIsAbsent(entry.getIsAbsent() != null ? entry.getIsAbsent() : false);
            mark.setRemarks(entry.getRemarks());

            markRepository.save(mark);
        }

        auditLogService.logAction(user.getId(), username, "MARKS_RECORDED", "EXAM_SUBJECT", examSubjectId.toString(),
                "Entered marks for exam subject: " + es.getSubject().getName(), null);
    }

    @Transactional
    public void publishResults(Long examId, String username) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", examId));

        User publisher = userRepository.findByUsername(username).orElse(null);

        List<ExamSubject> examSubjects = examSubjectRepository.findByExamId(examId);
        if (examSubjects.isEmpty()) {
            throw new BadRequestException("Cannot publish results: Exam has no subjects assigned");
        }

        List<Student> students;
        if (exam.getClassBatch() != null) {
            students = studentRepository.findByClassBatchId(exam.getClassBatch().getId());
        } else {
            students = studentRepository.findByCourseIdAndCurrentSemester(exam.getCourse().getId(), exam.getSemester());
        }

        for (Student st : students) {
            BigDecimal totalMax = BigDecimal.ZERO;
            BigDecimal totalObtained = BigDecimal.ZERO;
            boolean hasFailed = false;

            for (ExamSubject es : examSubjects) {
                totalMax = totalMax.add(BigDecimal.valueOf(es.getMaxMarks()));
                Optional<Mark> markOpt = markRepository.findByExamSubjectIdAndStudentId(es.getId(), st.getId());
                if (markOpt.isPresent()) {
                    Mark m = markOpt.get();
                    if (m.getIsAbsent() || m.getMarksObtained().compareTo(BigDecimal.valueOf(es.getPassingMarks())) < 0) {
                        hasFailed = true;
                    }
                    totalObtained = totalObtained.add(m.getMarksObtained());
                } else {
                    hasFailed = true;
                }
            }

            BigDecimal percentage = totalMax.compareTo(BigDecimal.ZERO) > 0
                    ? totalObtained.multiply(BigDecimal.valueOf(100)).divide(totalMax, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            String grade = calculateGrade(percentage);
            BigDecimal gpa = calculateGpa(percentage);

            Result result = resultRepository.findByExamIdAndStudentId(examId, st.getId())
                    .orElseGet(() -> Result.builder()
                            .exam(exam)
                            .student(st)
                            .build());

            result.setTotalMaxMarks(totalMax);
            result.setTotalMarksObtained(totalObtained);
            result.setPercentage(percentage);
            result.setGrade(grade);
            result.setGpa(gpa);
            result.setStatus(hasFailed ? Result.ResultStatus.FAIL : Result.ResultStatus.PASS);
            result.setIsPublished(true);
            result.setPublishedDate(LocalDateTime.now());
            result.setPublishedBy(publisher);

            resultRepository.save(result);
        }

        exam.setIsPublished(true);
        examRepository.save(exam);

        auditLogService.logAction(publisher != null ? publisher.getId() : null, username, "RESULT_PUBLISHED", "EXAM", examId.toString(),
                "Published results for: " + exam.getTitle(), null);
    }

    @Transactional(readOnly = true)
    public List<ResultDto> getResultsForExam(Long examId) {
        return resultRepository.findByExamId(examId).stream()
                .map(this::mapResultToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ResultDto> getStudentResults(Long studentId) {
        return resultRepository.findByStudentIdAndIsPublishedTrue(studentId).stream()
                .map(this::mapResultToDto)
                .collect(Collectors.toList());
    }

    private String calculateGrade(BigDecimal percentage) {
        double p = percentage.doubleValue();
        if (p >= 90.0) return "A+";
        if (p >= 80.0) return "A";
        if (p >= 70.0) return "B+";
        if (p >= 60.0) return "B";
        if (p >= 50.0) return "C";
        if (p >= 40.0) return "D";
        return "F";
    }

    private BigDecimal calculateGpa(BigDecimal percentage) {
        double p = percentage.doubleValue();
        double gpa = (p / 10.0);
        return BigDecimal.valueOf(Math.min(10.0, Math.max(0.0, gpa))).setScale(2, RoundingMode.HALF_UP);
    }

    private ExamDto mapToDto(Exam e) {
        List<ExamSubjectDto> subjects = examSubjectRepository.findByExamId(e.getId()).stream()
                .map(es -> ExamSubjectDto.builder()
                        .id(es.getId())
                        .examId(e.getId())
                        .subjectId(es.getSubject().getId())
                        .subjectName(es.getSubject().getName())
                        .subjectCode(es.getSubject().getCode())
                        .examDate(es.getExamDate())
                        .startTime(es.getStartTime())
                        .endTime(es.getEndTime())
                        .roomNumber(es.getRoomNumber())
                        .maxMarks(es.getMaxMarks())
                        .passingMarks(es.getPassingMarks())
                        .build())
                .collect(Collectors.toList());

        return ExamDto.builder()
                .id(e.getId())
                .title(e.getTitle())
                .examType(e.getExamType().name())
                .courseId(e.getCourse().getId())
                .courseName(e.getCourse().getName())
                .classId(e.getClassBatch() != null ? e.getClassBatch().getId() : null)
                .className(e.getClassBatch() != null ? e.getClassBatch().getDisplayName() : null)
                .semester(e.getSemester())
                .academicYear(e.getAcademicYear())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .isPublished(e.getIsPublished())
                .subjects(subjects)
                .createdAt(e.getCreatedAt())
                .build();
    }

    private ResultDto mapResultToDto(Result r) {
        List<ExamSubject> examSubjects = examSubjectRepository.findByExamId(r.getExam().getId());
        List<ResultDto.SubjectScoreDto> scores = examSubjects.stream().map(es -> {
            Optional<Mark> mOpt = markRepository.findByExamSubjectIdAndStudentId(es.getId(), r.getStudent().getId());
            BigDecimal scored = mOpt.map(Mark::getMarksObtained).orElse(BigDecimal.ZERO);
            boolean absent = mOpt.map(Mark::getIsAbsent).orElse(false);
            String st = absent ? "ABSENT" : (scored.compareTo(BigDecimal.valueOf(es.getPassingMarks())) >= 0 ? "PASS" : "FAIL");

            return ResultDto.SubjectScoreDto.builder()
                    .subjectCode(es.getSubject().getCode())
                    .subjectName(es.getSubject().getName())
                    .maxMarks(es.getMaxMarks())
                    .passingMarks(es.getPassingMarks())
                    .marksObtained(scored)
                    .isAbsent(absent)
                    .status(st)
                    .build();
        }).collect(Collectors.toList());

        return ResultDto.builder()
                .id(r.getId())
                .examId(r.getExam().getId())
                .examTitle(r.getExam().getTitle())
                .examType(r.getExam().getExamType().name())
                .studentId(r.getStudent().getId())
                .studentName(r.getStudent().getUser().getFullName())
                .studentIdNumber(r.getStudent().getStudentIdNumber())
                .courseName(r.getStudent().getCourse().getName())
                .semester(r.getExam().getSemester())
                .totalMaxMarks(r.getTotalMaxMarks())
                .totalMarksObtained(r.getTotalMarksObtained())
                .percentage(r.getPercentage())
                .gpa(r.getGpa())
                .grade(r.getGrade())
                .status(r.getStatus().name())
                .isPublished(r.getIsPublished())
                .publishedDate(r.getPublishedDate())
                .subjectScores(scores)
                .build();
    }
}
