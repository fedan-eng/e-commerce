// app/admin/reviews/page.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:  { text: "text-[#e8c46a]", bg: "bg-[#e8c46a15]", border: "border-[#e8c46a33]", label: "Pending"  },
  approved: { text: "text-[#6ae8a0]", bg: "bg-[#6ae8a015]", border: "border-[#6ae8a033]", label: "Approved" },
  archived: { text: "text-[#666]",    bg: "bg-[#66666615]", border: "border-[#66666633]", label: "Archived" },
};

// ─── Small reusable components ────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex shrink-0 text-[9px] tracking-[0.1em] uppercase font-semibold border px-2 py-0.5 rounded ${cfg.text} ${cfg.bg} ${cfg.border}`}>
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
    "#fff":    "border-[#fff55544] text-[#fff]    hover:bg-[#fff55512]",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-2.5 py-1 bg-transparent border rounded text-[10px] tracking-[0.06em] transition-all font-mono whitespace-nowrap
        ${disabled || loading ? "border-[#1e1e1e] text-[#333] cursor-default" : colorMap[color] || "border-[#333] text-[#666]"}`}
    >
      {loading ? "…" : label}
    </button>
  );
};

// ─── Star renderer ────────────────────────────────────────────────────────────
// Supports half-stars for the aggregate average (e.g. 3.7 → 3 full, 1 half, 1 empty)
const StarIcon = ({ fill }) => (
  <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`star-${fill}`}>
        <stop offset={`${fill}%`} stopColor="#fb923c" />
        <stop offset={`${fill}%`} stopColor="#374151" />
      </linearGradient>
    </defs>
    <path
      fill={fill === 100 ? "#fb923c" : fill === 0 ? "#374151" : `url(#star-${fill})`}
      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
    />
  </svg>
);

/**
 * renderStars(value)
 * value: integer 1–5 for a review's own rating,
 *        OR a float like 3.7 for an average (half-star aware).
 */
const renderStars = (value) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.round(Math.min(Math.max((value - i) * 100, 0), 100) / 50) * 50; // 0, 50, or 100
        return <StarIcon key={i} fill={fill} />;
      })}
    </div>
  );
};

