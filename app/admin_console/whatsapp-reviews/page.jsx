// app/admin_console/whatsapp-reviews/page.jsx
// WhatsApp chat screenshots for the storefront review carousels (homepage + category pages).
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight, MessageCircle, ImageOff } from "lucide-react";
import {
  PageHeader, Card, CardHeader, Button, IconButton, Tabs, Field, Switch, EmptyState, Skeleton, StatusBadge,
  inputCls, cx,
} from "@/components/admin/ui";

const API = "/api/admin/whatsapp-reviews";
const EMPTY_FORM = { imageUrl: "", placements: [], note: "", published: true };

async function send(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => null);
  const data = await res?.json().catch(() => ({}));
  if (!res?.ok) throw new Error(data?.message || "Something went wrong");
  return data;
}

// The screenshot, or a placeholder when the link doesn't load
function Shot({ src, className }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  return (
    <div className={cx("relative overflow-hidden rounded-lg bg-[#0B141A]", className)}>
      {src && !broken
        ? <img src={src} alt="" className="h-full w-full object-cover object-top" onError={() => setBroken(true)} />
        : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-canvas text-xs text-faint">
            <ImageOff size={18} aria-hidden />
            {src ? "Link didn't load" : "Preview"}
          </div>
        )}
    </div>
  );
}

