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
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/orders?limit=5").then((r) => r.json()),
      fetch("/api/products?limit=1").then((r) => r.json()),
    ]).then(([ordersData, productsData]) => {
      setRecentOrders(ordersData.orders || []);
      setStats({
        totalOrders:   ordersData.total || 0,
        totalProducts: productsData.pagination?.total || 0,
        confirmed: (ordersData.orders || []).filter((o) => o.status?.toLowerCase() === "confirmed").length,
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

  const StatCard = ({ label, value, accentClass, href }) => (
    <Link href={href} className="no-underline group">
      <div className={`bg-[#111] border border-[#222] ${accentClass} rounded-lg p-6 cursor-pointer transition-all duration-200 hover:border-opacity-80`}>
        <div className="text-[11px] tracking-[0.15em] text-white uppercase mb-2.5">{label}</div>
        <div className="text-4xl font-bold text-[#e8e8e8] leading-none">
          {loading ? "—" : value}
        </div>
      </div>
    </Link>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-9">
        <div className="text-[11px] tracking-[0.2em] text-[#555] uppercase mb-1.5">Overview</div>
        <h1 className="m-0 text-[28px] font-bold text-[#e8e8e8] tracking-tight">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatCard label="Total Orders"     value={stats?.totalOrders}    accentClass="border-t-2 border-t-[#e8c46a]" href="/admin/orders" />
        <StatCard label="Total Products"   value={stats?.totalProducts}  accentClass="border-t-2 border-t-[#6ae8a0]" href="/admin/products" />
        <StatCard label="Confirmed Orders" value={stats?.confirmed}      accentClass="border-t-2 border-t-[#e8c46a]" href="/admin/orders?status=Confirmed" />
      </div>

      {/* Recent Orders */}
      <div className="bg-[#111] border border-[#222] rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-[#222] flex justify-between items-center">
          <div className="text-[13px] text-white tracking-[0.06em]">RECENT ORDERS</div>
          <Link href="/admin/orders" className="text-[11px] text-white no-underline tracking-[0.1em] hover:text-[#e8c46a] transition-colors">
            VIEW ALL →
          </Link>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-[#444] text-[13px]">Loading...</div>
        ) : recentOrders.length === 0 ? (
          <div className="px-6 py-8 text-[#444] text-[13px]">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  {["Order ID", "Items", "Total", "Status", "Date"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-[10px] tracking-[0.15em] text-white uppercase font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const statusKey = order.status?.toLowerCase();
                  const statusClasses = STATUS_COLORS[statusKey] || "text-white bg-[#88888818] border-[#88888833]";
                  return (
                    <tr key={order._id} className="border-b border-[#171717] hover:bg-[#141414] transition-colors">
                      <td className="px-6 py-3.5 text-[12px] text-white font-mono whitespace-nowrap">
                        <Link href={`/admin/orders/${order._id}`} className="text-[#e8c46a] no-underline hover:underline">
                          #{String(order._id).slice(-8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5 text-[13px] text-white whitespace-nowrap">{order.items?.length || 0} item(s)</td>
                      <td className="px-6 py-3.5 text-[13px] text-white font-semibold whitespace-nowrap">₦{getTotal(order)}</td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span className={`text-[10px] tracking-[0.12em] uppercase border px-2 py-0.5 rounded ${statusClasses}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-[12px] text-white whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}