# Database Schema Specification

## Database Design Summary
- **Database Engine**: MySQL 8.0 InnoDB
- **Character Set**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`

## Complete Table Specifications

### 1. `roles` & `permissions`
- `roles`: `id` (PK), `name` (UNIQUE), `description`, `created_at`, `updated_at`.
- `permissions`: `id` (PK), `name` (UNIQUE), `module`, `description`, timestamps.
- `role_permissions`: `(role_id, permission_id)` composite primary key with cascade delete.

### 2. `users`
- Core authentication and credentials repository.
- Fields: `id`, `username` (UNIQUE), `email` (UNIQUE), `password` (BCrypt), `role_id` (FK to roles), `first_name`, `last_name`, `phone`, `profile_image`, `status` ('ACTIVE', 'INACTIVE', 'SUSPENDED').
- Indexes: `idx_user_email`, `idx_user_status`.

### 3. Academic Structure: `departments`, `courses`, `classes`, `subjects`
- `departments`: `id`, `code` (UNIQUE), `name`, `description`, `head_user_id` (FK to users), `status`.
- `courses`: `id`, `department_id` (FK), `code` (UNIQUE), `name`, `duration_years`, `total_semesters`, `status`.
- `classes`: `id`, `course_id` (FK), `academic_year`, `semester`, `division`, `section`, `class_teacher_id` (FK), `room_number`, `max_capacity`, `status`.
  - UNIQUE: `(course_id, academic_year, semester, division)`.
- `subjects`: `id`, `course_id` (FK), `code` (UNIQUE), `name`, `semester`, `credits`, `max_marks`, `passing_marks`, `type` ('THEORY', 'PRACTICAL'), `status`.

### 4. Profiles & Assignments
- `teachers`: `id`, `user_id` (FK UNIQUE), `employee_id` (UNIQUE), `department_id` (FK), `qualification`, `specialization` (VARCHAR(500) supporting comma-separated multi-choice global specializations), `joining_date`, `status`.
  - *Email Policy*: Institutional address ending with `.sms.in` or `@sms.in`.
- `students`: `id`, `user_id` (FK UNIQUE), `student_id_number` (UNIQUE), `department_id` (FK), `course_id` (FK), `class_id` (FK), `current_semester`, `admission_date`, `date_of_birth`, `gender`, `blood_group`, `address`, `city`, `state`, `postal_code`, `emergency_contact_name`, `emergency_contact_phone`, `status`.
  - *Email Policy*: Personal address ending with `@gmail.com`.
- `teacher_subjects`: `(id, teacher_id, subject_id, class_id, academic_year)`. UNIQUE composite key prevents duplicate assignment.
- `student_subjects`: `(id, student_id, subject_id, academic_year, semester, status)`.

### 5. Academic Performance & Operations
- `attendance`: roll call header for `(class_id, subject_id, attendance_date)`.
- `attendance_records`: individual student attendance state: `'PRESENT'`, `'ABSENT'`, `'LATE'`, `'EXCUSED'`.
- `exams` & `exam_subjects`: schedule, max marks, passing marks, room allocation.
- `marks`: recorded marks per `(exam_subject_id, student_id)` with absent flag and remarks.
- `results`: calculated totals, percentage, grade ('A+', 'A', 'B', etc.), GPA, pass/fail status, publishing flag.

### 6. Administration & Governance
- `fee_structures`: total fee dues per course and academic semester.
- `student_fees`: billing ledger tracking paid and pending balances with status (`PAID`, `PARTIAL`, `UNPAID`, `OVERDUE`).
- `fee_payments`: individual transactions, mode (`CASH`, `UPI`, `BANK_TRANSFER`, `ONLINE`), receipt numbers.
- `timetables`: weekly period allocations avoiding classroom, teacher, or class overlaps.
- `assignments` & `assignment_submissions`: files, deadlines, evaluations, scores.
- `announcements`: targeted broadcasts (`ALL`, `STUDENTS`, `TEACHERS`, `COURSE`, `CLASS`).
- `notifications`: unread alerts for events, grades, exams, and fees.
- `documents`: categorized file metadata storage.
- `audit_logs`: security and data modification trail.
