// src/components/forms/mark-attendance-form.tsx
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { markAttendance } from "@/actions/teacher-portal.actions";

type StudentRow = {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo: string;
  currentStatus: string | null;
};

type Props = {
  classId: string;
  teacherId: string;
  students: StudentRow[];
};

const statuses = ["PRESENT", "ABSENT", "LATE", "EXCUSED", "SICK"] as const;

export function MarkAttendanceForm({ classId, teacherId, students }: Props) {
  const [attendance, setAttendance] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    students.forEach((s) => {
      initial[s.id] = s.currentStatus ?? "PRESENT";
    });
    return initial;
  });

  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        const records = Object.entries(attendance).map(
          ([studentId, status]) => ({
            studentId,
            status: status as (typeof statuses)[number],
          }),
        );
        await markAttendance({ classId, teacherId, date: new Date(), records });
        toast.success("Attendance saved successfully!");
      } catch (error) {
        toast.error("Failed to save attendance.");
      }
    });
  };

  const markAllPresent = () => {
    const updated: Record<string, string> = {};
    students.forEach((s) => {
      updated[s.id] = "PRESENT";
    });
    setAttendance(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={markAllPresent}>
          Mark All Present
        </Button>
      </div>

      <div className="space-y-2">
        {students.map((student) => (
          <div
            key={student.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div>
              <p className="font-medium">
                {student.lastName}, {student.firstName}
              </p>
              <p className="text-sm text-muted-foreground">
                {student.admissionNo}
              </p>
            </div>
            <Select
              value={attendance[student.id]}
              onValueChange={(value) =>
                setAttendance((prev) => ({ ...prev, [student.id]: value }))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      {students.length === 0 && (
        <p className="text-center text-muted-foreground">
          No students in this class.
        </p>
      )}

      {students.length > 0 && (
        <Button onClick={handleSubmit} disabled={isPending} className="w-full">
          {isPending ? "Saving..." : "Save Attendance"}
        </Button>
      )}
    </div>
  );
}
