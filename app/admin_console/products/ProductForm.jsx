// app/admin_console/products/ProductForm.jsx
"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, ArrowUp, ArrowDown, GripVertical, Sparkles, Package } from "lucide-react";
import { CATEGORY_OPTIONS, getCategoryByDbName, getSpecFields } from "@/lib/categories";
import { Card, CardHeader, Button, Field, Switch, inputCls, selectCls, textareaCls, cx } from "@/components/admin/ui";
import { money } from "@/components/admin/format";

const TAG_OPTIONS = [
  { value: "",         label: "None" },
  { value: "hurry",    label: "Hurry" },
  { value: "fast",     label: "Fast" },
  { value: "new",      label: "New" },
  { value: "discount", label: "Discount" },
];

function useDragSort(setter) {
  const from = useRef(null), to = useRef(null);
  return useCallback((i) => ({
    draggable: true,
    onDragStart: (e) => { from.current = i; e.dataTransfer.effectAllowed = "move"; },
    onDragEnter: () => { to.current = i; },
    onDragOver:  (e) => e.preventDefault(),
    onDragEnd:   () => {
      if (from.current !== null && to.current !== null && from.current !== to.current) {
        setter(prev => {
          const arr = [...prev]; const [m] = arr.splice(from.current, 1); arr.splice(to.current, 0, m); return arr;
        });
      }
      from.current = null; to.current = null;
    },
  }), [setter]);
}

// ── Presentational pieces ────────────────────────────────────

const Section = ({ title, description, children }) => (
  <Card>
    <CardHeader title={title} description={description} />
    <div className="px-5 pb-5">{children}</div>
  </Card>
);

// A tickable row (specs and badges)
const CheckRow = ({ label, checked, onChange }) => (
  <label className={cx(
    "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[13px] transition-colors",
    checked ? "border-pine/40 bg-pine-tint text-ink" : "border-edge text-sub hover:bg-[#fafbfa]",
  )}>
    <input type="checkbox" checked={!!checked} onChange={onChange} className="h-4 w-4 cursor-pointer accent-pine" />
    <span className="font-medium">{label}</span>
  </label>
);

const AddBtn = ({ onClick, label }) => (
  <Button size="sm" onClick={onClick} className="mt-1 border-dashed">
    <Plus size={14} aria-hidden /> {label}
  </Button>
);

