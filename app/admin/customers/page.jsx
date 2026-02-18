// app/admin/customers/page.jsx  ← NEW file
"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const ROLE_COLORS = {
  admin: "#e8c46a",
  user: "#6ab4e8",
};

export default function AdminCustomersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (search) params.append("search", search);
    if (roleFilter !== "all") params.append("role", roleFilter);

    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users || []);
    setTotalPages(data.totalPages || 1);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, search, roleFilter]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const getInitials = (user) => {
    const f = user.firstName?.[0] || "";
    const l = user.lastName?.[0] || "";
    return (f + l).toUpperCase() || user.email?.[0]?.toUpperCase() || "?";
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", marginBottom: "6px" }}>Management</div>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#e8e8e8", letterSpacing: "-0.02em" }}>
            Customers <span style={{ color: "#444", fontSize: "18px" }}>({total})</span>
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{
            background: "#111", border: "1px solid #222", borderRadius: "6px",
            padding: "10px 16px", color: "#e8e8e8", fontSize: "13px",
            width: "300px", outline: "none", fontFamily: "inherit",
          }}
        />
        <div style={{ display: "flex", gap: "8px" }}>
          {["all", "user", "admin"].map(r => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }} style={{
              padding: "8px 16px", borderRadius: "20px", fontSize: "11px",
              letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
              border: roleFilter === r ? `1px solid ${ROLE_COLORS[r] || "#e8e8e8"}` : "1px solid #222",
              color: roleFilter === r ? (ROLE_COLORS[r] || "#e8e8e8") : "#555",
              background: roleFilter === r ? `${ROLE_COLORS[r] || "#e8e8e8"}12` : "transparent",
              transition: "all 0.15s",
            }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "48px", color: "#444", fontSize: "13px", textAlign: "center" }}>Loading customers...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: "48px", color: "#444", fontSize: "13px", textAlign: "center" }}>No customers found.</div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                  {["Customer", "Email", "Phone", "Location", "Role", "Joined", "Actions"].map(h => (
                    <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: "10px", letterSpacing: "0.15em", color: "#444", textTransform: "uppercase", fontWeight: "600" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} style={{ borderBottom: "1px solid #161616" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#141414"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {/* Avatar */}
                        <div style={{
                          width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                          background: `${ROLE_COLORS[user.role] || "#6ab4e8"}18`,
                          border: `1px solid ${ROLE_COLORS[user.role] || "#6ab4e8"}33`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "11px", fontWeight: "700", color: ROLE_COLORS[user.role] || "#6ab4e8",
                          letterSpacing: "0.05em",
                        }}>
                          {getInitials(user)}
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", color: "#e8e8e8" }}>
                            {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
                          </div>
                          {user.isActive === false && (
                            <div style={{ fontSize: "10px", color: "#e86a6a", letterSpacing: "0.08em" }}>SUSPENDED</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "12px", color: "#888" }}>{user.email}</td>
                    <td style={{ padding: "14px 20px", fontSize: "12px", color: "#666" }}>{user.phone || "—"}</td>
                    <td style={{ padding: "14px 20px", fontSize: "12px", color: "#666" }}>
                      {[user.city, user.country].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
                        color: ROLE_COLORS[user.role] || "#888",
                        background: `${ROLE_COLORS[user.role] || "#888"}15`,
                        border: `1px solid ${ROLE_COLORS[user.role] || "#888"}33`,
                        padding: "3px 8px", borderRadius: "4px",
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "12px", color: "#555" }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <Link href={`/admin/customers/${user._id}`} style={{
                        fontSize: "11px", color: "#555", textDecoration: "none",
                        letterSpacing: "0.08em", padding: "4px 10px",
                        border: "1px solid #222", borderRadius: "4px", transition: "all 0.15s",
                      }}
                        onMouseEnter={e => { e.target.style.color = "#e8e8e8"; e.target.style.borderColor = "#444"; }}
                        onMouseLeave={e => { e.target.style.color = "#555"; e.target.style.borderColor = "#222"; }}
                      >
                        VIEW
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: "16px 20px", borderTop: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#444" }}>Page {page} of {totalPages}</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ padding: "6px 14px", background: "transparent", border: "1px solid #222", color: page === 1 ? "#333" : "#888", borderRadius: "4px", cursor: page === 1 ? "default" : "pointer", fontSize: "12px" }}>
                    ← Prev
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ padding: "6px 14px", background: "transparent", border: "1px solid #222", color: page === totalPages ? "#333" : "#888", borderRadius: "4px", cursor: page === totalPages ? "default" : "pointer", fontSize: "12px" }}>
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}