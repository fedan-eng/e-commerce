// app/admin_console/products/page.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Plus, ArrowUpDown, MoreVertical, Pencil, ExternalLink, PackageCheck, PackageX, Trash2, Package, GripVertical, Star,
} from "lucide-react";
import { CATEGORY_OPTIONS } from "@/lib/categories";
import { useAdmin } from "@/components/admin/AdminContext";
import {
  PageHeader, Card, CardHeader, Button, SearchInput, Dropdown, MenuItem, MenuSeparator, Pagination,
  Checkbox, BulkBar, bulkBtnCls, EmptyState, Spinner, selectCls, TH, TD, cx,
} from "@/components/admin/ui";
import { money } from "@/components/admin/format";

const PAGE_SIZE = 15;

// Display-order lists: everything, each shop category, and the specials shelves
const SORT_LISTS = [
  { value: "__all__", label: "All products" },
  ...CATEGORY_OPTIONS.map(c => ({ value: c.value, label: c.label })),
  { value: "isBestseller", label: "Best sellers", special: true },
  { value: "isWhatsNew",   label: "What's new",   special: true },
  { value: "isTodaysDeal", label: "Today's deal", special: true },
];

const StockBadge = ({ inStock }) => (
  <span className={cx(
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
    inStock ? "bg-[#eaf7ef] text-[#15803d]" : "bg-[#fdeeee] text-[#b91c1c]",
  )}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
    {inStock ? "In stock" : "Out of stock"}
  </span>
);

const Thumb = ({ src, size = "h-10 w-10" }) => src
  // eslint-disable-next-line @next/next/no-img-element
  ? <img src={src} alt="" className={cx(size, "shrink-0 rounded-lg bg-hover object-cover")} />
  : <span className={cx(size, "flex shrink-0 items-center justify-center rounded-lg bg-hover text-faint")}><Package size={16} aria-hidden /></span>;

function ProductMenu({ product, onToggleStock, onDelete }) {
  return (
    <Dropdown
      renderTrigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label={`More actions for ${product.name}`}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-sub transition-colors hover:bg-hover hover:text-ink"
        >
          <MoreVertical size={16} aria-hidden />
        </button>
      )}
    >
      <MenuItem icon={Pencil} href={`/admin_console/products/${product._id}`}>Edit</MenuItem>
      <MenuItem icon={ExternalLink} onClick={() => window.open(`/products/${product._id}`, "_blank", "noopener")}>View in store</MenuItem>
      <MenuItem icon={product.availability ? PackageX : PackageCheck} onClick={() => onToggleStock([product], !product.availability)}>
        Mark {product.availability ? "out of stock" : "in stock"}
      </MenuItem>
      <MenuSeparator />
      <MenuItem icon={Trash2} danger onClick={() => onDelete([product])}>Delete</MenuItem>
    </Dropdown>
  );
}

