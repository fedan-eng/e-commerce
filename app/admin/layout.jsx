// app/admin/layout.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user || data.user.role !== "admin") {
          router.replace("/");
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.replace("/login"))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a] text-white font-mono">
        Verifying access...
      </div>
    );
  }

  const navItems = [
    { href: "/admin",           label: "Dashboard", icon: "⬡" },
    { href: "/admin/orders",    label: "Orders",    icon: "◈" },
    { href: "/admin/products",  label: "Products",  icon: "◉" },
    { href: "/admin/customers", label: "Customers", icon: "◎" },
    { href: "/admin/reviews",   label: "Reviews",   icon: "◌" },
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] font-mono">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-[220px] min-h-screen bg-[#111] border-r border-[#222] flex-col fixed top-0 left-0 bottom-0 z-10 overflow-y-auto">
        <div className="px-6 pt-7 pb-5 border-b border-[#222]">
          <div className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-1">Control Panel</div>
          <div className="text-lg font-bold text-[#e8e8e8] tracking-tight">Admin</div>
        </div>

        <nav className="flex-1 p-3">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 mb-1 rounded-md text-[13px] tracking-[0.04em] no-underline transition-all duration-150 border-l-2
                  ${active
                    ? "text-[#e8e8e8] bg-[#1e1e1e] border-[#e8c46a]"
                    : "text-[#555] bg-transparent border-transparent hover:text-[#888] hover:bg-[#161616]"
                  }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-6 border-t border-[#222] text-[11px] text-[#444]">
          <div className="mb-2">
            <span>{user?.firstName} {user?.lastName}</span>
            <div className="text-[#2a6e2a] mt-0.5">● admin</div>
          </div>
          <Link href="/"
            className="flex items-center gap-1.5 mt-2 px-4 py-2.5 rounded-lg bg-[#2a2a2a] hover:bg-[#1e1e1e] text-red-500 transition-colors no-underline text-[11px]">
            <LogOut size={13} />
            Logout
          </Link>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-[#111] border-t border-[#222] flex items-stretch h-16">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 no-underline text-[9px] tracking-[0.08em] uppercase transition-all border-t-2
                ${active
                  ? "text-[#e8c46a] border-[#e8c46a]"
                  : "text-[#555] border-transparent hover:bg-[#1e1e1e]"
                }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ── Main Content ── */}
      <main className="md:ml-[220px] flex-1 p-5 md:p-8 pb-24 md:pb-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}