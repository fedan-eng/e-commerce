// app/admin/customers/page.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const ROLE_CONFIG = {
  admin: { text: "text-pine", bg: "bg-zest/35", border: "border-pine/25", hex: "#b7791f" },
  user:  { text: "text-[#1d6fb0]", bg: "bg-[#e7f1fb]", border: "border-[#c3dbf1]", hex: "#1d6fb0" },
};

function getRoleStyle(role) {
  return ROLE_CONFIG[role] || ROLE_CONFIG.user;
}

export default function AdminCustomersPage() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [cartFilter, setCartFilter] = useState("all");
  const [sortBy, setSortBy]         = useState("createdAt");
  const [sortOrder, setSortOrder]   = useState("desc");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1); 
  const [total, setTotal]           = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (search)              params.append("search", search);
    if (roleFilter !== "all") params.append("role", roleFilter);
    if (cartFilter !== "all") params.append("cartStatus", cartFilter);
    if (sortBy !== "createdAt") params.append("sortBy", sortBy);
    if (sortOrder !== "desc") params.append("sortOrder", sortOrder);
    const res  = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users || []);
    setTotalPages(data.totalPages || 1);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, search, roleFilter, cartFilter, sortBy, sortOrder]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const getInitials = (user) => {
    const f = user.firstName?.[0] || "";
    const l = user.lastName?.[0] || "";
    return (f + l).toUpperCase() || user.email?.[0]?.toUpperCase() || "?";
  };

  const ROLE_TABS = [
    { key: "all",   label: "All",   activeClass: "border-pine text-white bg-pine" },
    { key: "user",  label: "User",  activeClass: "border-[#1d6fb0] text-[#1d6fb0] bg-[#e7f1fb]" },
    { key: "admin", label: "Admin", activeClass: "border-pine text-pine bg-zest/35" },
  ];

  const CART_TABS = [
    { key: "all",       label: "All Carts",      activeClass: "border-pine text-white bg-pine" },
    { key: "has_cart",  label: "Has Cart",       activeClass: "border-[#15803d] text-[#15803d] bg-[#e3f6e9]" },
    { key: "abandoned", label: "Abandoned",      activeClass: "border-[#c53030] text-[#c53030] bg-[#fdecec]" },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center text-[11px] font-semibold text-pine bg-zest px-2.5 py-0.5 rounded-full mb-2">Management</div>
        <h1 className="m-0 text-[28px] font-poppins font-bold text-pine leading-tight">
          Customers <span className="text-faint text-base font-roboto font-medium">({total})</span>
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-start sm:items-center">
          <input type="text" placeholder="Search by name, email, phone..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full sm:w-[300px] h-11 bg-white border border-line-strong rounded-full px-5 text-ink text-[13px] outline-none focus:border-pine transition-colors"
          />
          {/* Role tabs */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 w-full sm:w-auto" style={{ scrollbarWidth: "none" }}>
            {ROLE_TABS.map(r => (
              <button key={r.key} onClick={() => { setRoleFilter(r.key); setPage(1); }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer border transition-all
                  ${roleFilter === r.key ? r.activeClass : "border-line text-muted bg-white hover:border-pine hover:text-pine"}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        {/* Cart tabs */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 w-full lg:w-auto" style={{ scrollbarWidth: "none" }}>
          {CART_TABS.map(c => (
            <button key={c.key} onClick={() => { setCartFilter(c.key); setPage(1); }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-[12px] font-medium cursor-pointer border transition-all
                ${cartFilter === c.key ? c.activeClass : "border-line text-muted bg-white hover:border-pine hover:text-pine"}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center gap-3 text-faint text-[13px] bg-white border border-line rounded-3xl">
          <div className="w-7 h-7 rounded-full border-[3px] border-mint border-t-pine animate-spin" />
          Loading customers…
        </div>
      ) : users.length === 0 ? (
        <div className="py-12 text-faint text-[13px] text-center bg-white border border-line rounded-3xl">
          <div className="text-3xl mb-2" aria-hidden>🙈</div>
          No customers found.
        </div>
      ) : (
        <>
          {/* ── Desktop Table ── */}
          <div className="hidden md:block bg-white border border-line rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-sage">
                    <th className="px-5 py-3 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold whitespace-nowrap">Customer</th>
                    <th className="px-5 py-3 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold whitespace-nowrap hidden lg:table-cell">Phone</th>
                    <th className="px-5 py-3 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold whitespace-nowrap hidden xl:table-cell">Location</th>
                    <th className="px-5 py-3 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold whitespace-nowrap">Role</th>
                    <th className="px-5 py-3 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold whitespace-nowrap hidden lg:table-cell">Provider</th>
                    <th className="px-5 py-3 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold whitespace-nowrap">Cart</th>
                    <th className="px-5 py-3 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold whitespace-nowrap">
                      <button 
                        onClick={() => {
                          if (sortBy === "totalSpent") {
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                          } else {
                            setSortBy("totalSpent");
                            setSortOrder("desc");
                          }
                          setPage(1);
                        }}
                        className="flex items-center gap-1 text-faint hover:text-ink transition-colors cursor-pointer"
                      >
                        Amount Spent
                        {sortBy === "totalSpent" && (
                          <span className="text-pine">{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold whitespace-nowrap hidden xl:table-cell">Joined</th>
                    <th className="px-5 py-3 text-right text-[11px] tracking-[0.08em] text-faint uppercase font-semibold whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => {
                    const rs = getRoleStyle(user.role);
                    return (
                      <tr key={user._id} className="border-b border-line hover:bg-[#fafcf9] transition-colors">
                        {/* Customer + Email (Merged Column) */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] font-bold tracking-[0.05em] border ${rs.text} ${rs.bg} ${rs.border}`}>
                              {getInitials(user)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-[13px] text-ink font-medium truncate max-w-[180px]">
                                {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
                              </div>
                              <div className="text-[11px] text-faint truncate max-w-[180px]">{user.email}</div>
                              {user.isActive === false && (
                                <span className="text-[10px] text-[#c53030] font-semibold bg-[#fdecec] border border-[#f3c4c4] px-2 rounded-full mt-0.5 inline-block">
                                  Suspended
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Phone (Hidden on Medium, Shown on Large+) */}
                        <td className="px-5 py-4 text-[12px] text-muted whitespace-nowrap hidden lg:table-cell">
                          {user.phone || "—"}
                        </td>

                        {/* Location (Hidden on Laptop, Shown on Large Desktop) */}
                        <td className="px-5 py-4 text-[12px] text-faint whitespace-nowrap hidden xl:table-cell">
                          {[user.city, user.country].filter(Boolean).join(", ") || "—"}
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`text-[10px] font-semibold capitalize border px-2 py-0.5 rounded-full ${rs.text} ${rs.bg} ${rs.border}`}>
                            {user.role}
                          </span>
                        </td>

                        {/* Provider (Hidden on Medium, Shown on Large+) */}
                        <td className="px-5 py-4 whitespace-nowrap hidden lg:table-cell">
                          {user.provider === "google" ? (
                            <span className="text-[11px] text-pine font-medium">Google</span>
                          ) : (
                            <span className="text-[11px] text-[#1d6fb0] font-medium">Email</span>
                          )}
                        </td>

                        {/* Cart */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {user.cart?.items?.length > 0 ? (
                            <div className="flex flex-col">
                              <span className="text-[12px] text-[#15803d] font-medium">{user.cart.items.length} item(s)</span>
                              {user.cart.updatedAt && (
                                <span className="text-[10px] text-faint">
                                  {new Date(user.cart.updatedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-faint">—</span>
                          )}
                        </td>

                        {/* Amount Spent */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-[13px] text-ink font-semibold">₦{(user.totalSpent || 0).toLocaleString()}</span>
                        </td>

                        {/* Joined (Hidden on Laptop, Shown on Large Desktop) */}
                        <td className="px-5 py-4 text-[12px] text-muted whitespace-nowrap hidden xl:table-cell">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>

                        {/* View Action */}
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <Link href={`/admin_console/customers/${user._id}`}
                            className="text-[12px] font-semibold text-pine no-underline px-3.5 py-1.5 bg-mint rounded-full hover:bg-zest transition-colors whitespace-nowrap">
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-line flex justify-between items-center">
                <span className="text-[12px] text-faint">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className={`px-4 py-1.5 bg-white border border-line rounded-full text-[12px] font-medium ${page === 1 ? "text-ghost cursor-default" : "text-pine cursor-pointer hover:border-pine hover:bg-mint"}`}>
                    ← Prev
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className={`px-4 py-1.5 bg-white border border-line rounded-full text-[12px] font-medium ${page === totalPages ? "text-ghost cursor-default" : "text-pine cursor-pointer hover:border-pine hover:bg-mint"}`}>
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Mobile Cards ── */}
          <div className="md:hidden flex flex-col gap-2.5">
            {users.map(user => {
              const rs = getRoleStyle(user.role);
              return (
                <div key={user._id} className="bg-white border border-line rounded-3xl p-4 hover:border-line transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-[13px] font-bold border ${rs.text} ${rs.bg} ${rs.border}`}>
                      {getInitials(user)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] text-ink font-medium">
                          {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
                        </span>
                        <span className={`text-[10px] font-semibold capitalize border px-2 py-0.5 rounded-full ${rs.text} ${rs.bg} ${rs.border}`}>
                          {user.role}
                        </span>
                        <span className={`text-[10px] font-semibold capitalize border px-2 py-0.5 rounded-full ${user.provider === "google" ? "text-pine bg-zest/35 border-pine/25" : "text-[#1d6fb0] bg-[#e7f1fb] border-[#c3dbf1]"}`}>
                          {user.provider === "google" ? "Google" : "Email"}
                        </span>
                        {user.isActive === false && (
                          <span className="text-[10px] text-[#c53030] font-semibold bg-[#fdecec] border border-[#f3c4c4] px-2 py-0.5 rounded-full">
                            Suspended
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] text-faint mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2.5 border-t border-line">
                    <div className="text-[11px] text-faint">
                      {user.phone && <span className="mr-3">{user.phone}</span>}
                      {user.cart?.items?.length > 0 && (
                        <span className="mr-3 text-[#15803d]">{user.cart.items.length} cart item(s)</span>
                      )}
                      <span className="mr-3 text-ink font-semibold">₦{(user.totalSpent || 0).toLocaleString()}</span>
                      <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <Link href={`/admin_console/customers/${user._id}`}
                      className="text-[12px] font-semibold text-pine no-underline px-3.5 py-1.5 bg-mint rounded-full hover:bg-zest transition-colors whitespace-nowrap">
                      View →
                    </Link>
                  </div>
                </div>
              );
            })}

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-[12px] text-faint">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className={`px-4 py-1.5 bg-white border border-line rounded-full text-[12px] font-medium ${page === 1 ? "text-ghost cursor-default" : "text-pine cursor-pointer hover:border-pine hover:bg-mint"}`}>
                    ← Prev
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className={`px-4 py-1.5 bg-white border border-line rounded-full text-[12px] font-medium ${page === totalPages ? "text-ghost cursor-default" : "text-pine cursor-pointer hover:border-pine hover:bg-mint"}`}>
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}