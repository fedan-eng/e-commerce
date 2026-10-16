// app/admin_console/reviews/page.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:  { text: "text-[#a16207]", bg: "bg-[#fef6dc]", border: "border-[#f3dc9a]", label: "Pending"  },
  approved: { text: "text-[#15803d]", bg: "bg-[#e3f6e9]", border: "border-[#bfe5cc]", label: "Approved" },
  archived: { text: "text-faint",    bg: "bg-sage", border: "border-line-strong", label: "Archived" },
};

// ─── Small reusable components ────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex shrink-0 text-[10px] font-semibold capitalize border px-2 py-0.5 rounded-full ${cfg.text} ${cfg.bg} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
};

const ActionBtn = ({ onClick, label, color, disabled, loading }) => {
  const colorMap = {
    "#15803d": "border-[#15803d] bg-[#15803d] text-white hover:bg-[#116a32]",
    "#b7791f": "border-[#f3dc9a] text-[#a16207] hover:bg-[#fef6dc]",
    "#7c8b84":    "border-line-strong text-muted    hover:bg-sage",
    "#c53030": "border-[#f3c4c4] text-[#c53030] hover:bg-[#fdecec]",
    "#0f472b":    "border-line-strong text-ink    hover:bg-sage",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-3.5 py-1.5 bg-white border rounded-full text-[12px] font-semibold transition-all whitespace-nowrap
        ${disabled || loading ? "border-line text-ghost cursor-default" : colorMap[color] || "border-line-strong text-faint"}`}
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
        <stop offset={`${fill}%`} stopColor="#f5a524" />
        <stop offset={`${fill}%`} stopColor="#d5ddd8" />
      </linearGradient>
    </defs>
    <path
      fill={fill === 100 ? "#f5a524" : fill === 0 ? "#d5ddd8" : `url(#star-${fill})`}
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
  // Resolve display name: account name/email, else the buyer's name from an emailed review link
  const userName = review.user
    ? [review.user.firstName, review.user.lastName].filter(Boolean).join(" ").trim() || review.user.email || "Unknown"
    : review.authorName
      ? `${review.authorName} (guest)`
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
      className={`bg-white border rounded-3xl p-4 mb-2.5 w-full transition-all
        ${editing ? "border-pine shadow-[0_0_0_4px_rgba(215,247,91,0.45)]" : "border-line hover:shadow-[0_14px_30px_-20px_rgba(15,71,43,0.45)]"}`}
    >
      {/* ── Top row: product thumb + name + user + badge + date ── */}
      <div className="flex items-start gap-2.5 mb-3 w-full min-w-0">
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-mint">
          {review.product?.image ? (
            <Image
              src={review.product.image}
              alt=""
              width={32}
              height={32}
              className="w-full h-full object-cover"
              onError={e => { e.target.style.display = "none"; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-ghost">□</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Link
            href={`/products/${review.product?._id}`}
            className="text-[13px] font-semibold text-pine no-underline block truncate hover:underline leading-tight"
          >
            {review.product?.name || "Unknown Product"}
          </Link>
          <div className="text-[11px] text-faint mt-0.5 truncate">
            by <span className="text-ink font-medium">{userName}</span>
            {review.verified && (
              <span className="ml-1.5 text-[#15803d] font-medium" title="Bought and received this product">
                · ✅ Verified purchase{review.color ? ` (${review.color})` : ""}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-1">
          <StatusBadge status={status} />
          <span className="text-[10px] text-faint whitespace-nowrap">
            {new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
        </div>
      </div>

      {/* ── Star rating ── */}
      {rating !== null && (
        <div className="flex items-center gap-2 mb-3">
          {renderStars(rating)}
          <span className="text-[11px] font-semibold text-ink">
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
            className="w-full bg-canvas border border-line-strong rounded-2xl px-3.5 py-2.5 text-ink text-[13px] leading-relaxed resize-y outline-none focus:border-pine focus:bg-white"
          />
          {editError && <div className="text-[10px] text-[#c53030] mt-1">{editError}</div>}
          <div className="flex gap-1.5 mt-2">
            <button
              onClick={handleSave}
              disabled={savingEdit || !editText.trim()}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border-none cursor-pointer
                ${savingEdit ? "bg-sage text-ink" : "bg-pine text-white"}`}
            >
              {savingEdit ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => { setEditText(review.text); setEditing(false); setEditError(null); }}
              disabled={savingEdit}
              className="px-4 py-1.5 bg-white border border-line-strong rounded-full text-muted text-[13px] font-medium cursor-pointer hover:border-pine"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setEditing(true)}
          className="relative text-[13px] text-muted leading-relaxed pl-3.5 pr-8 py-3 bg-sage rounded-2xl mb-3 italic cursor-text
            hover:bg-zest/25 transition-all w-full overflow-hidden"
        >
          <span className="break-words">"{review.text}"</span>
          <span className="absolute top-2.5 right-3 text-[12px] text-faint not-italic">✎</span>
        </div>
      )}

      {/* ── Likes / Dislikes ── */}
      {/* likes and dislikes are arrays of user ObjectIds; .length = vote count */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px]" aria-hidden>👍</span>
          <span className="text-[12px] font-semibold text-ink">{likeCount}</span>
          <span className="text-[11px] text-faint">helpful</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[13px]" aria-hidden>👎</span>
          <span className="text-[12px] font-semibold text-ink">{dislikeCount}</span>
          <span className="text-[11px] text-faint">not helpful</span>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {status !== "approved" && (
          <ActionBtn onClick={() => changeStatus("approved")} label="Approve" color="#15803d"
            loading={actioning === "approved"} disabled={!!actioning || editing} />
        )}
        {status !== "pending" && (
          <ActionBtn onClick={() => changeStatus("pending")}  label="Pending" color="#b7791f"
            loading={actioning === "pending"}  disabled={!!actioning || editing} />
        )}
        {status !== "archived" && (
          <ActionBtn onClick={() => changeStatus("archived")} label="Archive" color="#7c8b84"
            loading={actioning === "archived"} disabled={!!actioning || editing} />
        )}

        <div className="flex-1" />

        {confirmDelete ? (
          <div className="flex gap-1.5 items-center flex-wrap">
            <span className="text-[12px] font-medium text-[#c53030]">Delete?</span>
            <ActionBtn onClick={handleDelete}                  label="Yes" color="#c53030" loading={actioning === "delete"} />
            <ActionBtn onClick={() => setConfirmDelete(false)} label="No"  color="#0f472b" />
          </div>
        ) : (
          <ActionBtn onClick={() => setConfirmDelete(true)} label="Delete" color="#c53030"
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
    { key: "all",      label: "All",      count: null,            activeClass: "border-pine text-white bg-pine" },
    { key: "pending",  label: "Pending",  count: counts.pending,  activeClass: "border-[#f3dc9a] text-[#a16207] bg-[#fef6dc]" },
    { key: "approved", label: "Approved", count: counts.approved, activeClass: "border-[#15803d] text-[#15803d] bg-[#e3f6e9]" },
    { key: "archived", label: "Archived", count: counts.archived, activeClass: "border-line-strong    text-faint    bg-sage" },
  ];

  return (
    <div className="w-full max-w-full">
      {/* Header */}
      <div className="mb-5">
        <div className="inline-flex items-center text-[11px] font-semibold text-pine bg-zest px-2.5 py-0.5 rounded-full mb-2">Management</div>
        <h1 className="m-0 text-[28px] font-poppins font-bold text-pine leading-tight">
          Reviews <span className="text-faint text-base font-roboto font-medium">({total})</span>
        </h1>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by comment, product or customer…"
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        className="w-full h-11 bg-white border border-line-strong rounded-full px-5 text-[13px] text-ink placeholder-ghost outline-none focus:border-pine transition-colors mb-3"
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
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium cursor-pointer border transition-all
                  ${isActive ? tab.activeClass : "border-line text-muted bg-white hover:border-pine hover:text-pine"}`}
              >
                {tab.label}
                {tab.count != null && (
                  <span className={`text-[9px] px-1.5 py-px rounded-full font-bold ${isActive ? "bg-white/25" : "bg-sage text-faint"}`}>
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
        <div className="py-12 flex flex-col items-center gap-3 text-faint text-[13px]"><div className="w-7 h-7 rounded-full border-[3px] border-mint border-t-pine animate-spin" />Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-faint text-[13px] text-center bg-white border border-line rounded-3xl">
          <div className="text-3xl mb-2" aria-hidden>💬</div>
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
              <span className="text-[11px] text-faint">Page {page} / {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-3.5 py-1.5 bg-white border border-line rounded-full text-[12px] font-medium
                    ${page === 1 ? "text-ghost cursor-default" : "text-pine cursor-pointer hover:border-pine hover:bg-mint"}`}
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-3.5 py-1.5 bg-white border border-line rounded-full text-[12px] font-medium
                    ${page === totalPages ? "text-ghost cursor-default" : "text-pine cursor-pointer hover:border-pine hover:bg-mint"}`}
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