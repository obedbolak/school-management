import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import {
  ArrowLeft,
  User,
  BookOpen,
  Wallet,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { getTeacherById } from "@/actions/teacher.actions";
import { format } from "date-fns";

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teacher = await getTeacherById(id);

  if (!teacher) notFound();

  const totalStudents =
    teacher.courseAssignments?.reduce(
      (sum, ca) => sum + (ca._count?.enrollments || 0),
      0,
    ) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/teachers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {teacher.title} {teacher.firstName} {teacher.lastName}
          </h1>
          <p className="text-muted-foreground">
            {teacher.employeeId} • {teacher.department || "No Department"}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Courses Teaching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teacher.courseAssignments?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Base Salary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teacher.salaryBase
                ? `${Number(teacher.salaryBase).toLocaleString()} FCFA`
                : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Title</span>
              <span>{teacher.title || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gender</span>
              <span>{teacher.gender || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{teacher.email || teacher.user?.email || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{teacher.phone || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Department</span>
              <span>{teacher.department || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hire Date</span>
              <span>
                {teacher.hireDate
                  ? format(new Date(teacher.hireDate), "PPP")
                  : "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Assigned Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!teacher.courseAssignments ||
            teacher.courseAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No courses assigned
              </p>
            ) : (
              <div className="space-y-4">
                {teacher.courseAssignments.map((ca) => (
                  <div key={ca.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-sm">
                          {ca.course?.code} — {ca.course?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ca.course?.department?.name} • Level{" "}
                          {ca.course?.level} • {ca.course?.creditHours} Credits
                        </p>
                      </div>
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {ca._count?.enrollments || 0}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {ca.academicYear} • {ca.semester} Semester
                    </div>

                    {/* Schedule for this course */}
                    {ca.timetableEntries && ca.timetableEntries.length > 0 && (
                      <div className="space-y-1">
                        {ca.timetableEntries.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>
                              {t.dayOfWeek.charAt(0) +
                                t.dayOfWeek.slice(1).toLowerCase()}{" "}
                              {t.timeSlot?.startTime}-{t.timeSlot?.endTime}
                            </span>
                            {t.room && (
                              <>
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span>{t.room.name}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Students per Course */}
      {teacher.courseAssignments && teacher.courseAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students by Course
            </CardTitle>
            <CardDescription>
              All students enrolled in your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teacher.courseAssignments.map((ca) => (
              <div key={ca.id} className="mb-6 last:mb-0">
                <h3 className="font-bold text-sm mb-2">
                  {ca.course?.code} — {ca.course?.name}
                  <Badge variant="outline" className="ml-2 text-xs">
                    {ca.enrollments?.length || 0} students
                  </Badge>
                </h3>
                {ca.enrollments && ca.enrollments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Matric No</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ca.enrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-mono text-sm">
                            {enrollment.student?.matricNo}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/dashboard/students/${enrollment.student?.id}`}
                              className="text-primary hover:underline"
                            >
                              {enrollment.student?.firstName}{" "}
                              {enrollment.student?.lastName}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {enrollment.student?.department?.name || "—"}
                          </TableCell>
                          <TableCell>{enrollment.student?.level}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No students enrolled
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Salary History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Salary History
          </CardTitle>
          <CardDescription>Monthly salary payments</CardDescription>
        </CardHeader>
        <CardContent>
          {!teacher.salaryPayments || teacher.salaryPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No salary records</p>
          ) : (
            <div className="space-y-3">
              {teacher.salaryPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{payment.monthYear}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(payment.paymentDate), "PP")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{Number(payment.amount).toLocaleString()} FCFA</span>
                    <Badge
                      variant={
                        payment.status === "PAID" ? "default" : "secondary"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
