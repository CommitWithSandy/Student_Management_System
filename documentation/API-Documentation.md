# Student Management System - REST API Specification

## Base URL
`http://localhost:8080/api`

## Standard Response Structure
### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Paginated Success Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [ ... ],
  "page": 0,
  "size": 10,
  "totalElements": 48,
  "totalPages": 5
}
```

### Error Response
```json
{
  "success": false,
  "message": "Specific error description",
  "data": null,
  "timestamp": "2026-10-25T19:56:00Z",
  "path": "/api/endpoint"
}
```

---

## 1. Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate credentials, returns JWT bearer token and user role payload.
- `POST /api/auth/register`: Public registration (for students/teachers if enabled).
- `GET /api/auth/me`: Current authenticated user profile with roles and permissions.
- `POST /api/auth/forgot-password`: Issues a secure password reset token.
- `POST /api/auth/reset-password`: Resets password using token.
- `POST /api/auth/logout`: Clears authentication session context.

## 2. Departments (`/api/departments`)
- `GET /api/departments`: List with search and status filter.
- `GET /api/departments/{id}`: Detailed department view.
- `POST /api/departments`: Create department [Admin/Super Admin].
- `PUT /api/departments/{id}`: Update department [Admin/Super Admin].
- `DELETE /api/departments/{id}`: Remove department if no courses reference it.

## 3. Courses (`/api/courses`)
- `GET /api/courses`: List courses, filter by department or status.
- `GET /api/courses/{id}`: Single course details.
- `POST /api/courses`: Create course [Admin].
- `PUT /api/courses/{id}`: Update course [Admin].
- `DELETE /api/courses/{id}`: Delete course [Admin].

## 4. Classes (`/api/classes`)
- `GET /api/classes`: Filter by course, academic year, semester.
- `GET /api/classes/{id}`: Class details with assigned teacher and student count.
- `POST /api/classes`: Create class batch [Admin].
- `PUT /api/classes/{id}`: Update class batch [Admin].
- `DELETE /api/classes/{id}`: Delete class batch [Admin].

## 5. Subjects (`/api/subjects`)
- `GET /api/subjects`: Filter by course and semester.
- `POST /api/subjects`: Create subject [Admin].
- `PUT /api/subjects/{id}`: Update subject [Admin].
- `DELETE /api/subjects/{id}`: Delete subject [Admin].

## 6. Students (`/api/students`)
- `GET /api/students`: Server-side paginated list with search, department, course, class, status filters.
- `GET /api/students/{id}`: Comprehensive profile (academic, attendance, fees, marks).
- `POST /api/students`: Create student with user credentials [Admin].
- `PUT /api/students/{id}`: Update profile [Admin/Super Admin].
- `DELETE /api/students/{id}`: Soft delete / archive student [Admin].
- `GET /api/students/{id}/attendance`: Student's attendance records and percentages.
- `GET /api/students/{id}/results`: Student's exam marks and report cards.
- `GET /api/students/{id}/fees`: Student's billing history.

## 7. Teachers (`/api/teachers`)
- `GET /api/teachers`: List teachers with department and specialization filters.
- `GET /api/teachers/{id}`: Profile with assigned classes and subjects.
- `POST /api/teachers`: Register teacher [Admin].
- `PUT /api/teachers/{id}`: Update teacher details [Admin].
- `DELETE /api/teachers/{id}`: Delete teacher [Admin].
- `POST /api/teachers/assign-subject`: Assign teacher to subject and class.

## 8. Attendance (`/api/attendance`)
- `GET /api/attendance/session`: Get attendance list for class, subject, and date.
- `POST /api/attendance`: Submit or update attendance roll call [Teacher/Admin].
- `GET /api/attendance/student/{studentId}`: Student attendance report and summary.
- `GET /api/attendance/class/{classId}`: Class attendance metrics.

## 9. Examination & Marks (`/api/exams`, `/api/marks`, `/api/results`)
- `GET /api/exams`: List exams by course and semester.
- `POST /api/exams`: Schedule exam [Admin/Teacher].
- `GET /api/marks/exam-subject/{id}`: Get student marks for subject evaluation.
- `POST /api/marks`: Save student marks [Teacher/Admin].
- `POST /api/results/publish/{examId}`: Calculate and publish official results [Admin].
- `GET /api/results/student/{studentId}`: Student result records.

## 10. Fees Management (`/api/fees`)
- `GET /api/fees/structures`: List active fee structures.
- `POST /api/fees/structures`: Create fee structure [Admin].
- `GET /api/fees/student/{studentId}`: Student fees breakdown.
- `POST /api/fees/pay`: Record payment transaction and generate receipt [Admin].

## 11. Timetable, Assignments, Announcements & Notifications
- `/api/timetable`: Weekly schedule conflict-checked CRUD.
- `/api/assignments`: File attachment uploads and student submissions.
- `/api/announcements`: Targeted bulletins.
- `/api/notifications`: Real-time user alert feed and read-receipt toggles.
- `/api/documents`: Document vault with access permissions.
- `/api/reports`: PDF and CSV export endpoints.
- `/api/audit-logs`: Institutional accountability logs.
