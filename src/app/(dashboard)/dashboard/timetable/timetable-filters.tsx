// src/app/(dashboard)/dashboard/timetable/timetable-filters.tsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, X } from "lucide-react";

type Props = {
  departments: { id: string; name: string; code: string }[];
  currentDepartment: string;
  currentYear: string;
  currentSemester: string;
};

export function TimetableFilters({
  departments,
  currentDepartment,
  currentYear,
  currentSemester,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard/timetable?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/dashboard/timetable");
  }

  const hasFilters =
    currentDepartment ||
    currentYear !== "2024-2025" ||
    currentSemester !== "SECOND";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filters
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Department</Label>
            <Select
              value={currentDepartment || "all"}
              onValueChange={(value) => updateFilter("department", value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.code} — {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Academic Year</Label>
            <Select
              value={currentYear}
              onValueChange={(value) => updateFilter("year", value)}
            >
              <SelectTrigger className="w-[150px]">
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
            <Select
              value={currentSemester}
              onValueChange={(value) => updateFilter("semester", value)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIRST">First</SelectItem>
                <SelectItem value="SECOND">Second</SelectItem>
                <SelectItem value="SUMMER">Summer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
