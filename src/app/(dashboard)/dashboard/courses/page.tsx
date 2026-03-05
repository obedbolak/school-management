import { getCourses } from "@/actions/course.actions";
import { getTeachers } from "@/actions/teacher.actions";
import { serialize } from "@/lib/serialize"; // Import your serialize function
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
import { BookOpen } from "lucide-react";
import Link from "next/link";

import { getDepartments } from "@/actions/department.actions";
import { AddCourseForm } from "@/components/forms/course-form";
import { AssignTeacherForm } from "@/components/forms/assign-teacher-form";

export default async function CoursesPage() {
  const courses = await getCourses();
  const teachers = await getTeachers();
  const departments = await getDepartments();

  const level100 = courses.filter((c: { level: number }) => c.level === 100);
  const level200 = courses.filter((c: { level: number }) => c.level === 200);
  const level300 = courses.filter((c: { level: number }) => c.level === 300);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Courses
          </h1>
          <p className="text-muted-foreground mt-1">
            {courses.length} courses offered
          </p>
        </div>

        <div className="flex gap-2">
          <AddCourseForm departments={departments} />
          <AssignTeacherForm
            courses={serialize(courses)}
            teachers={serialize(teachers)}
          />
        </div>
      </div>

      {[
        { label: "Level 100", items: level100 },
        { label: "Level 200", items: level200 },
        { label: "Level 300", items: level300 },
      ].map(({ label, items }) => (
        <Card key={label}>
          <CardHeader>
            <CardTitle>{label}</CardTitle>
            <CardDescription>{items.length} courses</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Students</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((course: any) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/courses/${String(course.id)}`}
                        className="font-mono font-bold text-primary hover:underline"
                      >
                        {course.code}
                      </Link>
                    </TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {course.department?.code || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>{course.creditHours}</TableCell>
                    <TableCell>
                      {course.assignments?.[0]?.teacher
                        ? `${course.assignments[0].teacher.title || ""} ${course.assignments[0].teacher.lastName}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {course.assignments?.reduce(
                        (sum: any, a: { _count: { enrollments: any } }) =>
                          sum + (a._count?.enrollments || 0),
                        0,
                      ) || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
