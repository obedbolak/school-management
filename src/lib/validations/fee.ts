// src/lib/validations/fee.ts

import { z } from "zod";

export const feePaymentSchema = z.object({
  studentId: z.string().uuid("Select a student"),
  amount: z.number().positive("Amount must be positive"),
  paidAmount: z.number().min(0).default(0),
  dueDate: z.date(),
  feeType: z.string().min(1, "Fee type is required"),
  method: z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER", "OTHER"]).optional(),
  notes: z.string().optional(),
});

export type FeePaymentFormData = z.infer<typeof feePaymentSchema>;
