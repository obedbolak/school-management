// src/app/(teacher-portal)/teacher/attendance/attendance-wrapper.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, ClipboardCheck } from "lucide-react";
import { getTeacherCourseAttendance } from "@/actions/teacher-portal.actions";
import { MarkAttendanceForm } from "@/components/forms/mark-attendance-form";

type Assignment = {
  id: string;
  academicYear: string;
  semester: string;
  course: {
    code: string;
    name: string;
    department?: {
      code: string;
      name: string;
    };
  };
  _count: {
    enrollments: number;
  };
};

type Props = {
  teacherId: string;
  assignments: Assignment[];
};

export function TeacherAttendanceWrapper({ teacherId, assignments }: Props) {
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedAssignment) {
      setStudents([]);
      return;
    }

    setLoading(true);

    // Use your existing getTeacherCourseAttendance action
    const today = new Date().toISOString().split("T")[0];

    getTeacherCourseAttendance(selectedAssignment, today)
      .then((data: any) => {
        // Map students with their existing attendance status
        const mapped = data.students.map((student: any) => {
          const existing = data.attendance.find(
            (a: any) => a.studentId === student.id,
          );
          return {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            admissionNo: student.matricNo,
            currentStatus: existing?.status || null,
          };
        });
        setStudents(mapped);
      })
      .catch(() => {
        setStudents([]);
      })
      .finally(() => setLoading(false));
  }, [selectedAssignment]);

  const selectedCourse = assignments.find((a) => a.id === selectedAssignment);

  return (
    <div className="space-y-6">
      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Course</CardTitle>
          <CardDescription>
            Choose which class to mark attendance for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Label>Course</Label>
            <Select
              value={selectedAssignment}
              onValueChange={setSelectedAssignment}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {assignments.map((assignment) => (
                  <SelectItem key={assignment.id} value={assignment.id}>
                    {assignment.course.code} — {assignment.course.name} (
                    {assignment._count?.enrollments || 0} students)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Form */}
      {selectedAssignment && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedCourse?.course.code} — {selectedCourse?.course.name}
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {" • "}
              {students.length} students
              {students.some((s) => s.currentStatus) && (
                <span className="ml-2 text-yellow-600">
                  (Attendance already recorded today — editing mode)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading students...
              </div>
            ) : (
              <MarkAttendanceForm
                classId={selectedAssignment}
                teacherId={teacherId}
                students={students}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* No courses message */}
      {assignments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No courses assigned</p>
            <p className="text-sm mt-1">
              You don&apos;t have any courses assigned for this semester.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
