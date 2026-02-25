// app/admin/products/ProductForm.jsx
"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const C = {
  bg: "#0a0a0a", surface: "#111", border: "#1e1e1e", border2: "#2a2a2a",
  text: "#e8e8e8", muted: "#666", dim: "#444", faint: "#2a2a2a",
  gold: "#e8c46a", green: "#6ae8a0", blue: "#6ab4e8", red: "#e86a6a",
};

const INPUT = {
  width: "100%", background: C.bg, border: `1px solid ${C.border2}`,
  borderRadius: "6px", padding: "10px 14px", color: C.text,
  fontSize: "13px", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};

const TAG_OPTIONS = ["", "hurry", "fast", "new", "discount"];
const TAG_COLORS  = { hurry: "#e86a6a", fast: "#e8a06a", new: "#6ae8a0", discount: "#6ab4e8", "": C.dim };

// ── useDragSort ──────────────────────────────────────────────────────────────
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
          const arr = [...prev];
          const [m] = arr.splice(from.current, 1);
          arr.splice(to.current, 0, m);
          return arr;
        });
      }
      from.current = null; to.current = null;
    },
  }), [setter]);
}

// ── Small components ─────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "24px", marginBottom: "14px" }}>
    <div style={{ fontSize: "9px", letterSpacing: "0.22em", color: C.dim, textTransform: "uppercase", marginBottom: "20px", fontWeight: "600" }}>{title}</div>
    {children}
  </div>
);

const Label = ({ children }) => (
  <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: C.dim, textTransform: "uppercase", marginBottom: "6px", fontWeight: "600" }}>{children}</div>
);

const Field = ({ label, children, style }) => (
  <div style={{ marginBottom: "16px", ...style }}>{label && <Label>{label}</Label>}{children}</div>
);

const Checkbox = ({ label, checked, onChange, accent = C.gold }) => (
  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${checked ? accent + "44" : C.border}`, background: checked ? accent + "0a" : "transparent", transition: "all 0.15s", marginBottom: "6px" }}>
    <div style={{ width: "15px", height: "15px", border: `1.5px solid ${checked ? accent : "#333"}`, borderRadius: "3px", background: checked ? accent + "22" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
      {checked && <span style={{ fontSize: "9px", color: accent, fontWeight: "900" }}>✓</span>}
    </div>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ display: "none" }} />
    <span style={{ fontSize: "12px", color: checked ? C.text : C.muted, letterSpacing: "0.04em" }}>{label}</span>
  </label>
);

const AddBtn = ({ onClick, label }) => (
  <button type="button" onClick={onClick}
    style={{ padding: "7px 16px", background: "transparent", border: `1px dashed ${C.border2}`, borderRadius: "6px", color: C.dim, fontSize: "11px", letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.15s", marginTop: "6px" }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.color = "#999"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.color = C.dim; }}
  >+ {label}</button>
);

const IconBtn = ({ onClick, title, children, danger, disabled }) => (
  <button type="button" onClick={onClick} disabled={disabled} title={title}
    style={{ width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid ${C.border}`, borderRadius: "5px", color: disabled ? "#252525" : C.dim, fontSize: "11px", cursor: disabled ? "default" : "pointer", flexShrink: 0, transition: "all 0.15s" }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = danger ? C.red + "55" : "#555"; e.currentTarget.style.color = danger ? C.red : "#bbb"; e.currentTarget.style.background = danger ? C.red + "0a" : "#1a1a1a"; }}}
    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = disabled ? "#252525" : C.dim; e.currentTarget.style.background = "transparent"; }}
  >{children}</button>
);

const DragDots = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "3px", padding: "4px 5px", cursor: "grab", flexShrink: 0, opacity: 0.22, transition: "opacity 0.15s" }}
    onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
    onMouseLeave={e => e.currentTarget.style.opacity = "0.22"}
    title="Drag to reorder"
  >
    {[0,1,2].map(r => (
      <div key={r} style={{ display: "flex", gap: "2.5px" }}>
        <div style={{ width: "2.5px", height: "2.5px", borderRadius: "50%", background: "#aaa" }} />
        <div style={{ width: "2.5px", height: "2.5px", borderRadius: "50%", background: "#aaa" }} />
      </div>
    ))}
  </div>
);

