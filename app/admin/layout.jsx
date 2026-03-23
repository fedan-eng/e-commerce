// app/admin/layout.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, Menu, X, LayoutDashboard, ShoppingBag, Package, Users, Star, ChevronRight } from "lucide-react";

export default function AdminLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user,     setUser]     = useState(null);
  const [checking, setChecking] = useState(true);
  const [open,     setOpen]     = useState(false); // mobile drawer

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (!data.user || data.user.role !== "admin") router.replace("/");
        else setUser(data.user);
      })
      .catch(() => router.replace("/login"))
      .finally(() => setChecking(false));
  }, []);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a] text-[#555] font-mono text-sm tracking-widest">
        VERIFYING ACCESS...
      </div>
    );
  }

  const navItems = [
    { href: "/admin",           label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders",    label: "Orders",    icon: ShoppingBag },
    { href: "/admin/products",  label: "Products",  icon: Package },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/reviews",   label: "Reviews",   icon: Star },
  ];

  const NavLink = ({ item }) => {
    const Icon   = item.icon;
    const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
    return (
      <Link href={item.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] tracking-[0.03em] no-underline transition-all duration-150 group
          ${active
            ? "bg-[#1c1c1c] text-[#e8e8e8] border-l-2 border-[#e8c46a] pl-[10px]"
            : "text-[#555] border-l-2 border-transparent hover:text-[#999] hover:bg-[#161616]"
          }`}
      >
        <Icon size={15} className={`flex-shrink-0 transition-colors ${active ? "text-[#e8c46a]" : "text-[#444] group-hover:text-[#777]"}`} />
        <span>{item.label}</span>
        {active && <ChevronRight size={12} className="ml-auto text-[#e8c46a] opacity-60" />}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-[#1e1e1e]">
        <div className="text-[9px] tracking-[0.25em] text-[#444] uppercase mb-1">Control Panel</div>
        <div className="text-[17px] font-bold text-[#e8e8e8] tracking-tight">FIL Admin</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => <NavLink key={item.href} item={item} />)}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-5 pt-3 border-t border-[#1e1e1e]">
        {user && (
          <div className="px-3 py-2 mb-2">
            <div className="text-[12px] text-[#888] font-medium">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-[10px] text-[#e8c46a] tracking-[0.1em] mt-0.5">● ADMIN</div>
          </div>
        )}
        <Link href="/"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-[#e86a6a] no-underline tracking-[0.03em]
            border border-[#e86a6a22] bg-[#e86a6a08] hover:bg-[#e86a6a14] hover:border-[#e86a6a44] transition-all duration-150">
          <LogOut size={14} className="flex-shrink-0" />
          <span>Back to Store</span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] font-mono">

      {/* ── Desktop Sidebar (always visible ≥ lg) ── */}
      <aside className="hidden lg:flex w-[220px] min-h-screen bg-[#0f0f0f] border-r border-[#1e1e1e] flex-col fixed top-0 left-0 bottom-0 z-30">
        <SidebarContent />
      </aside>

      {/* ── Mobile: Hamburger button ── */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-9 h-9 flex items-center justify-center
          bg-[#111] border border-[#2a2a2a] rounded-lg text-[#888] hover:text-[#e8e8e8] hover:border-[#444] transition-all"
        aria-label="Open menu"
      >
        <Menu size={16} />
      </button>

      {/* ── Mobile: Backdrop ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile: Slide-in Drawer ── */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-[260px] bg-[#0f0f0f] border-r border-[#1e1e1e]
          flex flex-col transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close button inside drawer */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center
            text-[#555] hover:text-[#e8e8e8] transition-colors"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <main className="lg:ml-[220px] flex-1 min-h-screen w-0 lg:w-auto">
        {/* Mobile top bar spacer so content isn't under the hamburger */}
        <div className="lg:hidden h-14" />
        <div className="px-4 pb-8 pt-0 lg:p-8 max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}