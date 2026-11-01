# Entity Relationship (ER) Documentation & Diagrams

## Entity Relationship Overview

The Student Management System uses a 3NF normalized relational schema designed for institutional scalability and referential integrity.

```mermaid
erDiagram
    ROLES ||--o{ USERS : "assigned to"
    ROLES ||--o{ ROLE_PERMISSIONS : "contains"
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : "grouped in"
    
    USERS ||--o| TEACHERS : "profiles"
    USERS ||--o| STUDENTS : "profiles"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ AUDIT_LOGS : "triggers"

    DEPARTMENTS ||--o{ COURSES : "offers"
    DEPARTMENTS ||--o{ TEACHERS : "employs"
    DEPARTMENTS ||--o{ STUDENTS : "enrolls"

    COURSES ||--o{ CLASSES : "has batches"
    COURSES ||--o{ SUBJECTS : "teaches"
    COURSES ||--o{ STUDENTS : "has"

    CLASSES ||--o{ STUDENTS : "contains"
    CLASSES ||--o{ TEACHER_SUBJECTS : "schedules"
    CLASSES ||--o{ TIMETABLES : "scheduled in"
    CLASSES ||--o{ ATTENDANCE : "tracked for"
    CLASSES ||--o{ ASSIGNMENTS : "assigned to"

    TEACHERS ||--o{ TEACHER_SUBJECTS : "assigned to"
    SUBJECTS ||--o{ TEACHER_SUBJECTS : "taught in"

    STUDENTS ||--o{ STUDENT_SUBJECTS : "enrolled in"
    SUBJECTS ||--o{ STUDENT_SUBJECTS : "taken by"

    ATTENDANCE ||--o{ ATTENDANCE_RECORDS : "has entries"
    STUDENTS ||--o{ ATTENDANCE_RECORDS : "marked in"

    EXAMS ||--o{ EXAM_SUBJECTS : "schedules"
    SUBJECTS ||--o{ EXAM_SUBJECTS : "tested in"

    EXAM_SUBJECTS ||--o{ MARKS : "graded in"
    STUDENTS ||--o{ MARKS : "scored by"

    EXAMS ||--o{ RESULTS : "evaluates"
    STUDENTS ||--o{ RESULTS : "receives"

    FEE_STRUCTURES ||--o{ STUDENT_FEES : "invoiced as"
    STUDENTS ||--o{ STUDENT_FEES : "billed to"
    STUDENT_FEES ||--o{ FEE_PAYMENTS : "paid via"

    ASSIGNMENTS ||--o{ ASSIGNMENT_SUBMISSIONS : "collected from"
    STUDENTS ||--o{ ASSIGNMENT_SUBMISSIONS : "submits"
```

## Key Entities & Relationship Rules
1. **Users & Profiles**: `users` is the authentication principal. One-to-One with `students` and `teachers`. Deleting a user cascades to profile, but business records retain academic history.
2. **Attendance Integrity**: Composite unique key `(class_id, subject_id, attendance_date)` guarantees only one roll-call session per subject per date per class.
3. **Marks Integrity**: `(exam_subject_id, student_id)` composite unique key prevents duplicate score records.
4. **Fees Structure**: Distinct `fee_structures` per course/semester, generating individual `student_fees` ledgers with transactional `fee_payments` tracking.
5. **Timetable Conflict Avoidance**: Room, Teacher, and Class indexed by `(day_of_week, start_time)` to enforce conflict-free scheduling.
