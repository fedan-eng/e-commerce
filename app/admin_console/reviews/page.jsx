// app/admin_console/reviews/page.jsx
"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Check, Clock, Archive, Trash2, Pencil, ThumbsUp, ThumbsDown, BadgeCheck, MessageSquare, Package } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminContext";
import {
  PageHeader, Card, Button, Tabs, SearchInput, Pagination, Checkbox, BulkBar, bulkBtnCls, StatusBadge,
  EmptyState, Spinner, textareaCls, cx,
} from "@/components/admin/ui";

const PAGE_SIZE = 20;

// ─── Stars (supports halves for averages, e.g. 3.7) ───────────
const StarIcon = ({ fill }) => (
  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden>
    <defs>
      <linearGradient id={`star-${fill}`}>
        <stop offset={`${fill}%`} stopColor="#d97706" />
        <stop offset={`${fill}%`} stopColor="#d5ddd8" />
      </linearGradient>
    </defs>
    <path
      fill={fill === 100 ? "#d97706" : fill === 0 ? "#d5ddd8" : `url(#star-${fill})`}
      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
    />
  </svg>
);

const Stars = ({ value }) => (
  <span className="flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
    {Array.from({ length: 5 }, (_, i) => {
      const fill = Math.round(Math.min(Math.max((value - i) * 100, 0), 100) / 50) * 50; // 0, 50 or 100
      return <StarIcon key={i} fill={fill} />;
    })}
  </span>
);

const authorOf = review => review.user
  ? [review.user.firstName, review.user.lastName].filter(Boolean).join(" ").trim() || review.user.email || "Unknown"
  : review.authorName
    ? `${review.authorName} (guest)`
    : "Deleted user";

