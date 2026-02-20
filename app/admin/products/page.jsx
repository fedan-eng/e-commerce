// app/admin/products/page.jsx
"use client";
import {useEffect, useState, useCallback} from "react";
import Link from "next/link";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({page, limit: 15});
    if (search) params.append("search", search);

    const res = await fetch(`/api/products?${params}`);
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
    const res = await fetch(`/api/products/${id}`, {method: "DELETE"});
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setTotal((t) => t - 1);
    }
    setDeleting(null);
    setConfirmDelete(null);
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "0.2em",
              color: "#555",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            Management
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: "700",
              color: "#e8e8e8",
              letterSpacing: "-0.02em",
            }}
          >
            Products{" "}
            <span style={{color: "#444", fontSize: "18px"}}>({total})</span>
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          style={{
            padding: "10px 20px",
            background: "#e8c46a",
            color: "#0a0a0a",
            textDecoration: "none",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          + Add Product
        </Link>
      </div>

      {/* Search */}
      <div style={{marginBottom: "20px"}}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{
            background: "#111",
            border: "1px solid #222",
            borderRadius: "6px",
            padding: "10px 16px",
            color: "#e8e8e8",
            fontSize: "13px",
            width: "320px",
            outline: "none",
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Table */}
      <div
        style={{
          background: "#111",
          border: "1px solid #222",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div
            style={{
              padding: "48px 24px",
              color: "#444",
              fontSize: "13px",
              textAlign: "center",
            }}
          >
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              color: "#444",
              fontSize: "13px",
              textAlign: "center",
            }}
          >
            No products found.
          </div>
        ) : (
          <>
            <table style={{width: "100%", borderCollapse: "collapse"}}>
              <thead>
                <tr style={{borderBottom: "1px solid #1a1a1a"}}>
                  {[
                    "Product",
                    "Category",
                    "Price",
                    "Stock",
                    "Rating",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "14px 20px",
                        textAlign: "left",
                        fontSize: "10px",
                        letterSpacing: "0.15em",
                        color: "#444",
                        textTransform: "uppercase",
                        fontWeight: "600",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product._id}
                    style={{borderBottom: "1px solid #161616"}}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#141414")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td style={{padding: "14px 20px"}}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        {product.image && (
                          <img
                            src={product.image}
                            alt=""
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "4px",
                              objectFit: "cover",
                              background: "#1a1a1a",
                            }}
                          />
                        )}
                        <div>
                          <div style={{fontSize: "13px", color: "#e8e8e8"}}>
                            {product.name}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#444",
                              fontFamily: "monospace",
                            }}
                          >
                            {String(product._id).slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "14px 20px",
                        fontSize: "12px",
                        color: "#666",
                        textTransform: "capitalize",
                      }}
                    >
                      {product.category || "—"}
                    </td>
                    <td
                    className="flex items-center"
                      style={{
                        padding: "14px 20px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#e8e8e8",
                      }}
                    >
                      ₦{product.price?.toFixed(2)}
                    </td>
                    <td style={{padding: "14px 20px"}}>
                      <span
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: product.availability ? "#6ae8a0" : "#e86a6a",
                          background: product.availability
                            ? "#6ae8a018"
                            : "#e86a6a18",
                          border: `1px solid ${product.availability ? "#6ae8a033" : "#e86a6a33"}`,
                          padding: "3px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {product.availability ? "In Stock" : "Out"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "14px 20px",
                        fontSize: "13px",
                        color: "#e8c46a",
                      }}
                    >
                      {product.averageRating > 0
                        ? `★ ${product.averageRating.toFixed(1)}`
                        : "—"}
                    </td>
                    <td style={{padding: "14px 20px"}}>
                      <div style={{display: "flex", gap: "8px"}}>
                        <Link
                          href={`/admin/products/${product._id}`}
                          style={{
                            fontSize: "11px",
                            color: "#6ab4e8",
                            textDecoration: "none",
                            letterSpacing: "0.08em",
                            padding: "4px 10px",
                            border: "1px solid #6ab4e822",
                            borderRadius: "4px",
                          }}
                        >
                          EDIT
                        </Link>
                        {confirmDelete === product._id ? (
                          <div style={{display: "flex", gap: "4px"}}>
                            <button
                              onClick={() => deleteProduct(product._id)}
                              disabled={deleting === product._id}
                              style={{
                                fontSize: "10px",
                                color: "#e86a6a",
                                background: "#e86a6a18",
                                border: "1px solid #e86a6a44",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                cursor: "pointer",
                              }}
                            >
                              {deleting === product._id ? "..." : "Confirm"}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              style={{
                                fontSize: "10px",
                                color: "#555",
                                background: "transparent",
                                border: "1px solid #222",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(product._id)}
                            style={{
                              fontSize: "11px",
                              color: "#666",
                              background: "transparent",
                              border: "1px solid #222",
                              borderRadius: "4px",
                              padding: "4px 10px",
                              cursor: "pointer",
                              letterSpacing: "0.08em",
                            }}
                          >
                            DEL
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  padding: "16px 20px",
                  borderTop: "1px solid #1a1a1a",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{fontSize: "12px", color: "#444"}}>
                  Page {page} of {totalPages}
                </span>
                <div style={{display: "flex", gap: "8px"}}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      padding: "6px 14px",
                      background: "transparent",
                      border: "1px solid #222",
                      color: page === 1 ? "#333" : "#888",
                      borderRadius: "4px",
                      cursor: page === 1 ? "default" : "pointer",
                      fontSize: "12px",
                    }}
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{
                      padding: "6px 14px",
                      background: "transparent",
                      border: "1px solid #222",
                      color: page === totalPages ? "#333" : "#888",
                      borderRadius: "4px",
                      cursor: page === totalPages ? "default" : "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
