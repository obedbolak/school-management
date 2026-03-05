import { getDepartments } from "@/actions/department.actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, BookOpen, GraduationCap } from "lucide-react";
import { AddDepartmentForm } from "@/components/forms/department-form";

export default async function DepartmentsPage() {
  const departments = await getDepartments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Departments
          </h1>
          <p className="text-muted-foreground mt-1">
            {departments.length} departments
          </p>
        </div>
        <AddDepartmentForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <Card key={dept.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{dept.name}</CardTitle>
                  <CardDescription>{dept.faculty}</CardDescription>
                </div>
                <Badge variant="outline">{dept.code}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>{dept._count?.courses || 0} courses</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span>{dept._count?.students || 0} students</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
