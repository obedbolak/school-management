import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTeacherByUserId } from "@/actions/teacher-portal.actions";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Calendar } from "lucide-react";
import { serialize } from "@/lib/serialize";

export default async function TeacherCoursesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const teacherRaw = await getTeacherByUserId(session.user.id);
  if (!teacherRaw) redirect("/login");

  // Serialize to convert Decimal to number
  const teacher = serialize(teacherRaw);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          My Courses
        </h1>
        <p className="text-muted-foreground mt-1">
          You are teaching {teacher.courseAssignments.length} courses this
          semester
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teacher.courseAssignments.map((ca: any) => (
          <Link key={ca.id} href={`/teacher/courses/${ca.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{ca.course?.code}</CardTitle>
                    <CardDescription>{ca.course?.name}</CardDescription>
                  </div>
                  <Badge>Level {ca.course?.level}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{ca._count?.enrollments || 0} students enrolled</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {ca.academicYear} • {ca.semester} Semester
                  </span>
                </div>
                {ca.timetableEntries && ca.timetableEntries.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    {ca.timetableEntries.map((t: any) => (
                      <div key={t.id}>
                        {t.dayOfWeek.charAt(0) +
                          t.dayOfWeek.slice(1).toLowerCase()}{" "}
                        {t.timeSlot?.startTime}-{t.timeSlot?.endTime}
                        {t.room && ` • ${t.room.name}`}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
