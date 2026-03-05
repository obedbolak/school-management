import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Users, BookOpen } from "lucide-react";
import { getTeachers } from "@/actions/teacher.actions";

export default async function TeachersPage() {
  const teachers = await getTeachers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            Teachers
          </h1>
          <p className="text-muted-foreground">
            {teachers.length} total teachers
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/teachers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Teacher
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center">
                    No teachers found
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher) => {
                  const totalStudents =
                    teacher.courseAssignments?.reduce(
                      (sum, ca) => sum + (ca._count?.enrollments || 0),
                      0,
                    ) || 0;

                  return (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-mono text-sm">
                        {teacher.employeeId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {teacher.firstName} {teacher.lastName}
                      </TableCell>
                      <TableCell>{teacher.title || "—"}</TableCell>
                      <TableCell>{teacher.department || "—"}</TableCell>
                      <TableCell>{teacher.gender || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {teacher._count?.courseAssignments || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          {totalStudents}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/teachers/${teacher.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
