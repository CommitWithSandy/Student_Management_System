package com.sms.config;

import com.sms.entity.*;
import com.sms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final ClassBatchRepository classBatchRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing system roles and default seed users...");

        // 1. Seed Roles
        List<String> roleNames = Arrays.asList(
                "ROLE_SUPER_ADMIN",
                "ROLE_ADMIN",
                "ROLE_TEACHER",
                "ROLE_STUDENT"
        );

        for (String roleName : roleNames) {
            if (!roleRepository.existsByName(roleName)) {
                Role role = Role.builder()
                        .name(roleName)
                        .description(getRoleDescription(roleName))
                        .build();
                roleRepository.save(role);
                log.info("Created role: {}", roleName);
            }
        }

        // 2. Seed Default Development Users
        seedUserIfMissing("superadmin", "superadmin@example.com", "Admin@123", "ROLE_SUPER_ADMIN", "Super", "Admin");
        seedUserIfMissing("admin", "admin@example.com", "Admin@123", "ROLE_ADMIN", "System", "Admin");
        User teacherUser = seedUserIfMissing("teacher", "teacher@sms.in", "Teacher@123", "ROLE_TEACHER", "Prof. John", "Smith");
        User studentUser = seedUserIfMissing("student", "student@gmail.com", "Student@123", "ROLE_STUDENT", "Sarthak", "Homkar");

        // 3. Ensure Teacher Profile exists for teacherUser
        if (teacherUser != null && teacherRepository.findByUserId(teacherUser.getId()).isEmpty()) {
            Department dept = departmentRepository.findAll().stream().findFirst().orElse(null);
            Teacher teacher = Teacher.builder()
                    .user(teacherUser)
                    .employeeId("EMP2026001")
                    .department(dept)
                    .qualification("Ph.D in Computer Science")
                    .specialization("Cloud & Distributed Systems")
                    .joiningDate(LocalDate.of(2022, 8, 1))
                    .status(Teacher.TeacherStatus.ACTIVE)
                    .build();
            teacherRepository.save(teacher);
            log.info("Created initial Teacher profile for user: {}", teacherUser.getUsername());
        }

        // 4. Ensure Student Profile exists for studentUser
        if (studentUser != null && studentRepository.findByUserId(studentUser.getId()).isEmpty()) {
            Department dept = departmentRepository.findAll().stream().findFirst().orElse(null);
            Course course = courseRepository.findAll().stream().findFirst().orElse(null);
            ClassBatch classBatch = classBatchRepository.findAll().stream().findFirst().orElse(null);

            Student student = Student.builder()
                    .user(studentUser)
                    .studentIdNumber("STU2026001")
                    .department(dept)
                    .course(course)
                    .classBatch(classBatch)
                    .currentSemester(1)
                    .admissionDate(LocalDate.of(2026, 7, 1))
                    .dateOfBirth(LocalDate.of(2004, 5, 15))
                    .gender(Student.Gender.MALE)
                    .bloodGroup("O+")
                    .status(Student.StudentStatus.ACTIVE)
                    .build();
            studentRepository.save(student);
            log.info("Created initial Student profile for user: {}", studentUser.getUsername());
        }

        log.info("Data initialization check completed successfully.");
    }

    private User seedUserIfMissing(String username, String email, String rawPassword, String roleName, String firstName, String lastName) {
        User existingUser = userRepository.findByUsernameOrEmail(username).orElse(null);
        if (existingUser != null) {
            // Update email if it's the old example.com seed
            if (!existingUser.getEmail().equals(email) && !userRepository.existsByEmail(email)) {
                existingUser.setEmail(email);
                userRepository.save(existingUser);
            }
            return existingUser;
        }

        if (!userRepository.existsByEmail(email) && !userRepository.existsByUsername(username)) {
            Role role = roleRepository.findByName(roleName).orElse(null);
            if (role != null) {
                User user = User.builder()
                        .username(username)
                        .email(email)
                        .password(passwordEncoder.encode(rawPassword))
                        .role(role)
                        .firstName(firstName)
                        .lastName(lastName)
                        .status(User.UserStatus.ACTIVE)
                        .phone("+91 9876543210")
                        .build();
                User saved = userRepository.save(user);
                log.info("Seeded default account: {} [{}] with role {}", email, username, roleName);
                return saved;
            }
        }
        return userRepository.findByEmail(email).orElse(null);
    }

    private String getRoleDescription(String roleName) {
        return switch (roleName) {
            case "ROLE_SUPER_ADMIN" -> "Institutional Super Administrator with full system control";
            case "ROLE_ADMIN" -> "Administrator managing courses, students, teachers, and exams";
            case "ROLE_TEACHER" -> "Faculty member managing classes, attendance, marks, and assignments";
            case "ROLE_STUDENT" -> "Enrolled student accessing personal academic records and timetable";
            default -> "System role";
        };
    }
}
