// src/app/(dashboard)/dashboard/students/new/page.tsx
import { auth } from "@/lib/auth";
import NewStudentForm from "./NewStudentForm";

export default async function NewStudentPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return <NewStudentForm isAdmin={isAdmin} />;
}
