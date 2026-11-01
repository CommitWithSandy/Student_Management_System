# 🎓 EduTrack Pro — Enterprise Student Management System (SMS)

A complete, production-grade, full-stack Student Management System built for modern educational institutions, universities, and colleges. Engineered with **Spring Boot 3.3**, **React 19**, **TypeScript**, **MySQL 8.0**, and **Spring Security 6 (JWT + BCrypt)**.

---

## 🌟 Key Features & Capabilities

### 1. Role-Based Access Control (RBAC)
- **Super Admin**: System governance, administrators management, dynamic roles & permissions, audit logs, and institutional health monitors.
- **Admin**: Full academic cohort control, department & course structuring, faculty registrations, student admissions, fee structuring & billing, timetable scheduling, exams management, and institutional broadcasting.
- **Faculty / Teacher**: Teaching load management, interactive digital roll call (Present, Absent, Late, Excused), examination paper scheduling, student marks entry with instant range validation, homework assignment management, and student performance review.
- **Student**: Personalized portal with academic profile, class timetable, live attendance percentage metrics with threshold compliance badges, examination schedules, official grade cards & transcripts with GPA calculations, fee invoice dues & online payment recording, and coursework submission.

### 2. Academic Core
- **Departments & Courses**: Multi-year degree configurations with semester schemas and department affiliations.
- **Classes & Cohorts**: Academic year divisions, section allotments, classroom assignments, and max capacity limits.
- **Subject Syllabus**: Theory and practical course modules, academic credit points, minimum passing benchmarks, and max marks.
- **Auto-Enrollment**: Automatically enrolls students into that semester's subjects upon cohort admission.

### 3. Examination, Marks & Results
- Flexible exam terms: `INTERNAL`, `MIDTERM`, `PRACTICAL`, `SEMESTER`, and `FINAL`.
- Subject-wise scheduling with hall allotments, dates, and timings.
- Marks entry sheet with boundary checks (`0 <= marks <= maxMarks`) and absence tracking.
- Automated result calculations: Cumulative percentage, SGPA/CGPA, letter grade (`A+`, `A`, `B+`, `B`, `C`, `P`, `F`), and official publication.

### 4. Financial & Fee Management
- Term-wise fee structure definition with due dates and description.
- Student fee billing ledger tracking Total Due, Paid Amount, Pending Balance, and Status (`PAID`, `PARTIAL`, `UNPAID`, `OVERDUE`).
- Payment collection with multi-mode support (`UPI`, `ONLINE`, `BANK_TRANSFER`, `CASH`, `CHEQUE`), transaction reference tracking, and official printable receipt generation.

### 5. Attendance & Compliance Engine
- Interactive roll call with real-time present rate computation.
- Cumulative summary tracking per student with threshold warning badges:
  - 🟢 **SATISFACTORY**: Attendance $\ge 75\%$
  - 🟡 **WARNING**: Attendance between $60\% - 74\%$
  - 🔴 **CRITICAL**: Attendance $< 60\%$

### 6. Conflict-Free Timetable Scheduler
- Visual weekly calendar grid across Monday through Saturday.
- Tri-factor overlap prevention: Prevents double-booking teachers, classrooms, or student classes at overlapping time slots.

### 7. Coursework, Notices & Documents
- Faculty assignment creation with deadline countdowns, file attachments, and student submission portal.
- Submissions grading drawer with score evaluation and teacher feedback.
- Campus notice board with audience targeting (`ALL`, `STUDENTS`, `TEACHERS`).
- Institutional document repository with category classification and secure reference storage.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Lucide React, React Hook Form, Zod |
| **Backend** | Java 20+, Spring Boot 3.3.4, Spring Web, Spring Data JPA, Hibernate, Spring Security 6, JJWT 0.12.6, Lombok, Jakarta Validation |
| **Database** | MySQL 8.0 (29 Normalized Tables with Foreign Keys, Cascading Rules, and Composite Indexes) |
| **Testing** | JUnit 5, Mockito, Spring Boot Test |
| **Security** | BCrypt Password Hashing, Stateless JWT Bearer Authentication, CORS Protection, Method Security (`@PreAuthorize`) |

---

## 📂 Repository Structure

