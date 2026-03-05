import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCircle, BookOpen, Clock, MapPin, Users } from "lucide-react";
import { format } from "date-fns";

export default async function TeacherProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      courseAssignments: {
        include: {
          course: { include: { department: true } },
          _count: { select: { enrollments: true } },
          timetableEntries: {
            include: { timeSlot: true, room: true },
          },
        },
      },
    },
  });

  if (!teacher) return <p>Profile not found.</p>;

  const totalStudents = teacher.courseAssignments.reduce(
    (sum, ca) => sum + (ca._count?.enrollments || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserCircle className="h-8 w-8" />
          My Profile
        </h1>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Employee ID</p>
            <p className="font-mono font-bold">{teacher.employeeId}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Full Name</p>
            <p className="font-medium">
              {teacher.title} {teacher.firstName} {teacher.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">
              {teacher.email || teacher.user?.email || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gender</p>
            <p className="font-medium">{teacher.gender ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{teacher.phone ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Department</p>
            <p className="font-medium">{teacher.department ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Title</p>
            <p className="font-medium">{teacher.title ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Hire Date</p>
            <p className="font-medium">
              {teacher.hireDate
                ? format(new Date(teacher.hireDate), "PP")
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Base Salary</p>
            <p className="font-medium">
              {teacher.salaryBase
                ? `${Number(teacher.salaryBase).toLocaleString()} FCFA`
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Students</p>
            <p className="font-medium">{totalStudents}</p>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Assigned Courses ({teacher.courseAssignments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teacher.courseAssignments.length > 0 ? (
            <div className="space-y-4">
              {teacher.courseAssignments.map((ca) => {
                const course = ca.course;
                const timetable = ca.timetableEntries || [];

                return (
                  <div key={ca.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-sm">
                          {course?.code} — {course?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {course?.department?.name} • Level {course?.level} •{" "}
                          {course?.creditHours} Credits
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          <Users className="h-3 w-3 mr-1" />
                          {ca._count?.enrollments || 0}
                        </Badge>
                        <Badge variant="outline">{ca.semester}</Badge>
                      </div>
                    </div>

                    {timetable.length > 0 && (
                      <div className="space-y-1">
                        {timetable.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                          >
                            <Clock className="h-3 w-3" />
                            <span>
                              {t.dayOfWeek.charAt(0) +
                                t.dayOfWeek.slice(1).toLowerCase()}{" "}
                              {t.timeSlot?.startTime}-{t.timeSlot?.endTime}
                            </span>
                            {t.room && (
                              <>
                                <MapPin className="h-3 w-3" />
                                <span>{t.room.name}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No courses assigned yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
