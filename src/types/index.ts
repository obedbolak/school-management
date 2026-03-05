import type {
  User,
  Admin,
  Teacher,
  Student,
  Parent,
  Department,
  Course,
  CourseAssignment,
  CourseEnrollment,
  Attendance,
  FeePayment,
  SalaryPayment,
  Room,
  TimeSlot,
  TimetableEntry,
} from "@prisma/client";

export type UserWithProfiles = User & {
  adminProfile?: Admin | null;
  teacherProfile?: TeacherWithCourses | null;
  studentProfile?: StudentWithEnrollments | null;
  parentProfile?: ParentWithChildren | null;
};

export type DepartmentWithRelations = Department & {
  courses?: Course[];
  students?: Student[];
  _count?: {
    courses: number;
    students: number;
  };
};

export type CourseWithRelations = Course & {
  department?: Department | null;
  assignments?: CourseAssignmentWithRelations[];
  _count?: {
    assignments: number;
  };
};

export type CourseAssignmentWithRelations = CourseAssignment & {
  course?: Course & { department?: Department | null };
  teacher?: Teacher;
  enrollments?: CourseEnrollmentWithStudent[];
  timetableEntries?: TimetableEntryWithRelations[];
  attendances?: Attendance[];
  _count?: {
    enrollments: number;
    attendances: number;
  };
};

export type CourseEnrollmentWithStudent = CourseEnrollment & {
  student?: Student;
  courseAssignment?: CourseAssignmentWithRelations;
};

export type CourseEnrollmentWithCourse = CourseEnrollment & {
  courseAssignment?: CourseAssignment & {
    course?: Course & { department?: Department | null };
    teacher?: Teacher;
    timetableEntries?: TimetableEntryWithRelations[];
  };
};

export type TeacherWithCourses = Teacher & {
  user?: User | null;
  courseAssignments?: CourseAssignmentWithRelations[];
  salaryPayments?: SalaryPayment[];
  _count?: {
    courseAssignments: number;
  };
};

export type StudentWithEnrollments = Student & {
  user?: User | null;
  department?: Department | null;
  parent?: Parent | null;
  enrollments?: CourseEnrollmentWithCourse[];
  attendances?: Attendance[];
  feePayments?: FeePayment[];
  _count?: {
    enrollments: number;
    attendances: number;
  };
};

export type ParentWithChildren = Parent & {
  user?: User | null;
  children?: StudentWithEnrollments[];
};

export type AttendanceWithRelations = Attendance & {
  student?: Student;
  courseAssignment?: CourseAssignment & {
    course?: Course;
    teacher?: Teacher;
  };
};

export type TimetableEntryWithRelations = TimetableEntry & {
  courseAssignment?: CourseAssignment & {
    course?: Course;
    teacher?: Teacher;
  };
  timeSlot?: TimeSlot;
  room?: Room | null;
};

export type RoomWithRelations = Room & {
  timetableEntries?: TimetableEntryWithRelations[];
  _count?: {
    timetableEntries: number;
  };
};

export type DashboardStats = {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalDepartments: number;
  activeEnrollments: number;
  attendanceRate: number;
  pendingFees: number;
  recentAttendance: AttendanceWithRelations[];
  departmentBreakdown: {
    name: string;
    studentCount: number;
    courseCount: number;
  }[];
};

export type TeacherDashboardStats = {
  totalCourses: number;
  totalStudents: number;
  attendanceRate: number;
  courseAssignments: CourseAssignmentWithRelations[];
  recentAttendance: AttendanceWithRelations[];
  upcomingClasses: TimetableEntryWithRelations[];
};

export type StudentDashboardStats = {
  totalCourses: number;
  attendanceRate: number;
  pendingFees: number;
  enrollments: CourseEnrollmentWithCourse[];
  recentAttendance: AttendanceWithRelations[];
  todaySchedule: TimetableEntryWithRelations[];
};

export type FeePaymentWithStudent = FeePayment & {
  student?: Student & {
    department?: Department | null;
  };
};

export type SalaryPaymentWithTeacher = SalaryPayment & {
  teacher?: Teacher;
};
