// src/components/forms/enroll-student-form.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Loader2, BookOpen, User } from "lucide-react";
import { enrollStudent, getCourseAssignments } from "@/actions/course.actions";
import { getStudents } from "@/actions/student.actions";
import { toast } from "sonner";

type Props = {
  course: {
    id: string;
    code: string;
    name: string;
    level: number;
  };
  teacher?: {
    title: string;
    firstName: string;
    lastName: string;
  };
  courseAssignmentId: string;
};

export function EnrollStudentForm({
  course,
  teacher,
  courseAssignmentId,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    if (open) {
      setLoadingStudents(true);
      getStudents({ status: "ACTIVE" })
        .then(setStudents)
        .finally(() => setLoadingStudents(false));
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      await enrollStudent({
        studentId,
        courseAssignmentId,
      });
      toast.success("Student enrolled successfully");
      setOpen(false);
      setStudentId("");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to enroll student");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <GraduationCap className="h-4 w-4 mr-2" />
          Enroll Student
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll Student in Course</DialogTitle>
          <DialogDescription>
            Select a student to enroll in this course
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 👇 Course & Teacher displayed as info, not a select */}
          <div className="rounded-lg border p-4 space-y-3 bg-muted/50">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Course</p>
                <p className="text-sm text-muted-foreground">
                  {course.code} — {course.name}
                  <Badge variant="outline" className="ml-2">
                    Level {course.level}
                  </Badge>
                </p>
              </div>
            </div>

            {teacher && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Teacher</p>
                  <p className="text-sm text-muted-foreground">
                    {teacher.title} {teacher.firstName} {teacher.lastName}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 👇 Only one select — for the student */}
          <div>
            <Label>Student</Label>
            {loadingStudents ? (
              <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading students...
              </div>
            ) : (
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student: any) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.matricNo} — {student.firstName}{" "}
                      {student.lastName} (Level {student.level},{" "}
                      {student.department?.code || "N/A"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !studentId}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enroll Student
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
