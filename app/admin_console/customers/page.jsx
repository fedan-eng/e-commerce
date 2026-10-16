// app/admin_console/customers/page.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { MoreVertical, Eye, MessageCircle, Phone, Mail, Users } from "lucide-react";
import {
  PageHeader, Card, Tabs, SearchInput, Dropdown, MenuItem, MenuSeparator, Pagination, Avatar,
  EmptyState, Spinner, selectCls, TH, TD, cx,
} from "@/components/admin/ui";
import { money, localPhone, telLink, whatsappLink } from "@/components/admin/format";

const PAGE_SIZE = 20;

const ROLE_TABS = [
  { value: "all",   label: "All" },
  { value: "user",  label: "Customers" },
  { value: "admin", label: "Admins" },
];

const SORTS = [
  { value: "createdAt:desc",  label: "Newest first" },
  { value: "createdAt:asc",   label: "Oldest first" },
  { value: "totalSpent:desc", label: "Highest spend" },
  { value: "totalSpent:asc",  label: "Lowest spend" },
];

const fullName = u => [u.firstName, u.lastName].filter(Boolean).join(" ") || "—";
const fmtDate  = d => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function RoleBadge({ role }) {
  return role === "admin"
    ? <span className="rounded-full bg-pine-tint px-2 py-0.5 text-xs font-medium text-pine">Admin</span>
    : <span className="rounded-full bg-[#f1f3f2] px-2 py-0.5 text-xs font-medium text-sub">Customer</span>;
}

function CartCell({ user }) {
  const n = user.cart?.items?.length || 0;
  if (!n) return <span className="text-faint">—</span>;
  const stale = user.cart.updatedAt && Date.now() - new Date(user.cart.updatedAt).getTime() > 48 * 3600 * 1000;
  return (
    <span className="flex flex-col">
      <span className={stale ? "text-[#b45309]" : "text-[#15803d]"}>{n} item{n === 1 ? "" : "s"}{stale ? " · abandoned" : ""}</span>
      {user.cart.updatedAt && <span className="text-xs text-faint">{fmtDate(user.cart.updatedAt)}</span>}
    </span>
  );
}

function CustomerMenu({ user }) {
  const phone = localPhone(user.phone);
  return (
    <Dropdown
      renderTrigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label={`More actions for ${fullName(user)}`}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-sub transition-colors hover:bg-hover hover:text-ink"
        >
          <MoreVertical size={16} aria-hidden />
        </button>
      )}
    >
      <MenuItem icon={Eye} href={`/admin_console/customers/${user._id}`}>View profile</MenuItem>
      {(phone || user.email) && <MenuSeparator />}
      {phone && <MenuItem icon={MessageCircle} onClick={() => window.open(whatsappLink(phone, `Hi ${user.firstName || ""}, this is FIL.`), "_blank", "noopener")}>Message on WhatsApp</MenuItem>}
      {phone && <MenuItem icon={Phone} onClick={() => { window.location.href = telLink(phone); }}>Call {phone}</MenuItem>}
      {user.email && <MenuItem icon={Mail} onClick={() => { window.location.href = `mailto:${user.email}`; }}>Email</MenuItem>}
    </Dropdown>
  );
}

