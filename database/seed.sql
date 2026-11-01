-- =============================================================================
-- STUDENT MANAGEMENT SYSTEM (SMS) - SEED DATA
-- Default development credentials:
-- Super Admin: superadmin@example.com / Admin@123
-- Admin:       admin@example.com / Admin@123
-- Teacher:     teacher@example.com / Teacher@123
-- Student:     student@example.com / Student@123
-- BCrypt Hash for 'Admin@123':   $2a$10$w09Z56wK3t5s5aE.5/3Jau33G0QhO87F5x0pC4WlFkY1hYpXQyMbm
-- BCrypt Hash for 'Teacher@123': $2a$10$fVz5ZfU4N2pP3YtM7yZfSuG1D0pL8g7Q4kK5hV8pL2mN1bV4cT3uO
-- BCrypt Hash for 'Student@123': $2a$10$lU7lF2P1rK3tQ7zM9xYfUuF5N1pK4g8Q6mJ3hW7pK9mN3bV5cT4vP
-- Note: Spring Boot DataInitializer also dynamically initializes these users with BCryptPasswordEncoder.
-- =============================================================================

USE sms_db;

-- Insert Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'ROLE_SUPER_ADMIN', 'Super Administrator with full institutional privileges'),
(2, 'ROLE_ADMIN', 'Administrator managing academic and operational workflows'),
(3, 'ROLE_TEACHER', 'Faculty member managing classes, attendance, marks, and assignments'),
(4, 'ROLE_STUDENT', 'Enrolled student accessing personal academics, timetable, and records')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Sample Department
INSERT INTO departments (id, code, name, description, status) VALUES
(1, 'CS', 'Computer Science and Engineering', 'Department of Computer Science and Engineering', 'ACTIVE'),
(2, 'IT', 'Information Technology', 'Department of Information Technology', 'ACTIVE'),
(3, 'ME', 'Mechanical Engineering', 'Department of Mechanical Engineering', 'ACTIVE')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Sample Courses
INSERT INTO courses (id, department_id, code, name, description, duration_years, total_semesters, status) VALUES
(1, 1, 'MCA', 'Master of Computer Applications', 'Postgraduate program in Computer Applications', 2, 4, 'ACTIVE'),
(2, 1, 'BTECH-CS', 'B.Tech Computer Science', 'Undergraduate Engineering Program in CS', 4, 8, 'ACTIVE'),
(3, 2, 'BTECH-IT', 'B.Tech Information Technology', 'Undergraduate Engineering Program in IT', 4, 8, 'ACTIVE')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Sample Classes
INSERT INTO classes (id, course_id, academic_year, semester, division, section, room_number, max_capacity, status) VALUES
(1, 1, '2026-2028', 1, 'A', 'Morning', 'Lab 101', 60, 'ACTIVE'),
(2, 1, '2026-2028', 1, 'B', 'Morning', 'Lab 102', 60, 'ACTIVE'),
(3, 2, '2026-2030', 1, 'A', 'Regular', 'Classroom 201', 60, 'ACTIVE')
ON DUPLICATE KEY UPDATE division = VALUES(division);

-- Sample Subjects
INSERT INTO subjects (id, course_id, code, name, semester, credits, max_marks, passing_marks, type, status) VALUES
(1, 1, 'MCA101', 'Advanced Java Programming', 1, 4, 100, 40, 'THEORY', 'ACTIVE'),
(2, 1, 'MCA102', 'Database Management Systems', 1, 4, 100, 40, 'THEORY', 'ACTIVE'),
(3, 1, 'MCA103', 'Web Technologies & Frameworks', 1, 4, 100, 40, 'THEORY', 'ACTIVE'),
(4, 1, 'MCA104', 'Cloud Computing & DevOps', 1, 3, 100, 40, 'THEORY', 'ACTIVE'),
(5, 1, 'MCA105', 'Java Lab & Practical', 1, 2, 50, 20, 'PRACTICAL', 'ACTIVE')
ON DUPLICATE KEY UPDATE name = VALUES(name);
