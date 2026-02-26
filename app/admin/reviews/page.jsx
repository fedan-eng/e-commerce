// app/admin/reviews/page.jsx  ← NEW file
"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const STATUS_CONFIG = {
  pending:  { color: "#e8c46a", bg: "#e8c46a15", border: "#e8c46a33", label: "Pending" },
  approved: { color: "#6ae8a0", bg: "#6ae8a015", border: "#6ae8a033", label: "Approved" },
  archived: { color: "#666",    bg: "#66666615", border: "#66666633", label: "Archived" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      padding: "3px 8px", borderRadius: "4px", fontWeight: "600", flexShrink: 0,
    }}>
      {cfg.label}
    </span>
  );
};

const ActionBtn = ({ onClick, label, color, disabled, loading }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    style={{
      padding: "5px 12px", background: "transparent",
      border: `1px solid ${disabled ? "#1e1e1e" : color + "44"}`,
      borderRadius: "5px", color: disabled ? "#333" : color,
      fontSize: "11px", letterSpacing: "0.08em", cursor: disabled ? "default" : "pointer",
      transition: "all 0.15s", fontFamily: "inherit",
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = color + "12"; }}
    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
  >
    {loading ? "..." : label}
  </button>
);

// Individual review row with its own action state
const ReviewRow = ({ review, onStatusChange, onDelete, onEditText }) => {
  const [actioning, setActioning]       = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing]           = useState(false);
  const [editText, setEditText]         = useState(review.text);
  const [savingEdit, setSavingEdit]     = useState(false);
  const [editError, setEditError]       = useState(null);

  const status = review.status || "pending";
  const userName = review.user
    ? [review.user.firstName, review.user.lastName].filter(Boolean).join(" ") || review.user.email
    : "Deleted User";

  const changeStatus = async (newStatus) => {
    setActioning(newStatus);
    await onStatusChange(review._id, newStatus);
    setActioning(null);
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setActioning("delete");
    await onDelete(review._id);
    setActioning(null);
    setConfirmDelete(false);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || editText.trim() === review.text) { setEditing(false); return; }
    setSavingEdit(true);
    setEditError(null);
    const ok = await onEditText(review._id, editText.trim());
    if (ok) {
      setEditing(false);
    } else {
      setEditError("Failed to save. Try again.");
    }
    setSavingEdit(false);
  };

  const handleCancelEdit = () => {
    setEditText(review.text); // reset
    setEditing(false);
    setEditError(null);
  };

  return (
    <div style={{
      background: "#111", border: `1px solid ${editing ? "#333" : "#1a1a1a"}`, borderRadius: "8px",
      padding: "16px 20px", marginBottom: "10px", transition: "border-color 0.15s",
    }}
      onMouseEnter={e => { if (!editing) e.currentTarget.style.borderColor = "#2a2a2a"; }}
      onMouseLeave={e => { if (!editing) e.currentTarget.style.borderColor = "#1a1a1a"; }}
    >
      {/* Top row: product + status + date */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "6px", overflow: "hidden", border: "1px solid #222", flexShrink: 0, background: "#0a0a0a" }}>
            {review.product?.image
              ? <img src={review.product.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#333" }}>□</div>
            }
          </div>
          <div style={{ minWidth: 0 }}>
            <Link href={`/products/${review.product?._id}`} style={{ fontSize: "12px", color: "#e8c46a", textDecoration: "none", letterSpacing: "0.04em", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {review.product?.name || "Unknown Product"}
            </Link>
            <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>
              by <span style={{ color: "#777" }}>{userName}</span>
              {review.user?.email && <span style={{ color: "#444" }}> · {review.user.email}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <StatusBadge status={status} />
          <span style={{ fontSize: "11px", color: "#444" }}>
            {new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Comment text — view or edit mode */}
      {editing ? (
        <div style={{ marginBottom: "12px" }}>
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value)}
            rows={4}
            autoFocus
            style={{
              width: "100%", background: "#0d0d0d", border: "1px solid #444",
              borderRadius: "6px", padding: "12px 14px", color: "#e8e8e8",
              fontSize: "13px", lineHeight: "1.65", resize: "vertical",
              outline: "none", fontFamily: "inherit", boxSizing: "border-box",
            }}
          />
          {editError && (
            <div style={{ fontSize: "11px", color: "#e86a6a", marginTop: "4px" }}>{editError}</div>
          )}
          <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
            <button
              onClick={handleSaveEdit}
              disabled={savingEdit || !editText.trim()}
              style={{
                padding: "6px 16px", background: savingEdit ? "#1a1a1a" : "#e8c46a",
                color: savingEdit ? "#555" : "#0a0a0a", border: "none", borderRadius: "5px",
                fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase",
                fontWeight: "700", cursor: savingEdit ? "default" : "pointer", fontFamily: "inherit",
              }}
            >
              {savingEdit ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={savingEdit}
              style={{
                padding: "6px 16px", background: "transparent", border: "1px solid #333",
                borderRadius: "5px", color: "#666", fontSize: "11px", letterSpacing: "0.1em",
                textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setEditing(true)}
          title="Click to edit"
          style={{
            fontSize: "13px", color: "#999", lineHeight: "1.65",
            padding: "12px 14px", background: "#0d0d0d", borderRadius: "6px",
            border: "1px solid #1a1a1a", marginBottom: "12px", fontStyle: "italic",
            cursor: "text", transition: "border-color 0.15s, background 0.15s",
            position: "relative",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#3a3a3a"; e.currentTarget.style.background = "#111"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.background = "#0d0d0d"; }}
        >
          "{review.text}"
          <span style={{ position: "absolute", top: "8px", right: "10px", fontSize: "9px", color: "#333", letterSpacing: "0.1em", textTransform: "uppercase", fontStyle: "normal" }}>
            ✎ edit
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
        {status !== "approved" && (
          <ActionBtn onClick={() => changeStatus("approved")} label="Approve" color="#6ae8a0" loading={actioning === "approved"} disabled={!!actioning || editing} />
        )}
        {status !== "pending" && (
          <ActionBtn onClick={() => changeStatus("pending")} label="Set Pending" color="#e8c46a" loading={actioning === "pending"} disabled={!!actioning || editing} />
        )}
        {status !== "archived" && (
          <ActionBtn onClick={() => changeStatus("archived")} label="Archive" color="#888" loading={actioning === "archived"} disabled={!!actioning || editing} />
        )}

        <div style={{ flex: 1 }} />

        {confirmDelete ? (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "#e86a6a", letterSpacing: "0.06em" }}>Confirm delete?</span>
            <ActionBtn onClick={handleDelete} label="Yes, Delete" color="#e86a6a" loading={actioning === "delete"} />
            <ActionBtn onClick={() => setConfirmDelete(false)} label="Cancel" color="#555" />
          </div>
        ) : (
          <ActionBtn onClick={() => setConfirmDelete(true)} label="Delete" color="#e86a6a" disabled={!!actioning || editing} />
        )}
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminReviewsPage() {
  const [reviews, setReviews]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const [counts, setCounts]       = useState({ pending: 0, approved: 0, archived: 0 });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (search) params.append("search", search);
    if (statusFilter !== "all") params.append("status", statusFilter);

    const res  = await fetch(`/api/admin/reviews?${params}`);
    const data = await res.json();
    setReviews(data.reviews || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }, [page, search, statusFilter]);

  // Also fetch counts for tab badges
  const fetchCounts = useCallback(async () => {
    const [p, a, ar] = await Promise.all([
      fetch("/api/admin/reviews?status=pending&limit=1000").then(r => r.json()),
      fetch("/api/admin/reviews?status=approved&limit=1000").then(r => r.json()),
      fetch("/api/admin/reviews?status=archived&limit=1000").then(r => r.json()),
    ]);
    setCounts({ pending: p.total || 0, approved: a.total || 0, archived: ar.total || 0 });
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchReviews, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchReviews]);

  useEffect(() => { fetchCounts(); }, []);

  const handleStatusChange = async (commentId, newStatus) => {
    const res = await fetch(`/api/admin/reviews/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      // Update inline without refetch
      setReviews(prev => prev.map(r => r._id === commentId ? { ...r, status: newStatus } : r));
      fetchCounts();
    }
  };

  const handleDelete = async (commentId) => {
    const res = await fetch(`/api/admin/reviews/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      setReviews(prev => prev.filter(r => r._id !== commentId));
      setTotal(t => t - 1);
      fetchCounts();
    }
  };

  const handleEditText = async (commentId, newText) => {
    const res = await fetch(`/api/admin/reviews/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText }),
    });
    if (res.ok) {
      setReviews(prev => prev.map(r => r._id === commentId ? { ...r, text: newText } : r));
      return true;
    }
    return false;
  };
     const TABS = [
    { key: "all",      label: "All",      count: null },
    { key: "pending",  label: "Pending",  count: counts.pending,  color: "#e8c46a" },
    { key: "approved", label: "Approved", count: counts.approved, color: "#6ae8a0" },
    { key: "archived", label: "Archived", count: counts.archived, color: "#666" },
  ];


  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", marginBottom: "6px" }}>Management</div>
        <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#e8e8e8", letterSpacing: "-0.02em" }}>
          Reviews <span style={{ color: "#444", fontSize: "18px" }}>({total})</span>
        </h1>
      </div>

      {/* Search + filter tabs */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search by comment, product, or customer..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{
            background: "#111", border: "1px solid #222", borderRadius: "6px",
            padding: "10px 16px", color: "#e8e8e8", fontSize: "13px",
            width: "320px", outline: "none", fontFamily: "inherit",
          }}
        />
        <div style={{ display: "flex", gap: "6px" }}>
          {TABS.map(tab => {
            const active = statusFilter === tab.key;
            const color  = tab.color || "#e8e8e8";
            return (
              <button key={tab.key} onClick={() => { setStatusFilter(tab.key); setPage(1); }} style={{
                padding: "8px 14px", borderRadius: "20px", fontSize: "11px",
                letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
                border: active ? `1px solid ${color}` : "1px solid #222",
                color: active ? color : "#555",
                background: active ? color + "12" : "transparent",
                transition: "all 0.15s", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                {tab.label}
                {tab.count != null && (
                  <span style={{ fontSize: "10px", background: active ? color + "22" : "#1a1a1a", color: active ? color : "#444", padding: "1px 6px", borderRadius: "10px", fontWeight: "700" }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div style={{ padding: "48px", color: "#444", fontSize: "13px", textAlign: "center" }}>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div style={{ padding: "48px", color: "#444", fontSize: "13px", textAlign: "center", background: "#111", border: "1px solid #1a1a1a", borderRadius: "8px" }}>
          No reviews found.
        </div>
      ) : (
        <>
          {reviews.map(review => (
            <ReviewRow
              key={review._id}
              review={review}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onEditText={handleEditText}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
              <span style={{ fontSize: "12px", color: "#444" }}>Page {page} of {totalPages}</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: "7px 16px", background: "transparent", border: "1px solid #222", color: page === 1 ? "#333" : "#888", borderRadius: "5px", cursor: page === 1 ? "default" : "pointer", fontSize: "12px", fontFamily: "inherit" }}>
                  ← Prev
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ padding: "7px 16px", background: "transparent", border: "1px solid #222", color: page === totalPages ? "#333" : "#888", borderRadius: "5px", cursor: page === totalPages ? "default" : "pointer", fontSize: "12px", fontFamily: "inherit" }}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}