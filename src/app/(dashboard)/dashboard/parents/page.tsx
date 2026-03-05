// src/app/(dashboard)/dashboard/parents/page.tsx

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

export default async function ParentsPage() {
  const parents = await prisma.parent.findMany({
    include: {
      _count: { select: { children: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Parents</h1>
        <p className="text-muted-foreground">{parents.length} total parents</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Occupation</TableHead>
                <TableHead>Children</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">
                    No parents found
                  </TableCell>
                </TableRow>
              ) : (
                parents.map((parent) => (
                  <TableRow key={parent.id}>
                    <TableCell className="font-medium">
                      {parent.firstName} {parent.lastName}
                    </TableCell>
                    <TableCell>{parent.phone}</TableCell>
                    <TableCell>{parent.email || "—"}</TableCell>
                    <TableCell>{parent.occupation || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {parent._count.children} children
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
