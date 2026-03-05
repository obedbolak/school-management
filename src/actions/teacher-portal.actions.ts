"use server";

import prisma from "@/lib/prisma";
import { serialize } from "@/lib/serialize";
import { AttendanceStatus } from "@prisma/client";

export async function getTeacherByUserId(userId: string) {
  const teacher = await prisma.teacher.findUnique({
    where: { userId },
    include: {
      courseAssignments: {
        include: {
          course: { include: { department: true } },
          _count: { select: { enrollments: true } },
          timetableEntries: {
            include: { timeSlot: true, room: true },
          },
        },
      },
    },
  });

  return teacher ? serialize(teacher) : null;
}

export async function getTeacherCourseStudents(courseAssignmentId: string) {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: {
      courseAssignmentId,
      enrollmentStatus: "ENROLLED",
    },
    include: {
      student: {
        include: { department: true },
      },
    },
    orderBy: { student: { lastName: "asc" } },
  });

  return serialize(enrollments);
}

export async function getTeacherCourseAttendance(
  courseAssignmentId: string,
  date?: string,
) {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: {
      courseAssignmentId,
      enrollmentStatus: "ENROLLED",
    },
    include: { student: true },
    orderBy: { student: { lastName: "asc" } },
  });

  let existingAttendance: any[] = [];
  if (date) {
    existingAttendance = await prisma.attendance.findMany({
      where: {
        courseAssignmentId,
        date: new Date(date),
      },
    });
  }

  return serialize({
    students: enrollments.map((e) => e.student),
    attendance: existingAttendance,
  });
}

export async function getTeacherSalary(teacherId: string) {
  const payments = await prisma.salaryPayment.findMany({
    where: { teacherId },
    orderBy: { monthYear: "desc" },
  });

  return serialize(payments);
}

export async function markAttendance(data: {
  classId: string;
  teacherId: string;
  date: Date;
  records: { studentId: string; status: AttendanceStatus }[];
}) {
  const results = [];
  for (const record of data.records) {
    const result = await prisma.attendance.upsert({
      where: {
        studentId_courseAssignmentId_date: {
          studentId: record.studentId,
          courseAssignmentId: data.classId,
          date: data.date,
        },
      },
      update: {
        status: record.status,
      },
      create: {
        studentId: record.studentId,
        courseAssignmentId: data.classId,
        date: data.date,
        status: record.status,
      },
    });
    results.push(result);
  }

  return results;
}