// ─── Add / edit form ──────────────────────────────────────────
function ReviewForm({ initial, placements, onCancel, onSaved }) {
  const [form, setForm]     = useState(initial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?._id);

  const togglePlacement = value => setForm(f => ({
    ...f,
    placements: f.placements.includes(value) ? f.placements.filter(p => p !== value) : [...f.placements, value],
  }));

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { imageUrl: form.imageUrl, placements: form.placements, note: form.note, published: form.published };
      const data = isEdit ? await send(`${API}/${initial._id}`, "PATCH", body) : await send(API, "POST", body);
      toast.success(isEdit ? "Screenshot updated" : "Screenshot added");
      onSaved(data.review);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-5">
      <CardHeader
        title={isEdit ? "Edit screenshot" : "Add a screenshot"}
        description="Upload the chat image to your image host (e.g. R2 or Cloudinary), then paste its link here. Hide names and numbers before uploading."
      />
      <form onSubmit={submit} className="flex flex-col gap-5 border-t border-edge px-5 py-5 sm:flex-row">
        <Shot src={form.imageUrl.trim()} className="aspect-[5/6] w-full shrink-0 sm:w-[180px]" />

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Field label="Image link">
            <input
              value={form.imageUrl}
              onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://pub-….r2.dev/reviews/chat-01.png"
              className={inputCls}
              inputMode="url"
              required
            />
          </Field>

          <Field label="Show on" hint="Pick the category the customer is talking about. Add Homepage for the best ones.">
            <div className="flex flex-wrap gap-2">
              {placements.map(p => {
                const on = form.placements.includes(p.value);
                return (
                  <button
                    key={p.value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => togglePlacement(p.value)}
                    className={cx(
                      "h-8 cursor-pointer rounded-full border px-3 text-xs font-medium transition-colors",
                      on ? "border-pine bg-pine text-white" : "border-[#dfe3e1] bg-white text-sub hover:border-pine hover:text-pine",
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Note (optional)" hint="Only admins see this.">
            <input
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="e.g. MagFlex 10K, customer from Ikeja"
              maxLength={120}
              className={inputCls}
            />
          </Field>

          <Switch
            checked={form.published}
            onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
            label="Live on the site"
            description="Turn off to save it without showing it yet."
          />

          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add screenshot"}
            </Button>
            <Button onClick={onCancel} disabled={saving}>Cancel</Button>
          </div>
        </div>
      </form>
    </Card>
  );
}

// ─── One screenshot in the grid ───────────────────────────────
function ReviewTile({ review, labelOf, canMoveBack, canMoveForward, onMove, onEdit, onToggle, onDelete }) {
  return (
    <Card as="li" className="flex flex-col overflow-hidden">
      <div className="relative p-2.5 pb-0">
        <Shot src={review.imageUrl} className={cx("aspect-[5/6] w-full", !review.published && "opacity-50")} />
        <span className="absolute left-4 top-4">
          <StatusBadge status={review.published ? "approved" : "archived"}>{review.published ? "Live" : "Hidden"}</StatusBadge>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3 pb-2 pt-3">
        <div className="flex flex-wrap gap-1">
          {review.placements.map(p => (
            <span key={p} className="rounded-full bg-pine-tint px-2 py-px text-[11px] font-medium text-pine">{labelOf(p)}</span>
          ))}
        </div>
        {review.note && <p className="m-0 line-clamp-2 text-xs text-faint">{review.note}</p>}
      </div>

      <div className="flex items-center justify-between border-t border-edge px-1 py-1">
        <div className="flex">
          <IconButton label="Move earlier" onClick={() => onMove(-1)} disabled={!canMoveBack} className="h-9 w-9 disabled:opacity-30">
            <ChevronLeft size={16} aria-hidden />
          </IconButton>
          <IconButton label="Move later" onClick={() => onMove(1)} disabled={!canMoveForward} className="h-9 w-9 disabled:opacity-30">
            <ChevronRight size={16} aria-hidden />
          </IconButton>
        </div>
        <div className="flex">
          <IconButton label={review.published ? "Hide from site" : "Show on site"} onClick={onToggle} className="h-9 w-9">
            {review.published ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
          </IconButton>
          <IconButton label="Edit" onClick={onEdit} className="h-9 w-9">
            <Pencil size={16} aria-hidden />
          </IconButton>
          <IconButton label="Delete" onClick={onDelete} className="h-9 w-9 hover:bg-[#fdeeee] hover:text-[#b91c1c]">
            <Trash2 size={16} aria-hidden />
          </IconButton>
        </div>
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function WhatsAppReviewsPage() {
  const [reviews,    setReviews]    = useState([]);
  const [placements, setPlacements] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState("all");
  const [editing,    setEditing]    = useState(null); // null | "new" | review

  const load = useCallback(async () => {
    try {
      const data = await send(API, "GET");
      setReviews(data.reviews);
      setPlacements(data.placements);
    } catch {
      toast.error("Couldn't load WhatsApp reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const labelOf = useCallback(v => placements.find(p => p.value === v)?.label || v, [placements]);

  const visible = useMemo(
    () => (tab === "all" ? reviews : reviews.filter(r => r.placements.includes(tab))),
    [reviews, tab],
  );

  const tabs = [
    { value: "all", label: "All", count: reviews.length },
    ...placements.map(p => ({ value: p.value, label: p.label, count: reviews.filter(r => r.placements.includes(p.value)).length })),
  ];

  const onSaved = saved => {
    setReviews(list => list.some(r => r._id === saved._id)
      ? list.map(r => (r._id === saved._id ? saved : r))
      : [saved, ...list]);
    setEditing(null);
  };

  const toggle = async review => {
    try {
      const { review: saved } = await send(`${API}/${review._id}`, "PATCH", { published: !review.published });
      setReviews(list => list.map(r => (r._id === saved._id ? saved : r)));
      toast.success(saved.published ? "Now live on the site" : "Hidden from the site");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async review => {
    if (!window.confirm("Delete this screenshot? It will disappear from the site.")) return;
    try {
      await send(`${API}/${review._id}`, "DELETE");
      setReviews(list => list.filter(r => r._id !== review._id));
      toast.success("Screenshot deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Swap with its neighbour in the current tab, then save the whole order
  const move = async (review, dir) => {
    const neighbour = visible[visible.indexOf(review) + dir];
    if (!neighbour) return;
    const previous = reviews;
    const next = [...reviews];
    const a = next.indexOf(review), b = next.indexOf(neighbour);
    [next[a], next[b]] = [next[b], next[a]];
    setReviews(next);
    try {
      await send(API, "PUT", { order: next.map(r => r._id) });
    } catch (err) {
      setReviews(previous);
      toast.error(err.message);
    }
  };

  return (
    <>
      <PageHeader
        title="WhatsApp reviews"
        description="Chat screenshots shown in the review carousels on the homepage and category pages."
        actions={editing !== "new" && (
          <Button variant="primary" onClick={() => setEditing("new")}>
            <Plus size={16} aria-hidden /> Add screenshot
          </Button>
        )}
      />

      {editing && (
        <ReviewForm
          key={editing === "new" ? "new" : editing._id}
          initial={editing === "new" ? null : editing}
          placements={placements}
          onCancel={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}

      <Card>
        <Tabs label="Filter by page" tabs={tabs} value={tab} onChange={setTab} />

        {loading ? (
          <ul className="m-0 grid list-none grid-cols-2 gap-4 p-4 sm:grid-cols-3 sm:p-5 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 5 }, (_, i) => <li key={i}><Skeleton className="aspect-[5/7] w-full rounded-xl" /></li>)}
          </ul>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title={tab === "all" ? "No screenshots yet" : `Nothing on ${labelOf(tab)} yet`}
            description={tab === "all"
              ? "Add your first WhatsApp review and it will show on the pages you pick."
              : tab === "home"
                ? "The homepage shows the original sample chats until you add one."
                : "This page's review section stays hidden until you add one."}
            action={editing !== "new" && <Button variant="primary" onClick={() => setEditing("new")}><Plus size={16} aria-hidden /> Add screenshot</Button>}
          />
        ) : (
          <ul className="m-0 grid list-none grid-cols-2 gap-4 p-4 sm:grid-cols-3 sm:p-5 lg:grid-cols-4 xl:grid-cols-5">
            {visible.map((review, i) => (
              <ReviewTile
                key={review._id}
                review={review}
                labelOf={labelOf}
                canMoveBack={i > 0}
                canMoveForward={i < visible.length - 1}
                onMove={dir => move(review, dir)}
                onEdit={() => { setEditing(review); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                onToggle={() => toggle(review)}
                onDelete={() => remove(review)}
              />
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
