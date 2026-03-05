"use server";

import prisma from "@/lib/prisma";
import type { TeacherFormData } from "@/lib/validations/teacher";
import bcrypt from "bcryptjs";
import { serialize } from "@/lib/serialize";

export async function getTeachers(filters?: {
  search?: string;
  department?: string;
}) {
  const teachers = await prisma.teacher.findMany({
    where: {
      ...(filters?.department && { department: filters.department }),
      ...(filters?.search && {
        OR: [
          {
            firstName: {
              contains: filters.search,
              mode: "insensitive" as const,
            },
          },
          {
            lastName: {
              contains: filters.search,
              mode: "insensitive" as const,
            },
          },
          {
            employeeId: {
              contains: filters.search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    },
    include: {
      user: true,
      courseAssignments: {
        include: {
          course: true,
          _count: { select: { enrollments: true } },
        },
      },
      _count: {
        select: { courseAssignments: true },
      },
    },
    orderBy: { lastName: "asc" },
  });

  return serialize(teachers);
}

export async function getTeacherById(id: string) {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      user: true,
      courseAssignments: {
        include: {
          course: { include: { department: true } },
          enrollments: {
            include: {
              student: { include: { department: true } },
            },
          },
          timetableEntries: {
            include: { timeSlot: true, room: true },
          },
          _count: {
            select: { enrollments: true, attendances: true },
          },
        },
      },
      salaryPayments: {
        orderBy: { monthYear: "desc" },
        take: 12,
      },
    },
  });

  return teacher ? serialize(teacher) : null;
}

export async function createTeacher(data: TeacherFormData) {
  const password = await bcrypt.hash("teacher123", 12);

  const existingTeacher = await prisma.teacher.findUnique({
    where: { employeeId: data.employeeId },
  });

  if (existingTeacher) {
    throw new Error(`Employee ID "${data.employeeId}" already exists`);
  }

  const email =
    data.email?.trim() ||
    `${data.employeeId.toLowerCase().replace(/[^a-z0-9]/g, "")}@university.com`;
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error(`Email "${email}" already exists`);
  }

  return prisma.user.create({
    data: {
      email,
      name: `${data.firstName} ${data.lastName}`,
      password,
      role: "TEACHER",
      teacherProfile: {
        create: {
          employeeId: data.employeeId,
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender as any,
          phone: data.phone || null,
          email: data.email || null,
          department: data.department || null,
          title: data.title || null,
          salaryBase: data.salaryBase || null,
          hireDate: data.hireDate ? new Date(data.hireDate) : null,
        },
      },
    },
    include: { teacherProfile: true },
  });
}

export async function updateTeacher(
  id: string,
  data: Partial<TeacherFormData>,
) {
  return prisma.teacher.update({
    where: { id },
    data: {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.gender && { gender: data.gender as any }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.department !== undefined && { department: data.department }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.salaryBase !== undefined && { salaryBase: data.salaryBase }),
      ...(data.hireDate && { hireDate: new Date(data.hireDate) }),
    },
  });
}

export async function deleteTeacher(id: string) {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (teacher?.userId) {
    await prisma.user.delete({ where: { id: teacher.userId } });
  } else {
    await prisma.teacher.delete({ where: { id } });
  }
}
