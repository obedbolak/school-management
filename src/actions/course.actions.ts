// src/actions/course.actions.ts

"use server";

import prisma from "@/lib/prisma";
import { serialize } from "@/lib/serialize";
import type {
  CourseFormData,
  CourseAssignmentFormData,
  CourseEnrollmentFormData,
} from "@/lib/validations/course";

export async function getCourses(filters?: {
  level?: number;
  departmentId?: string;
  search?: string;
}) {
  return prisma.course.findMany({
    where: {
      ...(filters?.level && { level: filters.level }),
      ...(filters?.departmentId && { departmentId: filters.departmentId }),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" as const } },
          { code: { contains: filters.search, mode: "insensitive" as const } },
        ],
      }),
    },
    include: {
      department: true,
      assignments: {
        include: {
          teacher: true,
          _count: { select: { enrollments: true } },
        },
      },
      _count: { select: { assignments: true } },
    },
    orderBy: [{ level: "asc" }, { code: "asc" }],
  });
}

export async function getCourseById(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      department: true,
      assignments: {
        include: {
          teacher: true,
          enrollments: {
            include: {
              student: {
                include: { department: true },
              },
            },
          },
          timetableEntries: {
            include: {
              timeSlot: true,
              room: true,
            },
          },
          _count: {
            select: { enrollments: true, attendances: true },
          },
        },
      },
    },
  });
}

export async function createCourse(data: CourseFormData) {
  return prisma.course.create({
    data: {
      code: data.code,
      name: data.name,
      description: data.description,
      creditHours: data.creditHours,
      level: data.level,
      departmentId: data.departmentId || null,
    },
  });
}

export async function updateCourse(id: string, data: Partial<CourseFormData>) {
  return prisma.course.update({
    where: { id },
    data,
  });
}

export async function deleteCourse(id: string) {
  return prisma.course.delete({ where: { id } });
}

export async function getCourseAssignments(filters?: {
  teacherId?: string;
  academicYear?: string;
  semester?: "FIRST" | "SECOND" | "SUMMER";
}) {
  const assignments = await prisma.courseAssignment.findMany({
    where: {
      ...(filters?.teacherId && { teacherId: filters.teacherId }),
      ...(filters?.academicYear && { academicYear: filters.academicYear }),
      ...(filters?.semester && { semester: filters.semester }),
    },
    include: {
      course: { include: { department: true } },
      teacher: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { course: { code: "asc" } },
  });

  return serialize(assignments);
}

export async function createCourseAssignment(data: CourseAssignmentFormData) {
  // 👇 Check for duplicate assignment
  const existing = await prisma.courseAssignment.findFirst({
    where: {
      courseId: data.courseId,
      teacherId: data.teacherId,
      academicYear: data.academicYear,
      semester: data.semester,
    },
  });

  if (existing) {
    throw new Error(
      "This teacher is already assigned to this course for this semester",
    );
  }

  return prisma.courseAssignment.create({
    data: {
      courseId: data.courseId,
      teacherId: data.teacherId,
      academicYear: data.academicYear,
      semester: data.semester,
    },
  });
}

export async function deleteCourseAssignment(id: string) {
  return prisma.courseAssignment.delete({ where: { id } });
}

// 👇 Updated with duplicate check
export async function enrollStudent(data: CourseEnrollmentFormData) {
  const existing = await prisma.courseEnrollment.findUnique({
    where: {
      studentId_courseAssignmentId: {
        studentId: data.studentId,
        courseAssignmentId: data.courseAssignmentId,
      },
    },
  });

  if (existing) {
    throw new Error("Student is already enrolled in this course");
  }

  return prisma.courseEnrollment.create({
    data: {
      studentId: data.studentId,
      courseAssignmentId: data.courseAssignmentId,
      enrollmentStatus: "ENROLLED",
    },
  });
}

export async function unenrollStudent(enrollmentId: string) {
  return prisma.courseEnrollment.update({
    where: { id: enrollmentId },
    data: { enrollmentStatus: "DROPPED" },
  });
}

// 👇 NEW — get IDs of already enrolled students (for filtering the dropdown)
export async function getEnrolledStudentIds(courseAssignmentId: string) {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: {
      courseAssignmentId,
      enrollmentStatus: "ENROLLED",
    },
    select: { studentId: true },
  });

  return enrollments.map((e) => e.studentId);
}

export async function getStudentEnrollments(studentId: string) {
  return prisma.courseEnrollment.findMany({
    where: { studentId, enrollmentStatus: "ENROLLED" },
    include: {
      courseAssignment: {
        include: {
          course: { include: { department: true } },
          teacher: true,
          timetableEntries: {
            include: {
              timeSlot: true,
              room: true,
            },
          },
        },
      },
    },
    orderBy: { courseAssignment: { course: { code: "asc" } } },
  });
}

export async function getEnrolledStudents(courseAssignmentId: string) {
  return prisma.courseEnrollment.findMany({
    where: { courseAssignmentId, enrollmentStatus: "ENROLLED" },
    include: {
      student: {
        include: { department: true },
      },
    },
    orderBy: { student: { lastName: "asc" } },
  });
}
