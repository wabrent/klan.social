import { getSessionUser } from "@/lib/auth";
import { MobileBar, Sidebar } from "@/components/nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1320px]">
      <Sidebar user={user} />
      <main className="min-w-0 flex-1 border-r border-edge pb-16 pt-14 md:pb-0 md:pt-0">{children}</main>
      <MobileBar user={user} />
    </div>
  );
}
