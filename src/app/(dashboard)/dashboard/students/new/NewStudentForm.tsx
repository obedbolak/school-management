"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft, RefreshCw, Lock } from "lucide-react";
import Link from "next/link";
import { studentSchema, type StudentFormData } from "@/lib/validations/student";
import { createStudent, generateNextMatricNo } from "@/actions/student.actions";
import { getDepartments } from "@/actions/department.actions";
import { toast } from "sonner";

export default function NewStudentForm({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [matricLoading, setMatricLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema) as any,
    defaultValues: {
      matricNo: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: undefined,
      address: "",
      phone: "",
      departmentId: "",
      level: 100,
      parentId: "",
      email: "",
    },
  });

  const watchedDepartmentId = form.watch("departmentId");
  const watchedLevel = form.watch("level");

  useEffect(() => {
    getDepartments().then(setDepartments);
  }, []);

  // Auto-generate matric preview whenever department or level changes
  useEffect(() => {
    if (!watchedDepartmentId) {
      form.setValue("matricNo", "");
      return;
    }

    const dept = departments.find((d) => d.id === watchedDepartmentId);
    if (!dept) return;

    setMatricLoading(true);
    generateNextMatricNo(dept.code, watchedLevel ?? 100)
      .then((matric) => form.setValue("matricNo", matric))
      .catch(() => toast.error("Failed to generate matric number"))
      .finally(() => setMatricLoading(false));
  }, [watchedDepartmentId, watchedLevel, departments]);

  async function regenerateMatric() {
    const dept = departments.find((d) => d.id === watchedDepartmentId);
    if (!dept) {
      toast.error("Please select a department first");
      return;
    }
    setMatricLoading(true);
    try {
      const matric = await generateNextMatricNo(dept.code, watchedLevel ?? 100);
      form.setValue("matricNo", matric);
      toast.info("Matric number refreshed");
    } catch {
      toast.error("Failed to regenerate matric number");
    } finally {
      setMatricLoading(false);
    }
  }

  async function onSubmit(data: StudentFormData) {
    setLoading(true);
    try {
      await createStudent(data);
      toast.success("Student created successfully");
      router.push("/dashboard/students");
    } catch (error: any) {
      toast.error(error.message || "Failed to create student");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/students">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* EMAIL */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="student@university.com"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave blank to auto-generate from matric number.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* FIRST NAME & LAST NAME */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Alice" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Nguema" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* DATE OF BIRTH */}
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* GENDER */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DEPARTMENT & LEVEL — must be before matric field */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.code} — {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={String(field.value ?? 100)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="100">Level 100</SelectItem>
                          <SelectItem value="200">Level 200</SelectItem>
                          <SelectItem value="300">Level 300</SelectItem>
                          <SelectItem value="400">Level 400</SelectItem>
                          <SelectItem value="500">Level 500</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* MATRIC NUMBER */}
              <FormField
                control={form.control}
                name="matricNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matriculation Number</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          readOnly={!isAdmin}
                          placeholder={
                            !watchedDepartmentId
                              ? "Select a department first..."
                              : matricLoading
                                ? "Generating..."
                                : ""
                          }
                          className={
                            !isAdmin
                              ? "bg-muted text-muted-foreground cursor-not-allowed"
                              : ""
                          }
                        />
                      </FormControl>

                      {isAdmin ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={regenerateMatric}
                          disabled={matricLoading || !watchedDepartmentId}
                          title="Refresh matric number"
                        >
                          {matricLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled
                          title="Auto-generated — only admins can edit"
                        >
                          {matricLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      )}
                    </div>
                    <FormDescription>
                      {!watchedDepartmentId
                        ? "Select a department and level to generate a matric number."
                        : isAdmin
                          ? "Preview based on current student count. Final number is assigned on save."
                          : "Auto-generated. Only admins can edit this field."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PHONE */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="677000000"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ADDRESS */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Yaoundé, Cameroon"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ACTIONS */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading || matricLoading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Student
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard/students">Cancel</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
