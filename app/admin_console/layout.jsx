// app/admin_console/layout.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, LayoutDashboard, ShoppingBag, Package, Users, Star, ReceiptText, Store, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin_console",           label: "Dashboard",   icon: LayoutDashboard },
  { href: "/admin_console/orders",    label: "Orders",      icon: ShoppingBag },
  { href: "/admin_console/sales",     label: "Sales Entry", icon: ReceiptText },
  { href: "/admin_console/products",  label: "Products",    icon: Package },
  { href: "/admin_console/customers", label: "Customers",   icon: Users },
  { href: "/admin_console/reviews",   label: "Reviews",     icon: Star },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", emoji: "☀️" };
  if (h < 17) return { text: "Good afternoon", emoji: "🌿" };
  return { text: "Good evening", emoji: "🌙" };
}

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
      <div className="flex flex-col items-center justify-center gap-4 h-screen bg-canvas font-roboto">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-mint" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pine animate-spin" />
          <div className="absolute inset-[18px] rounded-full bg-zest" />
        </div>
        <div className="text-sm font-medium text-pine">Checking you in…</div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const hello = greeting();

  const NavLink = ({ item }) => {
    const Icon   = item.icon;
    const active = pathname === item.href || (item.href !== "/admin_console" && pathname.startsWith(item.href));
    return (
      <Link href={item.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-[14px] font-medium no-underline transition-all duration-200 group
          ${active
            ? "bg-zest text-pine shadow-[0_6px_18px_-6px_rgba(215,247,91,0.7)]"
            : "text-white/75 hover:text-white hover:bg-white/10 hover:translate-x-0.5"
          }`}
      >
        <span className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 transition-colors
          ${active ? "bg-pine text-zest" : "bg-white/10 text-white/80 group-hover:bg-white/15"}`}>
          <Icon size={15} />
        </span>
        <span>{item.label}</span>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full bg-zest/10" />
      <div className="pointer-events-none absolute bottom-24 -left-20 w-48 h-48 rounded-full bg-white/5" />

      {/* Brand */}
      <div className="relative px-5 pt-6 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-zest flex items-center justify-center rotate-[-6deg] shadow-[0_6px_18px_-6px_rgba(215,247,91,0.8)]">
            <span className="text-pine font-poppins font-bold text-lg rotate-[6deg]">F</span>
          </div>
          <div>
            <div className="text-[17px] font-poppins font-bold text-white leading-none">FIL Admin</div>
            <div className="text-[11px] text-white/55 mt-1 flex items-center gap-1">
              <Sparkles size={11} className="text-zest" /> Control panel
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.18em] text-white/40 font-semibold">Menu</div>
        {NAV_ITEMS.map(item => <NavLink key={item.href} item={item} />)}
      </nav>

      {/* User + back to store */}
      <div className="relative p-3">
        <div className="rounded-3xl bg-white/[0.07] p-3">
          {user && (
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-mint text-pine flex items-center justify-center text-[13px] font-bold flex-shrink-0">
                {(user.firstName?.[0] || "A").toUpperCase()}{(user.lastName?.[0] || "").toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] text-white font-medium truncate">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-[11px] text-zest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zest animate-pulse" /> Admin
                </div>
              </div>
            </div>
          )}
          <Link href="/"
            className="flex items-center justify-center gap-2 h-10 rounded-full text-[13px] font-semibold text-pine bg-white no-underline
              hover:bg-zest transition-colors duration-200">
            <Store size={14} className="flex-shrink-0" />
            <span>Back to Store</span>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-canvas font-roboto text-ink">

      {/* ── Desktop Sidebar (always visible ≥ lg) ── */}
      <aside className="hidden lg:flex w-[240px] bg-pine flex-col fixed top-3 left-3 bottom-3 z-30 rounded-[28px]">
        <SidebarContent />
      </aside>

      {/* ── Mobile: Backdrop ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-pine/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile: Slide-in Drawer ── */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-[270px] bg-pine rounded-r-[28px]
          flex flex-col transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-5 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full
            text-white/80 hover:text-pine hover:bg-zest transition-colors"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <main className="lg:ml-[256px] flex-1 min-h-screen w-0 lg:w-auto">
        {/* Top bar */}
        <header className="relative z-20">
          <div className="flex items-center gap-3 px-4 lg:px-8 py-3 lg:py-4">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-pine text-white
                hover:bg-pine-deep transition-colors"
              aria-label="Open menu"
            >
              <Menu size={17} />
            </button>
            <div className="min-w-0">
              <div className="text-[15px] lg:text-[17px] font-poppins font-semibold text-pine truncate">
                {hello.text}{user?.firstName ? `, ${user.firstName}` : ""} <span aria-hidden>{hello.emoji}</span>
              </div>
              <div className="text-[12px] text-faint hidden sm:block">{today}</div>
            </div>
            <Link href="/admin_console/sales"
              className="ml-auto hidden sm:flex items-center gap-2 h-10 px-4 rounded-full bg-zest text-pine text-[13px] font-semibold no-underline
                hover:bg-pine hover:text-zest transition-colors duration-200">
              <ReceiptText size={14} /> Record a sale
            </Link>
          </div>
        </header>
        <div className="px-4 pb-10 pt-2 lg:px-8 lg:pt-3 max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
