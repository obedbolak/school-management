"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TimetableEntryWithRelations } from "@/types";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const;

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

type Props = {
  entries: TimetableEntryWithRelations[];
  showTeacher?: boolean;
  showRoom?: boolean;
};

export function TimetableGrid({ entries, showTeacher = true, showRoom = true }: Props) {
  const timeSlots = Array.from(
    new Map(
      entries.filter((e) => e.timeSlot).map((e) => [e.timeSlot!.id, e.timeSlot!])
    ).values()
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const activeDays = DAYS.filter((day) => entries.some((e) => e.dayOfWeek === day));

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No timetable entries found.</p>
      </div>
    );
  }

  const getEntry = (day: string, slotId: string) => {
    return entries.filter((e) => e.dayOfWeek === day && e.timeSlotId === slotId);
  };

  const levelColors: Record<number, string> = {
    100: "bg-blue-100 border-blue-300 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100",
    200: "bg-green-100 border-green-300 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100",
    300: "bg-purple-100 border-purple-300 text-purple-900 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-100",
    400: "bg-orange-100 border-orange-300 text-orange-900 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-100",
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-3 bg-muted text-left min-w-[100px]">Time</th>
            {activeDays.map((day) => (
              <th key={day} className="border p-3 bg-muted text-center min-w-[160px]">
                {DAY_LABELS[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot) => (
            <tr key={slot.id}>
              <td className="border p-3 bg-muted/50 font-medium text-sm">
                <div>{slot.startTime}</div>
                <div className="text-muted-foreground">to</div>
                <div>{slot.endTime}</div>
                <div className="text-xs text-muted-foreground mt-1">{slot.label}</div>
              </td>
              {activeDays.map((day) => {
                const cellEntries = getEntry(day, slot.id);
                return (
                  <td key={`${day}-${slot.id}`} className="border p-2">
                    {cellEntries.length > 0 ? (
                      <div className="space-y-2">
                        {cellEntries.map((entry) => {
                          const course = entry.courseAssignment?.course;
                          const teacher = entry.courseAssignment?.teacher;
                          const level = (course as any)?.level || 100;
                          const colorClass = levelColors[level] || levelColors[100];

                          return (
                            <Card key={entry.id} className={`${colorClass} border shadow-sm`}>
                              <CardContent className="p-2">
                                <div className="font-bold text-sm">{course?.code}</div>
                                <div className="text-xs truncate">{course?.name}</div>
                                {showTeacher && teacher && (
                                  <div className="text-xs mt-1 opacity-80">
                                    {teacher.title} {teacher.lastName}
                                  </div>
                                )}
                                {showRoom && entry.room && (
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    📍 {entry.room.name}
                                  </Badge>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center text-xs text-muted-foreground py-4">—</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
