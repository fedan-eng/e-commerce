// app/admin_console/products/page.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  "__all__",
  "Power Bank","Wearables","Chargers","Lifestyle","Extensions",
  "isBestseller","isWhatsNew","isTodaysDeal",
];
const CATEGORY_LABELS = { isBestseller: "Best Seller", isWhatsNew: "What's New", isTodaysDeal: "Today's Deal" };

export default function AdminProductsPage() {
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [page, setPage]                   = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [total, setTotal]                 = useState(0);
  const [deleting, setDeleting]           = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [sortMode, setSortMode]           = useState(false);
  const [sortCategory, setSortCategory]   = useState("");
  const [sortableProducts, setSortableProducts] = useState([]);
  const [savingOrder, setSavingOrder]     = useState(false);
  const [dragOverId, setDragOverId]       = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (search) params.append("search", search);
    params.append("sort", "sortOrder.__all__");
    const res  = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.products || []);
    setTotalPages(data.pagination?.totalPages || 1);
    setTotal(data.pagination?.total || 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { const t = setTimeout(fetchProducts, search ? 400 : 0); return () => clearTimeout(t); }, [fetchProducts]);

  const deleteProduct = async (id) => {
    setDeleting(id);
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) { setProducts(prev => prev.filter(p => p._id !== id)); setTotal(t => t - 1); }
    setDeleting(null); setConfirmDelete(null);
  };

  const openSortMode = () => { setSortMode(true); setSortCategory(""); setSortableProducts([]); };

  const handleCategorySelect = async (cat) => {
    setSortCategory(cat); setSortableProducts([]);
    const isSpecial = cat.startsWith("is");
    const isAll = cat === "__all__";
    const url = isAll
      ? `/api/products?limit=500`
      : isSpecial
      ? `/api/products?specials=${cat}&limit=500`
      : `/api/products?categories=${encodeURIComponent(cat)}&limit=500`;
    const res  = await fetch(url);
    const data = await res.json();
    setSortableProducts((data.products || []).sort((a, b) => (a.sortOrder?.[cat] ?? 9999) - (b.sortOrder?.[cat] ?? 9999)));
  };

  const handleDragStart = (e, id) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("draggedId", id); };
  const handleDragOver  = (e, id) => { e.preventDefault(); setDragOverId(id); };
  const handleDrop = (e, targetId) => {
    e.preventDefault();
    const from = e.dataTransfer.getData("draggedId");
    if (from === targetId) return;
    setSortableProducts(prev => {
      const arr = [...prev];
      const fi = arr.findIndex(p => p._id === from);
      const ti = arr.findIndex(p => p._id === targetId);
      const [m] = arr.splice(fi, 1); arr.splice(ti, 0, m); return arr;
    });
    setDragOverId(null);
  };

  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      const res = await fetch("/api/products/sort-order", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: sortCategory, orderedIds: sortableProducts.map(p => p._id) }),
      });
      if (res.ok) { alert("Order saved!"); setSortMode(false); fetchProducts(); }
      else alert("Failed to save order.");
    } catch { alert("Something went wrong."); }
    finally { setSavingOrder(false); }
  };

  const Pagination = ({ pad }) => totalPages > 1 ? (
    <div className={`flex justify-between items-center ${pad ? "px-4 py-3 border-t border-line" : "mt-4"}`}>
      <span className="text-[11px] text-faint">Page {page} / {totalPages}</span>
      <div className="flex gap-2">
        <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
          className={`px-3.5 py-1.5 bg-white border border-line rounded-full text-[12px] font-medium ${page === 1 ? "text-ghost cursor-default" : "text-pine cursor-pointer hover:border-pine hover:bg-mint"}`}>
          ← Prev
        </button>
        <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
          className={`px-3.5 py-1.5 bg-white border border-line rounded-full text-[12px] font-medium ${page === totalPages ? "text-ghost cursor-default" : "text-pine cursor-pointer hover:border-pine hover:bg-mint"}`}>
          Next →
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className="w-full max-w-full">
      {/* Header — stacks on mobile */}
      <div className="mb-6">
        <div className="inline-flex items-center text-[11px] font-semibold text-pine bg-zest px-2.5 py-0.5 rounded-full mb-2">Management</div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="m-0 text-[28px] font-poppins font-bold text-pine leading-tight">
            Products <span className="text-faint text-base font-roboto font-medium">({total})</span>
          </h1>
          {/* Buttons — full width row on mobile */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={openSortMode}
              className="flex-1 sm:flex-none h-10 px-4 bg-zest text-pine rounded-full text-[13px] font-semibold cursor-pointer hover:bg-pine hover:text-zest transition-colors">
              ⠿ Sort
            </button>
            <Link href="/admin_console/products/new"
              className="flex-1 sm:flex-none flex items-center justify-center h-10 px-4 bg-pine text-white no-underline rounded-full text-[13px] font-semibold hover:bg-pine-deep transition-colors">
              + Add Product
            </Link>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input type="text" placeholder="Search products…" value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full sm:w-80 h-11 bg-white border border-line-strong rounded-full px-5 text-ink text-[13px] outline-none focus:border-pine transition-colors"
        />
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center gap-3 text-faint text-[13px] bg-white border border-line rounded-3xl"><div className="w-7 h-7 rounded-full border-[3px] border-mint border-t-pine animate-spin" />Loading products…</div>
      ) : products.length === 0 ? (
        <div className="py-12 text-faint text-[13px] text-center bg-white border border-line rounded-3xl"><div className="text-3xl mb-2" aria-hidden>📦</div>No products found.</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white border border-line rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[560px]">
                <thead>
                  <tr className="bg-sage">
                    {["Product","Category","Price","Stock","Rating","Actions"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id} className="border-b border-line hover:bg-[#fafcf9] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {p.image && <Image src={p.image} alt="" width={36} height={36} className="w-10 h-10 rounded-xl object-cover bg-mint shrink-0" />}
                          <div>
                            <div className="text-[13px] font-medium text-ink whitespace-nowrap">{p.name}</div>
                            <div className="text-[11px] text-faint">{String(p._id).slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">{p.category ? <span className="text-[11px] font-semibold text-pine bg-mint px-2.5 py-1 rounded-full capitalize">{p.category}</span> : <span className="text-ghost">—</span>}</td>
                      <td className="px-5 py-3.5 text-[13px] font-semibold text-ink whitespace-nowrap">₦{p.price?.toFixed(2)}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${p.availability ? "text-[#15803d] bg-[#e3f6e9] border-[#bfe5cc]" : "text-[#c53030] bg-[#fdecec] border-[#f3c4c4]"}`}>
                          {p.availability ? "In Stock" : "Out"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-ink font-medium whitespace-nowrap">{p.averageRating > 0 ? <><span className="text-star">★</span> {p.averageRating.toFixed(1)}</> : <span className="text-ghost">—</span>}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Link href={`/admin_console/products/${p._id}`} className="text-[12px] font-semibold text-pine no-underline px-3.5 py-1.5 bg-mint rounded-full hover:bg-zest transition-colors">Edit</Link>
                          {confirmDelete === p._id ? (
                            <div className="flex gap-1">
                              <button onClick={() => deleteProduct(p._id)} disabled={deleting === p._id}
                                className="text-[12px] font-semibold text-white bg-[#c53030] rounded-full px-3 py-1.5 cursor-pointer hover:bg-[#a52828]">
                                {deleting === p._id ? "…" : "Confirm"}
                              </button>
                              <button onClick={() => setConfirmDelete(null)}
                                className="text-[12px] font-medium text-muted bg-white border border-line rounded-full px-3 py-1.5 cursor-pointer hover:border-line-strong">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDelete(p._id)}
                              className="text-[12px] font-medium text-[#c53030] bg-white border border-line rounded-full px-3.5 py-1.5 cursor-pointer hover:bg-[#fdecec] hover:border-[#f3c4c4] transition-colors">
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pad />
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-2 w-full">
            {products.map(p => (
              <div key={p._id} className="bg-white border border-line rounded-3xl p-3.5 flex items-center gap-3 hover:border-line transition-colors w-full">
                {p.image && <Image src={p.image} alt="" width={48} height={48} className="w-12 h-12 rounded-xl object-cover bg-sage shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-ink truncate font-medium">{p.name}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[11px] text-muted capitalize">{p.category || "—"}</span>
                    <span className="text-[12px] text-ink font-semibold">₦{p.price?.toFixed(2)}</span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${p.availability ? "text-[#15803d] bg-[#e3f6e9] border-[#bfe5cc]" : "text-[#c53030] bg-[#fdecec] border-[#f3c4c4]"}`}>
                      {p.availability ? "In Stock" : "Out"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Link href={`/admin_console/products/${p._id}`}
                    className="text-[12px] font-semibold text-pine no-underline px-3 py-1.5 bg-mint rounded-full hover:bg-zest transition-colors">
                    Edit
                  </Link>
                  {confirmDelete === p._id ? (
                    <div className="flex gap-1">
                      <button onClick={() => deleteProduct(p._id)} disabled={deleting === p._id}
                        className="text-[12px] font-semibold text-white bg-[#c53030] rounded-full px-2.5 py-1.5 cursor-pointer">
                        {deleting === p._id ? "…" : "✓"}
                      </button>
                      <button onClick={() => setConfirmDelete(null)}
                        className="text-[12px] text-muted bg-white border border-line rounded-full px-2.5 py-1.5 cursor-pointer">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(p._id)}
                      className="text-[12px] text-[#c53030] bg-white border border-line rounded-full px-3 py-1.5 cursor-pointer hover:bg-[#fdecec] transition-colors">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
            <Pagination pad={false} />
          </div>
        </>
      )}

      {/* Sort Mode Panel */}
      {sortMode && (
        <div className="mt-6 bg-white border border-line rounded-3xl p-5">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="m-0 text-[16px] font-poppins font-semibold text-pine">Manage display order ✨</h2>
            <button onClick={() => setSortMode(false)}
              className="bg-white border border-line text-muted rounded-full px-3.5 py-1.5 cursor-pointer text-[12px] font-medium hover:border-pine hover:text-pine transition-colors">
              Close
            </button>
          </div>
          <div className="mb-3">
            <button
              onClick={() => handleCategorySelect("__all__")}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium cursor-pointer border transition-all
                ${sortCategory === "__all__"
                  ? "border-pine bg-pine text-zest"
                  : "border-line bg-white text-muted hover:border-pine hover:text-pine"}`}>
              All Products
            </button>
          </div>
          <div className="mb-4">
            <p className="text-[12px] font-medium text-faint mb-1.5">Categories</p>
            <div className="w-full overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <div className="flex gap-2 pb-2 w-max">
                {CATEGORIES.filter(c => !c.startsWith("is")).map(cat => (
                  <button key={cat} onClick={() => handleCategorySelect(cat)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium cursor-pointer border transition-all
                      ${sortCategory === cat ? "border-pine bg-pine text-zest" : "border-line bg-white text-muted hover:border-pine hover:text-pine"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[12px] font-medium text-faint mb-1.5 mt-3">Specials</p>
            <div className="w-full overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <div className="flex gap-2 pb-1 w-max">
                {CATEGORIES.filter(c => c.startsWith("is")).map(cat => (
                  <button key={cat} onClick={() => handleCategorySelect(cat)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium cursor-pointer border transition-all
                      ${sortCategory === cat ? "border-pine bg-pine text-zest" : "border-line bg-white text-muted hover:border-pine hover:text-pine"}`}>
                    {CATEGORY_LABELS[cat] || cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {sortCategory && sortableProducts.length === 0 && <p className="text-faint text-[12px]">No products here.</p>}

          {sortableProducts.length > 0 && (
            <>
              <p className="text-[12px] font-medium text-faint mb-2">Drag to reorder</p>
              <div className="flex flex-col gap-1.5">
                {sortableProducts.map((p, idx) => (
                  <div key={p._id} draggable
                    onDragStart={e => handleDragStart(e, p._id)}
                    onDragOver={e => handleDragOver(e, p._id)}
                    onDrop={e => handleDrop(e, p._id)}
                    onDragLeave={() => setDragOverId(null)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-grab transition-all
                      ${dragOverId === p._id ? "bg-zest/40 border border-pine/40 scale-[1.01]" : "bg-canvas border border-line hover:bg-sage"}`}>
                    <span className="text-ghost text-sm select-none shrink-0">⠿</span>
                    <span className="text-[10px] text-faint w-5 shrink-0">{idx + 1}</span>
                    {p.image && <Image src={p.image} alt="" width={28} height={28} className="w-7 h-7 object-cover rounded-lg bg-sage shrink-0" />}
                    <span className="text-[12px] text-ink flex-1 min-w-0 truncate">{p.name}</span>
                    <span className="text-[11px] text-faint shrink-0">₦{p.price?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={handleSaveOrder} disabled={savingOrder}
                  className={`px-5 py-2.5 border-none rounded-full text-[13px] font-semibold transition-all
                    ${savingOrder ? "bg-line text-faint cursor-default" : "bg-pine text-white cursor-pointer hover:bg-pine-deep"}`}>
                  {savingOrder ? "Saving..." : "Save Order"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}