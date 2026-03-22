// app/admin/products/ProductForm.jsx
"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const TAG_OPTIONS = ["", "hurry", "fast", "new", "discount"];
const TAG_COLORS  = {
  hurry:    { text: "text-[#e86a6a]", border: "border-[#e86a6a77]", bg: "bg-[#e86a6a18]" },
  fast:     { text: "text-[#e8a06a]", border: "border-[#e8a06a77]", bg: "bg-[#e8a06a18]" },
  new:      { text: "text-[#6ae8a0]", border: "border-[#6ae8a077]", bg: "bg-[#6ae8a018]" },
  discount: { text: "text-[#6ab4e8]", border: "border-[#6ab4e877]", bg: "bg-[#6ab4e818]" },
  "":       { text: "text-[#444]",    border: "border-[#2a2a2a]",   bg: "bg-transparent" },
};

const INPUT_CLASS = "w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3.5 py-2.5 text-[#e8e8e8] text-[13px] outline-none font-mono box-border";

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

const Section = ({ title, children }) => (
  <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 mb-3.5">
    <div className="text-[9px] tracking-[0.22em] text-[#444] uppercase mb-5 font-semibold">{title}</div>
    {children}
  </div>
);

const Label = ({ children }) => (
  <div className="text-[9px] tracking-[0.18em] text-[#444] uppercase mb-1.5 font-semibold">{children}</div>
);

const Field = ({ label, children, className = "" }) => (
  <div className={`mb-4 ${className}`}>{label && <Label>{label}</Label>}{children}</div>
);

const Checkbox = ({ label, checked, onChange, accentClass }) => (
  <label className={`flex items-center gap-2.5 cursor-pointer p-2 rounded-md border transition-all mb-1.5
    ${checked ? `${accentClass.border} ${accentClass.bg}` : "border-[#1e1e1e] bg-transparent"}`}>
    <div className={`w-[15px] h-[15px] border-[1.5px] rounded-sm flex items-center justify-center flex-shrink-0 transition-all
      ${checked ? `${accentClass.checkBorder} ${accentClass.checkBg}` : "border-[#333] bg-transparent"}`}>
      {checked && <span className={`text-[9px] font-black ${accentClass.checkText}`}>✓</span>}
    </div>
    <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
    <span className={`text-[12px] tracking-[0.04em] ${checked ? "text-[#e8e8e8]" : "text-[#666]"}`}>{label}</span>
  </label>
);

const AddBtn = ({ onClick, label }) => (
  <button type="button" onClick={onClick}
    className="px-4 py-1.5 bg-transparent border border-dashed border-[#2a2a2a] rounded-md text-[#444] text-[11px] tracking-[0.1em] cursor-pointer transition-all mt-1.5 font-mono hover:border-[#555] hover:text-[#999]">
    + {label}
  </button>
);

const IconBtn = ({ onClick, title, children, danger, disabled }) => (
  <button type="button" onClick={onClick} disabled={disabled} title={title}
    className={`w-[26px] h-[26px] flex items-center justify-center bg-transparent border border-[#1e1e1e] rounded text-[11px] flex-shrink-0 transition-all font-mono
      ${disabled
        ? "text-[#252525] cursor-default"
        : danger
          ? "text-[#444] cursor-pointer hover:border-[#e86a6a55] hover:text-[#e86a6a] hover:bg-[#e86a6a0a]"
          : "text-[#444] cursor-pointer hover:border-[#555] hover:text-[#bbb] hover:bg-[#1a1a1a]"
      }`}
  >{children}</button>
);

const DragDots = () => (
  <div className="flex flex-col gap-[3px] p-1 cursor-grab flex-shrink-0 opacity-[0.22] hover:opacity-80 transition-opacity" title="Drag to reorder">
    {[0,1,2].map(r => (
      <div key={r} className="flex gap-[2.5px]">
        <div className="w-[2.5px] h-[2.5px] rounded-full bg-[#aaa]" />
        <div className="w-[2.5px] h-[2.5px] rounded-full bg-[#aaa]" />
      </div>
    ))}
  </div>
);

