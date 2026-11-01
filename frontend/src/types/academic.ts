export interface Department {
  id: number;
  code: string;
  name: string;
  description?: string;
  headUserId?: number;
  headName?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface Course {
  id: number;
  departmentId: number;
  departmentName?: string;
  code: string;
  name: string;
  description?: string;
  durationYears: number;
  totalSemesters: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface ClassBatch {
  id: number;
  courseId: number;
  courseName?: string;
  courseCode?: string;
  academicYear: string;
  semester: number;
  division: string;
  section?: string;
  classTeacherId?: number;
  classTeacherName?: string;
  roomNumber?: string;
  maxCapacity: number;
  studentCount?: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Subject {
  id: number;
  courseId: number;
  courseName?: string;
  code: string;
  name: string;
  semester: number;
  credits: number;
  maxMarks: number;
  passingMarks: number;
  type: 'THEORY' | 'PRACTICAL';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Teacher {
  id: number;
  userId: number;
  employeeId: string;
  fullName: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  departmentId: number;
  departmentName?: string;
  qualification?: string;
  specialization?: string;
  joiningDate?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  profileImage?: string;
}

export interface Student {
  id: number;
  userId: number;
  studentIdNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  departmentId: number;
  departmentName?: string;
  courseId: number;
  courseName?: string;
  classId?: number;
  className?: string;
  currentSemester: number;
  admissionDate: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  address?: string;
  city?: string;
  state?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'SUSPENDED';
  profileImage?: string;
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
}

export interface AttendanceSession {
  id?: number;
  classId: number;
  subjectId: number;
  teacherId?: number;
  attendanceDate: string;
  notes?: string;
  records: AttendanceRecord[];
}

export interface SubjectAttendanceItem {
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  total: number;
  attended: number;
  percentage: number;
}

export interface AttendanceSummary {
  studentId: number;
  studentName: string;
  studentIdNumber?: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  status?: 'SATISFACTORY' | 'WARNING' | 'CRITICAL';
  warningStatus?: string;
  subjectBreakdown?: SubjectAttendanceItem[];
}

export interface Exam {
  id: number;
  title: string;
  examType: 'INTERNAL' | 'MIDTERM' | 'PRACTICAL' | 'SEMESTER' | 'FINAL';
  courseId: number;
  courseName?: string;
  classId?: number;
  className?: string;
  semester: number;
  academicYear: string;
  startDate: string;
  endDate: string;
  isPublished: boolean;
  subjectsCount?: number;
}

export interface ExamSubject {
  id: number;
  examId: number;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  roomNumber?: string;
  maxMarks: number;
  passingMarks: number;
}

export interface StudentMarkEntry {
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  marksObtained: number;
  isAbsent: boolean;
  remarks?: string;
}

export interface ResultItem {
  id: number;
  examId: number;
  examTitle: string;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  totalMaxMarks: number;
  totalMarksObtained: number;
  percentage: number;
  gpa: number;
  grade: string;
  status: 'PASS' | 'FAIL' | 'PENDING';
  isPublished: boolean;
  publishedDate?: string;
}

export interface FeeStructure {
  id: number;
  courseId: number;
  courseName?: string;
  academicYear: string;
  semester: number;
  title: string;
  totalAmount: number;
  dueDate: string;
  description?: string;
}

export interface StudentFeeSummary {
  id: number;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  courseName: string;
  feeTitle: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE';
  dueDate: string;
  payments?: FeePaymentRecord[];
}

export interface FeePaymentRecord {
  id: number;
  studentFeeId: number;
  receiptNumber: string;
  amountPaid: number;
  paymentDate: string;
  paymentMode: 'CASH' | 'CHEQUE' | 'BANK_TRANSFER' | 'ONLINE' | 'UPI';
  transactionReference?: string;
  remarks?: string;
  recordedByName?: string;
}

export interface TimetableEntry {
  id: number;
  classId: number;
  className?: string;
  subjectId: number;
  subjectName: string;
  teacherId: number;
  teacherName: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  startTime: string;
  endTime: string;
  roomNumber: string;
  academicYear: string;
}

export interface Assignment {
  id: number;
  teacherId: number;
  teacherName?: string;
  classId: number;
  className?: string;
  subjectId: number;
  subjectName?: string;
  title: string;
  description: string;
  deadline: string;
  attachmentPath?: string;
  maxPoints: number;
  status: 'PUBLISHED' | 'DRAFT' | 'CLOSED';
  submissionsCount?: number;
}

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  studentId: number;
  studentName?: string;
  studentIdNumber?: string;
  submissionText?: string;
  filePath?: string;
  submittedAt: string;
  status: 'SUBMITTED' | 'LATE' | 'REVIEWED';
  marksAwarded?: number;
  feedback?: string;
}

export interface Announcement {
  id: number;
  title: string;
  description: string;
  targetAudience: 'ALL' | 'STUDENTS' | 'TEACHERS' | 'COURSE' | 'CLASS';
  courseName?: string;
  className?: string;
  publishDate: string;
  expiryDate?: string;
  attachmentPath?: string;
  createdByName?: string;
  isActive: boolean;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'ASSIGNMENT' | 'EXAM' | 'RESULT' | 'FEE' | 'ATTENDANCE' | 'ANNOUNCEMENT' | 'GENERAL';
  referenceId?: number;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalDepartments: number;
  todayAttendancePercentage: number;
  pendingFeesTotal: number;
  upcomingExamsCount: number;
  activeAnnouncementsCount: number;
  monthlyAttendanceChart: { month: string; percentage: number }[];
  departmentDistribution: { name: string; students: number }[];
  feeCollectionChart: { month: string; collected: number; pending: number }[];
}
