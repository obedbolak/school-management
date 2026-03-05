// src/actions/attendance.actions.ts

"use server";

import prisma from "@/lib/prisma";
import type { AttendanceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function markAttendance(data: {
  classId: string;
  teacherId: string;
  date: Date;
  records: { studentId: string; status: AttendanceStatus }[];
}) {
  // 👇 Normalize the date to midnight UTC to prevent timezone issues
  const attendanceDate = new Date(data.date);
  attendanceDate.setHours(0, 0, 0, 0);

  // Use a transaction for atomicity
  const results = await prisma.$transaction(
    data.records.map((record) =>
      prisma.attendance.upsert({
        where: {
          studentId_courseAssignmentId_date: {
            studentId: record.studentId,
            courseAssignmentId: data.classId,
            date: attendanceDate,
          },
        },
        update: {
          status: record.status,
        },
        create: {
          studentId: record.studentId,
          courseAssignmentId: data.classId,
          date: attendanceDate,
          status: record.status,
        },
      }),
    ),
  );

  revalidatePath("/teacher/attendance");
  revalidatePath("/dashboard/attendance");

  return results;
}

export async function getAttendanceByDate(date: Date | string) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  // Normalize to date-only (strip time)
  const normalizedDate = new Date(dateObj.toISOString().split("T")[0]);

  return prisma.attendance.findMany({
    where: {
      date: normalizedDate,
    },
    include: {
      student: {
        include: {
          department: true,
        },
      },
      courseAssignment: {
        include: {
          course: true,
          teacher: true,
        },
      },
    },
    orderBy: [
      { courseAssignment: { course: { code: "asc" } } },
      { student: { lastName: "asc" } },
    ],
  });
}

export async function getAttendanceByCourse(
  courseAssignmentId: string,
  date?: string,
) {
  return prisma.attendance.findMany({
    where: {
      courseAssignmentId,
      ...(date && { date: new Date(date) }),
    },
    include: {
      student: true,
      courseAssignment: {
        include: { course: true, teacher: true },
      },
    },
    orderBy: [{ date: "desc" }, { student: { lastName: "asc" } }],
  });
}

export async function getAttendanceByStudent(studentId: string) {
  return prisma.attendance.findMany({
    where: { studentId },
    include: {
      courseAssignment: {
        include: { course: true, teacher: true },
      },
    },
    orderBy: { date: "desc" },
  });
}

export async function getAttendanceStats(courseAssignmentId: string) {
  const [total, present, late, absent, excused, sick] = await Promise.all([
    prisma.attendance.count({ where: { courseAssignmentId } }),
    prisma.attendance.count({
      where: { courseAssignmentId, status: "PRESENT" },
    }),
    prisma.attendance.count({ where: { courseAssignmentId, status: "LATE" } }),
    prisma.attendance.count({
      where: { courseAssignmentId, status: "ABSENT" },
    }),
    prisma.attendance.count({
      where: { courseAssignmentId, status: "EXCUSED" },
    }),
    prisma.attendance.count({ where: { courseAssignmentId, status: "SICK" } }),
  ]);

  return { total, present, late, absent, excused, sick };
}

export async function getAttendanceDates(courseAssignmentId: string) {
  const dates = await prisma.attendance.findMany({
    where: { courseAssignmentId },
    select: { date: true },
    distinct: ["date"],
    orderBy: { date: "desc" },
  });
  return dates.map((d) => d.date);
}
