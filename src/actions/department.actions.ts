"use server";

import prisma from "@/lib/prisma";

export async function getDepartments() {
  return prisma.department.findMany({
    include: {
      _count: {
        select: {
          courses: true,
          students: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getDepartmentById(id: string) {
  return prisma.department.findUnique({
    where: { id },
    include: {
      courses: {
        include: {
          assignments: {
            include: {
              teacher: true,
              _count: { select: { enrollments: true } },
            },
          },
        },
      },
      students: true,
      _count: {
        select: {
          courses: true,
          students: true,
        },
      },
    },
  });
}

export async function createDepartment(data: {
  name: string;
  code: string;
  faculty?: string;
}) {
  return prisma.department.create({ data });
}

export async function updateDepartment(
  id: string,
  data: { name?: string; code?: string; faculty?: string },
) {
  return prisma.department.update({ where: { id }, data });
}

export async function deleteDepartment(id: string) {
  return prisma.department.delete({ where: { id } });
}
