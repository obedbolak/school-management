// src/app/(dashboard)/dashboard/courses/[id]/page.tsx

import { getCourseById } from "@/actions/course.actions";
import { redirect } from "next/navigation";
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
import { EnrollStudentForm } from "@/components/forms/enroll-student-form";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) redirect("/dashboard/courses");

  // Get the current assignment (first one or most recent)
  const currentAssignment = course.assignments?.[0];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {course.code} — {course.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {course.department?.name} • Level {course.level} •{" "}
            {course.creditHours} Credits
          </p>
          {course.description && (
            <p className="text-sm mt-2">{course.description}</p>
          )}
        </div>

        {/* Enroll Student button - only shows if course has an assignment */}
        {currentAssignment && (
          <EnrollStudentForm
            course={{
              id: course.id,
              code: course.code,
              name: course.name,
              level: course.level,
            }}
            teacher={
              currentAssignment.teacher
                ? {
                    title: currentAssignment.teacher.title || "",
                    firstName: currentAssignment.teacher.firstName,
                    lastName: currentAssignment.teacher.lastName,
                  }
                : undefined
            }
            courseAssignmentId={currentAssignment.id}
          />
        )}
      </div>

      {course.assignments?.map((assignment: any) => (
        <Card key={assignment.id}>
          <CardHeader>
            <CardTitle>
              {assignment.teacher?.title} {assignment.teacher?.firstName}{" "}
              {assignment.teacher?.lastName}
            </CardTitle>
            <CardDescription>
              {assignment.academicYear} • {assignment.semester} Semester •{" "}
              {assignment._count?.enrollments || 0} students
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignment.timetableEntries &&
              assignment.timetableEntries.length > 0 && (
                <div className="mb-4 space-y-1">
                  <p className="text-sm font-medium">Schedule:</p>
                  {assignment.timetableEntries.map((t: any) => (
                    <div key={t.id} className="text-sm text-muted-foreground">
                      {t.dayOfWeek.charAt(0) +
                        t.dayOfWeek.slice(1).toLowerCase()}{" "}
                      {t.timeSlot?.startTime}-{t.timeSlot?.endTime}
                      {t.room && ` • ${t.room.name}`}
                    </div>
                  ))}
                </div>
              )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Matric No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignment.enrollments?.length > 0 ? (
                  assignment.enrollments.map(
                    (enrollment: any, index: number) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {enrollment.student?.matricNo}
                        </TableCell>
                        <TableCell>
                          {enrollment.student?.firstName}{" "}
                          {enrollment.student?.lastName}
                        </TableCell>
                        <TableCell>
                          {enrollment.student?.department?.name || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">
                            {enrollment.enrollmentStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ),
                  )
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
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
      ))}

      {/* Show message if no assignments exist */}
      {(!course.assignments || course.assignments.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">No teacher assigned yet</p>
            <p className="text-sm mt-1">
              Assign a teacher to this course from the courses page to start
              enrolling students.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
