// app/admin/customers/page.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const ROLE_CONFIG = {
  admin: { text: "text-[#e8c46a]", bg: "bg-[#e8c46a15]", border: "border-[#e8c46a33]", hex: "#e8c46a" },
  user:  { text: "text-[#6ab4e8]", bg: "bg-[#6ab4e815]", border: "border-[#6ab4e833]", hex: "#6ab4e8" },
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
    { key: "all",   label: "All",   activeClass: "border-[#e8e8e8] text-[#e8e8e8] bg-[#e8e8e812]" },
    { key: "user",  label: "User",  activeClass: "border-[#6ab4e8] text-[#6ab4e8] bg-[#6ab4e812]" },
    { key: "admin", label: "Admin", activeClass: "border-[#e8c46a] text-[#e8c46a] bg-[#e8c46a12]" },
  ];

  const CART_TABS = [
    { key: "all",       label: "All Carts",      activeClass: "border-[#e8e8e8] text-[#e8e8e8] bg-[#e8e8e812]" },
    { key: "has_cart",  label: "Has Cart",       activeClass: "border-[#6ae8a0] text-[#6ae8a0] bg-[#6ae8a012]" },
    { key: "abandoned", label: "Abandoned",      activeClass: "border-[#e86a6a] text-[#e86a6a] bg-[#e86a6a12]" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="text-[11px] tracking-[0.2em] text-[#fff] uppercase mb-1.5">Management</div>
        <h1 className="m-0 text-[28px] font-bold text-[#e8e8e8] tracking-tight">
          Customers <span className="text-[#444] text-lg">({total})</span>
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-start sm:items-center">
          <input type="text" placeholder="Search by name, email, phone..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full sm:w-[300px] bg-[#111] border border-[#222] rounded-md px-4 py-2.5 text-[#e8e8e8] text-[13px] outline-none font-mono"
          />
          {/* Role tabs */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 w-full sm:w-auto" style={{ scrollbarWidth: "none" }}>
            {ROLE_TABS.map(r => (
              <button key={r.key} onClick={() => { setRoleFilter(r.key); setPage(1); }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[11px] tracking-[0.1em] uppercase cursor-pointer border transition-all font-mono
                  ${roleFilter === r.key ? r.activeClass : "border-[#222] text-[#fff] bg-transparent hover:border-[#333] hover:text-[#777]"}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        {/* Cart tabs */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 w-full lg:w-auto" style={{ scrollbarWidth: "none" }}>
          {CART_TABS.map(c => (
            <button key={c.key} onClick={() => { setCartFilter(c.key); setPage(1); }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-[11px] tracking-[0.1em] uppercase cursor-pointer border transition-all font-mono
                ${cartFilter === c.key ? c.activeClass : "border-[#222] text-[#fff] bg-transparent hover:border-[#333] hover:text-[#777]"}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-[#444] text-[13px] text-center bg-[#111] border border-[#222] rounded-lg">
          Loading customers....
        </div>
      ) : users.length === 0 ? (
        <div className="py-12 text-[#444] text-[13px] text-center bg-[#111] border border-[#222] rounded-lg">
          No customers found.
        </div>
      ) : (
        <>
          {/* ── Desktop Table ── */}
          <div className="hidden md:block bg-[#111] border border-[#222] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#1a1a1a] bg-[#0c0c0c]">
                    <th className="px-5 py-4 text-left text-[10px] tracking-[0.15em] text-[#555] uppercase font-semibold whitespace-nowrap">Customer</th>
                    <th className="px-5 py-4 text-left text-[10px] tracking-[0.15em] text-[#555] uppercase font-semibold whitespace-nowrap hidden lg:table-cell">Phone</th>
                    <th className="px-5 py-4 text-left text-[10px] tracking-[0.15em] text-[#555] uppercase font-semibold whitespace-nowrap hidden xl:table-cell">Location</th>
                    <th className="px-5 py-4 text-left text-[10px] tracking-[0.15em] text-[#555] uppercase font-semibold whitespace-nowrap">Role</th>
                    <th className="px-5 py-4 text-left text-[10px] tracking-[0.15em] text-[#555] uppercase font-semibold whitespace-nowrap hidden lg:table-cell">Provider</th>
                    <th className="px-5 py-4 text-left text-[10px] tracking-[0.15em] text-[#555] uppercase font-semibold whitespace-nowrap">Cart</th>
                    <th className="px-5 py-4 text-left text-[10px] tracking-[0.15em] text-[#555] uppercase font-semibold whitespace-nowrap">
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
                        className="flex items-center gap-1 text-[#555] hover:text-[#e8e8e8] transition-colors cursor-pointer"
                      >
                        Amount Spent
                        {sortBy === "totalSpent" && (
                          <span className="text-[#e8c46a]">{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    </th>
                    <th className="px-5 py-4 text-left text-[10px] tracking-[0.15em] text-[#555] uppercase font-semibold whitespace-nowrap hidden xl:table-cell">Joined</th>
                    <th className="px-5 py-4 text-right text-[10px] tracking-[0.15em] text-[#555] uppercase font-semibold whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => {
                    const rs = getRoleStyle(user.role);
                    return (
                      <tr key={user._id} className="border-b border-[#161616] hover:bg-[#141414] transition-colors">
                        {/* Customer + Email (Merged Column) */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] font-bold tracking-[0.05em] border ${rs.text} ${rs.bg} ${rs.border}`}>
                              {getInitials(user)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-[13px] text-[#e8e8e8] font-medium truncate max-w-[180px]">
                                {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
                              </div>
                              <div className="text-[11px] text-[#666] truncate max-w-[180px]">{user.email}</div>
                              {user.isActive === false && (
                                <span className="text-[8px] text-[#e86a6a] font-bold tracking-[0.08em] bg-[#e86a6a12] border border-[#e86a6a33] px-1 rounded uppercase mt-0.5 inline-block">
                                  Suspended
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Phone (Hidden on Medium, Shown on Large+) */}
                        <td className="px-5 py-4 text-[12px] text-[#888] whitespace-nowrap hidden lg:table-cell">
                          {user.phone || "—"}
                        </td>

                        {/* Location (Hidden on Laptop, Shown on Large Desktop) */}
                        <td className="px-5 py-4 text-[12px] text-[#666] whitespace-nowrap hidden xl:table-cell">
                          {[user.city, user.country].filter(Boolean).join(", ") || "—"}
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`text-[10px] tracking-[0.1em] uppercase border px-2 py-0.5 rounded ${rs.text} ${rs.bg} ${rs.border}`}>
                            {user.role}
                          </span>
                        </td>

                        {/* Provider (Hidden on Medium, Shown on Large+) */}
                        <td className="px-5 py-4 whitespace-nowrap hidden lg:table-cell">
                          {user.provider === "google" ? (
                            <span className="text-[11px] text-[#e8c46a] font-medium">Google</span>
                          ) : (
                            <span className="text-[11px] text-[#6ab4e8] font-medium">Email</span>
                          )}
                        </td>

                        {/* Cart */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {user.cart?.items?.length > 0 ? (
                            <div className="flex flex-col">
                              <span className="text-[12px] text-[#6ae8a0] font-medium">{user.cart.items.length} item(s)</span>
                              {user.cart.updatedAt && (
                                <span className="text-[10px] text-[#444]">
                                  {new Date(user.cart.updatedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#444]">—</span>
                          )}
                        </td>

                        {/* Amount Spent */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-[13px] text-[#e8e8e8] font-semibold">₦{(user.totalSpent || 0).toLocaleString()}</span>
                        </td>

                        {/* Joined (Hidden on Laptop, Shown on Large Desktop) */}
                        <td className="px-5 py-4 text-[12px] text-[#888] whitespace-nowrap hidden xl:table-cell">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>

                        {/* View Action */}
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <Link href={`/admin/customers/${user._id}`}
                            className="text-[11px] text-[#fff] no-underline tracking-[0.08em] px-3 py-1.5 border border-[#222] rounded transition-all hover:text-[#e8e8e8] hover:border-[#444]">
                            VIEW
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-[#1a1a1a] flex justify-between items-center">
                <span className="text-[12px] text-[#444]">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className={`px-4 py-1.5 bg-transparent border border-[#222] rounded text-[12px] font-mono ${page === 1 ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}>
                    ← Prev
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className={`px-4 py-1.5 bg-transparent border border-[#222] rounded text-[12px] font-mono ${page === totalPages ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}>
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
                <div key={user._id} className="bg-[#111] border border-[#1a1a1a] rounded-lg p-4 hover:border-[#2a2a2a] transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-[13px] font-bold border ${rs.text} ${rs.bg} ${rs.border}`}>
                      {getInitials(user)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] text-[#e8e8e8] font-medium">
                          {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
                        </span>
                        <span className={`text-[9px] tracking-[0.1em] uppercase border px-1.5 py-px rounded ${rs.text} ${rs.bg} ${rs.border}`}>
                          {user.role}
                        </span>
                        <span className={`text-[9px] tracking-[0.08em] uppercase border px-1.5 py-px rounded ${user.provider === "google" ? "text-[#e8c46a] bg-[#e8c46a18] border-[#e8c46a33]" : "text-[#6ab4e8] bg-[#6ab4e818] border-[#6ab4e833]"}`}>
                          {user.provider === "google" ? "Google" : "Email"}
                        </span>
                        {user.isActive === false && (
                          <span className="text-[9px] text-[#e86a6a] tracking-[0.08em] bg-[#e86a6a18] border border-[#e86a6a33] px-1.5 py-px rounded uppercase">
                            Suspended
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] text-[#666] mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2.5 border-t border-[#1a1a1a]">
                    <div className="text-[11px] text-[#444]">
                      {user.phone && <span className="mr-3">{user.phone}</span>}
                      {user.cart?.items?.length > 0 && (
                        <span className="mr-3 text-[#6ae8a0]">{user.cart.items.length} cart item(s)</span>
                      )}
                      <span className="mr-3 text-[#e8e8e8] font-semibold">₦{(user.totalSpent || 0).toLocaleString()}</span>
                      <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <Link href={`/admin_console/customers/${user._id}`}
                      className="text-[11px] text-[#fff] no-underline tracking-[0.08em] px-3 py-1.5 border border-[#222] rounded hover:text-[#e8e8e8] hover:border-[#444] transition-all">
                      VIEW →
                    </Link>
                  </div>
                </div>
              );
            })}

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-[12px] text-[#444]">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className={`px-4 py-1.5 bg-transparent border border-[#222] rounded text-[12px] font-mono ${page === 1 ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}>
                    ← Prev
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className={`px-4 py-1.5 bg-transparent border border-[#222] rounded text-[12px] font-mono ${page === totalPages ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}>
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