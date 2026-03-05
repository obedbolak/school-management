import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getStudentEnrollments } from "@/actions/course.actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, User, Clock, MapPin } from "lucide-react";
import { Key } from "react";

export default async function StudentCoursesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  if (!student) redirect("/login");

  const enrollments = await getStudentEnrollments(student.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          My Courses
        </h1>
        <p className="text-muted-foreground mt-1">
          Enrolled in {enrollments.length} courses this semester
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {enrollments.map(
          (enrollment: {
            courseAssignment: any;
            id: Key | null | undefined;
          }) => {
            const ca = enrollment.courseAssignment;
            const course = ca?.course;
            const teacher = ca?.teacher;
            const timetable = ca?.timetableEntries || [];

            return (
              <Card key={enrollment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {course?.code} — {course?.name}
                      </CardTitle>
                      <CardDescription>
                        {(course as any)?.department?.name} • Level{" "}
                        {(course as any)?.level} • {course?.creditHours} Credits
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      Level {(course as any)?.level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {teacher && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {teacher.title} {teacher.firstName} {teacher.lastName}
                      </span>
                    </div>
                  )}
                  {timetable.length > 0 && (
                    <div className="space-y-1">
                      {timetable.map((t: any) => (
                        <div
                          key={t.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {t.dayOfWeek.charAt(0) +
                              t.dayOfWeek.slice(1).toLowerCase()}{" "}
                            {t.timeSlot?.startTime} - {t.timeSlot?.endTime}
                          </span>
                          {t.room && (
                            <>
                              <MapPin className="h-3 w-3 text-muted-foreground ml-2" />
                              <span className="text-muted-foreground">
                                {t.room.name}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          },
        )}
      </div>

      {enrollments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            You are not enrolled in any courses yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
