import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getFeePayments } from "@/actions/fee.actions";
import { format } from "date-fns";
import { CreditCard } from "lucide-react";

const statusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PAID: "default",
  PENDING: "secondary",
  PARTIAL: "outline",
  OVERDUE: "destructive",
};

export default async function FeesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const { payments, total, totalPages } = await getFeePayments({
    page,
    status: params.status,
  });

  // Calculate summary stats
  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.paidAmount), 0);
  const pendingCount = payments.filter(
    (p) => p.status === "PENDING" || p.status === "PARTIAL",
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          Fee Payments
        </h1>
        <p className="text-muted-foreground">{total} total records</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "All", value: undefined },
          { label: "Pending", value: "PENDING" },
          { label: "Partial", value: "PARTIAL" },
          { label: "Paid", value: "PAID" },
          { label: "Overdue", value: "OVERDUE" },
        ].map((filter) => (
          <Button
            key={filter.label}
            variant={params.status === filter.value ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link
              href={`/dashboard/fees?${filter.value ? `status=${filter.value}&` : ""}page=1`}
            >
              {filter.label}
            </Link>
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Fee Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center">
                    No fee records found
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => {
                  const balance =
                    Number(payment.amount) - Number(payment.paidAmount);

                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.student?.firstName} {payment.student?.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {payment.student?.department?.code || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.feeType}</TableCell>
                      <TableCell>
                        {Number(payment.amount).toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>
                        {Number(payment.paidAmount).toLocaleString()} FCFA
                      </TableCell>
                      <TableCell
                        className={
                          balance > 0
                            ? "text-red-600 font-medium"
                            : "text-green-600 font-medium"
                        }
                      >
                        {balance.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.dueDate), "PP")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusColors[payment.status] || "default"}
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/dashboard/fees?page=${page - 1}${params.status ? `&status=${params.status}` : ""}`}
              >
                Previous
              </Link>
            </Button>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link
                href={`/dashboard/fees?page=${p}${params.status ? `&status=${params.status}` : ""}`}
              >
                {p}
              </Link>
            </Button>
          ))}
          {page < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/dashboard/fees?page=${page + 1}${params.status ? `&status=${params.status}` : ""}`}
              >
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
