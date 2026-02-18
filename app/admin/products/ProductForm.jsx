// app/admin/products/ProductForm.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const INPUT = {
  width: "100%",
  background: "#0a0a0a",
  border: "1px solid #2a2a2a",
  borderRadius: "6px",
  padding: "10px 14px",
  color: "#e8e8e8",
  fontSize: "13px",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const LABEL = {
  display: "block",
  fontSize: "10px",
  letterSpacing: "0.15em",
  color: "#555",
  textTransform: "uppercase",
  marginBottom: "6px",
};

const Section = ({ title, children }) => (
  <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "24px", marginBottom: "16px" }}>
    <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#444", textTransform: "uppercase", marginBottom: "20px" }}>{title}</div>
    {children}
  </div>
);

const Field = ({ label, children, half }) => (
  <div style={{ marginBottom: "18px", gridColumn: half ? "span 1" : undefined }}>
    <label style={LABEL}>{label}</label>
    {children}
  </div>
);

const Checkbox = ({ label, checked, onChange, accent = "#e8c46a" }) => (
  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "10px" }}>
    <div style={{
      width: "16px", height: "16px", border: `1px solid ${checked ? accent : "#333"}`,
      borderRadius: "3px", background: checked ? `${accent}18` : "transparent",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s",
    }}>
      {checked && <span style={{ fontSize: "10px", color: accent }}>✓</span>}
    </div>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ display: "none" }} />
    <span style={{ fontSize: "12px", color: "#888", letterSpacing: "0.06em" }}>{label}</span>
  </label>
);

const AddButton = ({ onClick, label }) => (
  <button type="button" onClick={onClick} style={{
    padding: "7px 14px", background: "transparent", border: "1px dashed #333",
    borderRadius: "5px", color: "#555", fontSize: "11px", letterSpacing: "0.1em",
    cursor: "pointer", transition: "all 0.15s", marginTop: "8px",
  }}
    onMouseEnter={e => { e.target.style.borderColor = "#555"; e.target.style.color = "#888"; }}
    onMouseLeave={e => { e.target.style.borderColor = "#333"; e.target.style.color = "#555"; }}
  >
    + {label}
  </button>
);