```
student-management-system/
├── backend/
│   ├── src/main/java/com/sms/
│   │   ├── config/              # SecurityConfig, CorsConfig, DataInitializer
│   │   ├── controller/          # REST API endpoints (Auth, Students, Teachers, Attendance, etc.)
│   │   ├── dto/                 # Request/Response Data Transfer Objects
│   │   ├── entity/              # JPA Domain Entities (20+ entities)
│   │   ├── exception/           # GlobalExceptionHandler & custom exceptions
│   │   ├── repository/          # Spring Data JPA repositories
│   │   ├── security/            # JWT Token Filters, UserDetailsService, AuthEntryPoint
│   │   └── service/             # Transactional Business Logic & Calculations
│   ├── src/main/resources/
│   │   └── application.properties # Environment configuration & DB connection
│   ├── pom.xml                  # Maven dependencies & build lifecycle
│   └── mvnw.cmd                 # Maven wrapper executable
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable ProtectedRoute & UI components
│   │   ├── context/             # AuthContext (token storage & session lifecycle)
│   │   ├── layouts/             # DashboardLayout (responsive sidebar & navbar)
│   │   ├── pages/               # Feature-rich modular pages:
│   │   │   ├── auth/            # LoginPage
│   │   │   ├── dashboard/       # Role-tailored dashboards with Recharts
│   │   │   ├── departments/     # Department management
│   │   │   ├── courses/         # Course & degree management
│   │   │   ├── classes/         # Class cohort & batch management
│   │   │   ├── subjects/        # Syllabus & credit points management
│   │   │   ├── students/        # Student admissions & directory
│   │   │   ├── teachers/        # Faculty registry & load allocation
│   │   │   ├── attendance/      # Roll call session & compliance summary
│   │   │   ├── exams/           # Timetables, papers, and marks entry sheet
│   │   │   ├── fees/            # Fee structures, billing ledger & receipts
│   │   │   ├── timetable/       # Weekly schedule calendar
│   │   │   ├── assignments/     # Coursework, student submission & grading
│   │   │   ├── announcements/   # Notice board broadcast feed
│   │   │   ├── documents/       # Institutional repository
│   │   │   ├── audit/           # Immutable security audit logs
│   │   │   └── student/         # Profile & official grade card view
│   │   ├── services/            # Axios API clients & endpoints
│   │   ├── types/               # TypeScript data definitions & DTO interfaces
│   │   ├── App.tsx              # Router configuration
│   │   └── index.css            # Tailored design system, dark palette, glassmorphism
│   ├── package.json
│   └── vite.config.ts
│
├── database/
│   ├── schema.sql               # Normalized DDL script (29 tables)
│   └── seed.sql                 # Development seed data
├── documentation/
│   ├── Architecture.md          # Full architectural blueprint
│   ├── ER-Diagram.md            # Entity-Relationship diagram in Mermaid
│   ├── Database-Schema.md       # Detailed table schemas, indexes, and constraints
│   ├── API-Documentation.md     # Complete REST API reference
│   └── User-Guide.md            # Step-by-step role guides
├── .env.example                 # Environment configuration template
└── README.md                    # Project manual
```

---

## 🔑 Default Development Credentials

The system comes pre-seeded with accounts for all roles:

| Role | Email Address | Password | Permissions Summary |
|---|---|---|---|
| **Super Admin** | `superadmin@example.com` | `Admin@123` | Full system access, audit trails, user administration |
| **Administrator** | `admin@example.com` | `Admin@123` | Academics, cohorts, admissions, fees, exams, broadcasts |
| **Faculty / Teacher** | `teacher@sms.in` | `Teacher@123` | Assigned classes, roll call attendance, grading, homework |
| **Student** | `student@gmail.com` | `Student@123` | Personal profile, attendance, results, fees, coursework |

> [!NOTE]
> **Institutional Account Policy**: Student and Faculty accounts are pre-provisioned directly by the Institutional Administration during enrollment or hiring. Public self-registration is disabled for data integrity.
> - **Student Logins**: Enforced with personal `@gmail.com` email addresses.
> - **Teacher Logins**: Enforced with institutional `.sms.in` email addresses (e.g., `teacher@sms.in` or `prof@dept.sms.in`).

---

