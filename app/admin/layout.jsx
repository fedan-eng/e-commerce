// app/admin/layout.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut } from 'lucide-react';

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "monospace" }}>
        Verifying access...
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "⬡" },
    { href: "/admin/orders", label: "Orders", icon: "◈" },
    { href: "/admin/products", label: "Products", icon: "◉" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a", fontFamily: "'DM Mono', 'Courier New', monospace" }}>
      {/* Sidebar */}
      <aside style={{
        width: "220px",
        minHeight: "100vh",
        background: "#111",
        borderRight: "1px solid #222",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 10,
      }}>
        <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid #222" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#555", marginBottom: "4px", textTransform: "uppercase" }}>Control Panel</div>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#e8e8e8", letterSpacing: "-0.02em" }}>Admin</div>
        </div>

        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                marginBottom: "4px",
                borderRadius: "6px",
                color: active ? "#e8e8e8" : "#555",
                background: active ? "#1e1e1e" : "transparent",
                textDecoration: "none",
                fontSize: "13px",
                letterSpacing: "0.04em",
                borderLeft: active ? "2px solid #e8c46a" : "2px solid transparent",
                transition: "all 0.15s ease",
              }}>
                <span style={{ fontSize: "16px" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-6" style={{ borderTop: "1px solid #222", fontSize: "11px", color: "#444" }}>
          <div>
            {user?.firstName} {user?.lastName}
          <div style={{ color: "#2a6e2a", marginTop: "2px" }}>● admin</div>
          </div>
          <Link  className="hover:bg-[#1e1e1e] bg-[#2a2a2a] py-3 px-5 rounded-lg" href="/" style={{ marginTop: "8px", color:"red", display: "flex", alignItems: "center", gap: "4px" }}>
            <LogOut size={14} />
            Logout
          </Link>
        </div>
      </aside> 

      {/* Main Content */}
      <main style={{ marginLeft: "220px", flex: 1, padding: "32px", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}