// src/app/(teacher-portal)/teacher/courses/[id]/page.tsx

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { serialize } from "@/lib/serialize";

export default async function TeacherCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // 👇 First check if the ID is valid before querying
  if (!id || typeof id !== "string") {
    redirect("/teacher/courses");
  }

  // 👇 Use findFirst instead of findUnique to avoid strict ID matching issues
  const courseAssignmentRaw = await prisma.courseAssignment.findFirst({
    where: {
      id,
      // 👇 Also verify this teacher owns this course assignment
      teacher: {
        userId: session.user.id,
      },
    },
    include: {
      course: { include: { department: true } },
      teacher: true,
      enrollments: {
        where: { enrollmentStatus: "ENROLLED" },
        include: {
          student: { include: { department: true } },
        },
        orderBy: { student: { lastName: "asc" } },
      },
      timetableEntries: {
        include: { timeSlot: true, room: true },
      },
      _count: {
        select: { enrollments: true, attendances: true },
      },
    },
  });

  if (!courseAssignmentRaw) redirect("/teacher/courses");

  const courseAssignment = serialize(courseAssignmentRaw);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {courseAssignment.course?.code} — {courseAssignment.course?.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          {courseAssignment.course?.department?.name} • Level{" "}
          {courseAssignment.course?.level} •{" "}
          {courseAssignment.course?.creditHours} Credits
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {courseAssignment.academicYear} • {courseAssignment.semester} Semester
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courseAssignment._count?.enrollments || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Attendance Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courseAssignment._count?.attendances || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              {courseAssignment.timetableEntries?.length > 0 ? (
                courseAssignment.timetableEntries.map((t: any) => (
                  <div key={t.id}>
                    {t.dayOfWeek.charAt(0) + t.dayOfWeek.slice(1).toLowerCase()}{" "}
                    {t.timeSlot?.startTime}-{t.timeSlot?.endTime}
                    {t.room && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {t.room.name}
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No schedule set</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students</CardTitle>
          <CardDescription>
            {courseAssignment.enrollments?.length || 0} students currently
            enrolled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Matric No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseAssignment.enrollments?.length > 0 ? (
                courseAssignment.enrollments.map(
                  (enrollment: any, index: number) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {enrollment.student?.matricNo}
                      </TableCell>
                      <TableCell className="font-medium">
                        {enrollment.student?.firstName}{" "}
                        {enrollment.student?.lastName}
                      </TableCell>
                      <TableCell>
                        {enrollment.student?.department?.name || "—"}
                      </TableCell>
                      <TableCell>{enrollment.student?.level}</TableCell>
                      <TableCell>
                        <Badge variant="default">Enrolled</Badge>
                      </TableCell>
                    </TableRow>
                  ),
                )
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No students enrolled yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