export default function AdminCustomersPage() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [cartFilter, setCartFilter] = useState("all");
  const [sort, setSort]             = useState("createdAt:desc");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [sortBy, sortOrder] = sort.split(":");
      const params = new URLSearchParams({ page, limit: PAGE_SIZE });
      if (search)               params.append("search", search);
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (cartFilter !== "all") params.append("cartStatus", cartFilter);
      if (sortBy !== "createdAt") params.append("sortBy", sortBy);
      if (sortOrder !== "desc")   params.append("sortOrder", sortOrder);
      const data = await fetch(`/api/admin/users?${params}`).then(r => r.json());
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      toast.error("Couldn't load customers");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, cartFilter, sort]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const resetPage = setter => v => { setter(v); setPage(1); };
  const hasFilters = search || cartFilter !== "all" || roleFilter !== "all";

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${total.toLocaleString()} account${total === 1 ? "" : "s"}${hasFilters ? " matching your filters" : ""}`}
      />

      <Card>
        <Tabs label="Account type" value={roleFilter} onChange={resetPage(setRoleFilter)} tabs={ROLE_TABS} />

        <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:px-5">
          <SearchInput
            className="min-w-[220px] flex-1"
            value={search}
            onChange={resetPage(setSearch)}
            onClear={() => resetPage(setSearch)("")}
            placeholder="Search by name, email or phone"
          />
          <select value={cartFilter} onChange={e => resetPage(setCartFilter)(e.target.value)} className={cx(selectCls, "w-auto")} aria-label="Cart">
            <option value="all">Any cart</option>
            <option value="has_cart">Has items in cart</option>
            <option value="abandoned">Abandoned cart (48h+)</option>
          </select>
          <select value={sort} onChange={e => resetPage(setSort)(e.target.value)} className={cx(selectCls, "w-auto")} aria-label="Sort">
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {loading && !users.length ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="No customers found" description={hasFilters ? "Try a different search or filter." : "Accounts appear here as people sign up."} />
        ) : (
          <div className={cx("transition-opacity", loading && "opacity-60")}>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[820px] border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className={TH}>Customer</th>
                    <th className={cx(TH, "hidden lg:table-cell")}>Phone</th>
                    <th className={cx(TH, "hidden xl:table-cell")}>Location</th>
                    <th className={TH}>Role</th>
                    <th className={TH}>Cart</th>
                    <th className={cx(TH, "text-right")}>Spent</th>
                    <th className={cx(TH, "hidden xl:table-cell")}>Joined</th>
                    <th className={cx(TH, "w-12")}><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="transition-colors hover:bg-[#fafbfa]">
                      <td className={TD}>
                        <Link href={`/admin_console/customers/${u._id}`} className="flex items-center gap-3 text-ink no-underline">
                          <Avatar first={u.firstName} last={u.lastName} email={u.email} />
                          <span className="min-w-0">
                            <span className="flex items-center gap-2">
                              <span className="max-w-[200px] truncate font-medium hover:text-pine">{fullName(u)}</span>
                              {u.isActive === false && <span className="rounded-full bg-[#fdeeee] px-2 py-px text-[11px] font-medium text-[#b91c1c]">Suspended</span>}
                            </span>
                            <span className="block max-w-[240px] truncate text-xs text-faint">{u.email}</span>
                          </span>
                        </Link>
                      </td>
                      <td className={cx(TD, "hidden whitespace-nowrap text-sub lg:table-cell")}>{localPhone(u.phone) || "—"}</td>
                      <td className={cx(TD, "hidden whitespace-nowrap text-sub xl:table-cell")}>{[u.city, u.country].filter(Boolean).join(", ") || "—"}</td>
                      <td className={TD}><RoleBadge role={u.role} /></td>
                      <td className={cx(TD, "whitespace-nowrap")}><CartCell user={u} /></td>
                      <td className={cx(TD, "whitespace-nowrap text-right font-medium")}>{money(u.totalSpent)}</td>
                      <td className={cx(TD, "hidden whitespace-nowrap text-sub xl:table-cell")}>{fmtDate(u.createdAt)}</td>
                      <td className={cx(TD, "text-right")}><CustomerMenu user={u} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col md:hidden">
              {users.map(u => (
                <div key={u._id} className="flex items-center gap-3 border-t border-[#eef0ef] px-3 py-3">
                  <Avatar first={u.firstName} last={u.lastName} email={u.email} />
                  <Link href={`/admin_console/customers/${u._id}`} className="min-w-0 flex-1 text-ink no-underline">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-medium">{fullName(u)}</span>
                      {u.role === "admin" && <RoleBadge role="admin" />}
                      {u.isActive === false && <span className="rounded-full bg-[#fdeeee] px-2 py-px text-[11px] font-medium text-[#b91c1c]">Suspended</span>}
                    </span>
                    <span className="block truncate text-xs text-faint">{u.email}</span>
                    <span className="block text-xs text-sub">
                      {money(u.totalSpent)} spent{u.cart?.items?.length ? ` · ${u.cart.items.length} in cart` : ""}
                    </span>
                  </Link>
                  <CustomerMenu user={u} />
                </div>
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} onChange={setPage} noun="accounts" />
          </div>
        )}
      </Card>
    </div>
  );
}
