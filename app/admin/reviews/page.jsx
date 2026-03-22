// app/admin/reviews/page.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const STATUS_CONFIG = {
  pending:  { text: "text-[#e8c46a]", bg: "bg-[#e8c46a15]", border: "border-[#e8c46a33]", label: "Pending" },
  approved: { text: "text-[#6ae8a0]", bg: "bg-[#6ae8a015]", border: "border-[#6ae8a033]", label: "Approved" },
  archived: { text: "text-[#666]",    bg: "bg-[#66666615]", border: "border-[#66666633]", label: "Archived" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`text-[10px] tracking-[0.1em] uppercase font-semibold border px-2 py-0.5 rounded flex-shrink-0 ${cfg.text} ${cfg.bg} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
};

const ActionBtn = ({ onClick, label, color, disabled, loading }) => {
  const colorMap = {
    "#6ae8a0": "border-[#6ae8a044] text-[#6ae8a0] hover:bg-[#6ae8a012]",
    "#e8c46a": "border-[#e8c46a44] text-[#e8c46a] hover:bg-[#e8c46a12]",
    "#888":    "border-[#88888844] text-[#888]    hover:bg-[#88888812]",
    "#e86a6a": "border-[#e86a6a44] text-[#e86a6a] hover:bg-[#e86a6a12]",
    "#555":    "border-[#55555544] text-[#555]    hover:bg-[#55555512]",
  };
  const disabledClass = "border-[#1e1e1e] text-[#333] cursor-default";
  return (
    <button onClick={onClick} disabled={disabled || loading}
      className={`px-3 py-1 bg-transparent border rounded text-[11px] tracking-[0.08em] transition-all font-mono
        ${disabled || loading ? disabledClass : colorMap[color] || "border-[#333] text-[#666]"}`}
    >
      {loading ? "..." : label}
    </button>
  );
};

const ReviewRow = ({ review, onStatusChange, onDelete, onEditText }) => {
  const [actioning, setActioning]         = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing]             = useState(false);
  const [editText, setEditText]           = useState(review.text);
  const [savingEdit, setSavingEdit]       = useState(false);
  const [editError, setEditError]         = useState(null);

  const status   = review.status || "pending";
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
    setSavingEdit(true); setEditError(null);
    const ok = await onEditText(review._id, editText.trim());
    if (ok) { setEditing(false); }
    else    { setEditError("Failed to save. Try again."); }
    setSavingEdit(false);
  };

  const handleCancelEdit = () => { setEditText(review.text); setEditing(false); setEditError(null); };

  return (
    <div className={`bg-[#111] border rounded-lg px-5 py-4 mb-2.5 transition-all duration-150 ${editing ? "border-[#333]" : "border-[#1a1a1a] hover:border-[#2a2a2a]"}`}>

      {/* Top row */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2.5">
        {/* Product + user */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-md overflow-hidden border border-[#222] flex-shrink-0 bg-[#0a0a0a]">
            {review.product?.image
              ? <img src={review.product.image} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = "none"} />
              : <div className="w-full h-full flex items-center justify-center text-sm text-[#333]">□</div>
            }
          </div>
          <div className="min-w-0">
            <Link href={`/products/${review.product?._id}`}
              className="text-[12px] text-[#e8c46a] no-underline tracking-[0.04em] block overflow-hidden text-ellipsis whitespace-nowrap hover:underline">
              {review.product?.name || "Unknown Product"}
            </Link>
            <div className="text-[11px] text-[#555] mt-0.5">
              by <span className="text-[#777]">{userName}</span>
              {review.user?.email && <span className="text-[#444]"> · {review.user.email}</span>}
            </div>
          </div>
        </div>
        {/* Badge + date */}
        <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
          <StatusBadge status={status} />
          <span className="text-[11px] text-[#444]">
            {new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Comment text */}
      {editing ? (
        <div className="mb-3">
          <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={4} autoFocus
            className="w-full bg-[#0d0d0d] border border-[#444] rounded-md px-3.5 py-3 text-[#e8e8e8] text-[13px] leading-relaxed resize-y outline-none font-mono" />
          {editError && <div className="text-[11px] text-[#e86a6a] mt-1">{editError}</div>}
          <div className="flex gap-1.5 mt-2">
            <button onClick={handleSaveEdit} disabled={savingEdit || !editText.trim()}
              className={`px-4 py-1.5 rounded text-[11px] tracking-[0.1em] uppercase font-bold border-none cursor-pointer font-mono transition-all
                ${savingEdit ? "bg-[#1a1a1a] text-[#555]" : "bg-[#e8c46a] text-[#0a0a0a]"}`}>
              {savingEdit ? "Saving..." : "Save"}
            </button>
            <button onClick={handleCancelEdit} disabled={savingEdit}
              className="px-4 py-1.5 bg-transparent border border-[#333] rounded text-[#666] text-[11px] tracking-[0.1em] uppercase cursor-pointer font-mono">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div onClick={() => setEditing(true)} title="Click to edit"
          className="relative text-[13px] text-[#999] leading-relaxed px-3.5 py-3 bg-[#0d0d0d] border border-[#1a1a1a] rounded-md mb-3 italic cursor-text
            hover:border-[#3a3a3a] hover:bg-[#111] transition-all duration-150">
          "{review.text}"
          <span className="absolute top-2 right-2.5 text-[9px] text-[#333] tracking-[0.1em] uppercase not-italic">✎ edit</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1.5 items-center flex-wrap">
        {status !== "approved" && <ActionBtn onClick={() => changeStatus("approved")} label="Approve"     color="#6ae8a0" loading={actioning === "approved"} disabled={!!actioning || editing} />}
        {status !== "pending"  && <ActionBtn onClick={() => changeStatus("pending")}  label="Set Pending" color="#e8c46a" loading={actioning === "pending"}  disabled={!!actioning || editing} />}
        {status !== "archived" && <ActionBtn onClick={() => changeStatus("archived")} label="Archive"     color="#888"    loading={actioning === "archived"} disabled={!!actioning || editing} />}

        <div className="flex-1" />

        {confirmDelete ? (
          <div className="flex gap-1.5 items-center">
            <span className="text-[11px] text-[#e86a6a] tracking-[0.06em]">Confirm delete?</span>
            <ActionBtn onClick={handleDelete}              label="Yes, Delete" color="#e86a6a" loading={actioning === "delete"} />
            <ActionBtn onClick={() => setConfirmDelete(false)} label="Cancel"  color="#555" />
          </div>
        ) : (
          <ActionBtn onClick={() => setConfirmDelete(true)} label="Delete" color="#e86a6a" disabled={!!actioning || editing} />
        )}
      </div>
    </div>
  );
};

export default function AdminReviewsPage() {
  const [reviews, setReviews]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);
  const [counts, setCounts]           = useState({ pending: 0, approved: 0, archived: 0 });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (search)               params.append("search", search);
    if (statusFilter !== "all") params.append("status", statusFilter);
    const res  = await fetch(`/api/admin/reviews?${params}`);
    const data = await res.json();
    setReviews(data.reviews || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }, [page, search, statusFilter]);

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
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) { setReviews(prev => prev.map(r => r._id === commentId ? { ...r, status: newStatus } : r)); fetchCounts(); }
  };

  const handleDelete = async (commentId) => {
    const res = await fetch(`/api/admin/reviews/${commentId}`, { method: "DELETE" });
    if (res.ok) { setReviews(prev => prev.filter(r => r._id !== commentId)); setTotal(t => t - 1); fetchCounts(); }
  };

  const handleEditText = async (commentId, newText) => {
    const res = await fetch(`/api/admin/reviews/${commentId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText }),
    });
    if (res.ok) { setReviews(prev => prev.map(r => r._id === commentId ? { ...r, text: newText } : r)); return true; }
    return false;
  };

  const TABS = [
    { key: "all",      label: "All",      count: null,            activeColor: "border-[#e8e8e8] text-[#e8e8e8] bg-[#e8e8e812]" },
    { key: "pending",  label: "Pending",  count: counts.pending,  activeColor: "border-[#e8c46a] text-[#e8c46a] bg-[#e8c46a12]" },
    { key: "approved", label: "Approved", count: counts.approved, activeColor: "border-[#6ae8a0] text-[#6ae8a0] bg-[#6ae8a012]" },
    { key: "archived", label: "Archived", count: counts.archived, activeColor: "border-[#666]    text-[#666]    bg-[#66666612]" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <div className="text-[11px] tracking-[0.2em] text-[#555] uppercase mb-1.5">Management</div>
        <h1 className="m-0 text-[28px] font-bold text-[#e8e8e8] tracking-tight">
          Reviews <span className="text-[#444] text-lg">({total})</span>
        </h1>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 items-start sm:items-center">
        <input type="text" placeholder="Search by comment, product, or customer..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full sm:w-80 bg-[#111] border border-[#222] rounded-md px-4 py-2.5 text-[#e8e8e8] text-[13px] outline-none font-mono"
        />
        {/* Tabs — horizontal scroll on mobile */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 w-full sm:w-auto scrollbar-hide" style={{ scrollbarWidth: "none" }}>
          {TABS.map(tab => {
            const active = statusFilter === tab.key;
            return (
              <button key={tab.key} onClick={() => { setStatusFilter(tab.key); setPage(1); }}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] tracking-[0.1em] uppercase cursor-pointer border transition-all font-mono
                  ${active ? tab.activeColor : "border-[#222] text-[#555] bg-transparent hover:border-[#333] hover:text-[#777]"}`}
              >
                {tab.label}
                {tab.count != null && (
                  <span className={`text-[10px] px-1.5 py-px rounded-full font-bold ${active ? "bg-white/10" : "bg-[#1a1a1a] text-[#444]"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12 text-[#444] text-[13px] text-center">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-[#444] text-[13px] text-center bg-[#111] border border-[#1a1a1a] rounded-lg">No reviews found.</div>
      ) : (
        <>
          {reviews.map(review => (
            <ReviewRow key={review._id} review={review}
              onStatusChange={handleStatusChange} onDelete={handleDelete} onEditText={handleEditText} />
          ))}

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-5">
              <span className="text-[12px] text-[#444]">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className={`px-4 py-1.5 bg-transparent border border-[#222] rounded text-[12px] font-mono transition-colors
                    ${page === 1 ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}>
                  ← Prev
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className={`px-4 py-1.5 bg-transparent border border-[#222] rounded text-[12px] font-mono transition-colors
                    ${page === totalPages ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}>
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