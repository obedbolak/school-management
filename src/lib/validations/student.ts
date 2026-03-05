import { z } from "zod";

export const studentSchema = z.object({
  matricNo: z.string().min(2, "Matriculation number is required").max(50),
  firstName: z.string().min(2, "First name is required").max(100),
  lastName: z.string().min(2, "Last name is required").max(100),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  level: z
    .number()
    .min(100, "Minimum level is 100")
    .max(900, "Maximum level is 900"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  departmentId: z.string().optional(),
  parentId: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: "Invalid email" },
    ),
});

export type StudentFormData = z.infer<typeof studentSchema>;
