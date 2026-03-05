import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  CalendarCheck,
  DollarSign,
  Clock,
  MapPin,
  GraduationCap,
} from "lucide-react";
import { format } from "date-fns";
import type { DayOfWeek } from "@prisma/client";

export default async function TeacherDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });

  if (!teacher) redirect("/login");

  const dayNames: DayOfWeek[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  const todayDay = dayNames[new Date().getDay()];
  const todayDate = new Date(new Date().toISOString().split("T")[0]);

  const [
    courseAssignments,
    todayAttendanceCount,
    recentSalary,
    todaySchedule,
    recentAttendance,
  ] = await Promise.all([
    prisma.courseAssignment.findMany({
      where: { teacherId: teacher.id },
      include: {
        course: { include: { department: true } },
        _count: { select: { enrollments: true } },
        timetableEntries: {
          include: { timeSlot: true, room: true },
        },
      },
    }),
    prisma.attendance.count({
      where: {
        courseAssignment: { teacherId: teacher.id },
        date: todayDate,
      },
    }),
    prisma.salaryPayment.findFirst({
      where: { teacherId: teacher.id },
      orderBy: { paymentDate: "desc" },
    }),
    prisma.timetableEntry.findMany({
      where: {
        courseAssignment: { teacherId: teacher.id },
        dayOfWeek: todayDay,
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
      orderBy: { timeSlot: { startTime: "asc" } },
    }),
    prisma.attendance.findMany({
      where: { courseAssignment: { teacherId: teacher.id } },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        student: true,
        courseAssignment: { include: { course: true } },
      },
    }),
  ]);

  const totalStudents = courseAssignments.reduce(
    (sum, ca) => sum + (ca._count?.enrollments || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GraduationCap className="h-8 w-8" />
          Welcome, {teacher.title} {teacher.firstName} {teacher.lastName}
        </h1>
        <p className="text-muted-foreground">
          {teacher.department || "No Department"} • Teacher Dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseAssignments.length}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Attendance
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAttendanceCount}</div>
            <p className="text-xs text-muted-foreground">
              Records marked today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Last Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentSalary
                ? `${Number(recentSalary.amount).toLocaleString()} FCFA`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {recentSalary?.monthYear ?? "No payments yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today&apos;s Schedule
            </CardTitle>
            <CardDescription>
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaySchedule.length > 0 ? (
              <div className="space-y-3">
                {todaySchedule.map((entry) => {
                  const course = entry.courseAssignment?.course;

                  return (
                    <div
                      key={entry.id}
                      className="border rounded-lg p-3 space-y-1"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-sm">
                            {course?.code} — {course?.name}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {entry.timeSlot?.startTime}-{entry.timeSlot?.endTime}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {entry.courseAssignment?._count?.enrollments ||
                            0}{" "}
                          students
                        </span>
                        {entry.room && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {entry.room.name}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No classes scheduled for today 🎉
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5" />
              Recent Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAttendance.length > 0 ? (
              <div className="space-y-3">
                {recentAttendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {record.student?.firstName} {record.student?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.courseAssignment?.course?.code} •{" "}
                        {format(new Date(record.date), "PP")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        record.status === "PRESENT"
                          ? "default"
                          : record.status === "ABSENT"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No attendance records yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Courses */}
      <Card>
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
          <CardDescription>
            Click a course to view details and manage students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {courseAssignments.map((ca) => (
              <Link
                key={ca.id}
                href={`/teacher/courses/${ca.id}`}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent transition-colors"
              >
                <div>
                  <p className="font-medium">
                    {ca.course?.code} — {ca.course?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {ca.course?.department?.name} • Level {ca.course?.level} •{" "}
                    {ca.academicYear} {ca.semester}
                  </p>
                  {ca.timetableEntries && ca.timetableEntries.length > 0 && (
                    <div className="flex gap-3 mt-1">
                      {ca.timetableEntries.map((t) => (
                        <span
                          key={t.id}
                          className="text-xs text-muted-foreground"
                        >
                          {t.dayOfWeek.charAt(0) +
                            t.dayOfWeek.slice(1).toLowerCase()}{" "}
                          {t.timeSlot?.startTime}-{t.timeSlot?.endTime}
                          {t.room && ` (${t.room.name})`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Badge variant="secondary">
                  <Users className="h-3 w-3 mr-1" />
                  {ca._count?.enrollments || 0}
                </Badge>
              </Link>
            ))}
            {courseAssignments.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No courses assigned yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
