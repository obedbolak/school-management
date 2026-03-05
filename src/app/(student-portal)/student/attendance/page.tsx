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
import { ClipboardCheck } from "lucide-react";
import { format } from "date-fns";

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

export default async function StudentAttendancePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Find student profile from user id
  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  if (!student) redirect("/login");

  const attendances = await prisma.attendance.findMany({
    where: { studentId: student.id },
    include: {
      courseAssignment: {
        include: {
          course: true,
          teacher: true,
        },
      },
    },
    orderBy: { date: "desc" },
    take: 50,
  });

  // Calculate stats
  const total = attendances.length;
  const present = attendances.filter((a) => a.status === "PRESENT").length;
  const late = attendances.filter((a) => a.status === "LATE").length;
  const absent = attendances.filter((a) => a.status === "ABSENT").length;
  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ClipboardCheck className="h-8 w-8" />
          My Attendance
        </h1>
        <p className="text-muted-foreground">
          Your attendance records across all courses
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${rate >= 75 ? "text-green-600" : "text-red-600"}`}
            >
              {rate}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Present
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{present}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Late
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{late}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Absent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>{total} total records</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendances.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No attendance records found.
                  </TableCell>
                </TableRow>
              ) : (
                attendances.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{format(new Date(record.date), "PP")}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {record.courseAssignment?.course?.code || "—"}
                      </Badge>{" "}
                      <span className="text-sm text-muted-foreground">
                        {record.courseAssignment?.course?.name || ""}
                      </span>
                    </TableCell>
                    <TableCell>
                      {record.courseAssignment?.teacher
                        ? `${record.courseAssignment.teacher.title || ""} ${record.courseAssignment.teacher.lastName}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[record.status] || "default"}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {record.remarks || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
