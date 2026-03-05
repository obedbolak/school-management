"use server";

import prisma from "@/lib/prisma";
import type { StudentFormData } from "@/lib/validations/student";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// ─── MATRIC GENERATOR ────────────────────────────────────────────────────────
export async function generateNextMatricNo(
  departmentCode: string,
  level: number,
): Promise<string> {
  const year = new Date().getFullYear();

  const count = await prisma.student.count({
    where: {
      level,
      enrollmentDate: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      },
      ...(departmentCode !== "GEN" && {
        department: {
          code: departmentCode,
        },
      }),
    },
  });

  const serial = String(count + 1).padStart(4, "0"); // 0001, 0002 ...
  return `UNI/${departmentCode}/${year}/${level}/${serial}`;
}

// ─── GET ALL STUDENTS ─────────────────────────────────────────────────────────
export async function getStudents(filters?: {
  search?: string;
  departmentId?: string;
  level?: number;
  status?: string;
}) {
  return prisma.student.findMany({
    where: {
      ...(filters?.status && { status: filters.status as any }),
      ...(filters?.departmentId && { departmentId: filters.departmentId }),
      ...(filters?.level && { level: filters.level }),
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
            matricNo: {
              contains: filters.search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    },
    include: {
      department: true,
      parent: true,
      _count: {
        select: { enrollments: true, attendances: true },
      },
    },
    orderBy: { lastName: "asc" },
  });
}

// ─── GET STUDENT BY ID ────────────────────────────────────────────────────────
export async function getStudentById(id: string) {
  return prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      department: true,
      parent: true,
      enrollments: {
        where: { enrollmentStatus: "ENROLLED" },
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
      },
      attendances: {
        take: 20,
        orderBy: { date: "desc" },
        include: {
          courseAssignment: {
            include: { course: true, teacher: true },
          },
        },
      },
      feePayments: {
        orderBy: { dueDate: "desc" },
      },
      _count: {
        select: { enrollments: true, attendances: true },
      },
    },
  });
}

// ─── CREATE STUDENT ───────────────────────────────────────────────────────────
export async function createStudent(data: StudentFormData) {
  const password = await bcrypt.hash("student123", 12);

  // Always generate matric server-side at save time (safe from race conditions)
  const dept = data.departmentId
    ? await prisma.department.findUnique({
        where: { id: data.departmentId },
        select: { code: true },
      })
    : null;

  const matricNo = await generateNextMatricNo(
    dept?.code ?? "GEN",
    data.level ?? 100,
  );

  const result = await prisma.user.create({
    data: {
      email: data.email || `${matricNo.replace(/\//g, ".")}@university.com`,
      name: `${data.firstName} ${data.lastName}`,
      password,
      role: "STUDENT",
      studentProfile: {
        create: {
          matricNo, // ← always server-generated, form value is just a preview
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: new Date(data.dateOfBirth),
          gender: data.gender as any,
          address: data.address,
          phone: data.phone,
          departmentId: data.departmentId || null,
          level: data.level,
          parentId: data.parentId || null,
        },
      },
    },
    include: { studentProfile: true },
  });

  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard/departments");

  return result;
}

// ─── UPDATE STUDENT ───────────────────────────────────────────────────────────
export async function updateStudent(
  id: string,
  data: Partial<StudentFormData>,
) {
  const result = await prisma.student.update({
    where: { id },
    data: {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
      ...(data.gender && { gender: data.gender as any }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.departmentId !== undefined && {
        departmentId: data.departmentId,
      }),
      ...(data.level && { level: data.level }),
      ...(data.parentId !== undefined && { parentId: data.parentId }),
    },
  });

  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${id}`);
  revalidatePath("/dashboard/departments");

  return result;
}

// ─── DELETE STUDENT ───────────────────────────────────────────────────────────
export async function deleteStudent(id: string) {
  const student = await prisma.student.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (student?.userId) {
    await prisma.user.delete({ where: { id: student.userId } });
  } else {
    await prisma.student.delete({ where: { id } });
  }

  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard/departments");
}
