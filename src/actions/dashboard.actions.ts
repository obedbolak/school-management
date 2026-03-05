"use server";

import prisma from "@/lib/prisma";
import type {
  DashboardStats,
  TeacherDashboardStats,
  StudentDashboardStats,
} from "@/types";
import type { DayOfWeek } from "@prisma/client";

export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const [
    totalStudents,
    totalTeachers,
    totalCourses,
    totalDepartments,
    activeEnrollments,
    totalAttendance,
    presentAttendance,
    pendingFeesResult,
    recentAttendance,
    departments,
  ] = await Promise.all([
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.teacher.count(),
    prisma.course.count(),
    prisma.department.count(),
    prisma.courseEnrollment.count({ where: { enrollmentStatus: "ENROLLED" } }),
    prisma.attendance.count(),
    prisma.attendance.count({ where: { status: { in: ["PRESENT", "LATE"] } } }),
    prisma.feePayment.aggregate({
      where: { status: { in: ["PENDING", "PARTIAL", "OVERDUE"] } },
      _sum: { amount: true, paidAmount: true },
    }),
    prisma.attendance.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        student: true,
        courseAssignment: {
          include: { course: true, teacher: true },
        },
      },
    }),
    prisma.department.findMany({
      include: {
        _count: { select: { students: true, courses: true } },
      },
    }),
  ]);

  const totalFees = Number(pendingFeesResult._sum.amount || 0);
  const paidFees = Number(pendingFeesResult._sum.paidAmount || 0);

  return {
    totalStudents,
    totalTeachers,
    totalCourses,
    totalDepartments,
    activeEnrollments,
    attendanceRate:
      totalAttendance > 0
        ? Math.round((presentAttendance / totalAttendance) * 100)
        : 0,
    pendingFees: totalFees - paidFees,
    recentAttendance,
    departmentBreakdown: departments.map((d) => ({
      name: d.name,
      studentCount: d._count.students,
      courseCount: d._count.courses,
    })),
  };
}

export async function getTeacherDashboardStats(
  teacherId: string,
): Promise<TeacherDashboardStats> {
  const today = new Date();
  const dayNames: DayOfWeek[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  const todayDay = dayNames[today.getDay()];

  const [
    courseAssignments,
    totalAttendance,
    presentAttendance,
    recentAttendance,
    upcomingClasses,
  ] = await Promise.all([
    prisma.courseAssignment.findMany({
      where: { teacherId },
      include: {
        course: { include: { department: true } },
        _count: { select: { enrollments: true, attendances: true } },
        timetableEntries: {
          include: { timeSlot: true, room: true },
        },
      },
    }),
    prisma.attendance.count({
      where: { courseAssignment: { teacherId } },
    }),
    prisma.attendance.count({
      where: {
        courseAssignment: { teacherId },
        status: { in: ["PRESENT", "LATE"] },
      },
    }),
    prisma.attendance.findMany({
      where: { courseAssignment: { teacherId } },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        student: true,
        courseAssignment: {
          include: { course: true, teacher: true },
        },
      },
    }),
    prisma.timetableEntry.findMany({
      where: {
        courseAssignment: { teacherId },
        dayOfWeek: todayDay,
      },
      include: {
        courseAssignment: {
          include: {
            course: true,
            _count: { select: { enrollments: true } },
          },
        },
        timeSlot: true,
        room: true,
      },
      orderBy: { timeSlot: { startTime: "asc" } },
    }),
  ]);

  const totalStudents = courseAssignments.reduce(
    (sum, ca) => sum + (ca._count?.enrollments || 0),
    0,
  );

  return {
    totalCourses: courseAssignments.length,
    totalStudents,
    attendanceRate:
      totalAttendance > 0
        ? Math.round((presentAttendance / totalAttendance) * 100)
        : 0,
    courseAssignments,
    recentAttendance,
    upcomingClasses,
  };
}

export async function getStudentDashboardStats(
  studentId: string,
): Promise<StudentDashboardStats> {
  const today = new Date();
  const dayNames: DayOfWeek[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  const todayDay = dayNames[today.getDay()];

  const [
    enrollments,
    totalAttendance,
    presentAttendance,
    pendingFeesResult,
    recentAttendance,
    todaySchedule,
  ] = await Promise.all([
    prisma.courseEnrollment.findMany({
      where: { studentId, enrollmentStatus: "ENROLLED" },
      include: {
        courseAssignment: {
          include: {
            course: { include: { department: true } },
            teacher: true,
            timetableEntries: {
              include: { timeSlot: true, room: true },
            },
          },
        },
      },
    }),
    prisma.attendance.count({ where: { studentId } }),
    prisma.attendance.count({
      where: { studentId, status: { in: ["PRESENT", "LATE"] } },
    }),
    prisma.feePayment.aggregate({
      where: {
        studentId,
        status: { in: ["PENDING", "PARTIAL", "OVERDUE"] },
      },
      _sum: { amount: true, paidAmount: true },
    }),
    prisma.attendance.findMany({
      where: { studentId },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        student: true,
        courseAssignment: {
          include: { course: true, teacher: true },
        },
      },
    }),
    prisma.timetableEntry.findMany({
      where: {
        dayOfWeek: todayDay,
        courseAssignment: {
          enrollments: {
            some: { studentId, enrollmentStatus: "ENROLLED" },
          },
        },
      },
      include: {
        courseAssignment: {
          include: { course: true, teacher: true },
        },
        timeSlot: true,
        room: true,
      },
      orderBy: { timeSlot: { startTime: "asc" } },
    }),
  ]);

  const totalFees = Number(pendingFeesResult._sum.amount || 0);
  const paidFees = Number(pendingFeesResult._sum.paidAmount || 0);

  return {
    totalCourses: enrollments.length,
    attendanceRate:
      totalAttendance > 0
        ? Math.round((presentAttendance / totalAttendance) * 100)
        : 0,
    pendingFees: totalFees - paidFees,
    enrollments,
    recentAttendance,
    todaySchedule,
  };
}
