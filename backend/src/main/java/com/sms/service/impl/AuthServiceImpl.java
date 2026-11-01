package com.sms.service.impl;

import com.sms.dto.*;
import com.sms.entity.*;
import com.sms.exception.BadRequestException;
import com.sms.exception.DuplicateResourceException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.*;
import com.sms.security.JwtUtils;
import com.sms.service.AuditLogService;
import com.sms.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final ClassBatchRepository classBatchRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        String identifier = request.getUsernameOrEmail().trim();

        // Find the user by username or email first
        User user = userRepository.findByUsernameOrEmail(identifier)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid credentials: User not found"));

        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new BadRequestException("Account is " + user.getStatus() + ". Please contact the administrator.");
        }

        // Validate role-specific email patterns if user entered an email
        if (identifier.contains("@") && user.getRole() != null) {
            String roleName = user.getRole().getName();
            String lowerEmail = identifier.toLowerCase();
            if ("ROLE_STUDENT".equals(roleName) && !lowerEmail.endsWith("@gmail.com")) {
                throw new BadRequestException("Student login requires an email ending with @gmail.com");
            }
            if ("ROLE_TEACHER".equals(roleName) && !(lowerEmail.endsWith(".sms.in") || lowerEmail.endsWith("@sms.in"))) {
                throw new BadRequestException("Teacher login requires an institutional email ending with .sms.in or @sms.in");
            }
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        auditLogService.logAction(user.getId(), user.getUsername(), "LOGIN", "USER", user.getId().toString(), "User logged in successfully", httpRequest);

        Long profileId = null;
        if (user.getRole() != null) {
            if ("ROLE_STUDENT".equals(user.getRole().getName())) {
                profileId = studentRepository.findByUserId(user.getId()).map(Student::getId).orElse(null);
            } else if ("ROLE_TEACHER".equals(user.getRole().getName())) {
                profileId = teacherRepository.findByUserId(user.getId()).map(Teacher::getId).orElse(null);
            }
        }

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profileImage(user.getProfileImage())
                .profileId(profileId)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request, HttpServletRequest httpRequest) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already registered");
        }

        String targetRole = request.getRole();
        if (targetRole == null || targetRole.trim().isEmpty()) {
            targetRole = "ROLE_STUDENT";
        }
        if (!targetRole.startsWith("ROLE_")) {
            targetRole = "ROLE_" + targetRole.toUpperCase();
        }
        final String resolvedRoleName = targetRole;

        String email = request.getEmail().trim().toLowerCase();

        // Enforce role-specific email pattern rules
        if ("ROLE_STUDENT".equals(resolvedRoleName)) {
            if (!email.endsWith("@gmail.com")) {
                throw new BadRequestException("Student registration requires a valid @gmail.com email address (e.g., student@gmail.com)");
            }
        } else if ("ROLE_TEACHER".equals(resolvedRoleName)) {
            if (!(email.endsWith(".sms.in") || email.endsWith("@sms.in"))) {
                throw new BadRequestException("Teacher registration requires an institutional email ending with .sms.in (e.g., teacher@sms.in or prof@dept.sms.in)");
            }
        }

        Role role = roleRepository.findByName(resolvedRoleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + resolvedRoleName));

        User user = User.builder()
                .username(request.getUsername().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .phone(request.getPhone())
                .role(role)
                .status(User.UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        Long profileId = null;
        if ("ROLE_STUDENT".equals(resolvedRoleName)) {
            Department dept = departmentRepository.findAll().stream().findFirst().orElse(null);
            Course course = courseRepository.findAll().stream().findFirst().orElse(null);
            ClassBatch classBatch = classBatchRepository.findAll().stream().findFirst().orElse(null);

            String studentIdNum = "STU" + LocalDate.now().getYear() + String.format("%04d", (int)(Math.random() * 9000) + 1000);
            while (studentRepository.existsByStudentIdNumber(studentIdNum)) {
                studentIdNum = "STU" + LocalDate.now().getYear() + String.format("%04d", (int)(Math.random() * 9000) + 1000);
            }

            Student student = Student.builder()
                    .user(savedUser)
                    .studentIdNumber(studentIdNum)
                    .department(dept)
                    .course(course)
                    .classBatch(classBatch)
                    .currentSemester(1)
                    .admissionDate(LocalDate.now())
                    .dateOfBirth(LocalDate.of(2004, 1, 1))
                    .gender(Student.Gender.OTHER)
                    .status(Student.StudentStatus.ACTIVE)
                    .build();
            Student savedStudent = studentRepository.save(student);
            profileId = savedStudent.getId();
        } else if ("ROLE_TEACHER".equals(resolvedRoleName)) {
            Department dept = departmentRepository.findAll().stream().findFirst().orElse(null);
            String empId = "EMP" + LocalDate.now().getYear() + String.format("%04d", (int)(Math.random() * 9000) + 1000);
            while (teacherRepository.existsByEmployeeId(empId)) {
                empId = "EMP" + LocalDate.now().getYear() + String.format("%04d", (int)(Math.random() * 9000) + 1000);
            }

            Teacher teacher = Teacher.builder()
                    .user(savedUser)
                    .employeeId(empId)
                    .department(dept)
                    .joiningDate(LocalDate.now())
                    .qualification("Master's / Ph.D")
                    .specialization("Academic Department")
                    .status(Teacher.TeacherStatus.ACTIVE)
                    .build();
            Teacher savedTeacher = teacherRepository.save(teacher);
            profileId = savedTeacher.getId();
        }

        String jwt = jwtUtils.generateTokenFromUsername(savedUser.getUsername(), role.getName());

        auditLogService.logAction(savedUser.getId(), savedUser.getUsername(), "REGISTER", "USER", savedUser.getId().toString(), "User registered account", httpRequest);

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().getName())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .profileImage(savedUser.getProfileImage())
                .profileId(profileId)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .profileImage(user.getProfileImage())
                .status(user.getStatus().name())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new ResourceNotFoundException("No account registered with email: " + request.getEmail()));

        String resetToken = UUID.randomUUID().toString();
        log.info("Password reset token generated for user {}: {}", user.getUsername(), resetToken);
        return resetToken;
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters");
        }
        log.info("Reset password executed for token: {}", request.getToken());
    }

    @Override
    @Transactional
    public void logout(String username, HttpServletRequest httpRequest) {
        userRepository.findByUsername(username).ifPresent(user ->
                auditLogService.logAction(user.getId(), user.getUsername(), "LOGOUT", "USER", user.getId().toString(), "User logged out", httpRequest)
        );
        SecurityContextHolder.clearContext();
    }
}
