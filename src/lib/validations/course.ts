import { z } from "zod";

export const courseSchema = z.object({
  code: z.string().min(2, "Course code is required").max(20),
  name: z.string().min(2, "Course name is required").max(200),
  description: z.string().optional(),
  creditHours: z.coerce.number().min(1).max(10).default(3),
  level: z.coerce.number().min(100).max(900).default(100),
  departmentId: z.string().optional(),
});

export const courseAssignmentSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  semester: z.enum(["FIRST", "SECOND", "SUMMER"]),
});

export const courseEnrollmentSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  courseAssignmentId: z.string().min(1, "Course assignment is required"),
});

export const timetableEntrySchema = z.object({
  courseAssignmentId: z.string().min(1, "Course assignment is required"),
  dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
  timeSlotId: z.string().min(1, "Time slot is required"),
  roomId: z.string().optional(),
  academicYear: z.string().min(1, "Academic year is required"),
  semester: z.enum(["FIRST", "SECOND", "SUMMER"]),
});

export const roomSchema = z.object({
  name: z.string().min(1, "Room name is required").max(100),
  building: z.string().optional(),
  capacity: z.coerce.number().optional(),
  type: z.string().optional(),
});

export const timeSlotSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:MM"),
  label: z.string().min(1, "Label is required").max(50),
});

export type CourseFormData = z.infer<typeof courseSchema>;
export type CourseAssignmentFormData = z.infer<typeof courseAssignmentSchema>;
export type CourseEnrollmentFormData = z.infer<typeof courseEnrollmentSchema>;
export type TimetableEntryFormData = z.infer<typeof timetableEntrySchema>;
export type RoomFormData = z.infer<typeof roomSchema>;
export type TimeSlotFormData = z.infer<typeof timeSlotSchema>;