const RemoveBtn = ({ onClick }) => (
  <button type="button" onClick={onClick} style={{
    padding: "4px 10px", background: "transparent", border: "1px solid #2a2a2a",
    borderRadius: "4px", color: "#555", fontSize: "11px", cursor: "pointer",
    flexShrink: 0, transition: "all 0.15s",
  }}
    onMouseEnter={e => { e.target.style.borderColor = "#e86a6a44"; e.target.style.color = "#e86a6a"; }}
    onMouseLeave={e => { e.target.style.borderColor = "#2a2a2a"; e.target.style.color = "#555"; }}
  >
    ✕
  </button>
);

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
    // Specials — match your actual DB field names
    isBestseller: initial.isBestseller || false,
    isTodaysDeal: initial.isTodaysDeal || false,
    isWhatsNew: initial.isWhatsNew || false,
    isDiscounted: initial.isDiscounted || false,
  });

  // Secondary images array
  const [secondaryImages, setSecondaryImages] = useState(
    initial.secondaryImages?.length > 0 ? initial.secondaryImages : [""]
  );

  // Colors array: [{ name, images: [url, url] }]
  const [colors, setColors] = useState(
    initial.colors?.length > 0
      ? initial.colors.map(c => ({ name: c.name || "", images: c.images?.length > 0 ? c.images : [""] }))
      : []
  );

  // Videos array
  const [videos, setVideos] = useState(
    initial.videos?.length > 0 ? initial.videos : []
  );

  // Box content array
  const [boxContent, setBoxContent] = useState(
    initial.boxContent?.length > 0 ? initial.boxContent : []
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const set = (field) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
  };

  // Secondary images helpers
  const updateSecImg = (i, val) => setSecondaryImages(prev => prev.map((v, idx) => idx === i ? val : v));
  const addSecImg = () => setSecondaryImages(prev => [...prev, ""]);
  const removeSecImg = (i) => setSecondaryImages(prev => prev.filter((_, idx) => idx !== i));

  // Colors helpers
  const addColor = () => setColors(prev => [...prev, { name: "", images: [""] }]);
  const removeColor = (i) => setColors(prev => prev.filter((_, idx) => idx !== i));
  const updateColorName = (i, val) => setColors(prev => prev.map((c, idx) => idx === i ? { ...c, name: val } : c));
  const updateColorImage = (ci, ii, val) => setColors(prev => prev.map((c, idx) => idx === ci ? { ...c, images: c.images.map((img, iidx) => iidx === ii ? val : img) } : c));
  const addColorImage = (ci) => setColors(prev => prev.map((c, idx) => idx === ci ? { ...c, images: [...c.images, ""] } : c));
  const removeColorImage = (ci, ii) => setColors(prev => prev.map((c, idx) => idx === ci ? { ...c, images: c.images.filter((_, iidx) => iidx !== ii) } : c));

  // Videos helpers
  const addVideo = () => setVideos(prev => [...prev, ""]);
  const updateVideo = (i, val) => setVideos(prev => prev.map((v, idx) => idx === i ? val : v));
  const removeVideo = (i) => setVideos(prev => prev.filter((_, idx) => idx !== i));

  // Box content helpers
  const addBoxItem = () => setBoxContent(prev => [...prev, ""]);
  const updateBoxItem = (i, val) => setBoxContent(prev => prev.map((v, idx) => idx === i ? val : v));
  const removeBoxItem = (i) => setBoxContent(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = {
        ...form,
        price: parseFloat(form.price) || 0,
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        features: form.features.split(",").map(f => f.trim()).filter(Boolean),
        secondaryImages: secondaryImages.filter(Boolean),
        colors: colors.map(c => ({ name: c.name, images: c.images.filter(Boolean) })).filter(c => c.name),
        videos: videos.filter(Boolean),
        boxContent: boxContent.filter(Boolean),
      };

      const url = isEdit ? `/api/products/${initial._id}` : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save");
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin/products"), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "760px" }}>

      {/* Core Details */}
      <Section title="Core Details">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Field label="Product Name">
            <input value={form.name} onChange={set("name")} placeholder="e.g. MagFlex Powerbank" style={INPUT} />
          </Field>
          <Field label="Category">
            <input value={form.category} onChange={set("category")} placeholder="e.g. Power Bank" style={INPUT} />
          </Field>
          <Field label="Price (₦)">
            <input type="number" value={form.price} onChange={set("price")} placeholder="19000" min="0" style={INPUT} />
          </Field>
          <Field label="Original Price (₦) — for discounts">
            <input type="number" value={form.originalPrice} onChange={set("originalPrice")} placeholder="23000" min="0" style={INPUT} />
          </Field>
        </div>
        <Field label="Tag (e.g. discount, new, hot)">
          <input value={form.tag} onChange={set("tag")} placeholder="discount" style={INPUT} />
        </Field>
        <Field label="Description">
          <textarea value={form.description} onChange={set("description")} placeholder="Product description..." rows={5}
            style={{ ...INPUT, resize: "vertical", lineHeight: "1.7" }} />
        </Field>
        <Field label="Features (comma-separated)">
          <input value={form.features} onChange={set("features")} placeholder="e.g. Fast charging, Built-in cable" style={INPUT} />
        </Field>
      </Section>

      {/* Main Image + Availability */}
      <Section title="Main Image & Availability">
        <Field label="Main Image URL">
          <input value={form.image} onChange={set("image")} placeholder="https://..." style={INPUT} />
        </Field>
        {form.image && (
          <div style={{ marginBottom: "18px" }}>
            <img src={form.image} alt="preview" style={{ height: "80px", borderRadius: "6px", objectFit: "cover", border: "1px solid #222" }} />
          </div>
        )}
        <Checkbox label="In Stock / Available" checked={form.availability} onChange={set("availability")} accent="#6ae8a0" />
      </Section>

      {/* Secondary Images */}
      <Section title="Secondary Images">
        <div style={{ fontSize: "11px", color: "#444", marginBottom: "14px" }}>These appear as thumbnails in the product gallery.</div>
        {secondaryImages.map((url, i) => (
          <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "center" }}>
            <input value={url} onChange={e => updateSecImg(i, e.target.value)} placeholder={`Image ${i + 1} URL`} style={{ ...INPUT, marginBottom: 0 }} />
            {url && <img src={url} alt="" style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "4px", border: "1px solid #222", flexShrink: 0 }} />}
            <RemoveBtn onClick={() => removeSecImg(i)} />
          </div>
        ))}
        <AddButton onClick={addSecImg} label="Add Secondary Image" />
      </Section>

      {/* Colors */}
      <Section title="Color Variants">
        <div style={{ fontSize: "11px", color: "#444", marginBottom: "14px" }}>Each color variant has a name and its own image(s).</div>
        {colors.map((color, ci) => (
          <div key={ci} style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: "6px", padding: "16px", marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.12em", color: "#444", textTransform: "uppercase" }}>Color {ci + 1}</div>
              <RemoveBtn onClick={() => removeColor(ci)} />
            </div>
            <Field label="Color Name">
              <input value={color.name} onChange={e => updateColorName(ci, e.target.value)} placeholder="e.g. black, purple, white" style={INPUT} />
            </Field>
            <div style={{ fontSize: "10px", letterSpacing: "0.12em", color: "#444", textTransform: "uppercase", marginBottom: "8px" }}>Images for this color</div>
            {color.images.map((img, ii) => (
              <div key={ii} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                <input value={img} onChange={e => updateColorImage(ci, ii, e.target.value)} placeholder={`Image ${ii + 1} URL`} style={{ ...INPUT, marginBottom: 0 }} />
                {img && <img src={img} alt="" style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "4px", border: "1px solid #222", flexShrink: 0 }} />}
                {color.images.length > 1 && <RemoveBtn onClick={() => removeColorImage(ci, ii)} />}
              </div>
            ))}
            <AddButton onClick={() => addColorImage(ci)} label="Add Image" />
          </div>
        ))}
        <AddButton onClick={addColor} label="Add Color Variant" />
      </Section>

      {/* Videos */}
      <Section title="Videos (optional)">
        {videos.map((url, i) => (
          <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "center" }}>
            <input value={url} onChange={e => updateVideo(i, e.target.value)} placeholder="Video URL" style={{ ...INPUT, marginBottom: 0 }} />
            <RemoveBtn onClick={() => removeVideo(i)} />
          </div>
        ))}
        <AddButton onClick={addVideo} label="Add Video URL" />
      </Section>

      {/* Box Content */}
      <Section title="Box Contents (optional)">
        <div style={{ fontSize: "11px", color: "#444", marginBottom: "14px" }}>List what's included in the box.</div>
        {boxContent.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "center" }}>
            <input value={item} onChange={e => updateBoxItem(i, e.target.value)} placeholder="e.g. USB-C Cable, User Manual" style={{ ...INPUT, marginBottom: 0 }} />
            <RemoveBtn onClick={() => removeBoxItem(i)} />
          </div>
        ))}
        <AddButton onClick={addBoxItem} label="Add Box Item" />
      </Section>

      {/* Specials / Badges */}
      <Section title="Specials / Badges">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
          <Checkbox label="Bestseller" checked={form.isBestseller} onChange={set("isBestseller")} />
          <Checkbox label="Today's Deal" checked={form.isTodaysDeal} onChange={set("isTodaysDeal")} />
          <Checkbox label="What's New" checked={form.isWhatsNew} onChange={set("isWhatsNew")} />
          <Checkbox label="Discounted" checked={form.isDiscounted} onChange={set("isDiscounted")} />
        </div>
      </Section>

      {error && (
        <div style={{ padding: "12px 16px", background: "#e86a6a18", border: "1px solid #e86a6a33", borderRadius: "6px", color: "#e86a6a", fontSize: "13px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={saving || success}
        style={{
          padding: "12px 32px",
          background: success ? "#1a2e1a" : saving ? "#1a1a1a" : "#e8c46a",
          color: success ? "#6ae8a0" : saving ? "#555" : "#0a0a0a",
          border: "none",
          borderRadius: "6px",
          fontSize: "11px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          fontWeight: "700",
          cursor: (saving || success) ? "default" : "pointer",
          transition: "all 0.2s",
        }}
      >
        {success ? "✓ Saved — Redirecting..." : saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
      </button>
    </div>
  );
}