// app/admin/customers/[id]/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const STATUS_COLORS = {
  confirmed:  "#e8c46a", pending:   "#e8c46a",
  processing: "#6ab4e8", processed: "#6ab4e8",
  shipped:    "#a06ae8", delivered: "#6ae8a0",
  cancelled:  "#e86a6a",
};

const getTotal = (order) => {
  if (order.total != null)    return parseFloat(order.total).toLocaleString();
  if (order.subTotal != null) return parseFloat(order.subTotal).toLocaleString();
  return "—";
};

export default function AdminCustomerDetailPage() {
  const { id } = useParams();
  const [user,     setUser]     = useState(null);
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState(null);
  const [role,     setRole]     = useState("user");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then(r => r.json())
      .then(data => {
        setUser(data.user);
        setOrders(data.orders || []);
        setRole(data.user?.role || "user");
        setIsActive(data.user?.isActive !== false);
        setLoading(false);
      });
  }, [id]);

  const saveChanges = async () => {
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, isActive }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        const data = await res.json();
        setError(data.message);
      }
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-[#444] text-[13px] pt-10">Loading customer...</div>;
  if (!user)   return <div className="text-[#e86a6a] text-[13px] pt-10">Customer not found.</div>;

  const currentIsActive = user.isActive ?? true;
  const hasChanges      = role !== user.role || isActive !== currentIsActive;
  const fullName        = [user.firstName, user.lastName].filter(Boolean).join(" ") || "—";
  const initials        = ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || user.email?.[0]?.toUpperCase() || "?";
  const totalSpent      = orders.reduce((acc, o) => acc + parseFloat(o.total || o.subTotal || 0), 0);

  const isAdmin    = user.role === "admin";
  const avatarText = isAdmin ? "text-[#e8c46a]" : "text-[#6ab4e8]";
  const avatarBg   = isAdmin ? "bg-[#e8c46a18]" : "bg-[#6ab4e818]";
  const avatarBorder = isAdmin ? "border-[#e8c46a33]" : "border-[#6ab4e833]";

  const profileFields = [
    { label: "Email",            value: user.email },
    { label: "Phone",            value: user.phone || "—" },
    { label: "Additional Phone", value: user.addPhone || "—" },
    { label: "Date of Birth",    value: user.dob || "—" },
    { label: "Address",          value: user.address || "—" },
    { label: "City",             value: user.city || "—" },
    { label: "Region",           value: user.region?.name || "—" },
    { label: "Country",          value: user.country || "—" },
  ];

  return (
    <div className="max-w-[960px]">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/customers" className="text-[11px] text-[#555] no-underline tracking-[0.1em] hover:text-[#888] transition-colors">
          ← BACK TO CUSTOMERS
        </Link>
        <div className="mt-4 flex items-center gap-4">
          <div className={`w-[52px] h-[52px] rounded-full border flex items-center justify-center text-lg font-bold flex-shrink-0 ${avatarText} ${avatarBg} ${avatarBorder}`}>
            {initials}
          </div>
          <div>
            <div className="text-[11px] tracking-[0.2em] text-[#555] uppercase mb-1">Customer</div>
            <h1 className="m-0 text-[24px] font-bold text-[#e8e8e8] tracking-tight flex items-center flex-wrap gap-3">
              {fullName}
              {user.isActive === false && (
                <span className="text-[11px] text-[#e86a6a] tracking-[0.1em] bg-[#e86a6a18] border border-[#e86a6a33] px-2 py-0.5 rounded uppercase align-middle">
                  SUSPENDED
                </span>
              )}
            </h1>
          </div>
        </div>
      </div>

      {/* Two-col on md+, stacked on mobile */}
      <div className="flex flex-col md:grid md:grid-cols-[1fr_280px] gap-5">

        {/* Left */}
        <div>
          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Total Orders", value: orders.length },
              { label: "Total Spent",  value: `₦${totalSpent.toLocaleString()}` },
              { label: "Member Since", value: new Date(user.createdAt).toLocaleDateString() },
            ].map(s => (
              <div key={s.label} className="bg-[#111] border border-[#222] rounded-lg p-4 md:p-5">
                <div className="text-[10px] tracking-[0.15em] text-[#444] uppercase mb-2">{s.label}</div>
                <div className="text-lg md:text-[20px] font-bold text-[#e8e8e8] leading-tight truncate">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Profile Info */}
          <div className="bg-[#111] border border-[#222] rounded-lg p-5 mb-5">
            <div className="text-[10px] tracking-[0.15em] text-[#444] uppercase mb-4">Profile Info</div>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {profileFields.map(f => (
                <div key={f.label} className="py-2.5 border-b border-[#171717]">
                  <div className="text-[10px] tracking-[0.12em] text-[#444] uppercase mb-1">{f.label}</div>
                  <div className="text-[13px] text-[#888] break-all">{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Order History */}
          <div className="bg-[#111] border border-[#222] rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1a1a1a]">
              <div className="text-[10px] tracking-[0.15em] text-[#444] uppercase">
                Order History ({orders.length})
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="py-8 text-[#444] text-[13px] text-center">No orders yet.</div>
            ) : (
              <>
                {/* Desktop order table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full border-collapse min-w-[420px]">
                    <thead>
                      <tr className="border-b border-[#1a1a1a]">
                        {["Order ID","Items","Total","Status","Date"].map(h => (
                          <th key={h} className="px-5 py-2.5 text-left text-[10px] tracking-[0.12em] text-[#444] uppercase whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => {
                        const sColor = STATUS_COLORS[order.status?.toLowerCase()] || "#888";
                        return (
                          <tr key={order._id} className="border-b border-[#161616] hover:bg-[#141414] transition-colors">
                            <td className="px-5 py-3 whitespace-nowrap">
                              <Link href={`/admin/orders/${order._id}`} className="text-[12px] text-[#e8c46a] no-underline font-mono hover:underline">
                                #{String(order._id).slice(-8).toUpperCase()}
                              </Link>
                            </td>
                            <td className="px-5 py-3 text-[13px] text-[#666]">{order.items?.length || 0}</td>
                            <td className="px-5 py-3 text-[13px] text-[#e8e8e8] font-semibold whitespace-nowrap">₦{getTotal(order)}</td>
                            <td className="px-5 py-3 whitespace-nowrap">
                              <span className="text-[10px] tracking-[0.08em] uppercase px-2 py-0.5 rounded border"
                                style={{ color: sColor, background: sColor + "18", borderColor: sColor + "33" }}>
                                {order.status}
                              </span>
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
                <div className="sm:hidden flex flex-col divide-y divide-[#161616]">
                  {orders.map(order => {
                    const sColor = STATUS_COLORS[order.status?.toLowerCase()] || "#888";
                    return (
                      <div key={order._id} className="px-4 py-3 hover:bg-[#141414] transition-colors">
                        <div className="flex justify-between items-start mb-1.5">
                          <Link href={`/admin/orders/${order._id}`} className="text-[12px] text-[#e8c46a] no-underline font-mono hover:underline">
                            #{String(order._id).slice(-8).toUpperCase()}
                          </Link>
                          <span className="text-[13px] text-[#e8e8e8] font-semibold">₦{getTotal(order)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] tracking-[0.08em] uppercase px-2 py-0.5 rounded border"
                              style={{ color: sColor, background: sColor + "18", borderColor: sColor + "33" }}>
                              {order.status}
                            </span>
                            <span className="text-[11px] text-[#444]">{order.items?.length || 0} item(s)</span>
                          </div>
                          <span className="text-[11px] text-[#555]">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Actions Panel */}
        <div>
          <div className="bg-[#111] border border-[#222] rounded-lg p-5 md:sticky md:top-5">
            <div className="text-[10px] tracking-[0.15em] text-[#444] uppercase mb-5">Account Controls</div>

            {/* Role */}
            <div className="mb-5">
              <div className="text-[10px] tracking-[0.12em] text-[#444] uppercase mb-2">Role</div>
              <div className="flex gap-2">
                {["user", "admin"].map(r => (
                  <button key={r} onClick={() => setRole(r)}
                    className={`flex-1 py-2.5 rounded-md cursor-pointer text-[11px] tracking-[0.1em] uppercase border transition-all font-mono
                      ${role === r
                        ? r === "admin"
                          ? "border-[#e8c46a] bg-[#e8c46a12] text-[#e8c46a] font-bold"
                          : "border-[#6ab4e8] bg-[#6ab4e812] text-[#6ab4e8] font-bold"
                        : "border-[#222] bg-transparent text-[#444] hover:border-[#333] hover:text-[#666]"
                      }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Status */}
            <div className="mb-6">
              <div className="text-[10px] tracking-[0.12em] text-[#444] uppercase mb-2">Account Status</div>
              <button onClick={() => setIsActive(a => !a)}
                className={`w-full py-2.5 rounded-md cursor-pointer text-[11px] tracking-[0.12em] uppercase font-semibold border transition-all font-mono
                  ${isActive
                    ? "border-[#6ae8a033] bg-[#6ae8a012] text-[#6ae8a0] hover:bg-[#6ae8a01a]"
                    : "border-[#e86a6a33] bg-[#e86a6a12] text-[#e86a6a] hover:bg-[#e86a6a1a]"
                  }`}>
                {isActive ? "● Active — Click to Suspend" : "● Suspended — Click to Restore"}
              </button>
              <div className={`text-[11px] mt-1.5 leading-relaxed ${isActive ? "text-[#333]" : "text-[#444]"}`}>
                {isActive ? "Customer can log in and place orders." : "Customer account is suspended."}
              </div>
            </div>

            {error && (
              <div className="px-3 py-2.5 bg-[#e86a6a18] border border-[#e86a6a33] rounded-md text-[#e86a6a] text-[12px] mb-3">
                {error}
              </div>
            )}

            <button onClick={saveChanges} disabled={saving || saved || !hasChanges}
              className={`w-full py-3 border-none rounded-md text-[11px] tracking-[0.15em] uppercase font-bold transition-all font-mono
                ${saved       ? "bg-[#1a2e1a] text-[#6ae8a0] cursor-default"
                : saving      ? "bg-[#1a1a1a] text-[#444] cursor-default"
                : hasChanges  ? "bg-[#e8c46a] text-[#0a0a0a] cursor-pointer hover:bg-[#d4b05e]"
                : "bg-[#141414] text-[#333] cursor-default"
                }`}>
              {saved ? "✓ Saved" : saving ? "Saving..." : "Save Changes"}
            </button>

            {/* Quick Links */}
            <div className="mt-5 pt-4 border-t border-[#1a1a1a]">
              <div className="text-[10px] tracking-[0.12em] text-[#444] uppercase mb-2.5">Quick Links</div>
              <a href={`mailto:${user.email}`}
                className="block py-2 text-[12px] text-[#555] no-underline border-b border-[#161616] transition-colors hover:text-[#888]">
                ✉ Email customer
              </a>
              {orders.length > 0 && (
                <Link href={`/admin/orders?search=${user._id}`}
                  className="block pt-2 text-[12px] text-[#555] no-underline transition-colors hover:text-[#888]">
                  ◈ View all orders
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}