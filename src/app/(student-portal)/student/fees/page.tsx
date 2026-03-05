import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PAID: "default",
  PENDING: "secondary",
  OVERDUE: "destructive",
  PARTIAL: "outline",
};

export default async function StudentFeesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  if (!student) redirect("/login");

  const feePayments = await prisma.feePayment.findMany({
    where: { studentId: student.id },
    orderBy: { dueDate: "desc" },
  });

  const totalAmount = feePayments.reduce((sum, f) => sum + Number(f.amount), 0);
  const totalPaid = feePayments.reduce(
    (sum, f) => sum + Number(f.paidAmount),
    0,
  );
  const balance = totalAmount - totalPaid;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          My Fees
        </h1>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {totalAmount.toLocaleString()} FCFA
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {totalPaid.toLocaleString()} FCFA
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${balance > 0 ? "text-red-600" : "text-green-600"}`}
            >
              {balance.toLocaleString()} FCFA
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Payment Records</CardTitle>
          <CardDescription>{feePayments.length} records</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt #</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feePayments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No fee records found.
                  </TableCell>
                </TableRow>
              ) : (
                feePayments.map((fee) => {
                  const feeBalance =
                    Number(fee.amount) - Number(fee.paidAmount);

                  return (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">
                        {fee.feeType}
                      </TableCell>
                      <TableCell>
                        {Number(fee.amount).toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>
                        {Number(fee.paidAmount).toLocaleString()} FCFA
                      </TableCell>
                      <TableCell
                        className={
                          feeBalance > 0
                            ? "text-red-600 font-medium"
                            : "text-green-600 font-medium"
                        }
                      >
                        {feeBalance.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>
                        {format(new Date(fee.dueDate), "PP")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[fee.status] || "outline"}>
                          {fee.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {fee.receiptNumber || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
