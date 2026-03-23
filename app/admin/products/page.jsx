// app/admin/products/page.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const CATEGORIES = [
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
    const url = isSpecial ? `/api/products?specials=${cat}&limit=500` : `/api/products?categories=${encodeURIComponent(cat)}&limit=500`;
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
    <div className={`flex justify-between items-center ${pad ? "px-4 py-3 border-t border-[#1a1a1a]" : "mt-4"}`}>
      <span className="text-[11px] text-[#444]">Page {page} / {totalPages}</span>
      <div className="flex gap-2">
        <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
          className={`px-3 py-1.5 bg-transparent border border-[#222] rounded text-[11px] font-mono ${page === 1 ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}>
          ← Prev
        </button>
        <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
          className={`px-3 py-1.5 bg-transparent border border-[#222] rounded text-[11px] font-mono ${page === totalPages ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}>
          Next →
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className="w-full max-w-full">
      {/* Header — stacks on mobile */}
      <div className="mb-6">
        <div className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-1">Management</div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="m-0 text-2xl font-bold text-[#e8e8e8] tracking-tight">
            Products <span className="text-[#444] text-base font-normal">({total})</span>
          </h1>
          {/* Buttons — full width row on mobile */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={openSortMode}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-transparent text-[#e8c46a] border border-[#e8c46a44] rounded-lg text-[11px] font-bold tracking-[0.1em] uppercase cursor-pointer hover:bg-[#e8c46a0a] transition-colors font-mono">
              ⠿ Sort
            </button>
            <Link href="/admin/products/new"
              className="flex-1 sm:flex-none text-center px-4 py-2.5 bg-[#e8c46a] text-[#0a0a0a] no-underline rounded-lg text-[11px] font-bold tracking-[0.1em] uppercase hover:bg-[#d4b05e] transition-colors">
              + Add Product
            </Link>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input type="text" placeholder="Search products…" value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full sm:w-80 bg-[#111] border border-[#1e1e1e] rounded-lg px-4 py-2.5 text-[#e8e8e8] text-[13px] outline-none font-mono"
        />
      </div>

      {loading ? (
        <div className="py-12 text-[#444] text-[13px] text-center bg-[#111] border border-[#1e1e1e] rounded-xl">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="py-12 text-[#444] text-[13px] text-center bg-[#111] border border-[#1e1e1e] rounded-xl">No products found.</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-[#111] border border-[#222] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[560px]">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    {["Product","Category","Price","Stock","Rating","Actions"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[10px] tracking-[0.12em] text-[#444] uppercase font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id} className="border-b border-[#161616] hover:bg-[#141414] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {p.image && <img src={p.image} alt="" className="w-9 h-9 rounded object-cover bg-[#1a1a1a] shrink-0" />}
                          <div>
                            <div className="text-[13px] text-[#e8e8e8] whitespace-nowrap">{p.name}</div>
                            <div className="text-[11px] text-[#444] font-mono">{String(p._id).slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-[#666] capitalize whitespace-nowrap">{p.category || "—"}</td>
                      <td className="px-5 py-3.5 text-[13px] font-semibold text-[#e8e8e8] whitespace-nowrap">₦{p.price?.toFixed(2)}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${p.availability ? "text-[#6ae8a0] bg-[#6ae8a018] border-[#6ae8a033]" : "text-[#e86a6a] bg-[#e86a6a18] border-[#e86a6a33]"}`}>
                          {p.availability ? "In Stock" : "Out"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#e8c46a]">{p.averageRating > 0 ? `★ ${p.averageRating.toFixed(1)}` : "—"}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Link href={`/admin/products/${p._id}`} className="text-[11px] text-[#6ab4e8] no-underline px-2.5 py-1 border border-[#6ab4e822] rounded hover:bg-[#6ab4e812] transition-colors">EDIT</Link>
                          {confirmDelete === p._id ? (
                            <div className="flex gap-1">
                              <button onClick={() => deleteProduct(p._id)} disabled={deleting === p._id}
                                className="text-[10px] text-[#e86a6a] bg-[#e86a6a18] border border-[#e86a6a44] rounded px-2 py-1 cursor-pointer font-mono">
                                {deleting === p._id ? "…" : "Confirm"}
                              </button>
                              <button onClick={() => setConfirmDelete(null)}
                                className="text-[10px] text-[#555] bg-transparent border border-[#222] rounded px-2 py-1 cursor-pointer font-mono">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDelete(p._id)}
                              className="text-[11px] text-[#666] bg-transparent border border-[#222] rounded px-2.5 py-1 cursor-pointer font-mono hover:border-[#444] transition-colors">
                              DEL
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
              <div key={p._id} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-3.5 flex items-center gap-3 hover:border-[#252525] transition-colors w-full">
                {p.image && <img src={p.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-[#1a1a1a] shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-[#e8e8e8] truncate font-medium">{p.name}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[11px] text-[#555] capitalize">{p.category || "—"}</span>
                    <span className="text-[12px] text-[#e8e8e8] font-semibold">₦{p.price?.toFixed(2)}</span>
                    <span className={`text-[9px] uppercase px-1.5 py-px rounded border ${p.availability ? "text-[#6ae8a0] bg-[#6ae8a018] border-[#6ae8a033]" : "text-[#e86a6a] bg-[#e86a6a18] border-[#e86a6a33]"}`}>
                      {p.availability ? "In Stock" : "Out"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Link href={`/admin/products/${p._id}`}
                    className="text-[11px] text-[#6ab4e8] no-underline px-2.5 py-1.5 border border-[#6ab4e822] rounded hover:bg-[#6ab4e812] transition-colors">
                    EDIT
                  </Link>
                  {confirmDelete === p._id ? (
                    <div className="flex gap-1">
                      <button onClick={() => deleteProduct(p._id)} disabled={deleting === p._id}
                        className="text-[10px] text-[#e86a6a] bg-[#e86a6a18] border border-[#e86a6a44] rounded px-2 py-1.5 cursor-pointer font-mono">
                        {deleting === p._id ? "…" : "✓"}
                      </button>
                      <button onClick={() => setConfirmDelete(null)}
                        className="text-[10px] text-[#555] bg-transparent border border-[#222] rounded px-2 py-1.5 cursor-pointer font-mono">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(p._id)}
                      className="text-[11px] text-[#666] bg-transparent border border-[#222] rounded px-2.5 py-1.5 cursor-pointer font-mono hover:border-[#444] transition-colors">
                      DEL
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
        <div className="mt-6 bg-[#111] border border-[#222] rounded-xl p-5">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="m-0 text-sm font-bold text-[#e8e8e8]">Manage Display Order</h2>
            <button onClick={() => setSortMode(false)}
              className="bg-transparent border border-[#222] text-[#666] rounded px-3 py-1 cursor-pointer text-[11px] font-mono hover:border-[#444] transition-colors">
              Close
            </button>
          </div>
          <div className="mb-4">
            <p className="text-[10px] text-[#555] uppercase tracking-[0.12em] mb-1.5">Categories</p>
            <div className="w-full overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <div className="flex gap-2 pb-2 w-max">
                {CATEGORIES.filter(c => !c.startsWith("is")).map(cat => (
                  <button key={cat} onClick={() => handleCategorySelect(cat)}
                    className={`shrink-0 px-3.5 py-1.5 rounded text-[11px] cursor-pointer border transition-all font-mono
                      ${sortCategory === cat ? "border-[#e8c46a] bg-[#e8c46a18] text-[#e8c46a] font-bold" : "border-[#222] bg-transparent text-[#666] hover:border-[#333]"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-[#555] uppercase tracking-[0.12em] mb-1.5 mt-3">Specials</p>
            <div className="w-full overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <div className="flex gap-2 pb-1 w-max">
                {CATEGORIES.filter(c => c.startsWith("is")).map(cat => (
                  <button key={cat} onClick={() => handleCategorySelect(cat)}
                    className={`shrink-0 px-3.5 py-1.5 rounded text-[11px] cursor-pointer border transition-all font-mono
                      ${sortCategory === cat ? "border-[#e8c46a] bg-[#e8c46a18] text-[#e8c46a] font-bold" : "border-[#222] bg-transparent text-[#666] hover:border-[#333]"}`}>
                    {CATEGORY_LABELS[cat] || cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {sortCategory && sortableProducts.length === 0 && <p className="text-[#444] text-[12px]">No products here.</p>}

          {sortableProducts.length > 0 && (
            <>
              <p className="text-[10px] text-[#555] uppercase tracking-[0.12em] mb-2">Drag to reorder</p>
              <div className="flex flex-col gap-1.5">
                {sortableProducts.map((p, idx) => (
                  <div key={p._id} draggable
                    onDragStart={e => handleDragStart(e, p._id)}
                    onDragOver={e => handleDragOver(e, p._id)}
                    onDrop={e => handleDrop(e, p._id)}
                    onDragLeave={() => setDragOverId(null)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-grab transition-all
                      ${dragOverId === p._id ? "bg-[#1a1a1a] border border-[#e8c46a44]" : "bg-[#0d0d0d] border border-[#1a1a1a]"}`}>
                    <span className="text-[#333] text-sm select-none shrink-0">⠿</span>
                    <span className="text-[10px] text-[#444] w-5 shrink-0">{idx + 1}</span>
                    {p.image && <img src={p.image} alt="" className="w-7 h-7 object-cover rounded bg-[#1a1a1a] shrink-0" />}
                    <span className="text-[12px] text-[#e8e8e8] flex-1 min-w-0 truncate">{p.name}</span>
                    <span className="text-[11px] text-[#666] shrink-0 font-mono">₦{p.price?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={handleSaveOrder} disabled={savingOrder}
                  className={`px-5 py-2.5 border-none rounded-lg text-[11px] font-bold tracking-[0.1em] uppercase font-mono transition-all
                    ${savingOrder ? "bg-[#333] text-[#666] cursor-default" : "bg-[#e8c46a] text-[#0a0a0a] cursor-pointer hover:bg-[#d4b05e]"}`}>
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