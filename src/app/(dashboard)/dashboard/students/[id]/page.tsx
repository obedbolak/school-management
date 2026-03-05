import { getStudentById } from "@/actions/student.actions";
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
import { format } from "date-fns";
import {
  GraduationCap,
  User,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  Clock,
  MapPin,
} from "lucide-react";

const statusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PRESENT: "default",
  ABSENT: "destructive",
  LATE: "outline",
  EXCUSED: "secondary",
  SICK: "secondary",
};

const feeStatusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PAID: "default",
  PENDING: "secondary",
  PARTIAL: "outline",
  OVERDUE: "destructive",
};

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudentById(id);

  if (!student) redirect("/dashboard/students");

  const totalFees =
    student.feePayments?.reduce((sum, f) => sum + Number(f.amount), 0) || 0;
  const totalPaid =
    student.feePayments?.reduce((sum, f) => sum + Number(f.paidAmount), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GraduationCap className="h-8 w-8" />
          {student.firstName} {student.lastName}
        </h1>
        <p className="text-muted-foreground mt-1">
          {student.matricNo} • {student.department?.name || "No Department"} •
          Level {student.level}
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={student.status === "ACTIVE" ? "default" : "destructive"}
            >
              {student.status}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Courses Enrolled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {student.enrollments?.length || 0}
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
              {student._count?.attendances || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Fee Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalFees - totalPaid > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {(totalFees - totalPaid).toLocaleString()} FCFA
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Matric Number</p>
              <p className="font-mono font-bold">{student.matricNo}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p>{format(new Date(student.dateOfBirth), "PP")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p>{student.gender || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p>{student.phone || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p>{student.user?.email || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p>{student.address || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p>{student.department?.name || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Parent/Guardian</p>
              <p>
                {student.parent
                  ? `${student.parent.firstName} ${student.parent.lastName}`
                  : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Enrolled Courses
          </CardTitle>
          <CardDescription>
            {student.enrollments?.length || 0} courses this semester
          </CardDescription>
        </CardHeader>
        <CardContent>
          {student.enrollments && student.enrollments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Credits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.enrollments.map((enrollment) => {
                  const ca = enrollment.courseAssignment;
                  const course = ca?.course;
                  const teacher = ca?.teacher;
                  const timetable = ca?.timetableEntries || [];

                  return (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-mono font-bold">
                        {course?.code || "—"}
                      </TableCell>
                      <TableCell>{course?.name || "—"}</TableCell>
                      <TableCell>
                        {teacher
                          ? `${teacher.title || ""} ${teacher.firstName} ${teacher.lastName}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {timetable.map((t: any) => (
                            <div
                              key={t.id}
                              className="flex items-center gap-1 text-xs"
                            >
                              <Clock className="h-3 w-3" />
                              <span>
                                {t.dayOfWeek.charAt(0) +
                                  t.dayOfWeek.slice(1).toLowerCase()}{" "}
                                {t.timeSlot?.startTime}-{t.timeSlot?.endTime}
                              </span>
                              {t.room && (
                                <>
                                  <MapPin className="h-3 w-3 ml-1" />
                                  <span>{t.room.name}</span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{course?.creditHours || "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              No courses enrolled
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Recent Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {student.attendances && student.attendances.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.attendances.map((attendance) => (
                  <TableRow key={attendance.id}>
                    <TableCell>
                      {format(new Date(attendance.date), "PP")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {attendance.courseAssignment?.course?.code || "—"}
                      </Badge>{" "}
                      {attendance.courseAssignment?.course?.name || ""}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusColors[attendance.status] || "default"}
                      >
                        {attendance.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {attendance.remarks || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              No attendance records
            </p>
          )}
        </CardContent>
      </Card>

      {/* Fee Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Fee Payments
          </CardTitle>
          <CardDescription>
            Total: {totalFees.toLocaleString()} FCFA • Paid:{" "}
            {totalPaid.toLocaleString()} FCFA • Balance:{" "}
            {(totalFees - totalPaid).toLocaleString()} FCFA
          </CardDescription>
        </CardHeader>
        <CardContent>
          {student.feePayments && student.feePayments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.feePayments.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>{fee.feeType}</TableCell>
                    <TableCell>
                      {Number(fee.amount).toLocaleString()} FCFA
                    </TableCell>
                    <TableCell>
                      {Number(fee.paidAmount).toLocaleString()} FCFA
                    </TableCell>
                    <TableCell>{format(new Date(fee.dueDate), "PP")}</TableCell>
                    <TableCell>
                      <Badge variant={feeStatusColors[fee.status] || "default"}>
                        {fee.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              No fee records
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
