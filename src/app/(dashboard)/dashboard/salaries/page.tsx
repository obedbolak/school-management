// src/app/(dashboard)/dashboard/salaries/page.tsx

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";
import { format } from "date-fns";

export default async function SalariesPage() {
  const salaries = await prisma.salaryPayment.findMany({
    include: { teacher: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Salary Payments</h1>
        <p className="text-muted-foreground">{salaries.length} total records</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">
                    No salary records found
                  </TableCell>
                </TableRow>
              ) : (
                salaries.map((salary) => (
                  <TableRow key={salary.id}>
                    <TableCell className="font-medium">
                      {salary.teacher.firstName} {salary.teacher.lastName}
                    </TableCell>
                    <TableCell>{salary.monthYear}</TableCell>
                    <TableCell>{salary.amount.toString()} FCFA</TableCell>
                    <TableCell>
                      {format(new Date(salary.paymentDate), "PP")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          salary.status === "PAID" ? "default" : "secondary"
                        }
                      >
                        {salary.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