// ─── One review ───────────────────────────────────────────────
function ReviewRow({ review, selected, onSelect, onStatusChange, onDelete, onEditText }) {
  const [actioning,  setActioning]  = useState(null);
  const [editing,    setEditing]    = useState(false);
  const [editText,   setEditText]   = useState(review.text);
  const [savingEdit, setSavingEdit] = useState(false);

  const status       = review.status || "pending";
  const rating       = review.rating ?? null;
  const likeCount    = Array.isArray(review.likes)    ? review.likes.length    : 0;
  const dislikeCount = Array.isArray(review.dislikes) ? review.dislikes.length : 0;

  const changeStatus = async s => {
    setActioning(s);
    await onStatusChange([review._id], s);
    setActioning(null);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;
    setActioning("delete");
    await onDelete([review._id]);
    setActioning(null);
  };

  const handleSave = async () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === review.text) { setEditing(false); return; }
    setSavingEdit(true);
    const ok = await onEditText(review._id, trimmed);
    if (ok) setEditing(false);
    setSavingEdit(false);
  };

  const busy = !!actioning || editing;

  return (
    <div className={cx("flex gap-3 border-b border-[#eef0ef] px-3 py-4 sm:px-5", selected && "bg-pine-tint/60")}>
      <span className="pt-0.5"><Checkbox checked={selected} onChange={onSelect} label="Select review" /></span>
      <div className="min-w-0 flex-1">
        {/* Product + author */}
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="flex min-w-0 items-center gap-3">
            {review.product?.image
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={review.product.image} alt="" className="h-10 w-10 shrink-0 rounded-lg bg-hover object-cover" />
              : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-hover text-faint"><Package size={16} aria-hidden /></span>}
            <div className="min-w-0">
              <Link href={`/products/${review.product?._id}`} target="_blank" className="block truncate text-[13px] font-medium text-ink no-underline hover:text-pine">
                {review.product?.name || "Unknown product"}
              </Link>
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-faint">
                <span>by <span className="text-sub">{authorOf(review)}</span></span>
                {review.verified && (
                  <span className="inline-flex items-center gap-1 text-[#15803d]" title="Bought and received this product">
                    <BadgeCheck size={13} aria-hidden /> Verified purchase{review.color ? ` (${review.color})` : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
            <span className="whitespace-nowrap text-xs text-faint">
              {new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {rating !== null && (
          <div className="mt-2.5 flex items-center gap-2">
            <Stars value={rating} />
            <span className="text-xs text-sub">{rating}/5</span>
          </div>
        )}

        {/* Text (edit in place) */}
        {editing ? (
          <div className="mt-2">
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              rows={4}
              autoFocus
              aria-label="Review text"
              className={textareaCls}
            />
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="primary" onClick={handleSave} disabled={savingEdit || !editText.trim()}>
                {savingEdit ? "Saving…" : "Save"}
              </Button>
              <Button size="sm" onClick={() => { setEditText(review.text); setEditing(false); }} disabled={savingEdit}>Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="m-0 mt-2 whitespace-pre-line break-words text-[13px] leading-relaxed text-ink">{review.text}</p>
        )}

        {/* Votes + actions */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="inline-flex items-center gap-1 text-xs text-faint"><ThumbsUp size={13} aria-hidden /> {likeCount} helpful</span>
          <span className="inline-flex items-center gap-1 text-xs text-faint"><ThumbsDown size={13} aria-hidden /> {dislikeCount}</span>
          <div className="ml-auto flex flex-wrap gap-1.5">
            {status !== "approved" && (
              <Button size="sm" variant="primary" onClick={() => changeStatus("approved")} disabled={busy}>
                <Check size={14} aria-hidden /> {actioning === "approved" ? "…" : "Approve"}
              </Button>
            )}
            {status !== "pending" && (
              <Button size="sm" onClick={() => changeStatus("pending")} disabled={busy}>
                <Clock size={14} aria-hidden /> {actioning === "pending" ? "…" : "Pending"}
              </Button>
            )}
            {status !== "archived" && (
              <Button size="sm" onClick={() => changeStatus("archived")} disabled={busy}>
                <Archive size={14} aria-hidden /> {actioning === "archived" ? "…" : "Archive"}
              </Button>
            )}
            <Button size="sm" onClick={() => setEditing(true)} disabled={busy} aria-label="Edit review text">
              <Pencil size={14} aria-hidden /> <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button size="sm" variant="danger" onClick={handleDelete} disabled={busy} aria-label="Delete review">
              <Trash2 size={14} aria-hidden /> <span className="hidden sm:inline">{actioning === "delete" ? "…" : "Delete"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function AdminReviewsPage() {
  const { refreshAlerts } = useAdmin();
  const [reviews,      setReviews]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [total,        setTotal]        = useState(0);
  const [counts,       setCounts]       = useState({ pending: 0, approved: 0, archived: 0 });
  const [selected,     setSelected]     = useState({});
  const [bulkBusy,     setBulkBusy]     = useState(false);

  const latestRequest = useRef(0);

  const fetchReviews = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: PAGE_SIZE });
      if (search)                 params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);
      // no-store: never show a copy the browser cached earlier
      const res  = await fetch(`/api/admin/reviews?${params}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.reviews)) throw new Error(data.message);
      // A slower response for a tab/search the admin already left must not overwrite the current one
      if (requestId !== latestRequest.current) return;
      setReviews(data.reviews);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      if (requestId === latestRequest.current) toast.error("Couldn't load reviews. Please refresh.");
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [page, search, statusFilter]);

  const fetchCounts = useCallback(async () => {
    const count = s => fetch(`/api/admin/reviews?status=${s}&limit=1`, { cache: "no-store" }).then(r => r.json()).then(d => d.total || 0).catch(() => 0);
    const [pending, approved, archived] = await Promise.all([count("pending"), count("approved"), count("archived")]);
    setCounts({ pending, approved, archived });
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchReviews, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchReviews]);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);
  useEffect(() => { setSelected({}); }, [page, search, statusFilter]);

  const afterChange = () => { fetchCounts(); refreshAlerts(); };

  const setStatus = async (ids, s) => {
    let failed = 0;
    for (const id of ids) {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: s }),
      }).catch(() => null);
      if (res?.ok) setReviews(prev => prev.map(r => r._id === id ? { ...r, status: s } : r));
      else failed++;
    }
    if (failed) toast.error(`${failed} review${failed === 1 ? "" : "s"} couldn't be updated`);
    else if (ids.length > 1) toast.success(`${ids.length} reviews marked ${s}`);
    afterChange();
  };

  const remove = async ids => {
    let failed = 0;
    for (const id of ids) {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" }).catch(() => null);
      if (res?.ok) {
        setReviews(prev => prev.filter(r => r._id !== id));
        setTotal(t => t - 1);
      } else failed++;
    }
    if (failed) toast.error(`${failed} review${failed === 1 ? "" : "s"} couldn't be deleted`);
    else toast.success(ids.length > 1 ? `${ids.length} reviews deleted` : "Review deleted");
    afterChange();
  };

  const editText = async (id, text) => {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).catch(() => null);
    if (res?.ok) {
      setReviews(prev => prev.map(r => r._id === id ? { ...r, text } : r));
      toast.success("Review updated");
      return true;
    }
    toast.error("Couldn't save. Please try again.");
    return false;
  };

  const selectedIds = reviews.filter(r => selected[r._id]).map(r => r._id);
  const allSelected = reviews.length > 0 && selectedIds.length === reviews.length;
  const toggleAll   = () => setSelected(allSelected ? {} : Object.fromEntries(reviews.map(r => [r._id, true])));

  const bulk = async (fn, ...args) => {
    setBulkBusy(true);
    await fn(selectedIds, ...args);
    setBulkBusy(false);
    setSelected({});
  };
  const bulkDelete = () => {
    if (window.confirm(`Delete ${selectedIds.length} review${selectedIds.length === 1 ? "" : "s"}? This cannot be undone.`)) bulk(remove);
  };

  const resetPage = setter => v => { setter(v); setPage(1); };
  const all = counts.pending + counts.approved + counts.archived;

  return (
    <div>
      <PageHeader title="Reviews" description={`${all.toLocaleString()} review${all === 1 ? "" : "s"} · ${counts.pending} waiting for approval`} />

      <Card>
        <Tabs
          label="Review status"
          value={statusFilter}
          onChange={resetPage(setStatusFilter)}
          tabs={[
            { value: "all",      label: "All",      count: all },
            { value: "pending",  label: "Pending",  count: counts.pending },
            { value: "approved", label: "Approved", count: counts.approved },
            { value: "archived", label: "Archived", count: counts.archived },
          ]}
        />

        <div className="flex flex-wrap items-center gap-3 px-3 py-3 sm:px-5">
          <label className="flex items-center gap-2 text-xs text-faint">
            <Checkbox checked={allSelected} indeterminate={selectedIds.length > 0} onChange={toggleAll} label="Select all reviews on this page" />
            <span className="hidden sm:inline">Select all</span>
          </label>
          <SearchInput
            className="min-w-[220px] flex-1"
            value={search}
            onChange={resetPage(setSearch)}
            onClear={() => resetPage(setSearch)("")}
            placeholder="Search by comment, product or customer"
          />
        </div>

        <BulkBar count={selectedIds.length} onClear={() => setSelected({})}>
          <button type="button" disabled={bulkBusy} onClick={() => bulk(setStatus, "approved")} className={bulkBtnCls}><Check size={13} aria-hidden /> Approve</button>
          <button type="button" disabled={bulkBusy} onClick={() => bulk(setStatus, "pending")} className={bulkBtnCls}><Clock size={13} aria-hidden /> Pending</button>
          <button type="button" disabled={bulkBusy} onClick={() => bulk(setStatus, "archived")} className={bulkBtnCls}><Archive size={13} aria-hidden /> Archive</button>
          <button type="button" disabled={bulkBusy} onClick={bulkDelete} className={bulkBtnCls}><Trash2 size={13} aria-hidden /> Delete</button>
        </BulkBar>

        {loading && !reviews.length ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : reviews.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No reviews found" description={search || statusFilter !== "all" ? "Try a different search or status." : "Reviews appear here as customers leave them."} />
        ) : (
          <div className={cx("border-t border-edge transition-opacity", loading && "opacity-60")}>
            {reviews.map(r => (
              <ReviewRow
                key={r._id}
                review={r}
                selected={!!selected[r._id]}
                onSelect={() => setSelected(s => ({ ...s, [r._id]: !s[r._id] }))}
                onStatusChange={setStatus}
                onDelete={remove}
                onEditText={editText}
              />
            ))}
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} onChange={setPage} noun="reviews" />
          </div>
        )}
      </Card>
    </div>
  );
}
