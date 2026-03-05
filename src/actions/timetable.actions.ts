// src/actions/timetable.actions.ts

"use server";

import prisma from "@/lib/prisma";
import { serialize } from "@/lib/serialize";
import { revalidatePath } from "next/cache";
import type {
  TimetableEntryFormData,
  RoomFormData,
  TimeSlotFormData,
} from "@/lib/validations/course";

export async function getTimetableEntries(filters?: {
  academicYear?: string;
  semester?: "FIRST" | "SECOND" | "SUMMER";
  level?: number;
  departmentId?: string;
}) {
  // 👇 Build course filter properly so both level AND department work together
  const courseFilter: Record<string, any> = {};
  if (filters?.level) courseFilter.level = filters.level;
  if (filters?.departmentId) courseFilter.departmentId = filters.departmentId;

  const entries = await prisma.timetableEntry.findMany({
    where: {
      ...(filters?.academicYear && { academicYear: filters.academicYear }),
      ...(filters?.semester && { semester: filters.semester }),
      ...(Object.keys(courseFilter).length > 0 && {
        courseAssignment: {
          course: courseFilter,
        },
      }),
    },
    include: {
      courseAssignment: {
        include: {
          course: { include: { department: true } },
          teacher: true,
        },
      },
      timeSlot: true,
      room: true,
    },
    orderBy: [{ dayOfWeek: "asc" }, { timeSlot: { startTime: "asc" } }],
  });

  return serialize(entries);
}

export async function getStudentTimetable(studentId: string) {
  const entries = await prisma.timetableEntry.findMany({
    where: {
      courseAssignment: {
        enrollments: {
          some: {
            studentId,
            enrollmentStatus: "ENROLLED",
          },
        },
      },
    },
    include: {
      courseAssignment: {
        include: {
          course: true,
          teacher: true,
        },
      },
      timeSlot: true,
      room: true,
    },
    orderBy: [{ dayOfWeek: "asc" }, { timeSlot: { startTime: "asc" } }],
  });

  return serialize(entries);
}

export async function getTeacherTimetable(teacherId: string) {
  const entries = await prisma.timetableEntry.findMany({
    where: {
      courseAssignment: {
        teacherId,
      },
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
    orderBy: [{ dayOfWeek: "asc" }, { timeSlot: { startTime: "asc" } }],
  });

  return serialize(entries);
}

export async function createTimetableEntry(data: TimetableEntryFormData) {
  if (data.roomId) {
    const roomConflict = await prisma.timetableEntry.findFirst({
      where: {
        roomId: data.roomId,
        dayOfWeek: data.dayOfWeek,
        timeSlotId: data.timeSlotId,
        academicYear: data.academicYear,
        semester: data.semester,
      },
    });
    if (roomConflict) {
      throw new Error("Room is already booked at this time");
    }
  }

  const assignment = await prisma.courseAssignment.findUnique({
    where: { id: data.courseAssignmentId },
  });
  if (assignment) {
    const teacherConflict = await prisma.timetableEntry.findFirst({
      where: {
        dayOfWeek: data.dayOfWeek,
        timeSlotId: data.timeSlotId,
        academicYear: data.academicYear,
        semester: data.semester,
        courseAssignment: {
          teacherId: assignment.teacherId,
        },
      },
    });
    if (teacherConflict) {
      throw new Error("Teacher already has a class at this time");
    }
  }

  const entry = await prisma.timetableEntry.create({
    data: {
      courseAssignmentId: data.courseAssignmentId,
      dayOfWeek: data.dayOfWeek,
      timeSlotId: data.timeSlotId,
      roomId: data.roomId || null,
      academicYear: data.academicYear,
      semester: data.semester,
    },
  });

  revalidatePath("/dashboard/timetable");

  return entry;
}

export async function deleteTimetableEntry(id: string) {
  await prisma.timetableEntry.delete({ where: { id } });

  revalidatePath("/dashboard/timetable");
}

export async function getRooms() {
  return prisma.room.findMany({
    include: {
      _count: { select: { timetableEntries: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function createRoom(data: RoomFormData) {
  return prisma.room.create({ data });
}

export async function updateRoom(id: string, data: Partial<RoomFormData>) {
  return prisma.room.update({ where: { id }, data });
}

export async function deleteRoom(id: string) {
  return prisma.room.delete({ where: { id } });
}

export async function getTimeSlots() {
  return prisma.timeSlot.findMany({
    orderBy: { startTime: "asc" },
  });
}

export async function createTimeSlot(data: TimeSlotFormData) {
  return prisma.timeSlot.create({ data });
}

export async function deleteTimeSlot(id: string) {
  return prisma.timeSlot.delete({ where: { id } });
}
