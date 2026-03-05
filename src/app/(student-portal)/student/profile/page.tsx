//src/app/(student-portal)/student/profile/page.tsx

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCircle, BookOpen, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

export default async function StudentProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      department: true,
      parent: true,
      user: true,
      enrollments: {
        where: { enrollmentStatus: "ENROLLED" },
        include: {
          courseAssignment: {
            include: {
              course: true,
              teacher: true,
              timetableEntries: {
                include: { timeSlot: true, room: true },
              },
            },
          },
        },
      },
    },
  });

  if (!student) return <p>Profile not found.</p>;

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
            <p className="text-sm text-muted-foreground">Matric Number</p>
            <p className="font-mono font-bold">{student.matricNo}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Full Name</p>
            <p className="font-medium">
              {student.firstName} {student.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{student.user?.email || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date of Birth</p>
            <p className="font-medium">
              {format(new Date(student.dateOfBirth), "PP")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gender</p>
            <p className="font-medium">{student.gender ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge
              variant={student.status === "ACTIVE" ? "default" : "destructive"}
            >
              {student.status}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Department</p>
            <p className="font-medium">
              {student.department
                ? `${student.department.code} — ${student.department.name}`
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Level</p>
            <p className="font-medium">{student.level || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{student.phone ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="font-medium">{student.address ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Enrollment Date</p>
            <p className="font-medium">
              {format(new Date(student.enrollmentDate), "PP")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Enrolled Courses ({student.enrollments?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {student.enrollments && student.enrollments.length > 0 ? (
            <div className="space-y-4">
              {student.enrollments.map((enrollment) => {
                const ca = enrollment.courseAssignment;
                const course = ca?.course;
                const teacher = ca?.teacher;
                const timetable = ca?.timetableEntries || [];

                return (
                  <div
                    key={enrollment.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-sm">
                          {course?.code} — {course?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {course?.creditHours} Credits
                        </p>
                      </div>
                      <Badge variant="outline">
                        Level {(course as any)?.level}
                      </Badge>
                    </div>

                    {teacher && (
                      <p className="text-sm text-muted-foreground">
                        {teacher.title} {teacher.firstName} {teacher.lastName}
                      </p>
                    )}

                    {timetable.length > 0 && (
                      <div className="space-y-1">
                        {timetable.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>
                              {t.dayOfWeek.charAt(0) +
                                t.dayOfWeek.slice(1).toLowerCase()}{" "}
                              {t.timeSlot?.startTime}-{t.timeSlot?.endTime}
                            </span>
                            {t.room && (
                              <>
                                <MapPin className="h-3 w-3 text-muted-foreground" />
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
              No courses enrolled yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Parent / Guardian */}
      {student.parent && (
        <Card>
          <CardHeader>
            <CardTitle>Parent / Guardian</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">
                {student.parent.firstName} {student.parent.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{student.parent.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{student.parent.email ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Occupation</p>
              <p className="font-medium">
                {student.parent.occupation ?? "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
