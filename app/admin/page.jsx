// app/admin/page.jsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const STATUS_COLORS = {
  pending:    "text-[#e8c46a] bg-[#e8c46a18] border-[#e8c46a33]",
  confirmed:  "text-[#e8c46a] bg-[#e8c46a18] border-[#e8c46a33]",
  processing: "text-[#6ab4e8] bg-[#6ab4e818] border-[#6ab4e833]",
  processed:  "text-[#6ab4e8] bg-[#6ab4e818] border-[#6ab4e833]",
  shipped:    "text-[#a06ae8] bg-[#a06ae818] border-[#a06ae833]",
  delivered:  "text-[#6ae8a0] bg-[#6ae8a018] border-[#6ae8a033]",
  cancelled:  "text-[#e86a6a] bg-[#e86a6a18] border-[#e86a6a33]",
};

export default function AdminDashboard() {
  const [stats,        setStats]        = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/orders?limit=5").then(r => r.json()),
      fetch("/api/products?limit=1").then(r => r.json()),
    ]).then(([ordersData, productsData]) => {
      setRecentOrders(ordersData.orders || []);
      setStats({
        totalOrders:   ordersData.total || 0,
        totalProducts: productsData.pagination?.total || 0,
        confirmed: (ordersData.orders || []).filter(o => o.status?.toLowerCase() === "confirmed").length,
      });
      setLoading(false);
    });
  }, []);

  const getTotal = (order) => {
    if (order.total != null)    return parseFloat(order.total).toFixed(2);
    if (order.subTotal != null) return parseFloat(order.subTotal).toFixed(2);
    return (order.items || []).reduce((acc, item) =>
      acc + parseFloat(item.price || 0) * parseFloat(item.quantity || 1), 0).toFixed(2);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-1.5">Overview</div>
        <h1 className="m-0 text-2xl font-bold text-[#e8e8e8] tracking-tight">Dashboard</h1>
      </div>

      {/* Stat Cards — single column on mobile, 3-col on md+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {[
          { label: "Total Orders",     value: stats?.totalOrders,    accent: "#e8c46a", href: "/admin/orders" },
          { label: "Total Products",   value: stats?.totalProducts,  accent: "#6ae8a0", href: "/admin/products" },
          { label: "Confirmed Orders", value: stats?.confirmed,      accent: "#e8c46a", href: "/admin/orders?status=Confirmed" },
        ].map(card => (
          <Link key={card.label} href={card.href} className="no-underline group">
            <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-5 transition-all duration-200
              hover:border-[#2a2a2a] hover:bg-[#131313]"
              style={{ borderTopWidth: "2px", borderTopColor: card.accent }}>
              <div className="text-[10px] tracking-[0.15em] text-[#888] uppercase mb-3">{card.label}</div>
              <div className="text-3xl font-bold text-[#e8e8e8] leading-none">
                {loading ? <span className="text-[#333]">—</span> : card.value}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e1e1e] flex justify-between items-center">
          <div className="text-[11px] tracking-[0.1em] text-[#888] uppercase">Recent Orders</div>
          <Link href="/admin/orders" className="text-[10px] text-[#555] no-underline tracking-[0.1em] hover:text-[#e8c46a] transition-colors">
            VIEW ALL →
          </Link>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-[#444] text-[13px] text-center">Loading...</div>
        ) : recentOrders.length === 0 ? (
          <div className="px-5 py-10 text-[#444] text-[13px] text-center">No orders yet.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse min-w-[480px]">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    {["Order ID","Items","Total","Status","Date"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] tracking-[0.12em] text-[#444] uppercase font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => {
                    const sKey = order.status?.toLowerCase();
                    const sc   = STATUS_COLORS[sKey] || "text-white bg-[#88888818] border-[#88888833]";
                    return (
                      <tr key={order._id} className="border-b border-[#171717] hover:bg-[#141414] transition-colors">
                        <td className="px-5 py-3 font-mono whitespace-nowrap">
                          <Link href={`/admin/orders/${order._id}`} className="text-[11px] text-[#e8c46a] no-underline hover:underline">
                            #{String(order._id).slice(-8).toUpperCase()}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-[13px] text-[#888]">{order.items?.length || 0} item(s)</td>
                        <td className="px-5 py-3 text-[13px] text-[#e8e8e8] font-semibold whitespace-nowrap">₦{getTotal(order)}</td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className={`text-[9px] tracking-[0.1em] uppercase border px-2 py-0.5 rounded ${sc}`}>{order.status}</span>
                        </td>
                        <td className="px-5 py-3 text-[12px] text-[#555] whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile order cards */}
            <div className="sm:hidden divide-y divide-[#171717]">
              {recentOrders.map(order => {
                const sKey = order.status?.toLowerCase();
                const sc   = STATUS_COLORS[sKey] || "text-white bg-[#88888818] border-[#88888833]";
                return (
                  <div key={order._id} className="px-4 py-3 hover:bg-[#141414] transition-colors">
                    <div className="flex justify-between items-start mb-1.5">
                      <Link href={`/admin/orders/${order._id}`} className="text-[11px] text-[#e8c46a] no-underline font-mono hover:underline">
                        #{String(order._id).slice(-8).toUpperCase()}
                      </Link>
                      <span className="text-[13px] text-[#e8e8e8] font-semibold">₦{getTotal(order)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] tracking-[0.1em] uppercase border px-2 py-0.5 rounded ${sc}`}>{order.status}</span>
                        <span className="text-[11px] text-[#555]">{order.items?.length || 0} item(s)</span>
                      </div>
                      <span className="text-[11px] text-[#444]">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}