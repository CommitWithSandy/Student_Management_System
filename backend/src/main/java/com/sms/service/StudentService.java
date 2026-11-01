package com.sms.service;

import com.sms.dto.PagedResponse;
import com.sms.dto.StudentDto;
import com.sms.entity.*;
import com.sms.exception.DuplicateResourceException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final ClassBatchRepository classBatchRepository;
    private final SubjectRepository subjectRepository;
    private final StudentSubjectRepository studentSubjectRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public PagedResponse<StudentDto> getAllStudents(
            int page, int size, String search, Long departmentId, Long courseId, Long classId, String status
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Student.StudentStatus studentStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                studentStatus = Student.StudentStatus.valueOf(status.toUpperCase());
            } catch (Exception ignored) {}
        }

        Page<Student> students = studentRepository.searchStudents(
                search != null && !search.trim().isEmpty() ? search.trim() : null,
                departmentId,
                courseId,
                classId,
                studentStatus,
                pageable
        );

        List<StudentDto> dtos = students.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PagedResponse.of(dtos, students.getNumber(), students.getSize(), students.getTotalElements(), students.getTotalPages(), students.isLast());
    }

    @Transactional(readOnly = true)
    public StudentDto getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        return mapToDto(student);
    }

    @Transactional(readOnly = true)
    public StudentDto getStudentByUserId(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + userId));
        return mapToDto(student);
    }

    @Transactional
    public StudentDto createStudent(StudentDto dto) {
        String studentIdNum;
        if (dto.getStudentIdNumber() != null && !dto.getStudentIdNumber().trim().isEmpty()) {
            studentIdNum = dto.getStudentIdNumber().trim().toUpperCase();
        } else {
            studentIdNum = "STU" + java.time.LocalDate.now().getYear() + String.format("%04d", (int)(Math.random() * 9000) + 1000);
        }

        if (studentRepository.existsByStudentIdNumber(studentIdNum)) {
            studentIdNum = "STU" + java.time.LocalDate.now().getYear() + String.format("%04d", (int)(Math.random() * 9000) + 1000);
        }

        String email = dto.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email '" + email + "' is already registered");
        }

        String username = studentIdNum.toLowerCase();
        if (userRepository.existsByUsername(username)) {
            username = email.split("@")[0] + "_" + System.currentTimeMillis() % 1000;
        }

        Role role = roleRepository.findByName("ROLE_STUDENT")
                .orElseThrow(() -> new ResourceNotFoundException("Role ROLE_STUDENT not found"));

        String rawPassword = dto.getTemporaryPassword() != null && !dto.getTemporaryPassword().trim().isEmpty()
                ? dto.getTemporaryPassword()
                : "Student@123";

        // 1. Create User
        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .firstName(dto.getFirstName().trim())
                .lastName(dto.getLastName().trim())
                .phone(dto.getPhone())
                .profileImage(dto.getProfileImage())
                .status(User.UserStatus.ACTIVE)
                .build();
        User savedUser = userRepository.save(user);

        // 2. Fetch Academic Relationships
        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", dto.getDepartmentId()));

        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", dto.getCourseId()));

        ClassBatch classBatch = null;
        if (dto.getClassId() != null) {
            classBatch = classBatchRepository.findById(dto.getClassId()).orElse(null);
        }

        int semester = dto.getCurrentSemester() != null ? dto.getCurrentSemester() : (classBatch != null ? classBatch.getSemester() : 1);

        // 3. Create Student Entity
        Student student = Student.builder()
                .user(savedUser)
                .studentIdNumber(studentIdNum)
                .department(department)
                .course(course)
                .classBatch(classBatch)
                .currentSemester(semester)
                .admissionDate(dto.getAdmissionDate())
                .dateOfBirth(dto.getDateOfBirth())
                .gender(Student.Gender.valueOf(dto.getGender().toUpperCase()))
                .bloodGroup(dto.getBloodGroup())
                .address(dto.getAddress())
                .city(dto.getCity())
                .state(dto.getState())
                .postalCode(dto.getPostalCode())
                .emergencyContactName(dto.getEmergencyContactName())
                .emergencyContactPhone(dto.getEmergencyContactPhone())
                .status(Student.StudentStatus.ACTIVE)
                .build();

        Student savedStudent = studentRepository.save(student);

        // 4. Auto-enroll student into subjects for this course & semester (PHASE 14 requirement)
        List<Subject> subjects = subjectRepository.findByCourseIdAndSemester(course.getId(), semester);
        String academicYear = classBatch != null ? classBatch.getAcademicYear() : "2026-2027";
        for (Subject sub : subjects) {
            if (!studentSubjectRepository.existsByStudentIdAndSubjectId(savedStudent.getId(), sub.getId())) {
                StudentSubject enrollment = StudentSubject.builder()
                        .student(savedStudent)
                        .subject(sub)
                        .academicYear(academicYear)
                        .semester(semester)
                        .status(StudentSubject.EnrollmentStatus.ENROLLED)
                        .build();
                studentSubjectRepository.save(enrollment);
            }
        }

        auditLogService.logAction(savedUser.getId(), savedUser.getUsername(), "STUDENT_CREATED", "STUDENT", savedStudent.getId().toString(), "Enrolled student: " + studentIdNum, null);

        return mapToDto(savedStudent);
    }

    @Transactional
    public StudentDto updateStudent(Long id, StudentDto dto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        User user = student.getUser();
        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName().trim());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName().trim());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getProfileImage() != null) user.setProfileImage(dto.getProfileImage());

        if (dto.getEmail() != null && !dto.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail().trim())) {
                throw new DuplicateResourceException("Email already in use: " + dto.getEmail());
            }
            user.setEmail(dto.getEmail().trim().toLowerCase());
        }
        userRepository.save(user);

        if (dto.getDepartmentId() != null && !dto.getDepartmentId().equals(student.getDepartment().getId())) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", dto.getDepartmentId()));
            student.setDepartment(department);
        }

        if (dto.getCourseId() != null && !dto.getCourseId().equals(student.getCourse().getId())) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course", "id", dto.getCourseId()));
            student.setCourse(course);
        }

        if (dto.getClassId() != null) {
            ClassBatch classBatch = classBatchRepository.findById(dto.getClassId()).orElse(null);
            student.setClassBatch(classBatch);
        }

        if (dto.getCurrentSemester() != null) student.setCurrentSemester(dto.getCurrentSemester());
        if (dto.getDateOfBirth() != null) student.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getGender() != null) student.setGender(Student.Gender.valueOf(dto.getGender().toUpperCase()));
        if (dto.getBloodGroup() != null) student.setBloodGroup(dto.getBloodGroup());
        if (dto.getAddress() != null) student.setAddress(dto.getAddress());
        if (dto.getCity() != null) student.setCity(dto.getCity());
        if (dto.getState() != null) student.setState(dto.getState());
        if (dto.getPostalCode() != null) student.setPostalCode(dto.getPostalCode());
        if (dto.getEmergencyContactName() != null) student.setEmergencyContactName(dto.getEmergencyContactName());
        if (dto.getEmergencyContactPhone() != null) student.setEmergencyContactPhone(dto.getEmergencyContactPhone());

        if (dto.getStatus() != null) {
            student.setStatus(Student.StudentStatus.valueOf(dto.getStatus().toUpperCase()));
        }

        auditLogService.logAction(user.getId(), user.getUsername(), "STUDENT_UPDATED", "STUDENT", student.getId().toString(), "Updated profile: " + student.getStudentIdNumber(), null);

        return mapToDto(studentRepository.save(student));
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        // Soft delete / archive
        student.setStatus(Student.StudentStatus.INACTIVE);
        student.getUser().setStatus(User.UserStatus.INACTIVE);
        userRepository.save(student.getUser());
        studentRepository.save(student);

        auditLogService.logAction(student.getUser().getId(), student.getUser().getUsername(), "STUDENT_DEACTIVATED", "STUDENT", student.getId().toString(), "Deactivated student: " + student.getStudentIdNumber(), null);
    }

    private StudentDto mapToDto(Student s) {
        return StudentDto.builder()
                .id(s.getId())
                .userId(s.getUser().getId())
                .studentIdNumber(s.getStudentIdNumber())
                .firstName(s.getUser().getFirstName())
                .lastName(s.getUser().getLastName())
                .fullName(s.getUser().getFullName())
                .email(s.getUser().getEmail())
                .phone(s.getUser().getPhone())
                .departmentId(s.getDepartment().getId())
                .departmentName(s.getDepartment().getName())
                .courseId(s.getCourse().getId())
                .courseName(s.getCourse().getName())
                .classId(s.getClassBatch() != null ? s.getClassBatch().getId() : null)
                .className(s.getClassBatch() != null ? s.getClassBatch().getDisplayName() : null)
                .currentSemester(s.getCurrentSemester())
                .admissionDate(s.getAdmissionDate())
                .dateOfBirth(s.getDateOfBirth())
                .gender(s.getGender().name())
                .bloodGroup(s.getBloodGroup())
                .address(s.getAddress())
                .city(s.getCity())
                .state(s.getState())
                .postalCode(s.getPostalCode())
                .emergencyContactName(s.getEmergencyContactName())
                .emergencyContactPhone(s.getEmergencyContactPhone())
                .status(s.getStatus().name())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