## 🌐 Worldwide Faculty Specializations System
When registering or editing faculty members in the **Faculty & Teachers** portal, administrators can select multiple specializations from a comprehensive, categorized catalog covering **80+ global disciplines**:
- **Computer Science & AI**: Artificial Intelligence, Machine Learning, Deep Learning, Data Science, Cyber Security, Cloud Computing, Distributed Systems, IoT, Blockchain, Quantum Computing, Full-Stack Web, etc.
- **Information Technology**: Enterprise IT Architecture, Database Administration, Cyber Defense, Business Intelligence.
- **Electrical & Electronics**: VLSI Design, Digital Signal Processing, Smart Grids, Renewable Energy, 5G/6G RF Engineering, Robotics, Power Electronics & EV Drives.
- **Mechanical & Aerospace**: Thermal Engineering, CFD, CAD/CAM, Mechatronics, Automotive & EV, Materials Science, Aerospace & Propulsion, FEA.
- **Civil & Environmental**: Structural Engineering, Geotechnical, Transportation, Environmental Systems, Water Resources, Urban Planning, GIS.
- **Bio, Chemical & Medical**: Biochemical Engineering, Bioinformatics, Genomics, Pharmaceuticals, Microbiology, Immunology, Public Health & Epidemiology.
- **Business & Management**: Strategic Management, Corporate Finance, FinTech, Marketing Strategy, Supply Chain, Business Analytics, Entrepreneurship.
- **Mathematics & Sciences**: Applied Mathematics, Probability & Statistics, Condensed Matter Physics, Astrophysics, Photonics, Organic Chemistry.
- **Humanities, Social Sciences & Law**: Corporate Law, Cyber Law & IPR, International Law, Public Policy, Economics & Econometrics, Cognitive Science.
- **Design & Architecture**: UI/UX & Product Design, Sustainable Architecture, Game Development & AR/VR, Industrial Design.
- **Custom Specializations**: If a faculty member has a niche specialization not listed, administrators can type in the search bar and click `+ Add Custom: "..."` to save it immediately.

---

## 🚀 Getting Started Locally

### Prerequisites
1. **Java JDK 17+ LTS** (or 20+) installed and available on PATH.
2. **Node.js v18+** & **npm v9+**.
3. **MySQL 8.0** service running locally on port `3306`.

---

### Step 1: Database Setup
Execute the initialization scripts using MySQL client:
```powershell
# Using MySQL command line
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS sms_db;"
mysql -u root -p sms_db < database/schema.sql
mysql -u root -p sms_db < database/seed.sql
```

---

### Step 2: Run the Unified Application (One Command)
The frontend and backend are completely connected and bundled together. You **do NOT need to run frontend and backend separately**!

Simply run one of the following from the root directory:

#### Option A: Quick Batch Script (Windows)
Double-click `run.bat` or execute in PowerShell / CMD:
```powershell
.\run.bat
```

#### Option B: PowerShell Script
```powershell
.\run.ps1
```

#### Option C: Maven Command
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

#### Option D: Root npm script
```powershell
npm start
```

*Maven will automatically build the React Vite frontend and serve both the frontend and REST APIs unified at **`http://localhost:8080`**.*

Open your browser and navigate to:
👉 **[http://localhost:8080](http://localhost:8080)**

---

### Optional: Running Frontend in Standalone Vite Dev Mode (with Hot Reloading)
If you specifically want instant frontend Hot Module Replacement (HMR) during frontend UI redesign, you can optionally run the Vite dev server separately:
```powershell
cd frontend
npm run dev
```
*(Vite is pre-configured with a reverse proxy that automatically forwards `/api` and `/uploads` requests directly to `http://localhost:8080`).*

---

## 🧪 Testing

### Automated Unit Tests
Run backend JUnit & Mockito unit tests:
```powershell
cd backend
.\mvnw.cmd test -Dtest=AcademicServiceTests
```

### Production Build Validation
Verify zero lint and bundling errors:
```powershell
cd frontend
npm run build
```

---

## 🔒 Security & Best Practices
- **Password Security**: Never stored as plaintext; encrypted using BCrypt (`BCryptPasswordEncoder` with strength factor 12).
- **Stateless Authorization**: JWT authentication with HS256 algorithm and expiration validation.
- **Auditing**: Sensitive transactions (grading, attendance, student admissions) are logged into the `audit_logs` table with timestamp and IP address.
- **Data Integrity**: Enforced via cascading foreign keys, unique constraint indexes (`class + subject + date`), and transaction rollback boundaries (`@Transactional`).

---

## 📄 License
This project is licensed under the MIT License — free for educational and commercial institutional use.
