// src/app/(teacher-portal)/teacher/attendance/page.tsx

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { getTeacherByUserId } from "@/actions/teacher-portal.actions";
import { TeacherAttendanceWrapper } from "./attendance-wrapper";

export default async function TeacherAttendancePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const teacher = await getTeacherByUserId(session.user.id);
  if (!teacher) redirect("/login");

  // Teacher's course assignments are already included
  // from getTeacherByUserId (you include courseAssignments)
  const assignments = (teacher.courseAssignments || [])
    .filter((assignment) => assignment.course?.department !== null)
    .map((assignment) => ({
      ...assignment,
      course: assignment.course
        ? {
            ...assignment.course,
            department: assignment.course.department || undefined,
          }
        : undefined,
    })) as any[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ClipboardCheck className="h-8 w-8" />
          Mark Attendance
        </h1>
        <p className="text-muted-foreground mt-1">
          Select a course to mark today&apos;s attendance
        </p>
      </div>

      <TeacherAttendanceWrapper
        teacherId={teacher.id}
        assignments={assignments}
      />
    </div>
  );
}
