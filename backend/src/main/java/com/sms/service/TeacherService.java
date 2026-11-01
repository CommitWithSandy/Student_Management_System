package com.sms.service;

import com.sms.dto.PagedResponse;
import com.sms.dto.TeacherDto;
import com.sms.dto.TeacherSubjectDto;
import com.sms.entity.*;
import com.sms.exception.DuplicateResourceException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;
    private final ClassBatchRepository classBatchRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public PagedResponse<TeacherDto> getAllTeachers(int page, int size, String search, Long departmentId, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Teacher.TeacherStatus teacherStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                teacherStatus = Teacher.TeacherStatus.valueOf(status.toUpperCase());
            } catch (Exception ignored) {}
        }

        Page<Teacher> teachers = teacherRepository.searchTeachers(
                search != null && !search.trim().isEmpty() ? search.trim() : null,
                departmentId,
                teacherStatus,
                pageable
        );

        List<TeacherDto> dtos = teachers.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PagedResponse.of(dtos, teachers.getNumber(), teachers.getSize(), teachers.getTotalElements(), teachers.getTotalPages(), teachers.isLast());
    }

    @Transactional(readOnly = true)
    public List<TeacherDto> getAllActiveTeachers() {
        return teacherRepository.findAll().stream()
                .filter(t -> t.getStatus() == Teacher.TeacherStatus.ACTIVE)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TeacherDto getTeacherById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));
        return mapToDto(teacher);
    }

    @Transactional(readOnly = true)
    public TeacherDto getTeacherByUserId(Long userId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found for user ID: " + userId));
        return mapToDto(teacher);
    }

    @Transactional
    public TeacherDto createTeacher(TeacherDto dto) {
        String employeeId;
        if (dto.getEmployeeId() != null && !dto.getEmployeeId().trim().isEmpty()) {
            employeeId = dto.getEmployeeId().trim().toUpperCase();
        } else {
            employeeId = "EMP" + String.format("%04d", (int)(Math.random() * 9000) + 1000);
        }

        if (teacherRepository.existsByEmployeeId(employeeId)) {
            employeeId = "EMP" + String.format("%04d", (int)(Math.random() * 9000) + 1000);
        }

        String email = dto.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email '" + email + "' is already registered");
        }

        String username = employeeId.toLowerCase();
        if (userRepository.existsByUsername(username)) {
            username = email.split("@")[0] + "_" + System.currentTimeMillis() % 1000;
        }

        Role role = roleRepository.findByName("ROLE_TEACHER")
                .orElseThrow(() -> new ResourceNotFoundException("Role ROLE_TEACHER not found"));

        String rawPassword = dto.getTemporaryPassword() != null && !dto.getTemporaryPassword().trim().isEmpty()
                ? dto.getTemporaryPassword()
                : "Teacher@123";

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

        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", dto.getDepartmentId()));

        Teacher teacher = Teacher.builder()
                .user(savedUser)
                .employeeId(employeeId)
                .department(department)
                .qualification(dto.getQualification())
                .specialization(dto.getSpecialization())
                .joiningDate(dto.getJoiningDate())
                .status(Teacher.TeacherStatus.ACTIVE)
                .build();

        Teacher savedTeacher = teacherRepository.save(teacher);

        auditLogService.logAction(savedUser.getId(), savedUser.getUsername(), "TEACHER_CREATED", "TEACHER", savedTeacher.getId().toString(), "Added faculty: " + employeeId, null);

        return mapToDto(savedTeacher);
    }

    @Transactional
    public TeacherDto updateTeacher(Long id, TeacherDto dto) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));

        User user = teacher.getUser();
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

        if (dto.getDepartmentId() != null && !dto.getDepartmentId().equals(teacher.getDepartment().getId())) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", dto.getDepartmentId()));
            teacher.setDepartment(department);
        }

        if (dto.getQualification() != null) teacher.setQualification(dto.getQualification());
        if (dto.getSpecialization() != null) teacher.setSpecialization(dto.getSpecialization());
        if (dto.getJoiningDate() != null) teacher.setJoiningDate(dto.getJoiningDate());
        if (dto.getStatus() != null) teacher.setStatus(Teacher.TeacherStatus.valueOf(dto.getStatus().toUpperCase()));

        return mapToDto(teacherRepository.save(teacher));
    }

    @Transactional
    public void deleteTeacher(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", id));
        teacher.setStatus(Teacher.TeacherStatus.INACTIVE);
        teacher.getUser().setStatus(User.UserStatus.INACTIVE);
        userRepository.save(teacher.getUser());
        teacherRepository.save(teacher);
    }

    @Transactional
    public TeacherSubjectDto assignSubjectToTeacher(TeacherSubjectDto dto) {
        Teacher teacher = teacherRepository.findById(dto.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", dto.getTeacherId()));

        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", dto.getSubjectId()));

        ClassBatch classBatch = classBatchRepository.findById(dto.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("ClassBatch", "id", dto.getClassId()));

        if (teacherSubjectRepository.existsByTeacherIdAndSubjectIdAndClassBatchId(teacher.getId(), subject.getId(), classBatch.getId())) {
            throw new DuplicateResourceException("Teacher is already assigned to this subject and class");
        }

        TeacherSubject ts = TeacherSubject.builder()
                .teacher(teacher)
                .subject(subject)
                .classBatch(classBatch)
                .academicYear(dto.getAcademicYear().trim())
                .build();

        TeacherSubject saved = teacherSubjectRepository.save(ts);

        return TeacherSubjectDto.builder()
                .id(saved.getId())
                .teacherId(teacher.getId())
                .teacherName(teacher.getUser().getFullName())
                .subjectId(subject.getId())
                .subjectName(subject.getName())
                .subjectCode(subject.getCode())
                .classId(classBatch.getId())
                .className(classBatch.getDisplayName())
                .academicYear(saved.getAcademicYear())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<TeacherSubjectDto> getTeacherAssignments(Long teacherId) {
        return teacherSubjectRepository.findByTeacherId(teacherId).stream()
                .map(ts -> TeacherSubjectDto.builder()
                        .id(ts.getId())
                        .teacherId(ts.getTeacher().getId())
                        .teacherName(ts.getTeacher().getUser().getFullName())
                        .subjectId(ts.getSubject().getId())
                        .subjectName(ts.getSubject().getName())
                        .subjectCode(ts.getSubject().getCode())
                        .classId(ts.getClassBatch().getId())
                        .className(ts.getClassBatch().getDisplayName())
                        .academicYear(ts.getAcademicYear())
                        .createdAt(ts.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private TeacherDto mapToDto(Teacher t) {
        List<TeacherSubjectDto> assigned = teacherSubjectRepository.findByTeacherId(t.getId()).stream()
                .map(ts -> TeacherSubjectDto.builder()
                        .id(ts.getId())
                        .teacherId(ts.getTeacher().getId())
                        .teacherName(ts.getTeacher().getUser().getFullName())
                        .subjectId(ts.getSubject().getId())
                        .subjectName(ts.getSubject().getName())
                        .subjectCode(ts.getSubject().getCode())
                        .classId(ts.getClassBatch().getId())
                        .className(ts.getClassBatch().getDisplayName())
                        .academicYear(ts.getAcademicYear())
                        .createdAt(ts.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return TeacherDto.builder()
                .id(t.getId())
                .userId(t.getUser().getId())
                .employeeId(t.getEmployeeId())
                .firstName(t.getUser().getFirstName())
                .lastName(t.getUser().getLastName())
                .fullName(t.getUser().getFullName())
                .email(t.getUser().getEmail())
                .phone(t.getUser().getPhone())
                .departmentId(t.getDepartment().getId())
                .departmentName(t.getDepartment().getName())
                .qualification(t.getQualification())
                .specialization(t.getSpecialization())
                .joiningDate(t.getJoiningDate())
                .status(t.getStatus().name())
                .profileImage(t.getUser().getProfileImage())
                .assignedSubjects(assigned)
                .createdAt(t.getCreatedAt())
                .build();
    }
}
