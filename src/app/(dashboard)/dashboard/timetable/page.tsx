// src/app/(dashboard)/dashboard/timetable/page.tsx

import { getTimetableEntries } from "@/actions/timetable.actions";
import { getDepartments } from "@/actions/department.actions";
import { TimetableGrid } from "@/components/timetable/timetable-grid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";
import { AddTimetableEntryForm } from "@/components/forms/timetable-form";
import { TimetableFilters } from "./timetable-filters";

export default async function AdminTimetablePage({
  searchParams,
}: {
  searchParams: Promise<{
    department?: string;
    year?: string;
    semester?: string;
  }>;
}) {
  const params = await searchParams;
  const departmentId = params.department || undefined;
  const academicYear = params.year || "2024-2025";
  const semester = (params.semester || "SECOND") as
    | "FIRST"
    | "SECOND"
    | "SUMMER";

  const departments = await getDepartments();

  // 👇 No need to serialize again — getTimetableEntries already does it
  const [level100, level200, level300] = await Promise.all([
    getTimetableEntries({ academicYear, semester, level: 100, departmentId }),
    getTimetableEntries({ academicYear, semester, level: 200, departmentId }),
    getTimetableEntries({ academicYear, semester, level: 300, departmentId }),
  ]);

  const selectedDept = departmentId
    ? departments.find((d: any) => d.id === departmentId)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            University Timetable
          </h1>
          <p className="text-muted-foreground mt-1">
            Academic Year {academicYear} •{" "}
            {semester.charAt(0) + semester.slice(1).toLowerCase()} Semester
            {selectedDept && ` • ${(selectedDept as any).name}`}
          </p>
        </div>
        <AddTimetableEntryForm />
      </div>

      <TimetableFilters
        departments={departments.map((d: any) => ({
          id: d.id,
          name: d.name,
          code: d.code,
        }))}
        currentDepartment={departmentId || ""}
        currentYear={academicYear}
        currentSemester={semester}
      />

      <Tabs defaultValue="100">
        <TabsList>
          <TabsTrigger value="100">
            Level 100
            {level100.length > 0 && (
              <span className="ml-1 text-xs">({level100.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="200">
            Level 200
            {level200.length > 0 && (
              <span className="ml-1 text-xs">({level200.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="300">
            Level 300
            {level300.length > 0 && (
              <span className="ml-1 text-xs">({level300.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All Levels</TabsTrigger>
        </TabsList>

        {[
          {
            value: "100",
            label: "Level 100",
            desc: "First year",
            entries: level100,
          },
          {
            value: "200",
            label: "Level 200",
            desc: "Second year",
            entries: level200,
          },
          {
            value: "300",
            label: "Level 300",
            desc: "Third year",
            entries: level300,
          },
        ].map(({ value, label, desc, entries }) => (
          <TabsContent key={value} value={value}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {label} Timetable
                  {selectedDept && ` — ${(selectedDept as any).code}`}
                </CardTitle>
                <CardDescription>
                  {desc} courses • {entries.length} scheduled sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {entries.length > 0 ? (
                  <TimetableGrid entries={entries} />
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No scheduled sessions for this level
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="all">
          <div className="space-y-6">
            {[
              { label: "Level 100", entries: level100 },
              { label: "Level 200", entries: level200 },
              { label: "Level 300", entries: level300 },
            ].map(({ label, entries }) => (
              <Card key={label}>
                <CardHeader>
                  <CardTitle>
                    {label}
                    {selectedDept && ` — ${(selectedDept as any).code}`}
                  </CardTitle>
                  <CardDescription>
                    {entries.length} scheduled sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {entries.length > 0 ? (
                    <TimetableGrid entries={entries} />
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No scheduled sessions
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