const Badge = ({ n }) => (
  <div style={{ minWidth: "20px", height: "20px", borderRadius: "4px", background: "#161616", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#444", fontWeight: "700", flexShrink: 0 }}>{n}</div>
);

const Thumb = ({ url }) => (
  <div style={{ width: "34px", height: "34px", borderRadius: "5px", border: `1px solid ${C.border}`, background: C.bg, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
    {url ? <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
          : <span style={{ fontSize: "12px", color: "#222" }}>□</span>}
  </div>
);

const DragTip = () => (
  <div style={{ fontSize: "10px", color: "#2e2e2e", marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px", letterSpacing: "0.06em" }}>
    <span>⠿</span> Drag to reorder · ↑↓ for precise moves
  </div>
);

// Generic sortable row
const SortRow = ({ dragH, i, total, onUp, onDown, onRemove, children }) => {
  const [over, setOver] = useState(false);
  const h = dragH(i);
  return (
    <div {...h}
      onDragEnter={() => { h.onDragEnter(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDragEnd={(e) => { h.onDragEnd(e); setOver(false); }}
      style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "7px", padding: "5px 6px", borderRadius: "7px", border: `1px solid ${over ? "#444" : "transparent"}`, background: over ? "#161616" : "transparent", transition: "all 0.12s" }}
    >
      <DragDots />
      <Badge n={i + 1} />
      {children}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <IconBtn onClick={onUp} disabled={i === 0} title="Move up">↑</IconBtn>
        <IconBtn onClick={onDown} disabled={i === total - 1} title="Move down">↓</IconBtn>
      </div>
      <IconBtn onClick={onRemove} danger title="Remove">✕</IconBtn>
    </div>
  );
};

// ── ColorImageRow — own component so hooks aren't inside .map() ───────────────
const ColorImageRow = ({ img, ii, total, onUpdate, onMoveUp, onMoveDown, onRemove, dragHandlers }) => {
  const [over, setOver] = useState(false);
  const ih = dragHandlers(ii);
  return (
    <div
      {...ih}
      onDragEnter={() => { ih.onDragEnter(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDragEnd={(e) => { ih.onDragEnd(e); setOver(false); }}
      style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "6px", padding: "4px 5px", borderRadius: "6px", border: `1px solid ${over ? "#555" : "transparent"}`, background: over ? "#1a1a1a" : "transparent", transition: "all 0.12s" }}
    >
      <DragDots />
      <Badge n={ii + 1} />
      <input value={img} onChange={e => onUpdate(e.target.value)} placeholder="Image URL" style={{ ...INPUT, marginBottom: 0, flex: 1, fontSize: "12px" }} />
      <Thumb url={img} />
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <IconBtn onClick={onMoveUp} disabled={ii === 0} title="Move up">↑</IconBtn>
        <IconBtn onClick={onMoveDown} disabled={ii === total - 1} title="Move down">↓</IconBtn>
      </div>
      <IconBtn onClick={onRemove} danger title="Remove">✕</IconBtn>
    </div>
  );
};

// ── ColorCard — own component so hooks aren't inside .map() ──────────────────
const ColorCard = ({ color, ci, totalColors, onNameChange, onMoveUp, onMoveDown, onRemove, onAddImage, onRemoveImage, onUpdateImage, onMoveImageUp, onMoveImageDown, dragHandlers, imageDragHandlers }) => {
  const [cardOver, setCardOver] = useState(false);
  const ch = dragHandlers(ci);
  return (
    <div
      {...ch}
      onDragEnter={() => { ch.onDragEnter(); setCardOver(true); }}
      onDragLeave={() => setCardOver(false)}
      onDragEnd={(e) => { ch.onDragEnd(e); setCardOver(false); }}
      style={{ background: cardOver ? "#141414" : "#0c0c0c", border: `1px solid ${cardOver ? "#444" : C.border}`, borderRadius: "8px", padding: "16px", marginBottom: "10px", transition: "all 0.12s" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <DragDots />
          <span style={{ fontSize: "9px", letterSpacing: "0.18em", color: "#444", textTransform: "uppercase", fontWeight: "600" }}>
            Variant {ci + 1}{color.name ? ` — ${color.name}` : ""}
          </span>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          <IconBtn onClick={onMoveUp} disabled={ci === 0} title="Move up">↑</IconBtn>
          <IconBtn onClick={onMoveDown} disabled={ci === totalColors - 1} title="Move down">↓</IconBtn>
          <IconBtn onClick={onRemove} danger title="Remove">✕</IconBtn>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "14px" }}>
        <div style={{ flex: 1 }}>
          <Label>Color Name</Label>
          <input value={color.name} onChange={e => onNameChange(e.target.value)} placeholder="e.g. black, midnight blue, rose gold" style={INPUT} />
        </div>
        <div style={{ marginTop: "20px", flexShrink: 0 }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: color.name || "#1e1e1e", border: `2px solid ${C.border2}`, transition: "background 0.3s, box-shadow 0.3s", boxShadow: color.name ? `0 0 14px ${color.name}55` : "none" }} title={color.name || "No color set"} />
        </div>
      </div>

      <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: "#333", textTransform: "uppercase", marginBottom: "8px", fontWeight: "600" }}>Images</div>
      {color.images.map((img, ii) => (
        <ColorImageRow
          key={ii}
          img={img} ii={ii} total={color.images.length}
          onUpdate={(val) => onUpdateImage(ii, val)}
          onMoveUp={() => onMoveImageUp(ii)}
          onMoveDown={() => onMoveImageDown(ii)}
          onRemove={() => onRemoveImage(ii)}
          dragHandlers={imageDragHandlers}
        />
      ))}
      <AddBtn onClick={onAddImage} label="Add Image" />
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProductForm({ initial = {}, isEdit = false }) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: initial.name || "",
    price: initial.price || "",
    originalPrice: initial.originalPrice || "",
    category: initial.category || "",
    tag: initial.tag || "",
    description: initial.description || "",
    image: initial.image || "",
    availability: initial.availability ?? true,
    features: (initial.features || []).join(", "),
    isBestseller: initial.isBestseller || false,
    isTodaysDeal: initial.isTodaysDeal || false,
    isWhatsNew: initial.isWhatsNew || false,
    isDiscounted: initial.isDiscounted || false,
  });

  const [secondaryImages, setSecondaryImages] = useState(initial.secondaryImages?.length ? initial.secondaryImages : [""]);
  const [colors, setColors] = useState(initial.colors?.length ? initial.colors.map(c => ({ name: c.name || "", images: c.images?.length ? c.images : [""] })) : []);
  const [videos, setVideos] = useState(initial.videos?.length ? initial.videos : []);
  const [boxContent, setBoxContent] = useState(initial.boxContent?.length ? initial.boxContent.map(b => ({ item: b.item || "", quantity: b.quantity || 1 })) : []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const swap = (setter, i, dir) => setter(prev => {
    const arr = [...prev], j = i + dir;
    if (j < 0 || j >= arr.length) return arr;
    [arr[i], arr[j]] = [arr[j], arr[i]]; return arr;
  });

  // Secondary images
  const secDrag = useDragSort(setSecondaryImages);
  const updateSecImg = (i, v) => setSecondaryImages(p => p.map((x, idx) => idx === i ? v : x));
  const addSecImg    = () => setSecondaryImages(p => [...p, ""]);
  const removeSecImg = (i) => setSecondaryImages(p => p.filter((_, idx) => idx !== i));

  // Colors (card level)
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

  // Color images (per-color drag)
  const ciFrom = useRef({}), ciTo = useRef({});
  const colorImgDrag = (ci) => (ii) => ({
    draggable: true,
    onDragStart: (e) => { ciFrom.current[ci] = ii; e.dataTransfer.effectAllowed = "move"; },
    onDragEnter: () => { ciTo.current[ci] = ii; },
    onDragOver:  (e) => e.preventDefault(),
    onDragEnd:   () => {
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
  const addColorImage    = (ci)      => setColors(p => p.map((c, idx) => idx === ci ? { ...c, images: [...c.images, ""] } : c));
  const removeColorImage = (ci, ii)  => setColors(p => p.map((c, idx) => idx === ci ? { ...c, images: c.images.filter((_, i) => i !== ii) } : c));
  const updateColorImage = (ci, ii, v) => setColors(p => p.map((c, idx) => idx === ci ? { ...c, images: c.images.map((img, i) => i === ii ? v : img) } : c));
  const swapColorImage   = (ci, ii, dir) => setColors(p => p.map((c, idx) => {
    if (idx !== ci) return c;
    const imgs = [...c.images], j = ii + dir;
    if (j < 0 || j >= imgs.length) return c;
    [imgs[ii], imgs[j]] = [imgs[j], imgs[ii]]; return { ...c, images: imgs };
  }));

  // Videos
  const videoDrag = useDragSort(setVideos);
  const updateVideo = (i, v) => setVideos(p => p.map((x, idx) => idx === i ? v : x));
  const addVideo    = () => setVideos(p => [...p, ""]);
  const removeVideo = (i) => setVideos(p => p.filter((_, idx) => idx !== i));

  // Box
  const boxDrag = useDragSort(setBoxContent);
  const updateBox = (i, f, v) => setBoxContent(p => p.map((b, idx) => idx === i ? { ...b, [f]: v } : b));
  const addBox    = () => setBoxContent(p => [...p, { item: "", quantity: 1 }]);
  const removeBox = (i) => setBoxContent(p => p.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    setSaving(true); setError(null);
    try {
      const body = {
        ...form,
        price: parseFloat(form.price) || 0,
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        tag: form.tag || null,
        features: form.features.split(",").map(f => f.trim()).filter(Boolean),
        secondaryImages: secondaryImages.filter(Boolean),
        colors: colors.map(c => ({ name: c.name, images: c.images.filter(Boolean) })).filter(c => c.name),
        videos: videos.filter(Boolean),
        boxContent: boxContent.filter(b => b.item?.trim()).map(b => ({ item: b.item.trim(), quantity: parseInt(b.quantity) || 1 })),
      };
      const url = isEdit ? `/api/products/${initial._id}` : "/api/admin/products";
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Failed"); }
      setSuccess(true);
      setTimeout(() => router.push("/admin/products"), 900);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: "780px" }}>

      {/* Core Details */}
      <Section title="Core Details">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <Field label="Product Name"><input value={form.name} onChange={set("name")} placeholder="e.g. MagFlex Powerbank" style={INPUT} /></Field>
          <Field label="Category"><input value={form.category} onChange={set("category")} placeholder="e.g. Power Bank" style={INPUT} /></Field>
          <Field label="Price (₦)"><input type="number" value={form.price} onChange={set("price")} placeholder="19000" min="0" style={INPUT} /></Field>
          <Field label="Original Price (₦)"><input type="number" value={form.originalPrice} onChange={set("originalPrice")} placeholder="23000 — leave blank if no discount" min="0" style={INPUT} /></Field>
        </div>
        <Field label="Tag">
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {TAG_OPTIONS.map(t => {
              const active = form.tag === t;
              const color = TAG_COLORS[t];
              return (
                <button key={t} type="button" onClick={() => setForm(p => ({ ...p, tag: t }))} style={{ padding: "6px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: active ? "700" : "400", border: `1px solid ${active ? color + "77" : C.border}`, background: active ? color + "18" : "transparent", color: active ? color : C.dim, transition: "all 0.15s" }}>
                  {t === "" ? "None" : t}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Description"><textarea value={form.description} onChange={set("description")} placeholder="Product description..." rows={5} style={{ ...INPUT, resize: "vertical", lineHeight: "1.7" }} /></Field>
        <Field label="Features (comma-separated)"><input value={form.features} onChange={set("features")} placeholder="Fast charging, Built-in cable, 10000mAh" style={INPUT} /></Field>
      </Section>

      {/* Main Image */}
      <Section title="Main Image & Availability">
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "14px", alignItems: "start" }}>
          <Field label="Main Image URL" style={{ marginBottom: 0 }}>
            <input value={form.image} onChange={set("image")} placeholder="https://res.cloudinary.com/..." style={INPUT} />
          </Field>
          {form.image && (
            <div style={{ width: "58px", height: "58px", borderRadius: "8px", overflow: "hidden", border: `1px solid ${C.border}`, marginTop: "22px", flexShrink: 0 }}>
              <img src={form.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
            </div>
          )}
        </div>
        <div style={{ marginTop: "14px" }}>
          <Checkbox label="In Stock / Available" checked={form.availability} onChange={set("availability")} accent={C.green} />
        </div>
      </Section>

      {/* Secondary Images */}
      <Section title="Secondary Images">
        <div style={{ fontSize: "11px", color: C.dim, marginBottom: "10px" }}>Gallery thumbnails shown on the product page.</div>
        <DragTip />
        {secondaryImages.map((url, i) => (
          <SortRow key={i} dragH={secDrag} i={i} total={secondaryImages.length}
            onUp={() => swap(setSecondaryImages, i, -1)} onDown={() => swap(setSecondaryImages, i, 1)} onRemove={() => removeSecImg(i)}
          >
            <input value={url} onChange={e => updateSecImg(i, e.target.value)} placeholder="Image URL" style={{ ...INPUT, marginBottom: 0, flex: 1, fontSize: "12px" }} />
            <Thumb url={url} />
          </SortRow>
        ))}
        <AddBtn onClick={addSecImg} label="Add Image" />
      </Section>

      {/* Color Variants */}
      <Section title="Color Variants">
        <div style={{ fontSize: "11px", color: C.dim, marginBottom: "10px" }}>Each color has a name and its own set of images. Drag cards to reorder.</div>
        {colors.length === 0 && <div style={{ fontSize: "12px", color: "#252525", marginBottom: "10px" }}>No color variants yet.</div>}
        {colors.map((color, ci) => (
          <ColorCard
            key={ci}
            color={color} ci={ci} totalColors={colors.length}
            onNameChange={(val) => updateColorName(ci, val)}
            onMoveUp={() => swap(setColors, ci, -1)}
            onMoveDown={() => swap(setColors, ci, 1)}
            onRemove={() => removeColor(ci)}
            onAddImage={() => addColorImage(ci)}
            onRemoveImage={(ii) => removeColorImage(ci, ii)}
            onUpdateImage={(ii, val) => updateColorImage(ci, ii, val)}
            onMoveImageUp={(ii) => swapColorImage(ci, ii, -1)}
            onMoveImageDown={(ii) => swapColorImage(ci, ii, 1)}
            dragHandlers={colorCardDrag}
            imageDragHandlers={colorImgDrag(ci)}
          />
        ))}
        <AddBtn onClick={addColor} label="Add Color Variant" />
      </Section>

      {/* Videos */}
      <Section title="Videos (optional)">
        {videos.length === 0 && <div style={{ fontSize: "12px", color: "#252525", marginBottom: "10px" }}>No videos added.</div>}
        {videos.length > 1 && <DragTip />}
        {videos.map((url, i) => (
          <SortRow key={i} dragH={videoDrag} i={i} total={videos.length}
            onUp={() => swap(setVideos, i, -1)} onDown={() => swap(setVideos, i, 1)} onRemove={() => removeVideo(i)}
          >
            <input value={url} onChange={e => updateVideo(i, e.target.value)} placeholder="Video URL" style={{ ...INPUT, marginBottom: 0, flex: 1, fontSize: "12px" }} />
          </SortRow>
        ))}
        <AddBtn onClick={addVideo} label="Add Video URL" />
      </Section>

      {/* Box Content */}
      <Section title="Box Contents (optional)">
        <div style={{ fontSize: "11px", color: C.dim, marginBottom: "10px" }}>What's included in the box — each item with quantity.</div>
        {boxContent.length === 0 && <div style={{ fontSize: "12px", color: "#252525", marginBottom: "10px" }}>No box items yet.</div>}
        {boxContent.length > 1 && <DragTip />}
        {boxContent.map((b, i) => (
          <SortRow key={i} dragH={boxDrag} i={i} total={boxContent.length}
            onUp={() => swap(setBoxContent, i, -1)} onDown={() => swap(setBoxContent, i, 1)} onRemove={() => removeBox(i)}
          >
            <input value={b.item} onChange={e => updateBox(i, "item", e.target.value)} placeholder="e.g. USB-C Cable, User Manual" style={{ ...INPUT, marginBottom: 0, flex: 1, fontSize: "12px" }} />
            <input type="number" value={b.quantity} onChange={e => updateBox(i, "quantity", e.target.value)} min="1" placeholder="Qty" style={{ ...INPUT, marginBottom: 0, width: "62px", flex: "none", fontSize: "12px", textAlign: "center" }} />
          </SortRow>
        ))}
        <AddBtn onClick={addBox} label="Add Item" />
      </Section>

      {/* Specials */}
      <Section title="Specials / Badges">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          <Checkbox label="Bestseller"  checked={form.isBestseller} onChange={set("isBestseller")} accent={C.gold} />
          <Checkbox label="Today's Deal" checked={form.isTodaysDeal} onChange={set("isTodaysDeal")} accent="#e8a06a" />
          <Checkbox label="What's New"  checked={form.isWhatsNew}   onChange={set("isWhatsNew")}   accent={C.green} />
          <Checkbox label="Discounted"  checked={form.isDiscounted} onChange={set("isDiscounted")} accent={C.blue} />
        </div>
      </Section>

      {error && (
        <div style={{ padding: "12px 16px", background: C.red + "15", border: `1px solid ${C.red}33`, borderRadius: "6px", color: C.red, fontSize: "13px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      <button onClick={handleSubmit} disabled={saving || success} style={{
        padding: "13px 36px", background: success ? "#1a2e1a" : saving ? "#141414" : C.gold,
        color: success ? C.green : saving ? "#444" : "#0a0a0a",
        border: "none", borderRadius: "7px", fontSize: "11px", letterSpacing: "0.18em",
        textTransform: "uppercase", fontWeight: "700",
        cursor: (saving || success) ? "default" : "pointer", transition: "all 0.2s",
        boxShadow: (!saving && !success) ? `0 0 24px ${C.gold}22` : "none",
      }}>
        {success ? "✓ Saved — Redirecting..." : saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
      </button>
    </div>
  );
}