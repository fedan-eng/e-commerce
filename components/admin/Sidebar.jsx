// components/admin/Sidebar.jsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, ReceiptText, TicketPercent, Package, Users, Star, MessageCircle, Store, LogOut } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { useAdmin } from "./AdminContext";
import { cx } from "./ui";

const GROUPS = [
  { label: "Overview",  items: [{ href: "/admin_console", label: "Dashboard", icon: LayoutDashboard }] },
  { label: "Sales",     items: [
    { href: "/admin_console/orders", label: "Orders",      icon: ShoppingBag, badge: "confirmedOrders" },
    { href: "/admin_console/sales",  label: "Sales entry", icon: ReceiptText },
    { href: "/admin_console/promo-codes", label: "Promo codes", icon: TicketPercent },
  ] },
  { label: "Catalogue", items: [{ href: "/admin_console/products", label: "Products", icon: Package }] },
  { label: "People",    items: [
    { href: "/admin_console/customers", label: "Customers", icon: Users },
    { href: "/admin_console/reviews",   label: "Reviews",   icon: Star, badge: "pendingReviews" },
    { href: "/admin_console/whatsapp-reviews", label: "WhatsApp reviews", icon: MessageCircle },
  ] },
];

const itemCls = (active, collapsed) => cx(
  "relative flex h-10 w-full cursor-pointer items-center gap-3 whitespace-nowrap rounded-lg text-left text-sm font-medium no-underline transition-colors",
  collapsed ? "justify-center px-0" : "px-3",
  active ? "bg-pine-tint text-pine" : "text-sub hover:bg-hover hover:text-ink",
);

// collapsed only applies on desktop; the mobile drawer always shows labels
export default function Sidebar({ collapsed = false }) {
  const pathname = usePathname();
  const { alerts } = useAdmin();

  return (
    <div className="flex h-full flex-col">
      <div className={cx("flex h-16 shrink-0 items-center gap-2.5 border-b border-edge", collapsed ? "justify-center" : "px-5")}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pine font-poppins text-[15px] font-bold text-white">F</span>
        {!collapsed && <span className="font-poppins text-base font-semibold text-ink">FIL Admin</span>}
      </div>

      <nav className="no-scrollbar flex flex-1 flex-col gap-0.5 overflow-y-auto p-3" aria-label="Admin">
        {GROUPS.map((group, gi) => (
          <div key={group.label} className="flex flex-col gap-0.5">
            {collapsed
              ? gi > 0 && <div className="mx-2 my-2.5 h-px bg-edge" />
              : <div className="px-3 pb-1.5 pt-3.5 text-[11px] font-medium uppercase tracking-[0.06em] text-faint">{group.label}</div>}
            {group.items.map(item => {
              const Icon   = item.icon;
              const active = pathname === item.href || (item.href !== "/admin_console" && pathname.startsWith(item.href));
              const count  = item.badge ? alerts?.[item.badge] : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                  className={itemCls(active, collapsed)}
                >
                  {active && <span className="absolute -left-3 bottom-2 top-2 w-[3px] rounded-r bg-pine" aria-hidden />}
                  <Icon size={18} className="shrink-0" aria-hidden />
                  {!collapsed && <span>{item.label}</span>}
                  {count > 0 && (
                    collapsed
                      ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-pine" aria-label={`${count} waiting`} />
                      : <span className={cx(
                          "ml-auto rounded-full px-2 py-px text-[11px] font-semibold",
                          active ? "bg-pine text-white" : "bg-[#f1f3f2] text-sub",
                        )}>{count > 99 ? "99+" : count}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-0.5 border-t border-edge p-3">
        <Link href="/" title={collapsed ? "Back to store" : undefined} className={itemCls(false, collapsed)}>
          <Store size={18} className="shrink-0" aria-hidden />
          {!collapsed && <span>Back to store</span>}
        </Link>
        <LogoutButton className={itemCls(false, collapsed)}>
          <LogOut size={18} className="shrink-0" aria-hidden />
          {!collapsed && <span>Log out</span>}
          {collapsed && <span className="sr-only">Log out</span>}
        </LogoutButton>
      </div>
    </div>
  );
}
