// components/admin/Topbar.jsx
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PanelLeft, Search, Bell, ChevronDown, Store, LogOut, X } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { shortId } from "@/lib/orderStatus";
import { useAdmin } from "./AdminContext";
import { Dropdown, IconButton, MenuItem, MenuLabel, MenuSeparator, Spinner, cx } from "./ui";
import { initials, money, timeAgo } from "./format";

// [section, page, link back to the section's list]
function crumbsFor(pathname) {
  const [, , section, sub] = pathname.split("/");
  switch (section) {
    case "orders":    return sub ? ["Orders", "Order details", "/admin_console/orders"] : ["Sales", "Orders"];
    case "sales":     return ["Sales", "Sales entry"];
    case "products":  return sub ? ["Products", sub === "new" ? "New product" : "Edit product", "/admin_console/products"] : ["Catalogue", "Products"];
    case "customers": return sub ? ["Customers", "Customer details", "/admin_console/customers"] : ["People", "Customers"];
    case "reviews":   return ["People", "Reviews"];
    case "whatsapp-reviews": return ["People", "WhatsApp reviews"];
    default:          return ["Overview", "Dashboard"];
  }
}

// ── Global search: orders, customers and products in one box ──
function GlobalSearch({ autoFocus, shortcut, onNavigate }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const boxRef = useRef(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Ctrl/Cmd + K jumps to search
  useEffect(() => {
    if (!shortcut) return;
    const onKey = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shortcut]);

  useEffect(() => {
    if (!open) return;
    const onDown = e => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setResults(null); setLoading(false); return; }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      const enc = encodeURIComponent(term);
      const get = url => fetch(url, { signal: ctrl.signal }).then(r => (r.ok ? r.json() : {}));
      Promise.all([
        get(`/api/admin/orders?search=${enc}&limit=4`),
        get(`/api/admin/users?search=${enc}&limit=4`),
        get(`/api/products?search=${enc}&limit=4`),
      ])
        .then(([o, u, p]) => setResults({ orders: o.orders || [], customers: u.users || [], products: p.products || [] }))
        .catch(e => { if (e.name !== "AbortError") setResults({ orders: [], customers: [], products: [] }); })
        .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    }, 300);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

  const go = href => {
    setOpen(false);
    setQ("");
    onNavigate?.();
    router.push(href);
  };

  const term = q.trim();
  const empty = results && !results.orders.length && !results.customers.length && !results.products.length;

  return (
    <div ref={boxRef} className="relative w-full">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" aria-hidden />
      <input
        ref={inputRef}
        type="search"
        value={q}
        autoFocus={autoFocus}
        onChange={e => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => {
          if (e.key === "Enter" && term) go(`/admin_console/orders?search=${encodeURIComponent(term)}`);
          if (e.key === "Escape") { setOpen(false); e.currentTarget.blur(); }
        }}
        placeholder="Search orders, customers, products…"
        aria-label="Search orders, customers and products"
        className="h-10 w-full rounded-lg border border-[#e1e5e3] bg-[#f8f9f8] pl-9 pr-14 text-[13px] text-ink outline-none transition-colors placeholder:text-faint focus:border-pine focus:bg-white focus:shadow-[0_0_0_3px_rgba(15,71,43,0.1)]"
      />
      {shortcut && (
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-[#e1e5e3] bg-white px-1.5 py-px font-roboto text-[11px] text-faint md:block">
          Ctrl K
        </kbd>
      )}

      {open && term.length >= 2 && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[70vh] overflow-y-auto rounded-[10px] border border-edge bg-white p-1.5 shadow-[0_16px_40px_-16px_rgba(16,24,20,0.28)]">
          {loading && !results && <div className="flex justify-center py-6"><Spinner className="h-5 w-5" /></div>}
          {empty && <div className="px-3 py-5 text-center text-[13px] text-faint">Nothing matches “{term}”</div>}
          {results?.orders.length > 0 && (
            <>
              <MenuLabel>Orders</MenuLabel>
              {results.orders.map(o => (
                <MenuItem key={o._id} onClick={() => go(`/admin_console/orders/${o._id}`)} description={`${money(o.total ?? o.subTotal)} · ${o.status}`}>
                  #{shortId(o._id)} · {[o.firstName, o.lastName].filter(Boolean).join(" ") || o.email}
                </MenuItem>
              ))}
            </>
          )}
          {results?.customers.length > 0 && (
            <>
              <MenuLabel>Customers</MenuLabel>
              {results.customers.map(u => (
                <MenuItem key={u._id} onClick={() => go(`/admin_console/customers/${u._id}`)} description={u.email}>
                  {[u.firstName, u.lastName].filter(Boolean).join(" ") || u.email}
                </MenuItem>
              ))}
            </>
          )}
          {results?.products.length > 0 && (
            <>
              <MenuLabel>Products</MenuLabel>
              {results.products.map(p => (
                <MenuItem key={p._id} onClick={() => go(`/admin_console/products/${p._id}`)} description={`${p.category || "Product"} · ${money(p.price)}`}>
                  {p.name}
                </MenuItem>
              ))}
            </>
          )}
          {results && !empty && (
            <>
              <MenuSeparator />
              <MenuItem onClick={() => go(`/admin_console/orders?search=${encodeURIComponent(term)}`)}>
                <span className="text-pine">See all orders matching “{term}”</span>
              </MenuItem>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Notification bell ──
const SEEN_KEY = "fil_admin_notifications_seen";

function Notifications() {
  const { alerts } = useAdmin();
  const [seenAt, setSeenAt] = useState(0);

  useEffect(() => {
    try { setSeenAt(Number(localStorage.getItem(SEEN_KEY)) || 0); } catch {}
  }, []);

  const recent = alerts?.recentOrders || [];
  const unseen = recent.filter(o => new Date(o.createdAt).getTime() > seenAt).length;
  const hasDot = unseen > 0 || (alerts?.pendingReviews || 0) > 0;

  const markSeen = () => {
    const now = Date.now();
    setSeenAt(now);
    try { localStorage.setItem(SEEN_KEY, String(now)); } catch {}
  };

  return (
    <Dropdown
      className="w-[320px] max-w-[calc(100vw-24px)]"
      renderTrigger={({ open, toggle }) => (
        <IconButton label="Notifications" aria-expanded={open} onClick={() => { if (!open) markSeen(); toggle(); }}>
          <Bell size={18} aria-hidden />
          {hasDot && <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#dc2626]" aria-hidden />}
        </IconButton>
      )}
    >
      <MenuLabel>Notifications</MenuLabel>
      {!alerts && <div className="flex justify-center py-5"><Spinner className="h-5 w-5" /></div>}
      {alerts?.pendingReviews > 0 && (
        <MenuItem href="/admin_console/reviews" description="Approve or archive them">
          {alerts.pendingReviews} review{alerts.pendingReviews === 1 ? "" : "s"} waiting for approval
        </MenuItem>
      )}
      {alerts?.outOfStock > 0 && (
        <MenuItem href="/admin_console/products" description="Restock or update availability">
          {alerts.outOfStock} product{alerts.outOfStock === 1 ? " is" : "s are"} out of stock
        </MenuItem>
      )}
      {recent.length > 0 && (
        <>
          {(alerts.pendingReviews > 0 || alerts.outOfStock > 0) && <MenuSeparator />}
          <MenuLabel>Latest orders</MenuLabel>
          {recent.map(o => (
            <MenuItem key={o._id} href={`/admin_console/orders/${o._id}`} description={timeAgo(o.createdAt)}>
              #{shortId(o._id)} · {money(o.total ?? o.subTotal)}
            </MenuItem>
          ))}
        </>
      )}
      {alerts && !recent.length && !alerts.pendingReviews && !alerts.outOfStock && (
        <div className="px-3 py-5 text-center text-[13px] text-faint">You’re all caught up</div>
      )}
    </Dropdown>
  );
}

function ProfileMenu() {
  const { user } = useAdmin();
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Admin";
  return (
    <Dropdown
      renderTrigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label="Account menu"
          className="flex h-10 cursor-pointer items-center gap-2.5 rounded-lg pl-1 pr-2 text-ink transition-colors hover:bg-hover"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pine-tint text-xs font-semibold text-pine">
            {initials(user?.firstName, user?.lastName, user?.email?.[0] || "A")}
          </span>
          <span className="hidden text-left leading-tight md:block">
            <span className="block text-[13px] font-medium">{name}</span>
            <span className="block text-[11px] text-faint">Admin</span>
          </span>
          <ChevronDown size={14} className="hidden text-faint md:block" aria-hidden />
        </button>
      )}
    >
      <div className="px-2.5 py-2">
        <div className="text-[13px] font-medium text-ink">{name}</div>
        {user?.email && <div className="truncate text-xs text-faint">{user.email}</div>}
      </div>
      <MenuSeparator />
      <MenuItem href="/" icon={Store}>Back to store</MenuItem>
      <LogoutButton className="flex min-h-9 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13px] text-[#b91c1c] transition-colors hover:bg-hover">
        <LogOut size={15} className="shrink-0" aria-hidden /> Log out
      </LogoutButton>
    </Dropdown>
  );
}

export default function Topbar({ onToggleSidebar }) {
  const pathname = usePathname();
  const [section, page, sectionHref] = crumbsFor(pathname);
  const [mobileSearch, setMobileSearch] = useState(false);

  useEffect(() => { setMobileSearch(false); }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-edge bg-white px-3 sm:gap-3 sm:px-4 lg:px-6">
      <IconButton label="Toggle sidebar" onClick={onToggleSidebar}>
        <PanelLeft size={18} aria-hidden />
      </IconButton>

      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 whitespace-nowrap text-[13px] text-faint">
        {sectionHref
          ? <Link href={sectionHref} className="hidden text-faint no-underline hover:text-pine sm:inline">{section}</Link>
          : <span className="hidden sm:inline">{section}</span>}
        <span className="hidden sm:inline" aria-hidden>/</span>
        <span className="truncate font-medium text-ink" aria-current="page">{page}</span>
      </nav>

      <div className="ml-auto hidden w-[min(380px,38vw)] sm:block">
        <GlobalSearch shortcut />
      </div>

      <IconButton label="Search" className="ml-auto sm:hidden" onClick={() => setMobileSearch(true)}>
        <Search size={18} aria-hidden />
      </IconButton>
      <Notifications />
      <ProfileMenu />

      {mobileSearch && (
        <div className="absolute inset-0 z-10 flex items-center gap-2 bg-white px-3 sm:hidden">
          <GlobalSearch autoFocus onNavigate={() => setMobileSearch(false)} />
          <IconButton label="Close search" onClick={() => setMobileSearch(false)}>
            <X size={18} aria-hidden />
          </IconButton>
        </div>
      )}
    </header>
  );
}
