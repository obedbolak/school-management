// src/components/layout/header.tsx

import { auth } from "@/lib/auth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export async function Header() {
  const session = await auth();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <Badge variant="outline" className="capitalize">
          {session?.user?.role?.toLowerCase()}
        </Badge>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {session?.user?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{session?.user?.name}</span>
      </div>
    </header>
  );
}