const Badge = ({ n }) => (
  <div className="min-w-[20px] h-5 rounded bg-[#161616] border border-[#1e1e1e] flex items-center justify-center text-[9px] text-[#444] font-bold flex-shrink-0 px-1">{n}</div>
);

const Thumb = ({ url }) => (
  <div className="w-[34px] h-[34px] rounded border border-[#1e1e1e] bg-[#0a0a0a] overflow-hidden flex-shrink-0 flex items-center justify-center">
    {url ? <img src={url} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = "none"; }} />
          : <span className="text-[12px] text-[#222]">□</span>}
  </div>
);

const DragTip = () => (
  <div className="text-[10px] text-[#2e2e2e] mb-2.5 flex items-center gap-1.5 tracking-[0.06em]">
    <span>⠿</span> Drag to reorder · ↑↓ for precise moves
  </div>
);

const SortRow = ({ dragH, i, total, onUp, onDown, onRemove, children }) => {
  const [over, setOver] = useState(false);
  const h = dragH(i);
  return (
    <div {...h}
      onDragEnter={() => { h.onDragEnter(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDragEnd={(e) => { h.onDragEnd(e); setOver(false); }}
      className={`flex gap-1.5 items-center mb-1.5 px-1.5 py-1 rounded-lg border transition-all
        ${over ? "border-[#444] bg-[#161616]" : "border-transparent bg-transparent"}`}
    >
      <DragDots />
      <Badge n={i + 1} />
      {children}
      <div className="flex flex-col gap-0.5">
        <IconBtn onClick={onUp}   disabled={i === 0}       title="Move up">↑</IconBtn>
        <IconBtn onClick={onDown} disabled={i === total-1} title="Move down">↓</IconBtn>
      </div>
      <IconBtn onClick={onRemove} danger title="Remove">✕</IconBtn>
    </div>
  );
};

const ColorImageRow = ({ img, ii, total, onUpdate, onMoveUp, onMoveDown, onRemove, dragHandlers }) => {
  const [over, setOver] = useState(false);
  const ih = dragHandlers(ii);
  return (
    <div {...ih}
      onDragEnter={() => { ih.onDragEnter(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDragEnd={(e) => { ih.onDragEnd(e); setOver(false); }}
      className={`flex gap-1.5 items-center mb-1.5 px-1 py-1 rounded-md border transition-all
        ${over ? "border-[#555] bg-[#1a1a1a]" : "border-transparent bg-transparent"}`}
    >
      <DragDots />
      <Badge n={ii + 1} />
      <input value={img} onChange={e => onUpdate(e.target.value)} placeholder="Image URL"
        className={`${INPUT_CLASS} flex-1 text-[12px] mb-0`} />
      <Thumb url={img} />
      <div className="flex flex-col gap-0.5">
        <IconBtn onClick={onMoveUp}   disabled={ii === 0}       title="Move up">↑</IconBtn>
        <IconBtn onClick={onMoveDown} disabled={ii === total-1} title="Move down">↓</IconBtn>
      </div>
      <IconBtn onClick={onRemove} danger title="Remove">✕</IconBtn>
    </div>
  );
};

const ColorCard = ({ color, ci, totalColors, onNameChange, onMoveUp, onMoveDown, onRemove, onAddImage, onRemoveImage, onUpdateImage, onMoveImageUp, onMoveImageDown, dragHandlers, imageDragHandlers }) => {
  const [cardOver, setCardOver] = useState(false);
  const ch = dragHandlers(ci);
  return (
    <div {...ch}
      onDragEnter={() => { ch.onDragEnter(); setCardOver(true); }}
      onDragLeave={() => setCardOver(false)}
      onDragEnd={(e) => { ch.onDragEnd(e); setCardOver(false); }}
      className={`border rounded-lg p-4 mb-2.5 transition-all ${cardOver ? "bg-[#141414] border-[#444]" : "bg-[#0c0c0c] border-[#1e1e1e]"}`}
    >
      <div className="flex justify-between items-center mb-3.5">
        <div className="flex items-center gap-2">
          <DragDots />
          <span className="text-[9px] tracking-[0.18em] text-[#444] uppercase font-semibold">
            Variant {ci + 1}{color.name ? ` — ${color.name}` : ""}
          </span>
        </div>
        <div className="flex gap-1">
          <IconBtn onClick={onMoveUp}   disabled={ci === 0}            title="Move up">↑</IconBtn>
          <IconBtn onClick={onMoveDown} disabled={ci === totalColors-1} title="Move down">↓</IconBtn>
          <IconBtn onClick={onRemove} danger title="Remove">✕</IconBtn>
        </div>
      </div>
      <div className="flex gap-2.5 items-center mb-3.5">
        <div className="flex-1">
          <Label>Color Name</Label>
          <input value={color.name} onChange={e => onNameChange(e.target.value)} placeholder="e.g. black, midnight blue"
            className={INPUT_CLASS} />
        </div>
        <div className="mt-5 flex-shrink-0">
          <div className="w-10 h-10 rounded-full border-2 border-[#2a2a2a] transition-all duration-300"
            style={{ background: color.name || "#1e1e1e", boxShadow: color.name ? `0 0 14px ${color.name}55` : "none" }} />
        </div>
      </div>
      <div className="text-[9px] tracking-[0.18em] text-[#333] uppercase mb-2 font-semibold">Images</div>
      {color.images.map((img, ii) => (
        <ColorImageRow key={ii} img={img} ii={ii} total={color.images.length}
          onUpdate={val => onUpdateImage(ii, val)}
          onMoveUp={() => onMoveImageUp(ii)} onMoveDown={() => onMoveImageDown(ii)}
          onRemove={() => onRemoveImage(ii)} dragHandlers={imageDragHandlers} />
      ))}
      <AddBtn onClick={onAddImage} label="Add Image" />
    </div>
  );
};

export default function ProductForm({ initial = {}, isEdit = false }) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: initial.name || "", price: initial.price || "", originalPrice: initial.originalPrice || "",
    category: initial.category || "", tag: initial.tag || "", description: initial.description || "",
    image: initial.image || "", availability: initial.availability ?? true,
    features: (initial.features || []).join(", "),
    isBestseller: initial.isBestseller || false, isTodaysDeal: initial.isTodaysDeal || false,
    isWhatsNew: initial.isWhatsNew || false, isDiscounted: initial.isDiscounted || false,
  });

  const [secondaryImages, setSecondaryImages] = useState(initial.secondaryImages?.length ? initial.secondaryImages : [""]);
  const [colors,     setColors]     = useState(initial.colors?.length ? initial.colors.map(c => ({ name: c.name || "", images: c.images?.length ? c.images : [""] })) : []);
  const [videos,     setVideos]     = useState(initial.videos?.length ? initial.videos : []);
  const [boxContent, setBoxContent] = useState(initial.boxContent?.length ? initial.boxContent.map(b => ({ item: b.item || "", quantity: b.quantity || 1 })) : []);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);

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
      };
      const url = isEdit ? `/api/products/${initial._id}` : "/api/admin/products";
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Failed"); }
      setSuccess(true);
      setTimeout(() => router.push("/admin/products"), 900);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const CHECKBOX_ACCENTS = {
    gold:  { border: "border-[#e8c46a44]", bg: "bg-[#e8c46a0a]", checkBorder: "border-[#e8c46a]", checkBg: "bg-[#e8c46a22]", checkText: "text-[#e8c46a]" },
    amber: { border: "border-[#e8a06a44]", bg: "bg-[#e8a06a0a]", checkBorder: "border-[#e8a06a]", checkBg: "bg-[#e8a06a22]", checkText: "text-[#e8a06a]" },
    green: { border: "border-[#6ae8a044]", bg: "bg-[#6ae8a00a]", checkBorder: "border-[#6ae8a0]", checkBg: "bg-[#6ae8a022]", checkText: "text-[#6ae8a0]" },
    blue:  { border: "border-[#6ab4e844]", bg: "bg-[#6ab4e80a]", checkBorder: "border-[#6ab4e8]", checkBg: "bg-[#6ab4e822]", checkText: "text-[#6ab4e8]" },
  };

  return (
    <div className="max-w-[780px]">

      {/* Core Details */}
      <Section title="Core Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Field label="Product Name"><input value={form.name} onChange={set("name")} placeholder="e.g. MagFlex Powerbank" className={INPUT_CLASS} /></Field>
          <Field label="Category"><input value={form.category} onChange={set("category")} placeholder="e.g. Power Bank" className={INPUT_CLASS} /></Field>
          <Field label="Price (₦)"><input type="number" value={form.price} onChange={set("price")} placeholder="19000" min="0" className={INPUT_CLASS} /></Field>
          <Field label="Original Price (₦)"><input type="number" value={form.originalPrice} onChange={set("originalPrice")} placeholder="23000 — leave blank if no discount" min="0" className={INPUT_CLASS} /></Field>
        </div>
        <Field label="Tag">
          <div className="flex gap-1.5 flex-wrap">
            {TAG_OPTIONS.map(t => {
              const active = form.tag === t;
              const c = TAG_COLORS[t];
              return (
                <button key={t} type="button" onClick={() => setForm(p => ({ ...p, tag: t }))}
                  className={`px-3.5 py-1.5 rounded-full cursor-pointer text-[11px] tracking-[0.1em] uppercase border transition-all font-mono
                    ${active ? `${c.text} ${c.border} ${c.bg} font-bold` : "text-[#444] border-[#1e1e1e] bg-transparent hover:text-[#666] hover:border-[#333]"}`}>
                  {t === "" ? "None" : t}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Description">
          <textarea value={form.description} onChange={set("description")} placeholder="Product description..." rows={5}
            className={`${INPUT_CLASS} resize-y leading-relaxed`} />
        </Field>
        <Field label="Features (comma-separated)">
          <input value={form.features} onChange={set("features")} placeholder="Fast charging, Built-in cable, 10000mAh" className={INPUT_CLASS} />
        </Field>
      </Section>

      {/* Main Image */}
      <Section title="Main Image & Availability">
        <div className="grid grid-cols-[1fr_auto] gap-3.5 items-start">
          <Field label="Main Image URL" className="mb-0">
            <input value={form.image} onChange={set("image")} placeholder="https://res.cloudinary.com/..." className={INPUT_CLASS} />
          </Field>
          {form.image && (
            <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#1e1e1e] mt-[22px] flex-shrink-0">
              <img src={form.image} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = "none"} />
            </div>
          )}
        </div>
        <div className="mt-3.5">
          <Checkbox label="In Stock / Available" checked={form.availability} onChange={set("availability")} accentClass={CHECKBOX_ACCENTS.green} />
        </div>
      </Section>

      {/* Secondary Images */}
      <Section title="Secondary Images">
        <div className="text-[11px] text-[#444] mb-2.5">Gallery thumbnails shown on the product page.</div>
        <DragTip />
        {secondaryImages.map((url, i) => (
          <SortRow key={i} dragH={secDrag} i={i} total={secondaryImages.length}
            onUp={() => swap(setSecondaryImages, i, -1)} onDown={() => swap(setSecondaryImages, i, 1)} onRemove={() => removeSecImg(i)}>
            <input value={url} onChange={e => updateSecImg(i, e.target.value)} placeholder="Image URL"
              className={`${INPUT_CLASS} flex-1 text-[12px]`} />
            <Thumb url={url} />
          </SortRow>
        ))}
        <AddBtn onClick={addSecImg} label="Add Image" />
      </Section>

      {/* Color Variants */}
      <Section title="Color Variants">
        <div className="text-[11px] text-[#444] mb-2.5">Each color has a name and its own set of images. Drag cards to reorder.</div>
        {colors.length === 0 && <div className="text-[12px] text-[#252525] mb-2.5">No color variants yet.</div>}
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
        <AddBtn onClick={addColor} label="Add Color Variant" />
      </Section>

      {/* Videos */}
      <Section title="Videos (optional)">
        {videos.length === 0 && <div className="text-[12px] text-[#252525] mb-2.5">No videos added.</div>}
        {videos.length > 1 && <DragTip />}
        {videos.map((url, i) => (
          <SortRow key={i} dragH={videoDrag} i={i} total={videos.length}
            onUp={() => swap(setVideos, i, -1)} onDown={() => swap(setVideos, i, 1)} onRemove={() => removeVideo(i)}>
            <input value={url} onChange={e => updateVideo(i, e.target.value)} placeholder="Video URL"
              className={`${INPUT_CLASS} flex-1 text-[12px]`} />
          </SortRow>
        ))}
        <AddBtn onClick={addVideo} label="Add Video URL" />
      </Section>

      {/* Box Content */}
      <Section title="Box Contents (optional)">
        <div className="text-[11px] text-[#444] mb-2.5">What's included in the box — each item with quantity.</div>
        {boxContent.length === 0 && <div className="text-[12px] text-[#252525] mb-2.5">No box items yet.</div>}
        {boxContent.length > 1 && <DragTip />}
        {boxContent.map((b, i) => (
          <SortRow key={i} dragH={boxDrag} i={i} total={boxContent.length}
            onUp={() => swap(setBoxContent, i, -1)} onDown={() => swap(setBoxContent, i, 1)} onRemove={() => removeBox(i)}>
            <input value={b.item} onChange={e => updateBox(i, "item", e.target.value)} placeholder="e.g. USB-C Cable, User Manual"
              className={`${INPUT_CLASS} flex-1 text-[12px]`} />
            <input type="number" value={b.quantity} onChange={e => updateBox(i, "quantity", e.target.value)} min="1" placeholder="Qty"
              className={`${INPUT_CLASS} w-14 sm:w-16 text-[12px] text-center`} style={{ flex: "none" }} />
          </SortRow>
        ))}
        <AddBtn onClick={addBox} label="Add Item" />
      </Section>

      {/* Specials */}
      <Section title="Specials / Badges">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          <Checkbox label="Bestseller"   checked={form.isBestseller} onChange={set("isBestseller")} accentClass={CHECKBOX_ACCENTS.gold} />
          <Checkbox label="Today's Deal" checked={form.isTodaysDeal} onChange={set("isTodaysDeal")} accentClass={CHECKBOX_ACCENTS.amber} />
          <Checkbox label="What's New"   checked={form.isWhatsNew}   onChange={set("isWhatsNew")}   accentClass={CHECKBOX_ACCENTS.green} />
          <Checkbox label="Discounted"   checked={form.isDiscounted} onChange={set("isDiscounted")} accentClass={CHECKBOX_ACCENTS.blue} />
        </div>
      </Section>

      {error && (
        <div className="px-4 py-3 bg-[#e86a6a15] border border-[#e86a6a33] rounded-md text-[#e86a6a] text-[13px] mb-4">{error}</div>
      )}

      <button onClick={handleSubmit} disabled={saving || success}
        className={`w-full py-3.5 border-none rounded-lg text-[11px] tracking-[0.18em] uppercase font-bold cursor-pointer transition-all font-mono
          ${success  ? "bg-[#1a2e1a] text-[#6ae8a0] cursor-default"
          : saving   ? "bg-[#141414] text-[#444] cursor-default"
          : "bg-[#e8c46a] text-[#0a0a0a] hover:bg-[#d4b05e]"}`}
        style={{ boxShadow: (!saving && !success) ? "0 0 24px #e8c46a22" : "none" }}>
        {success ? "✓ Saved — Redirecting..." : saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
      </button>
    </div>
  );
}