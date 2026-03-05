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
  CalendarCheck,
  CreditCard,
  BookOpen,
  AlertTriangle,
  Clock,
  MapPin,
  Building2,
  GraduationCap,
} from "lucide-react";
import { format } from "date-fns";
import type { DayOfWeek } from "@prisma/client";

export default async function StudentDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: { department: true },
  });

  if (!student) redirect("/login");

  // Get today's day name
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

  const [
    enrollments,
    attendanceStats,
    feeStats,
    todaySchedule,
    recentAttendance,
  ] = await Promise.all([
    prisma.courseEnrollment.count({
      where: { studentId: student.id, enrollmentStatus: "ENROLLED" },
    }),
    prisma.attendance.groupBy({
      by: ["status"],
      where: { studentId: student.id },
      _count: { status: true },
    }),
    prisma.feePayment.aggregate({
      where: { studentId: student.id },
      _sum: { amount: true, paidAmount: true },
      _count: true,
    }),
    prisma.timetableEntry.findMany({
      where: {
        dayOfWeek: todayDay,
        courseAssignment: {
          enrollments: {
            some: {
              studentId: student.id,
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
      orderBy: { timeSlot: { startTime: "asc" } },
    }),
    prisma.attendance.findMany({
      where: { studentId: student.id },
      take: 5,
      orderBy: { date: "desc" },
      include: {
        courseAssignment: {
          include: { course: true },
        },
      },
    }),
  ]);

  const totalAttendance = attendanceStats.reduce(
    (sum, s) => sum + s._count.status,
    0,
  );
  const presentCount =
    (attendanceStats.find((s) => s.status === "PRESENT")?._count.status ?? 0) +
    (attendanceStats.find((s) => s.status === "LATE")?._count.status ?? 0);
  const attendancePercentage =
    totalAttendance > 0
      ? ((presentCount / totalAttendance) * 100).toFixed(1)
      : "N/A";

  const totalFees = Number(feeStats._sum.amount ?? 0);
  const totalPaid = Number(feeStats._sum.paidAmount ?? 0);
  const outstanding = totalFees - totalPaid;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GraduationCap className="h-8 w-8" />
          Welcome, {student.firstName} {student.lastName}
        </h1>
        <p className="text-muted-foreground">
          {student.department
            ? `${student.department.code} — ${student.department.name}`
            : "No department"}{" "}
          • Level {student.level}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled this semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                Number(attendancePercentage) >= 75
                  ? "text-green-600"
                  : attendancePercentage === "N/A"
                    ? ""
                    : "text-red-600"
              }`}
            >
              {attendancePercentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              {presentCount}/{totalAttendance} sessions attended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPaid.toLocaleString()} FCFA
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                outstanding > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {outstanding.toLocaleString()} FCFA
            </div>
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
                  const teacher = entry.courseAssignment?.teacher;

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
                          {teacher && (
                            <p className="text-xs text-muted-foreground">
                              {teacher.title} {teacher.lastName}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">
                          {entry.timeSlot?.startTime}-{entry.timeSlot?.endTime}
                        </Badge>
                      </div>
                      {entry.room && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {entry.room.name}
                            {entry.room.building && ` • ${entry.room.building}`}
                          </span>
                        </div>
                      )}
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
                        {record.courseAssignment?.course?.code || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
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
    </div>
  );
}