// ─── Single review row ────────────────────────────────────────────────────────
const ReviewRow = ({ review, onStatusChange, onDelete, onEditText }) => {
  const [actioning,     setActioning]     = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing,       setEditing]       = useState(false);
  const [editText,      setEditText]      = useState(review.text);
  const [savingEdit,    setSavingEdit]    = useState(false);
  const [editError,     setEditError]     = useState(null);

  const status   = review.status || "pending";
  // Resolve display name: populated user object → full name or email, otherwise "Deleted User"
  const userName = review.user
    ? [review.user.firstName, review.user.lastName].filter(Boolean).join(" ").trim() || review.user.email || "Unknown"
    : "Deleted User";

  // ✅ review.rating is now a proper 1–5 field on the comment subdoc
  const rating = review.rating ?? null;

  // ✅ likes / dislikes are arrays of ObjectIds — .length is the correct count
  const likeCount    = Array.isArray(review.likes)    ? review.likes.length    : 0;
  const dislikeCount = Array.isArray(review.dislikes) ? review.dislikes.length : 0;

  const changeStatus = async (s) => {
    setActioning(s);
    await onStatusChange(review._id, s);
    setActioning(null);
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setActioning("delete");
    await onDelete(review._id);
    setActioning(null);
    setConfirmDelete(false);
  };

  const handleSave = async () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === review.text) { setEditing(false); return; }
    setSavingEdit(true);
    setEditError(null);
    const ok = await onEditText(review._id, trimmed);
    if (ok) setEditing(false);
    else setEditError("Failed to save. Please try again.");
    setSavingEdit(false);
  };

  return (
    <div
      className={`bg-[#111] border rounded-xl p-4 mb-2.5 w-full transition-all
        ${editing ? "border-[#333]" : "border-[#1a1a1a] hover:border-[#252525]"}`}
    >
      {/* ── Top row: product thumb + name + user + badge + date ── */}
      <div className="flex items-start gap-2.5 mb-3 w-full min-w-0">
        <div className="w-8 h-8 rounded-md overflow-hidden border border-[#222] shrink-0 bg-[#0a0a0a]">
          {review.product?.image ? (
            <img
              src={review.product.image}
              alt=""
              className="w-full h-full object-cover"
              onError={e => { e.target.style.display = "none"; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-[#333]">□</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Link
            href={`/products/${review.product?._id}`}
            className="text-[12px] text-[#e8c46a] no-underline block truncate hover:underline leading-tight"
          >
            {review.product?.name || "Unknown Product"}
          </Link>
          <div className="text-[10px] text-[#fff] mt-0.5 truncate">
            by <span className="text-[#777]">{userName}</span>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-1">
          <StatusBadge status={status} />
          <span className="text-[10px] text-[#444] whitespace-nowrap">
            {new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
        </div>
      </div>

      {/* ── Star rating ── */}
      {rating !== null && (
        <div className="flex items-center gap-2 mb-3">
          {renderStars(rating)}
          <span className="text-[10px] text-[#fff]">
            {rating}/5 
          </span>
        </div>
      )}

      {/* ── Review text (click to edit) ── */}
      {editing ? (
        <div className="mb-3 w-full">
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value)}
            rows={4}
            autoFocus
            className="w-full bg-[#0d0d0d] border border-[#444] rounded-lg px-3 py-2.5 text-[#e8e8e8] text-[12px] leading-relaxed resize-y outline-none font-mono"
          />
          {editError && <div className="text-[10px] text-[#e86a6a] mt-1">{editError}</div>}
          <div className="flex gap-1.5 mt-2">
            <button
              onClick={handleSave}
              disabled={savingEdit || !editText.trim()}
              className={`px-4 py-1.5 rounded text-[10px] tracking-[0.1em] uppercase font-bold border-none cursor-pointer font-mono
                ${savingEdit ? "bg-[#1a1a1a] text-[#fff]" : "bg-[#e8c46a] text-[#0a0a0a]"}`}
            >
              {savingEdit ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => { setEditText(review.text); setEditing(false); setEditError(null); }}
              disabled={savingEdit}
              className="px-4 py-1.5 bg-transparent border border-[#333] rounded text-[#666] text-[10px] uppercase cursor-pointer font-mono"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setEditing(true)}
          className="relative text-[12px] text-[#999] leading-relaxed px-3 py-2.5 bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg mb-3 italic cursor-text
            hover:border-[#333] hover:bg-[#111] transition-all w-full overflow-hidden"
        >
          <span className="break-words">"{review.text}"</span>
          <span className="absolute top-2 right-2 text-[8px] text-[#2a2a2a] tracking-[0.1em] uppercase not-italic">✎</span>
        </div>
      )}

      {/* ── Likes / Dislikes ── */}
      {/* likes and dislikes are arrays of user ObjectIds; .length = vote count */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#6ae8a0]">▲</span>
          <span className="text-[11px] text-[#fff]">{likeCount}</span>
          <span className="text-[9px] text-[#3a3a3a] tracking-wide">helpful</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#e86a6a]">▼</span>
          <span className="text-[11px] text-[#fff]">{dislikeCount}</span>
          <span className="text-[9px] text-[#3a3a3a] tracking-wide">not helpful</span>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {status !== "approved" && (
          <ActionBtn onClick={() => changeStatus("approved")} label="Approve" color="#6ae8a0"
            loading={actioning === "approved"} disabled={!!actioning || editing} />
        )}
        {status !== "pending" && (
          <ActionBtn onClick={() => changeStatus("pending")}  label="Pending" color="#e8c46a"
            loading={actioning === "pending"}  disabled={!!actioning || editing} />
        )}
        {status !== "archived" && (
          <ActionBtn onClick={() => changeStatus("archived")} label="Archive" color="#888"
            loading={actioning === "archived"} disabled={!!actioning || editing} />
        )}

        <div className="flex-1" />

        {confirmDelete ? (
          <div className="flex gap-1.5 items-center flex-wrap">
            <span className="text-[10px] text-[#e86a6a]">Delete?</span>
            <ActionBtn onClick={handleDelete}                  label="Yes" color="#e86a6a" loading={actioning === "delete"} />
            <ActionBtn onClick={() => setConfirmDelete(false)} label="No"  color="#fff" />
          </div>
        ) : (
          <ActionBtn onClick={() => setConfirmDelete(true)} label="Delete" color="#e86a6a"
            disabled={!!actioning || editing} />
        )}
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminReviewsPage() {
  const [reviews,      setReviews]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [total,        setTotal]        = useState(0);
  const [counts,       setCounts]       = useState({ pending: 0, approved: 0, archived: 0 });

  // Fetch the current page of reviews
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (search)               params.append("search", search);
    if (statusFilter !== "all") params.append("status", statusFilter);
    const res  = await fetch(`/api/admin/reviews?${params}`);
    const data = await res.json();
    setReviews(data.reviews   || []);
    setTotal(data.total       || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }, [page, search, statusFilter]);

  // Fetch sidebar counts (one request per status)
  const fetchCounts = useCallback(async () => {
    const [p, a, ar] = await Promise.all([
      fetch("/api/admin/reviews?status=pending&limit=1").then(r => r.json()),
      fetch("/api/admin/reviews?status=approved&limit=1").then(r => r.json()),
      fetch("/api/admin/reviews?status=archived&limit=1").then(r => r.json()),
    ]);
    setCounts({
      pending:  p.total  || 0,
      approved: a.total  || 0,
      archived: ar.total || 0,
    });
  }, []);

  // Debounce search; reset page on dependency changes
  useEffect(() => {
    const t = setTimeout(fetchReviews, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchReviews]);

  useEffect(() => { fetchCounts(); }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStatusChange = async (id, s) => {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    if (res.ok) {
      setReviews(prev => prev.map(r => r._id === id ? { ...r, status: s } : r));
      fetchCounts();
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    if (res.ok) {
      setReviews(prev => prev.filter(r => r._id !== id));
      setTotal(t => t - 1);
      fetchCounts();
    }
  };

  const handleEditText = async (id, text) => {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      setReviews(prev => prev.map(r => r._id === id ? { ...r, text } : r));
      return true;
    }
    return false;
  };

  // ── Tab definitions ───────────────────────────────────────────────────────
  const TABS = [
    { key: "all",      label: "All",      count: null,            activeClass: "border-[#e8e8e8] text-[#e8e8e8] bg-[#e8e8e812]" },
    { key: "pending",  label: "Pending",  count: counts.pending,  activeClass: "border-[#e8c46a] text-[#e8c46a] bg-[#e8c46a12]" },
    { key: "approved", label: "Approved", count: counts.approved, activeClass: "border-[#6ae8a0] text-[#6ae8a0] bg-[#6ae8a012]" },
    { key: "archived", label: "Archived", count: counts.archived, activeClass: "border-[#666]    text-[#666]    bg-[#66666612]" },
  ];

  return (
    <div className="w-full max-w-full">
      {/* Header */}
      <div className="mb-5">
        <div className="text-[10px] tracking-[0.2em] text-[#fff] uppercase mb-1">Management</div>
        <h1 className="m-0 text-2xl font-bold text-[#e8e8e8] tracking-tight">
          Reviews <span className="text-[#444] text-base font-normal">({total})</span>
        </h1>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by comment, product or customer…"
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        className="w-full bg-[#111] border border-[#1e1e1e] rounded-lg px-4 py-2.5 text-[12px] text-[#ccc] placeholder-[#3a3a3a] outline-none font-mono mb-3"
      />

      {/* Status tabs (horizontal scroll on mobile) */}
      <div className="w-full overflow-x-auto mb-5" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
        <div className="flex gap-1.5 pb-1 w-max">
          {TABS.map(tab => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setStatusFilter(tab.key); setPage(1); }}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] tracking-[0.08em] uppercase cursor-pointer border transition-all font-mono
                  ${isActive ? tab.activeClass : "border-[#222] text-[#fff] bg-transparent hover:border-[#333]"}`}
              >
                {tab.label}
                {tab.count != null && (
                  <span className={`text-[9px] px-1.5 py-px rounded-full font-bold ${isActive ? "bg-white/10" : "bg-[#1a1a1a] text-[#444]"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Review list */}
      {loading ? (
        <div className="py-12 text-[#444] text-[13px] text-center">Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-[#444] text-[13px] text-center bg-[#111] border border-[#1a1a1a] rounded-xl">
          No reviews found.
        </div>
      ) : (
        <>
          {reviews.map(r => (
            <ReviewRow
              key={r._id}
              review={r}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onEditText={handleEditText}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <span className="text-[11px] text-[#444]">Page {page} / {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-3 py-1.5 bg-transparent border border-[#222] rounded text-[11px] font-mono
                    ${page === 1 ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-3 py-1.5 bg-transparent border border-[#222] rounded text-[11px] font-mono
                    ${page === totalPages ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}
                >
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