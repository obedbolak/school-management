import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getStudentTimetable } from "@/actions/timetable.actions";
import { TimetableGrid } from "@/components/timetable/timetable-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { serialize } from "@/lib/serialize";

export default async function StudentTimetablePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: { department: true },
  });

  if (!student) redirect("/login");

  // Serialize to convert Decimal objects to plain numbers
  const timetableEntries = serialize(await getStudentTimetable(student.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          My Timetable
        </h1>
        <p className="text-muted-foreground mt-1">
          {student.firstName} {student.lastName} — {student.department?.name} —
          Level {student.level}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <TimetableGrid
            entries={timetableEntries}
            showTeacher={true}
            showRoom={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
