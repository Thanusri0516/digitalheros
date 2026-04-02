import { redirect } from "next/navigation";
import { Role } from "@/generated/prisma/client";
import { getSession } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === Role.ADMIN) redirect("/admin");
  redirect("/dashboard#profile");
}

