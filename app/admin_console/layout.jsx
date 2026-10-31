// app/admin_console/layout.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminProvider } from "@/components/admin/AdminContext";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { Spinner, cx } from "@/components/admin/ui";

const COLLAPSED_KEY = "fil_admin_sidebar_collapsed";

export default function AdminLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user,      setUser]      = useState(null);
  const [checking,  setChecking]  = useState(true);
  const [collapsed, setCollapsed] = useState(false); // desktop icon rail
  const [drawer,    setDrawer]    = useState(false); // mobile menu

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

  useEffect(() => {
    try { setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1"); } catch {}
  }, []);

  // Close the drawer on navigation
  useEffect(() => { setDrawer(false); }, [pathname]);

  // Lock page scroll and allow Escape while the drawer is open
  useEffect(() => {
    if (!drawer) return;
    const onKey = e => { if (e.key === "Escape") setDrawer(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const toggleSidebar = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setCollapsed(c => {
        try { localStorage.setItem(COLLAPSED_KEY, c ? "0" : "1"); } catch {}
        return !c;
      });
    } else {
      setDrawer(d => !d);
    }
  };

  if (checking || !user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-canvas font-roboto text-[13px] text-faint">
        <Spinner />
        Checking access…
      </div>
    );
  }

  return (
    <AdminProvider user={user}>
      <div className="flex min-h-screen bg-canvas font-roboto text-sm text-ink">

        {/* Desktop sidebar */}
        <aside
          className={cx(
            "sticky top-0 hidden h-screen shrink-0 border-r border-edge bg-white transition-[width] duration-200 lg:block",
            collapsed ? "w-[76px]" : "w-[248px]",
          )}
        >
          <Sidebar collapsed={collapsed} />
        </aside>

        {/* Mobile drawer */}
        <div
          className={cx("fixed inset-0 z-40 bg-[rgba(17,24,20,0.4)] transition-opacity lg:hidden", drawer ? "opacity-100" : "pointer-events-none opacity-0")}
          onClick={() => setDrawer(false)}
          aria-hidden
        />
        <aside
          className={cx(
            "fixed inset-y-0 left-0 z-50 w-[272px] max-w-[85vw] bg-white shadow-[0_0_40px_rgba(0,0,0,0.15)] transition-[transform,visibility] duration-200 lg:hidden",
            drawer ? "translate-x-0" : "invisible -translate-x-full",
          )}
        >
          <Sidebar />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onToggleSidebar={toggleSidebar} />
          <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-5 sm:px-6 sm:py-6">
            {children}
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
