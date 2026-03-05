import { getStudents } from "@/actions/student.actions";
import { getDepartments } from "@/actions/department.actions";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { GraduationCap, Plus } from "lucide-react";

const statusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  ACTIVE: "default",
  GRADUATED: "secondary",
  SUSPENDED: "destructive",
  DROPPED_OUT: "destructive",
  DEFERRED: "outline",
};

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    departmentId?: string;
    level?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;

  const [students, departments] = await Promise.all([
    getStudents({
      search: params.search,
      departmentId: params.departmentId,
      level: params.level ? parseInt(params.level) : undefined,
      status: params.status,
    }),
    getDepartments(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-8 w-8" />
            Students
          </h1>
          <p className="text-muted-foreground">
            {students.length} students found
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/students/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={!params.level ? "default" : "outline"}
          size="sm"
          asChild
        >
          <Link href="/dashboard/students">All Levels</Link>
        </Button>
        {[100, 200, 300].map((level) => (
          <Button
            key={level}
            variant={params.level === String(level) ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={`/dashboard/students?level=${level}`}>
              Level {level}
            </Link>
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matric No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono text-sm font-bold">
                      {student.matricNo}
                    </TableCell>
                    <TableCell className="font-medium">
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {student.department?.code || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>{student.level || "—"}</TableCell>
                    <TableCell>
                      {student._count?.enrollments || 0} courses
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusColors[student.status] || "default"}
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/students/${student.id}`}>
                          View
                        </Link>
                      </Button>
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
