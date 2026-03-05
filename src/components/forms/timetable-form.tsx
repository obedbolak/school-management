// src/components/forms/timetable-form.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Calendar, Loader2, BookOpen, Clock, DoorOpen } from "lucide-react";
import {
  createTimetableEntry,
  getRooms,
  getTimeSlots,
} from "@/actions/timetable.actions";
import { getCourseAssignments } from "@/actions/course.actions";
import { toast } from "sonner";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

export function AddTimetableEntryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 👇 Read current filters from URL to stay in sync
  const currentYear = searchParams.get("year") || "2024-2025";
  const currentSemester = searchParams.get("semester") || "SECOND";

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Form fields
  const [courseAssignmentId, setCourseAssignmentId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [timeSlotId, setTimeSlotId] = useState("");
  const [roomId, setRoomId] = useState("none");
  const [semester, setSemester] = useState(currentSemester);
  const [academicYear, setAcademicYear] = useState(currentYear);

  // Data
  const [courseAssignments, setCourseAssignments] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);

  // Fetch data when dialog opens or semester/year changes
  useEffect(() => {
    if (open) {
      setLoadingData(true);
      setCourseAssignmentId(""); // Reset selection when filters change

      Promise.all([
        getCourseAssignments({
          academicYear,
          semester: semester as "FIRST" | "SECOND" | "SUMMER",
        }),
        getRooms(),
        getTimeSlots(),
      ])
        .then(([assignments, roomsData, slotsData]) => {
          setCourseAssignments(assignments);
          setRooms(roomsData);
          setTimeSlots(slotsData);
        })
        .finally(() => setLoadingData(false));
    }
  }, [open, semester, academicYear]);

  function resetForm() {
    setCourseAssignmentId("");
    setDayOfWeek("");
    setTimeSlotId("");
    setRoomId("none");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      await createTimetableEntry({
        courseAssignmentId,
        dayOfWeek: dayOfWeek as any,
        timeSlotId,
        roomId: roomId === "none" ? undefined : roomId,
        academicYear,
        semester: semester as "FIRST" | "SECOND" | "SUMMER",
      });
      toast.success("Timetable entry created successfully");
      setOpen(false);
      resetForm();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create timetable entry");
    } finally {
      setLoading(false);
    }
  }

  // Get selected course info for preview
  const selectedAssignment = courseAssignments.find(
    (ca) => ca.id === courseAssignmentId,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Timetable Entry</DialogTitle>
          <DialogDescription>
            Schedule a course for a specific day and time
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Semester & Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Academic Year</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2025-2026">2025-2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Semester</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIRST">First</SelectItem>
                  <SelectItem value="SECOND">Second</SelectItem>
                  <SelectItem value="SUMMER">Summer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Course Selection */}
          <div className="space-y-1">
            <Label className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              Course (Teacher)
            </Label>
            {loadingData ? (
              <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading courses...
              </div>
            ) : courseAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No courses assigned for this semester. Assign a teacher first.
              </p>
            ) : (
              <Select
                value={courseAssignmentId}
                onValueChange={setCourseAssignmentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courseAssignments.map((ca: any) => (
                    <SelectItem key={ca.id} value={ca.id}>
                      {ca.course?.code} — {ca.course?.name} ({ca.teacher?.title}{" "}
                      {ca.teacher?.lastName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Selected Course Preview */}
          {selectedAssignment && (
            <div className="rounded-lg border p-3 bg-muted/50 space-y-1">
              <p className="text-sm font-medium">
                {selectedAssignment.course?.code} —{" "}
                {selectedAssignment.course?.name}
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {selectedAssignment.course?.department?.code || "No dept"}
                </Badge>
                <Badge variant="outline">
                  Level {selectedAssignment.course?.level}
                </Badge>
                <Badge variant="secondary">
                  {selectedAssignment.teacher?.title}{" "}
                  {selectedAssignment.teacher?.lastName}
                </Badge>
              </div>
            </div>
          )}

          {/* Day & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Day
              </Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Time Slot
              </Label>
              <Select value={timeSlotId} onValueChange={setTimeSlotId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot: any) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {slot.startTime} - {slot.endTime} ({slot.label})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Room */}
          <div className="space-y-1">
            <Label className="flex items-center gap-1">
              <DoorOpen className="h-3.5 w-3.5" />
              Room (optional)
            </Label>
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger>
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No room assigned</SelectItem>
                {rooms.map((room: any) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                    {room.building && ` • ${room.building}`}
                    {room.capacity && ` • Cap: ${room.capacity}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !courseAssignmentId ||
                !dayOfWeek ||
                !timeSlotId ||
                courseAssignments.length === 0
              }
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
