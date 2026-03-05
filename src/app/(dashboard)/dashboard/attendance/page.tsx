import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAttendanceByDate } from "@/actions/attendance.actions";
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

export default async function AttendancePage() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const records = await getAttendanceByDate(yesterday);

  // Group records by course for summary
  const courseSummary = records.reduce(
    (acc, record) => {
      const courseCode = record.courseAssignment?.course?.code || "Unknown";
      if (!acc[courseCode]) {
        acc[courseCode] = {
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          sick: 0,
          total: 0,
        };
      }
      acc[courseCode].total++;
      const status = record.status.toLowerCase() as keyof (typeof acc)[string];
      if (status in acc[courseCode]) {
        acc[courseCode][status]++;
      }
      return acc;
    },
    {} as Record<string, Record<string, number>>,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">
          Records for {format(yesterday, "PPP")}
        </p>
      </div>

      {/* Summary Cards */}
      {Object.keys(courseSummary).length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Total Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{records.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Present
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {records.filter((r) => r.status === "PRESENT").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Absent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {records.filter((r) => r.status === "ABSENT").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Late
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {records.filter((r) => r.status === "LATE").length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center">
                    No attendance records found for this date
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.student?.firstName} {record.student?.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {record.student?.department?.code || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm font-bold">
                        {record.courseAssignment?.course?.code || "—"}
                      </span>
                      <span className="text-muted-foreground text-xs ml-1">
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
