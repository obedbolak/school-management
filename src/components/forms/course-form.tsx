"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Loader2 } from "lucide-react";
import { createCourse } from "@/actions/course.actions";
import { toast } from "sonner";

type Props = {
  departments: any[];
};

export function AddCourseForm({ departments }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // These states are critical because Shadcn Select doesn't
  // automatically populate native HTML FormData
  const [departmentId, setDepartmentId] = useState<string>("");
  const [level, setLevel] = useState<string>("100");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      // We manually pull level and departmentId from our state
      await createCourse({
        code: formData.get("code") as string,
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || undefined,
        creditHours: Number(formData.get("creditHours")) || 3,
        level: Number(level),
        departmentId: departmentId || undefined,
      });

      toast.success("Course created successfully");

      // Reset State & Close
      setOpen(false);
      setDepartmentId("");
      setLevel("100");

      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
          <DialogDescription>
            Create a new course for the university. All fields marked with * are
            required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Course Code *</Label>
              <Input id="code" name="code" placeholder="CS401" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creditHours">Credit Hours</Label>
              <Input
                id="creditHours"
                name="creditHours"
                type="number"
                defaultValue={3}
                min={1}
                max={10}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Course Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Artificial Intelligence"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              name="description"
              placeholder="Introduction to AI and machine learning"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments && departments.length > 0 ? (
                    departments.map((dept: any) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.code} — {dept.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No departments found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">Level 100</SelectItem>
                  <SelectItem value="200">Level 200</SelectItem>
                  <SelectItem value="300">Level 300</SelectItem>
                  <SelectItem value="400">Level 400</SelectItem>
                  <SelectItem value="500">Level 500</SelectItem>
                  <SelectItem value="600">Level 600</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? "Creating..." : "Create Course"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
