import { z } from "zod";

export const teacherSchema = z.object({
  employeeId: z.string().min(2, "Employee ID is required"),
  firstName: z.string().min(2, "First name is required").max(100),
  lastName: z.string().min(2, "Last name is required").max(100),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  department: z.string().optional(),
  title: z.string().optional(),
  salaryBase: z.number().optional(),
  hireDate: z.string().optional(),
});

export type TeacherFormData = z.infer<typeof teacherSchema>;
