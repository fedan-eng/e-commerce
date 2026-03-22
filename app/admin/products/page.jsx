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
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [total, setTotal]               = useState(0);
  const [deleting, setDeleting]         = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [sortMode, setSortMode]         = useState(false);
  const [sortCategory, setSortCategory] = useState("");
  const [sortableProducts, setSortableProducts] = useState([]);
  const [savingOrder, setSavingOrder]   = useState(false);
  const [dragOverId, setDragOverId]     = useState(null);

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

  useEffect(() => {
    const t = setTimeout(fetchProducts, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchProducts]);

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
    const sorted = (data.products || []).sort((a, b) => (a.sortOrder?.[cat] ?? 9999) - (b.sortOrder?.[cat] ?? 9999));
    setSortableProducts(sorted);
  };

  const handleDragStart = (e, id) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("draggedId", id); };
  const handleDragOver  = (e, id) => { e.preventDefault(); setDragOverId(id); };
  const handleDrop = (e, targetId) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("draggedId");
    if (draggedId === targetId) return;
    setSortableProducts(prev => {
      const arr = [...prev];
      const fromIdx = arr.findIndex(p => p._id === draggedId);
      const toIdx   = arr.findIndex(p => p._id === targetId);
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return arr;
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
      else        { alert("Failed to save order."); }
    } catch { alert("Something went wrong."); }
    finally { setSavingOrder(false); }
  };

  const PaginationRow = ({ tableMode }) => totalPages > 1 ? (
    <div className={`flex justify-between items-center ${tableMode ? "px-5 py-4 border-t border-[#1a1a1a]" : "mt-4"}`}>
      <span className="text-[12px] text-[#444]">Page {page} of {totalPages}</span>
      <div className="flex gap-2">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
          className={`px-4 py-1.5 bg-transparent border border-[#222] rounded text-[12px] font-mono ${page === 1 ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}>
          ← Prev
        </button>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
          className={`px-4 py-1.5 bg-transparent border border-[#222] rounded text-[12px] font-mono ${page === totalPages ? "text-[#333] cursor-default" : "text-[#888] cursor-pointer hover:border-[#444]"}`}>
          Next →
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-3 mb-8">
        <div>
          <div className="text-[11px] tracking-[0.2em] text-[#555] uppercase mb-1.5">Management</div>
          <h1 className="m-0 text-[28px] font-bold text-[#e8e8e8] tracking-tight">
            Products <span className="text-[#444] text-lg">({total})</span>
          </h1>
        </div>
        <div className="flex gap-2.5 w-full sm:w-auto">
          <button onClick={openSortMode}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-transparent text-[#e8c46a] border border-[#e8c46a44] rounded-md text-[11px] font-bold tracking-[0.12em] uppercase cursor-pointer hover:bg-[#e8c46a0a] transition-colors font-mono">
            ⠿ Manage Order
          </button>
          <Link href="/admin/products/new"
            className="flex-1 sm:flex-none text-center px-5 py-2.5 bg-[#e8c46a] text-[#0a0a0a] no-underline rounded-md text-[11px] font-bold tracking-[0.12em] uppercase hover:bg-[#d4b05e] transition-colors">
            + Add Product
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input type="text" placeholder="Search products..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full sm:w-80 bg-[#111] border border-[#222] rounded-md px-4 py-2.5 text-[#e8e8e8] text-[13px] outline-none font-mono"
        />
      </div>

      {loading ? (
        <div className="py-12 text-[#444] text-[13px] text-center bg-[#111] border border-[#222] rounded-lg">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="py-12 text-[#444] text-[13px] text-center bg-[#111] border border-[#222] rounded-lg">No products found.</div>
      ) : (
        <>
          {/* ── Desktop Table ── */}
          <div className="hidden md:block bg-[#111] border border-[#222] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[580px]">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    {["Product","Category","Price","Stock","Rating","Actions"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[10px] tracking-[0.15em] text-[#444] uppercase font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id} className="border-b border-[#161616] hover:bg-[#141414] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {product.image && <img src={product.image} alt="" className="w-9 h-9 rounded object-cover bg-[#1a1a1a] flex-shrink-0" />}
                          <div>
                            <div className="text-[13px] text-[#e8e8e8] whitespace-nowrap">{product.name}</div>
                            <div className="text-[11px] text-[#444] font-mono">{String(product._id).slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-[#666] capitalize whitespace-nowrap">{product.category || "—"}</td>
                      <td className="px-5 py-3.5 text-[13px] font-semibold text-[#e8e8e8] whitespace-nowrap">₦{product.price?.toFixed(2)}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`text-[10px] tracking-[0.08em] uppercase px-2 py-0.5 rounded border
                          ${product.availability ? "text-[#6ae8a0] bg-[#6ae8a018] border-[#6ae8a033]" : "text-[#e86a6a] bg-[#e86a6a18] border-[#e86a6a33]"}`}>
                          {product.availability ? "In Stock" : "Out"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#e8c46a] whitespace-nowrap">
                        {product.averageRating > 0 ? `★ ${product.averageRating.toFixed(1)}` : "—"}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Link href={`/admin/products/${product._id}`}
                            className="text-[11px] text-[#6ab4e8] no-underline tracking-[0.08em] px-2.5 py-1 border border-[#6ab4e822] rounded hover:bg-[#6ab4e812] transition-colors">
                            EDIT
                          </Link>
                          {confirmDelete === product._id ? (
                            <div className="flex gap-1">
                              <button onClick={() => deleteProduct(product._id)} disabled={deleting === product._id}
                                className="text-[10px] text-[#e86a6a] bg-[#e86a6a18] border border-[#e86a6a44] rounded px-2 py-1 cursor-pointer font-mono">
                                {deleting === product._id ? "..." : "Confirm"}
                              </button>
                              <button onClick={() => setConfirmDelete(null)}
                                className="text-[10px] text-[#555] bg-transparent border border-[#222] rounded px-2 py-1 cursor-pointer font-mono">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDelete(product._id)}
                              className="text-[11px] text-[#666] bg-transparent border border-[#222] rounded px-2.5 py-1 cursor-pointer tracking-[0.08em] hover:border-[#444] transition-colors font-mono">
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
            <PaginationRow tableMode={true} />
          </div>

          {/* ── Mobile Cards ── */}
          <div className="md:hidden flex flex-col gap-2.5">
            {products.map(product => (
              <div key={product._id} className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3.5 flex items-center gap-3 hover:border-[#2a2a2a] transition-colors">
                {product.image && <img src={product.image} alt="" className="w-11 h-11 rounded-md object-cover bg-[#1a1a1a] flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-[#e8e8e8] overflow-hidden text-ellipsis whitespace-nowrap">{product.name}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[12px] text-[#666] capitalize">{product.category || "—"}</span>
                    <span className="text-[12px] text-[#e8e8e8] font-semibold">₦{product.price?.toFixed(2)}</span>
                    <span className={`text-[9px] tracking-[0.08em] uppercase px-1.5 py-px rounded border
                      ${product.availability ? "text-[#6ae8a0] bg-[#6ae8a018] border-[#6ae8a033]" : "text-[#e86a6a] bg-[#e86a6a18] border-[#e86a6a33]"}`}>
                      {product.availability ? "In Stock" : "Out"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Link href={`/admin/products/${product._id}`}
                    className="text-[11px] text-[#6ab4e8] no-underline px-2.5 py-1.5 border border-[#6ab4e822] rounded hover:bg-[#6ab4e812] transition-colors">
                    EDIT
                  </Link>
                  {confirmDelete === product._id ? (
                    <div className="flex gap-1">
                      <button onClick={() => deleteProduct(product._id)} disabled={deleting === product._id}
                        className="text-[10px] text-[#e86a6a] bg-[#e86a6a18] border border-[#e86a6a44] rounded px-2 py-1.5 cursor-pointer font-mono">
                        {deleting === product._id ? "..." : "✓"}
                      </button>
                      <button onClick={() => setConfirmDelete(null)}
                        className="text-[10px] text-[#555] bg-transparent border border-[#222] rounded px-2 py-1.5 cursor-pointer font-mono">
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(product._id)}
                      className="text-[11px] text-[#666] bg-transparent border border-[#222] rounded px-2.5 py-1.5 cursor-pointer font-mono hover:border-[#444] transition-colors">
                      DEL
                    </button>
                  )}
                </div>
              </div>
            ))}
            <PaginationRow tableMode={false} />
          </div>
        </>
      )}

      {/* Sort Mode Panel */}
      {sortMode && (
        <div className="mt-8 bg-[#111] border border-[#222] rounded-lg p-6">
          <div className="flex justify-between items-center mb-5 flex-wrap gap-2.5">
            <h2 className="m-0 text-base font-bold text-[#e8e8e8]">Manage Display Order</h2>
            <button onClick={() => setSortMode(false)}
              className="bg-transparent border border-[#222] text-[#666] rounded px-3 py-1 cursor-pointer text-[12px] font-mono hover:border-[#444] transition-colors">
              Close
            </button>
          </div>

          <div className="mb-5">
            <p className="text-[11px] text-[#555] uppercase tracking-[0.15em] mb-1.5">Categories</p>
            <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {CATEGORIES.filter(c => !c.startsWith("is")).map(cat => (
                <button key={cat} onClick={() => handleCategorySelect(cat)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded text-[12px] cursor-pointer border transition-all font-mono
                    ${sortCategory === cat ? "border-[#e8c46a] bg-[#e8c46a18] text-[#e8c46a] font-bold" : "border-[#222] bg-transparent text-[#666] hover:border-[#333]"}`}>
                  {cat}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#555] uppercase tracking-[0.15em] mb-1.5">Specials</p>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {CATEGORIES.filter(c => c.startsWith("is")).map(cat => (
                <button key={cat} onClick={() => handleCategorySelect(cat)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded text-[12px] cursor-pointer border transition-all font-mono
                    ${sortCategory === cat ? "border-[#e8c46a] bg-[#e8c46a18] text-[#e8c46a] font-bold" : "border-[#222] bg-transparent text-[#666] hover:border-[#333]"}`}>
                  {CATEGORY_LABELS[cat] || cat}
                </button>
              ))}
            </div>
          </div>

          {sortCategory && sortableProducts.length === 0 && (
            <p className="text-[#444] text-[13px]">No products in this selection.</p>
          )}

          {sortableProducts.length > 0 && (
            <>
              <p className="text-[11px] text-[#555] uppercase tracking-[0.15em] mb-2.5">Drag to reorder — top = displayed first</p>
              <div className="flex flex-col gap-1.5">
                {sortableProducts.map((product, idx) => (
                  <div key={product._id} draggable
                    onDragStart={e => handleDragStart(e, product._id)}
                    onDragOver={e => handleDragOver(e, product._id)}
                    onDrop={e => handleDrop(e, product._id)}
                    onDragLeave={() => setDragOverId(null)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md cursor-grab transition-all
                      ${dragOverId === product._id ? "bg-[#1a1a1a] border border-[#e8c46a44]" : "bg-[#0d0d0d] border border-[#1a1a1a]"}`}
                  >
                    <span className="text-[#333] text-base select-none flex-shrink-0">⠿</span>
                    <span className="text-[11px] text-[#444] w-5 flex-shrink-0">{idx + 1}</span>
                    {product.image && <img src={product.image} alt="" className="w-8 h-8 object-cover rounded bg-[#1a1a1a] flex-shrink-0" />}
                    <span className="text-[13px] text-[#e8e8e8] flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{product.name}</span>
                    <span className="text-[10px] text-[#555] flex-shrink-0 uppercase tracking-[0.08em] hidden sm:block">{product.category}</span>
                    <span className="text-[12px] text-[#666] flex-shrink-0">₦{product.price?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-end">
                <button onClick={handleSaveOrder} disabled={savingOrder}
                  className={`px-6 py-2.5 border-none rounded-md text-[12px] font-bold tracking-[0.1em] uppercase font-mono transition-all
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