const IconBtn = ({ onClick, label, children, danger, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    className={cx(
      "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-sub transition-colors disabled:cursor-default disabled:opacity-30",
      danger ? "hover:bg-[#fdeeee] hover:text-[#b91c1c]" : "hover:bg-hover hover:text-ink",
    )}
  >
    {children}
  </button>
);

const Thumb = ({ url, size = "h-10 w-10" }) => (
  <span className={cx(size, "flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-edge bg-hover")}>
    {url
      // eslint-disable-next-line @next/next/no-img-element
      ? <img src={url} alt="" className="h-full w-full object-cover" onError={e => { e.currentTarget.style.display = "none"; }} />
      : <Package size={14} className="text-faint" aria-hidden />}
  </span>
);

const DragTip = () => (
  <p className="m-0 mb-2 text-xs text-faint">Drag rows to reorder, or use the arrows.</p>
);

const SortRow = ({ dragH, i, total, onUp, onDown, onRemove, children }) => {
  const [over, setOver] = useState(false);
  const h = dragH(i);
  return (
    <div {...h}
      onDragEnter={() => { h.onDragEnter(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDragEnd={(e) => { h.onDragEnd(e); setOver(false); }}
      className={cx("mb-1.5 flex items-center gap-1.5 rounded-lg border p-1 transition-colors", over ? "border-pine bg-pine-tint" : "border-transparent")}
    >
      <GripVertical size={16} className="shrink-0 cursor-grab text-faint" aria-hidden />
      <span className="w-5 shrink-0 text-center text-xs text-faint">{i + 1}</span>
      {children}
      <IconBtn onClick={onUp}   disabled={i === 0}         label="Move up"><ArrowUp size={14} aria-hidden /></IconBtn>
      <IconBtn onClick={onDown} disabled={i === total - 1} label="Move down"><ArrowDown size={14} aria-hidden /></IconBtn>
      <IconBtn onClick={onRemove} danger label="Remove"><X size={15} aria-hidden /></IconBtn>
    </div>
  );
};

const ColorImageRow = ({ img, ii, total, onUpdate, onMoveUp, onMoveDown, onRemove, dragHandlers }) => (
  <SortRow dragH={dragHandlers} i={ii} total={total} onUp={onMoveUp} onDown={onMoveDown} onRemove={onRemove}>
    <input value={img} onChange={e => onUpdate(e.target.value)} placeholder="Image URL" className={cx(inputCls, "flex-1")} aria-label={`Image ${ii + 1} URL`} />
    <Thumb url={img} />
  </SortRow>
);

const ColorCard = ({ color, ci, totalColors, onNameChange, onMoveUp, onMoveDown, onRemove, onAddImage, onRemoveImage, onUpdateImage, onMoveImageUp, onMoveImageDown, dragHandlers, imageDragHandlers }) => {
  const [cardOver, setCardOver] = useState(false);
  const ch = dragHandlers(ci);
  return (
    <div {...ch}
      onDragEnter={() => { ch.onDragEnter(); setCardOver(true); }}
      onDragLeave={() => setCardOver(false)}
      onDragEnd={(e) => { ch.onDragEnd(e); setCardOver(false); }}
      className={cx("mb-3 rounded-xl border p-4 transition-colors", cardOver ? "border-pine bg-pine-tint" : "border-edge bg-[#fafbfa]")}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <GripVertical size={16} className="shrink-0 cursor-grab text-faint" aria-hidden />
          <span
            className="h-5 w-5 shrink-0 rounded-full border border-edge"
            style={{ background: color.name || "#f1f3f2" }}
            aria-hidden
          />
          <span className="truncate text-[13px] font-medium text-ink">
            Variant {ci + 1}{color.name ? ` · ${color.name}` : ""}
          </span>
        </div>
        <div className="flex shrink-0 gap-0.5">
          <IconBtn onClick={onMoveUp}   disabled={ci === 0}               label="Move variant up"><ArrowUp size={14} aria-hidden /></IconBtn>
          <IconBtn onClick={onMoveDown} disabled={ci === totalColors - 1} label="Move variant down"><ArrowDown size={14} aria-hidden /></IconBtn>
          <IconBtn onClick={onRemove} danger label="Remove variant"><X size={15} aria-hidden /></IconBtn>
        </div>
      </div>
      <Field label="Colour name" className="mb-3">
        <input value={color.name} onChange={e => onNameChange(e.target.value)} placeholder="e.g. black, midnight blue" className={inputCls} />
      </Field>
      <div className="mb-1.5 text-[13px] font-medium text-sub">Images</div>
      {color.images.map((img, ii) => (
        <ColorImageRow key={ii} img={img} ii={ii} total={color.images.length}
          onUpdate={val => onUpdateImage(ii, val)}
          onMoveUp={() => onMoveImageUp(ii)} onMoveDown={() => onMoveImageDown(ii)}
          onRemove={() => onRemoveImage(ii)} dragHandlers={imageDragHandlers} />
      ))}
      <AddBtn onClick={onAddImage} label="Add image" />
    </div>
  );
};

// Inputs for product.specs — which fields show depends on the category (see lib/categories.js)
const SpecsFields = ({ fields, specs, onChange }) => {
  const toggle = (name, id) => {
    const current = specs[name] || [];
    onChange(name, current.includes(id) ? current.filter(v => v !== id) : [...current, id]);
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {fields.map(f => (
        <Field key={f.name} label={f.unit ? `${f.label} (${f.unit})` : f.label}
          className={f.kind === "multiselect" ? "sm:col-span-2" : ""}>
          {f.kind === "number" && (
            <input type="number" min="0" step="any" value={specs[f.name] ?? ""}
              onChange={e => onChange(f.name, e.target.value)} className={inputCls} />
          )}
          {f.kind === "select" && (
            <select value={specs[f.name] ?? ""} onChange={e => onChange(f.name, e.target.value)} className={selectCls}>
              <option value="">Not set</option>
              {f.options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          )}
          {f.kind === "multiselect" && (
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {f.options.map(o => (
                <CheckRow key={o.id} label={o.label} checked={(specs[f.name] || []).includes(o.id)} onChange={() => toggle(f.name, o.id)} />
              ))}
            </div>
          )}
        </Field>
      ))}
    </div>
  );
};

// Only send the specs that belong to the selected category, with numbers parsed
function buildSpecs(fields, specs) {
  const out = {};
  for (const f of fields) {
    const v = specs[f.name];
    if (f.kind === "number") {
      const n = parseFloat(v);
      if (!isNaN(n)) out[f.name] = n;
    } else if (f.kind === "select") {
      if (v) out[f.name] = v;
    } else if (v?.length) {
      out[f.name] = v;
    }
  }
  return out;
}

export default function ProductForm({ initial = {}, isEdit = false }) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: initial.name || "", price: initial.price || "", originalPrice: initial.originalPrice || "",
    category: getCategoryByDbName(initial.category)?.dbCategory || initial.category || "", tag: initial.tag || "", description: initial.description || "",
    image: initial.image || "", availability: initial.availability ?? true,
    features: (initial.features || []).join(", "),
    isBestseller: initial.isBestseller || false, isTodaysDeal: initial.isTodaysDeal || false,
    isWhatsNew: initial.isWhatsNew || false, isDiscounted: initial.isDiscounted || false,
  });

  const [secondaryImages, setSecondaryImages] = useState(initial.secondaryImages?.length ? initial.secondaryImages : [""]);
  const [colors,     setColors]     = useState(initial.colors?.length ? initial.colors.map(c => ({ name: c.name || "", images: c.images?.length ? c.images : [""] })) : []);
  const [videos,     setVideos]     = useState(initial.videos?.length ? initial.videos : []);
  const [boxContent, setBoxContent] = useState(initial.boxContent?.length ? initial.boxContent.map(b => ({ item: b.item || "", quantity: b.quantity || 1 })) : []);
  const [specs,      setSpecs]      = useState(initial.specs || {});
  const specFields = getSpecFields(form.category);
  const setSpec    = (name, value) => setSpecs(p => ({ ...p, [name]: value }));
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);
  const [generating, setGenerating] = useState(false);

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const swap = (setter, i, dir) => setter(prev => {
    const arr = [...prev], j = i + dir;
    if (j < 0 || j >= arr.length) return arr;
    [arr[i], arr[j]] = [arr[j], arr[i]]; return arr;
  });

  const secDrag      = useDragSort(setSecondaryImages);
  const updateSecImg = (i, v) => setSecondaryImages(p => p.map((x, idx) => idx === i ? v : x));
  const addSecImg    = () => setSecondaryImages(p => [...p, ""]);
  const removeSecImg = (i) => setSecondaryImages(p => p.filter((_, idx) => idx !== i));

  const colorFrom = useRef(null), colorTo = useRef(null);
  const colorCardDrag = (ci) => ({
    draggable: true,
    onDragStart: (e) => { colorFrom.current = ci; e.dataTransfer.effectAllowed = "move"; },
    onDragEnter: () => { colorTo.current = ci; },
    onDragOver:  (e) => e.preventDefault(),
    onDragEnd:   () => {
      if (colorFrom.current !== null && colorTo.current !== null && colorFrom.current !== colorTo.current) {
        setColors(prev => { const arr = [...prev]; const [m] = arr.splice(colorFrom.current, 1); arr.splice(colorTo.current, 0, m); return arr; });
      }
      colorFrom.current = null; colorTo.current = null;
    },
  });
  const addColor        = () => setColors(p => [...p, { name: "", images: [""] }]);
  const removeColor     = (i) => setColors(p => p.filter((_, idx) => idx !== i));
  const updateColorName = (ci, v) => setColors(p => p.map((c, idx) => idx === ci ? { ...c, name: v } : c));

  const ciFrom = useRef({}), ciTo = useRef({});
  const colorImgDrag = (ci) => (ii) => ({
    draggable: true,
    onDragStart: (e) => { e.stopPropagation(); ciFrom.current[ci] = ii; e.dataTransfer.effectAllowed = "move"; },
    onDragEnter: () => { ciTo.current[ci] = ii; },
    onDragOver:  (e) => e.preventDefault(),
    onDragEnd:   (e) => {
      e?.stopPropagation?.();
      const f = ciFrom.current[ci], t = ciTo.current[ci];
      if (f !== undefined && t !== undefined && f !== t) {
        setColors(prev => prev.map((c, idx) => {
          if (idx !== ci) return c;
          const imgs = [...c.images]; const [m] = imgs.splice(f, 1); imgs.splice(t, 0, m);
          return { ...c, images: imgs };
        }));
      }
      delete ciFrom.current[ci]; delete ciTo.current[ci];
    },
  });
  const addColorImage    = (ci)        => setColors(p => p.map((c, idx) => idx === ci ? { ...c, images: [...c.images, ""] } : c));
  const removeColorImage = (ci, ii)    => setColors(p => p.map((c, idx) => idx === ci ? { ...c, images: c.images.filter((_, i) => i !== ii) } : c));
  const updateColorImage = (ci, ii, v) => setColors(p => p.map((c, idx) => idx === ci ? { ...c, images: c.images.map((img, i) => i === ii ? v : img) } : c));
  const swapColorImage   = (ci, ii, dir) => setColors(p => p.map((c, idx) => {
    if (idx !== ci) return c;
    const imgs = [...c.images], j = ii + dir;
    if (j < 0 || j >= imgs.length) return c;
    [imgs[ii], imgs[j]] = [imgs[j], imgs[ii]]; return { ...c, images: imgs };
  }));

  const videoDrag   = useDragSort(setVideos);
  const updateVideo = (i, v) => setVideos(p => p.map((x, idx) => idx === i ? v : x));
  const addVideo    = () => setVideos(p => [...p, ""]);
  const removeVideo = (i) => setVideos(p => p.filter((_, idx) => idx !== i));

  const boxDrag   = useDragSort(setBoxContent);
  const updateBox = (i, f, v) => setBoxContent(p => p.map((b, idx) => idx === i ? { ...b, [f]: v } : b));
  const addBox    = () => setBoxContent(p => [...p, { item: "", quantity: 1 }]);
  const removeBox = (i) => setBoxContent(p => p.filter((_, idx) => idx !== i));
  // The product page lists the product first in "In the box" unless it's here under its exact name
  const productName   = form.name?.trim() || "";
  const boxHasProduct = boxContent.some(b => b.item?.trim().toLowerCase() === productName.toLowerCase());
  const addProductToBox = () => setBoxContent(p => [{ item: productName, quantity: 1 }, ...p]);

  const handleSubmit = async () => {
    setSaving(true); setError(null);
    try {
      const body = {
        ...form, price: parseFloat(form.price) || 0,
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        tag: form.tag || null,
        features: form.features.split(",").map(f => f.trim()).filter(Boolean),
        secondaryImages: secondaryImages.filter(Boolean),
        colors: colors.map(c => ({ name: c.name, images: c.images.filter(Boolean) })).filter(c => c.name),
        videos: videos.filter(Boolean),
        boxContent: boxContent.filter(b => b.item?.trim()).map(b => ({ item: b.item.trim(), quantity: parseInt(b.quantity) || 1 })),
        specs: buildSpecs(specFields, specs),
      };
      const url = isEdit ? `/api/products/${initial._id}` : "/api/admin/products";
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Failed"); }
      setSuccess(true);
      setTimeout(() => router.push("/admin_console/products"), 900);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const generateDescription = async () => {
    if (!form.name || !form.category) {
      setError("Please enter product name and category first");
      return;
    }

    setGenerating(true); setError(null);
    try {
      const featuresArray = form.features.split(",").map(f => f.trim()).filter(Boolean);
      const res = await fetch("/api/admin/products/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          price: form.price,
          features: featuresArray,
          existingDescription: form.description || null,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to generate description");
      }

      const data = await res.json();
      setForm(p => ({ ...p, description: data.description }));
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const discountPct = form.originalPrice && parseFloat(form.originalPrice) > parseFloat(form.price)
    ? Math.round((1 - parseFloat(form.price) / parseFloat(form.originalPrice)) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* ── Main column ── */}
      <div className="flex min-w-0 flex-col gap-4">
        <Section title="Details">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Product name"><input value={form.name} onChange={set("name")} placeholder="e.g. MagFlex Powerbank" className={inputCls} /></Field>
            <Field label="Category">
              <select value={form.category} onChange={set("category")} className={selectCls}>
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                {form.category && !CATEGORY_OPTIONS.some(c => c.value === form.category) && (
                  <option value={form.category}>{form.category} (not a shop category)</option>
                )}
              </select>
            </Field>
            <Field label="Price (₦)"><input type="number" value={form.price} onChange={set("price")} placeholder="19000" min="0" className={inputCls} /></Field>
            <Field label="Original price (₦)" hint="Leave blank if there's no discount">
              <input type="number" value={form.originalPrice} onChange={set("originalPrice")} placeholder="23000" min="0" className={inputCls} />
            </Field>
          </div>

          <Field label="Tag" className="mt-4">
            <div className="flex flex-wrap gap-1.5">
              {TAG_OPTIONS.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, tag: t.value }))}
                  aria-pressed={form.tag === t.value}
                  className={cx(
                    "h-8 cursor-pointer rounded-full border px-3 text-[13px] font-medium transition-colors",
                    form.tag === t.value ? "border-pine bg-pine text-white" : "border-[#dfe3e1] bg-white text-sub hover:border-pine hover:text-pine",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Field>

          <Field className="mt-4">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-[13px] font-medium text-sub">Description</span>
              <Button
                size="sm"
                onClick={generateDescription}
                aria-label={form.description ? "Improve description with AI" : "Generate AI description"}
                disabled={generating || !form.name || !form.category}
              >
                <Sparkles size={14} className={cx(generating && "animate-spin")} aria-hidden />
                {generating ? "Writing…" : form.description ? "Improve with AI" : "Write with AI"}
              </Button>
            </div>
            <textarea value={form.description} onChange={set("description")} placeholder="Product description…" rows={6} className={textareaCls} />
            {form.description && <div className="mt-1 text-right text-xs text-faint">{form.description.length} characters</div>}
          </Field>

          <Field label="Features" hint="Separate with commas" className="mt-4">
            <input value={form.features} onChange={set("features")} placeholder="Fast charging, Built-in cable, 10000mAh" className={inputCls} />
          </Field>
        </Section>

        <Section
          title="Specs and filters"
          description={specFields.length ? `These power the filters on the ${form.category} page. Leave blank if they don't apply.` : undefined}
        >
          {specFields.length === 0
            ? <p className="m-0 text-[13px] text-faint">{form.category ? "No filterable specs for this category yet." : "Pick a category to see its specs."}</p>
            : <SpecsFields fields={specFields} specs={specs} onChange={setSpec} />}
        </Section>

        <Section title="Images" description="The main image is used on product cards; the gallery shows on the product page">
          <Field label="Main image URL">
            <div className="flex items-center gap-2">
              <input value={form.image} onChange={set("image")} placeholder="https://res.cloudinary.com/..." className={inputCls} />
              <Thumb url={form.image} />
            </div>
          </Field>
          <div className="mb-1.5 mt-4 text-[13px] font-medium text-sub">Gallery</div>
          {secondaryImages.length > 1 && <DragTip />}
          {secondaryImages.map((url, i) => (
            <SortRow key={i} dragH={secDrag} i={i} total={secondaryImages.length}
              onUp={() => swap(setSecondaryImages, i, -1)} onDown={() => swap(setSecondaryImages, i, 1)} onRemove={() => removeSecImg(i)}>
              <input value={url} onChange={e => updateSecImg(i, e.target.value)} placeholder="Image URL" className={cx(inputCls, "flex-1")} aria-label={`Gallery image ${i + 1} URL`} />
              <Thumb url={url} />
            </SortRow>
          ))}
          <AddBtn onClick={addSecImg} label="Add image" />
        </Section>

        <Section title="Colour variants" description="Each colour has a name and its own images. Drag cards to reorder.">
          {colors.length === 0 && <p className="m-0 mb-2 text-[13px] text-faint">No colour variants yet.</p>}
          {colors.map((color, ci) => (
            <ColorCard key={ci} color={color} ci={ci} totalColors={colors.length}
              onNameChange={val => updateColorName(ci, val)}
              onMoveUp={() => swap(setColors, ci, -1)} onMoveDown={() => swap(setColors, ci, 1)}
              onRemove={() => removeColor(ci)} onAddImage={() => addColorImage(ci)}
              onRemoveImage={ii => removeColorImage(ci, ii)}
              onUpdateImage={(ii, val) => updateColorImage(ci, ii, val)}
              onMoveImageUp={ii => swapColorImage(ci, ii, -1)}
              onMoveImageDown={ii => swapColorImage(ci, ii, 1)}
              dragHandlers={colorCardDrag} imageDragHandlers={colorImgDrag(ci)} />
          ))}
          <AddBtn onClick={addColor} label="Add colour variant" />
        </Section>

        <Section title="Videos" description="Optional">
          {videos.length === 0 && <p className="m-0 mb-2 text-[13px] text-faint">No videos added.</p>}
          {videos.length > 1 && <DragTip />}
          {videos.map((url, i) => (
            <SortRow key={i} dragH={videoDrag} i={i} total={videos.length}
              onUp={() => swap(setVideos, i, -1)} onDown={() => swap(setVideos, i, 1)} onRemove={() => removeVideo(i)}>
              <input value={url} onChange={e => updateVideo(i, e.target.value)} placeholder="Video URL" className={cx(inputCls, "flex-1")} aria-label={`Video ${i + 1} URL`} />
            </SortRow>
          ))}
          <AddBtn onClick={addVideo} label="Add video URL" />
        </Section>

        <Section
          title="In the box"
          description="Each item with its quantity. The product itself always shows first on the product page; add it here only to change its quantity or position."
        >
          {boxContent.length === 0 && <p className="m-0 mb-2 text-[13px] text-faint">No box items yet.</p>}
          {boxContent.length > 1 && <DragTip />}
          {boxContent.map((b, i) => (
            <SortRow key={i} dragH={boxDrag} i={i} total={boxContent.length}
              onUp={() => swap(setBoxContent, i, -1)} onDown={() => swap(setBoxContent, i, 1)} onRemove={() => removeBox(i)}>
              <input value={b.item} onChange={e => updateBox(i, "item", e.target.value)} placeholder="e.g. USB-C cable, user manual" className={cx(inputCls, "flex-1")} aria-label={`Box item ${i + 1}`} />
              <input type="number" value={b.quantity} onChange={e => updateBox(i, "quantity", e.target.value)} min="1" placeholder="Qty"
                className={cx(inputCls, "w-16 text-center")} aria-label={`Quantity of box item ${i + 1}`} />
            </SortRow>
          ))}
          <div className="flex flex-wrap gap-2">
            <AddBtn onClick={addBox} label="Add item" />
            {productName && !boxHasProduct && <AddBtn onClick={addProductToBox} label={`Add "${productName}"`} />}
          </div>
        </Section>
      </div>

      {/* ── Side column: summary, visibility and save ── */}
      <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
        <Card className="overflow-hidden">
          <div className="flex aspect-[4/3] items-center justify-center bg-hover">
            {form.image
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={form.image} alt="" className="h-full w-full object-cover" onError={e => { e.currentTarget.style.display = "none"; }} />
              : <Package size={32} className="text-faint" aria-hidden />}
          </div>
          <div className="px-5 py-4">
            <div className="truncate text-[15px] font-medium text-ink">{form.name || "Untitled product"}</div>
            <div className="mt-0.5 text-xs text-faint">{form.category || "No category"}</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-poppins text-lg font-semibold">{money(form.price)}</span>
              {discountPct > 0 && (
                <>
                  <span className="text-[13px] text-faint line-through">{money(form.originalPrice)}</span>
                  <span className="rounded-full bg-[#eaf7ef] px-2 py-px text-xs font-semibold text-[#15803d]">−{discountPct}%</span>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card className="px-5 py-4">
          <h2 className="m-0 mb-3 font-poppins text-[15px] font-semibold text-ink">Visibility</h2>
          <Switch
            label="In stock"
            description={form.availability ? "Shoppers can buy this product" : "Shown as out of stock"}
            checked={form.availability}
            onChange={set("availability")}
          />
          <div className="mb-2 mt-4 text-[13px] font-medium text-sub">Badges</div>
          <div className="flex flex-col gap-1.5">
            <CheckRow label="Bestseller"   checked={form.isBestseller} onChange={set("isBestseller")} />
            <CheckRow label="Today's deal" checked={form.isTodaysDeal} onChange={set("isTodaysDeal")} />
            <CheckRow label="What's new"   checked={form.isWhatsNew}   onChange={set("isWhatsNew")} />
            <CheckRow label="Discounted"   checked={form.isDiscounted} onChange={set("isDiscounted")} />
          </div>
        </Card>

        <Card className="px-5 py-4">
          {error && (
            <div role="alert" className="mb-3 rounded-lg border border-[#f3c4c4] bg-[#fdeeee] px-3 py-2 text-[13px] text-[#b91c1c]">{error}</div>
          )}
          <Button variant="primary" onClick={handleSubmit} disabled={saving || success} className="h-11 w-full">
            {success ? "Saved — taking you back…" : saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </Button>
          <Button href="/admin_console/products" variant="ghost" className="mt-2 w-full">Cancel</Button>
        </Card>
      </div>
    </div>
  );
}