// Drag-and-drop display order for one list
function DisplayOrder({ onClose, onSaved }) {
  const [list, setList]       = useState("");
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [dragOverId, setDragOverId] = useState(null);

  const pick = async value => {
    setList(value);
    setItems([]);
    setLoading(true);
    const def = SORT_LISTS.find(l => l.value === value);
    const url = value === "__all__"
      ? "/api/products?limit=500"
      : def?.special
        ? `/api/products?specials=${value}&limit=500`
        : `/api/products?categories=${encodeURIComponent(value)}&limit=500`;
    try {
      const data = await fetch(url).then(r => r.json());
      setItems((data.products || []).sort((a, b) => (a.sortOrder?.[value] ?? 9999) - (b.sortOrder?.[value] ?? 9999)));
    } catch {
      toast.error("Couldn't load products");
    } finally {
      setLoading(false);
    }
  };

  const move = (from, to) => setItems(prev => {
    if (to < 0 || to >= prev.length) return prev;
    const arr = [...prev];
    const [m] = arr.splice(from, 1);
    arr.splice(to, 0, m);
    return arr;
  });

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    const fromId = e.dataTransfer.getData("draggedId");
    setDragOverId(null);
    if (fromId === targetId) return;
    move(items.findIndex(p => p._id === fromId), items.findIndex(p => p._id === targetId));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/products/sort-order", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: list, orderedIds: items.map(p => p._id) }),
      });
      if (!res.ok) throw new Error();
      toast.success("Display order saved");
      onSaved();
    } catch {
      toast.error("Couldn't save the order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader
        title="Display order"
        description="Choose a list, then drag products into the order shoppers should see them"
        action={
          <div className="flex gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={save} disabled={!items.length || saving}>{saving ? "Saving…" : "Save order"}</Button>
          </div>
        }
      />
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-5 pb-4">
        {SORT_LISTS.map(l => (
          <button
            key={l.value}
            type="button"
            onClick={() => pick(l.value)}
            className={cx(
              "h-8 shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-3 text-[13px] font-medium transition-colors",
              list === l.value ? "border-pine bg-pine text-white" : "border-[#dfe3e1] bg-white text-sub hover:border-pine hover:text-pine",
            )}
          >
            {l.label}
          </button>
        ))}
      </div>
      {loading && <div className="flex justify-center pb-8"><Spinner /></div>}
      {!loading && list && items.length === 0 && <p className="m-0 px-5 pb-5 text-[13px] text-faint">No products in this list.</p>}
      {items.length > 0 && (
        <ol className="m-0 flex max-h-[480px] list-none flex-col gap-1.5 overflow-y-auto px-5 pb-5">
          {items.map((p, idx) => (
            <li
              key={p._id}
              draggable
              onDragStart={e => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("draggedId", p._id); }}
              onDragOver={e => { e.preventDefault(); setDragOverId(p._id); }}
              onDragLeave={() => setDragOverId(null)}
              onDrop={e => handleDrop(e, p._id)}
              className={cx(
                "flex cursor-grab items-center gap-3 rounded-lg border px-3 py-2 transition-colors active:cursor-grabbing",
                dragOverId === p._id ? "border-pine bg-pine-tint" : "border-edge bg-white hover:bg-[#fafbfa]",
              )}
            >
              <GripVertical size={16} className="shrink-0 text-faint" aria-hidden />
              <span className="w-6 shrink-0 text-xs text-faint">{idx + 1}</span>
              <Thumb src={p.image} size="h-8 w-8" />
              <span className="min-w-0 flex-1 truncate text-[13px]">{p.name}</span>
              <span className="hidden text-xs text-faint sm:inline">{money(p.price)}</span>
              <span className="flex shrink-0 gap-0.5">
                <button type="button" onClick={() => move(idx, idx - 1)} disabled={idx === 0} aria-label={`Move ${p.name} up`} className="h-7 w-7 cursor-pointer rounded-md text-sub hover:bg-hover disabled:opacity-30">↑</button>
                <button type="button" onClick={() => move(idx, idx + 1)} disabled={idx === items.length - 1} aria-label={`Move ${p.name} down`} className="h-7 w-7 cursor-pointer rounded-md text-sub hover:bg-hover disabled:opacity-30">↓</button>
              </span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

export default function AdminProductsPage() {
  const { refreshAlerts } = useAdmin();
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("");
  const [stock, setStock]           = useState("");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [selected, setSelected]     = useState({});
  const [busy, setBusy]             = useState(false);
  const [sortMode, setSortMode]     = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: PAGE_SIZE, sort: "sortOrder.__all__" });
      if (search)   params.append("search", search);
      if (category) params.append("categories", category);
      if (stock)    params.append("availability", stock);
      const data = await fetch(`/api/products?${params}`).then(r => r.json());
      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      toast.error("Couldn't load products");
    } finally {
      setLoading(false);
    }
  }, [page, search, category, stock]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  useEffect(() => { setSelected({}); }, [page, search, category, stock]);

  const toggleStock = async (list, availability) => {
    setBusy(true);
    let failed = 0;
    for (const p of list) {
      const res = await fetch(`/api/products/${p._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability }),
      }).catch(() => null);
      if (!res?.ok) failed++;
    }
    setBusy(false);
    if (failed) toast.error(`${failed} product${failed === 1 ? "" : "s"} couldn't be updated`);
    else toast.success(`${list.length === 1 ? list[0].name : `${list.length} products`} marked ${availability ? "in stock" : "out of stock"}`);
    setSelected({});
    fetchProducts();
    refreshAlerts();
  };

  const deleteProducts = async list => {
    const label = list.length === 1 ? `"${list[0].name}"` : `${list.length} products`;
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    setBusy(true);
    let failed = 0;
    for (const p of list) {
      const res = await fetch(`/api/products/${p._id}`, { method: "DELETE" }).catch(() => null);
      if (!res?.ok) failed++;
    }
    setBusy(false);
    if (failed) toast.error(`${failed} product${failed === 1 ? "" : "s"} couldn't be deleted`);
    else toast.success(`Deleted ${label}`);
    setSelected({});
    fetchProducts();
    refreshAlerts();
  };

  const selectedProducts = products.filter(p => selected[p._id]);
  const allSelected = products.length > 0 && selectedProducts.length === products.length;
  const toggleAll = () => setSelected(allSelected ? {} : Object.fromEntries(products.map(p => [p._id, true])));
  const toggleOne = id => setSelected(s => ({ ...s, [id]: !s[id] }));
  const resetPage = setter => v => { setter(v); setPage(1); };
  const hasFilters = search || category || stock;

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${total.toLocaleString()} product${total === 1 ? "" : "s"}${hasFilters ? " matching your filters" : ""}`}
        actions={
          <>
            <Button onClick={() => setSortMode(s => !s)} aria-pressed={sortMode}>
              <ArrowUpDown size={16} aria-hidden /> Display order
            </Button>
            <Button variant="primary" href="/admin_console/products/new">
              <Plus size={16} aria-hidden /> Add product
            </Button>
          </>
        }
      />

      {sortMode && <DisplayOrder onClose={() => setSortMode(false)} onSaved={() => { setSortMode(false); fetchProducts(); }} />}

      <Card>
        <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:px-5">
          <SearchInput
            className="min-w-[220px] flex-1"
            value={search}
            onChange={resetPage(setSearch)}
            onClear={() => resetPage(setSearch)("")}
            placeholder="Search products"
          />
          <select value={category} onChange={e => resetPage(setCategory)(e.target.value)} className={cx(selectCls, "w-auto")} aria-label="Category">
            <option value="">All categories</option>
            {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={stock} onChange={e => resetPage(setStock)(e.target.value)} className={cx(selectCls, "w-auto")} aria-label="Stock">
            <option value="">Any stock</option>
            <option value="inStock">In stock</option>
            <option value="outOfStock">Out of stock</option>
          </select>
        </div>

        <BulkBar count={selectedProducts.length} onClear={() => setSelected({})}>
          <button type="button" disabled={busy} onClick={() => toggleStock(selectedProducts, true)} className={bulkBtnCls}>
            <PackageCheck size={13} aria-hidden /> Mark in stock
          </button>
          <button type="button" disabled={busy} onClick={() => toggleStock(selectedProducts, false)} className={bulkBtnCls}>
            <PackageX size={13} aria-hidden /> Mark out of stock
          </button>
          <button type="button" disabled={busy} onClick={() => deleteProducts(selectedProducts)} className={bulkBtnCls}>
            <Trash2 size={13} aria-hidden /> Delete
          </button>
        </BulkBar>

        {loading && !products.length ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description={hasFilters ? "Try a different search or filter." : "Add your first product to get started."}
            action={!hasFilters && <Button variant="primary" href="/admin_console/products/new"><Plus size={16} aria-hidden /> Add product</Button>}
          />
        ) : (
          <div className={cx("transition-opacity", loading && "opacity-60")}>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className={cx(TH, "w-10 pr-0")}><Checkbox checked={allSelected} indeterminate={selectedProducts.length > 0} onChange={toggleAll} label="Select all products on this page" /></th>
                    <th className={TH}>Product</th>
                    <th className={TH}>Category</th>
                    <th className={cx(TH, "text-right")}>Price</th>
                    <th className={TH}>Stock</th>
                    <th className={TH}>Rating</th>
                    <th className={cx(TH, "w-12")}><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id} className={cx("transition-colors", selected[p._id] ? "bg-pine-tint/60" : "hover:bg-[#fafbfa]")}>
                      <td className={cx(TD, "pr-0")}><Checkbox checked={!!selected[p._id]} onChange={() => toggleOne(p._id)} label={`Select ${p.name}`} /></td>
                      <td className={TD}>
                        <div className="flex items-center gap-3">
                          <Thumb src={p.image} />
                          <div className="min-w-0">
                            <Link href={`/admin_console/products/${p._id}`} className="block max-w-[320px] truncate font-medium text-ink no-underline hover:text-pine">{p.name}</Link>
                            <span className="text-xs text-faint">ID {String(p._id).slice(-8).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td className={TD}>{p.category ? <span className="rounded-md bg-[#f1f3f2] px-2 py-0.5 text-xs font-medium capitalize text-sub">{p.category}</span> : <span className="text-faint">—</span>}</td>
                      <td className={cx(TD, "whitespace-nowrap text-right")}>
                        <div className="font-medium">{money(p.price)}</div>
                        {p.originalPrice > p.price && <div className="text-xs text-faint line-through">{money(p.originalPrice)}</div>}
                      </td>
                      <td className={TD}><StockBadge inStock={p.availability} /></td>
                      <td className={cx(TD, "whitespace-nowrap")}>
                        {p.averageRating > 0
                          ? <span className="inline-flex items-center gap-1"><Star size={13} className="fill-[#d97706] text-[#d97706]" aria-hidden />{p.averageRating.toFixed(1)}</span>
                          : <span className="text-faint">—</span>}
                      </td>
                      <td className={cx(TD, "text-right")}><ProductMenu product={p} onToggleStock={toggleStock} onDelete={deleteProducts} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col md:hidden">
              <label className="flex items-center gap-2.5 border-y border-edge bg-[#fafbfa] px-3 py-2 text-xs text-faint">
                <Checkbox checked={allSelected} indeterminate={selectedProducts.length > 0} onChange={toggleAll} label="Select all products on this page" />
                Select all
              </label>
              {products.map(p => (
                <div key={p._id} className={cx("flex items-center gap-3 border-b border-[#eef0ef] px-3 py-3", selected[p._id] && "bg-pine-tint/60")}>
                  <Checkbox checked={!!selected[p._id]} onChange={() => toggleOne(p._id)} label={`Select ${p.name}`} />
                  <Thumb src={p.image} size="h-12 w-12" />
                  <Link href={`/admin_console/products/${p._id}`} className="min-w-0 flex-1 text-ink no-underline">
                    <span className="block truncate text-[13px] font-medium">{p.name}</span>
                    <span className="block text-xs text-faint">{p.category || "—"} · {money(p.price)}</span>
                    <span className="mt-1 block"><StockBadge inStock={p.availability} /></span>
                  </Link>
                  <ProductMenu product={p} onToggleStock={toggleStock} onDelete={deleteProducts} />
                </div>
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} onChange={setPage} noun="products" />
          </div>
        )}
      </Card>
    </div>
  );
}
