"use server";

import prisma from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function getFeePayments(filters?: {
  studentId?: string;
  status?: string;
  academicYear?: string;
  semester?: string;
  page?: number;
}) {
  const page = filters?.page || 1;
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    ...(filters?.studentId && { studentId: filters.studentId }),
    ...(filters?.status && { status: filters.status as any }),
    ...(filters?.academicYear && { academicYear: filters.academicYear }),
    ...(filters?.semester && { semester: filters.semester as any }),
  };

  const [payments, total] = await Promise.all([
    prisma.feePayment.findMany({
      where,
      include: {
        student: {
          include: { department: true },
        },
      },
      orderBy: { dueDate: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.feePayment.count({ where }),
  ]);

  return {
    payments,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

export async function createFeePayment(data: {
  studentId: string;
  amount: number;
  dueDate: string;
  feeType: string;
  academicYear?: string;
  semester?: "FIRST" | "SECOND" | "SUMMER";
}) {
  return prisma.feePayment.create({
    data: {
      studentId: data.studentId,
      amount: data.amount,
      dueDate: new Date(data.dueDate),
      feeType: data.feeType,
      academicYear: data.academicYear,
      semester: data.semester,
      status: "PENDING",
    },
  });
}

export async function recordPayment(
  feeId: string,
  data: {
    paidAmount: number;
    method: "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER" | "OTHER";
    receiptNumber?: string;
    notes?: string;
  },
) {
  const fee = await prisma.feePayment.findUnique({ where: { id: feeId } });
  if (!fee) throw new Error("Fee not found");

  const newPaidAmount = Number(fee.paidAmount) + data.paidAmount;
  const totalAmount = Number(fee.amount);

  let status: "PENDING" | "PARTIAL" | "PAID" = "PARTIAL";
  if (newPaidAmount >= totalAmount) status = "PAID";
  else if (newPaidAmount > 0) status = "PARTIAL";

  return prisma.feePayment.update({
    where: { id: feeId },
    data: {
      paidAmount: newPaidAmount,
      paymentDate: new Date(),
      method: data.method,
      receiptNumber: data.receiptNumber,
      notes: data.notes,
      status,
    },
  });
}

export async function getStudentFees(studentId: string) {
  return prisma.feePayment.findMany({
    where: { studentId },
    orderBy: { dueDate: "desc" },
  });
}
