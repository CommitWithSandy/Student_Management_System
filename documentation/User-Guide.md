# Student Management System - User & Workflow Guide

## 1. System Roles & Access Portals

### Super Admin
- Full access to institutional settings, administrator accounts, global audit logs, and reports.
- Ability to monitor security, review user activities, and manage platform permissions.

### Admin
- Primary academic operator.
- Configures departments, courses, classes, and subjects.
- Enrolls students and registers teaching staff.
- Defines fee structures and logs fee receipts.
- Publishes institutional exams and official grade results.

### Teacher
- Manages assigned classes and subject rosters.
- Performs daily roll-call attendance with instant absent/late calculations.
- Enters examination marks with bounds-checking.
- Posts homework assignments and reviews student submissions.
- Broadcasts departmental announcements.

### Student
- Interactive personal academic dashboard.
- Monitors subject-wise and overall attendance percentage with shortage warnings (< 75%).
- Views weekly class timetable and classroom assignments.
- Downloads course materials and assignment prompts.
- Submits completed assignments online.
- Checks upcoming exam timetables, marks, published grade cards, and fee payment histories.

---

## 2. Institutional Onboarding Workflow
```
1. Admin logs into system
2. Admin creates Departments (e.g., Computer Science and Engineering)
3. Admin creates Courses (e.g., MCA, 4 Semesters)
4. Admin creates Classes/Batches (e.g., MCA 2026-2028 Semester 1 Div A)
5. Admin creates Subjects (e.g., MCA101 Java, MCA102 DBMS)
6. Admin registers Teachers:
   - Assigns to Department
   - Assigns Institutional Email (must end with .sms.in, e.g. teacher@sms.in)
   - Selects Multiple Specializations from the 80+ global catalog (or adds custom)
   - Credentials (login username/email and default password) are generated automatically
7. Admin assigns Teachers to Subjects for Class Div A
8. Admin registers Students:
   - Personal Email (must end with @gmail.com)
   - Enrolls student into Class Div A
   - Generates Student ID and portal credentials
```

> [!IMPORTANT]
> **Account Provisioning**: Public self-registration is disabled. Students and Teachers receive their verified credentials directly from the Administrator upon enrollment or appointment. Login occurs on the unified page at `/login`.

## 3. Daily Academic Workflow
```
1. Teacher logs in and sees today's scheduled classes
2. Teacher opens Attendance Module -> Selects Class & Subject -> Takes Roll Call
3. Teacher posts an Assignment with deadline and attachment
4. Student logs in -> Sees Assignment notification -> Downloads file -> Submits solution
5. Teacher grades submission -> Leaves feedback
```

## 4. Examination & Results Workflow
```
1. Admin or Teacher schedules Examination (e.g. Midterm / Semester End)
2. Exam subjects and dates are published to Student dashboard
3. Teacher enters marks for their subject
4. Admin reviews grade curve and publishes Result
5. Student views / downloads printable result scorecard
```
