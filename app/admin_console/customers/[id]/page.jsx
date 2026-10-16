// app/admin_console/customers/[id]/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const STATUS_COLORS = {
  confirmed:  "#b7791f", pending:   "#b7791f",
  processing: "#1d6fb0", processed: "#1d6fb0",
  shipped:    "#6d3fc8", delivered: "#15803d",
  cancelled:  "#c53030",
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

  if (loading) return <div className="flex items-center gap-3 text-faint text-[13px] pt-10"><div className="w-6 h-6 rounded-full border-[3px] border-mint border-t-pine animate-spin" /> Loading customer…</div>;
  if (!user)   return <div className="text-[#c53030] text-[13px] pt-10">Customer not found.</div>;

  const currentIsActive = user.isActive ?? true;
  const hasChanges      = role !== user.role || isActive !== currentIsActive;
  const fullName        = [user.firstName, user.lastName].filter(Boolean).join(" ") || "—";
  const initials        = ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || user.email?.[0]?.toUpperCase() || "?";
  const totalSpent      = orders.reduce((acc, o) => acc + parseFloat(o.total || o.subTotal || 0), 0);

  const isAdmin    = user.role === "admin";
  const avatarText = isAdmin ? "text-pine" : "text-[#1d6fb0]";
  const avatarBg   = isAdmin ? "bg-zest/35" : "bg-[#e7f1fb]";
  const avatarBorder = isAdmin ? "border-pine/25" : "border-[#c3dbf1]";

  const profileFields = [
    { label: "Email",            value: user.email },
    { label: "Provider",         value: user.provider === "google" ? "Google" : "Email/Password" },
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
        <Link href="/admin_console/customers" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-pine no-underline bg-white border border-line rounded-full px-3.5 py-1.5 hover:bg-mint transition-colors">
          ← Back to customers
        </Link>
        <div className="mt-4 flex items-center gap-4">
          <div className={`w-[60px] h-[60px] rounded-2xl rotate-[-4deg] border flex items-center justify-center text-lg font-bold flex-shrink-0 ${avatarText} ${avatarBg} ${avatarBorder}`}>
            {initials}
          </div>
          <div>
            <div className="inline-flex items-center text-[11px] font-semibold text-pine bg-zest px-2.5 py-0.5 rounded-full mb-2">Customer</div>
            <h1 className="m-0 text-[28px] font-poppins font-bold text-pine leading-tight flex items-center flex-wrap gap-3">
              {fullName}
              {user.isActive === false && (
                <span className="text-[11px] font-semibold text-[#c53030] bg-[#fdecec] border border-[#f3c4c4] px-2.5 py-0.5 rounded-full font-roboto align-middle">
                  Suspended
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
              { label: "Total Orders", value: orders.length,                                   cls: "bg-white border border-line" },
              { label: "Total Spent",  value: `₦${totalSpent.toLocaleString()}`,               cls: "bg-pine border border-pine [&>div:last-child]:text-zest [&>div:first-child]:text-white/70" },
              { label: "Member Since", value: new Date(user.createdAt).toLocaleDateString(), cls: "bg-white border border-line" },
            ].map(s => (
              <div key={s.label} className={`rounded-3xl p-4 md:p-5 ${s.cls}`}>
                <div className="text-[15px] font-poppins font-semibold text-pine mb-2">{s.label}</div>
                <div className="text-lg md:text-[20px] font-poppins font-bold text-ink leading-tight truncate">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Profile Info */}
          <div className="bg-white border border-line rounded-3xl p-5 mb-5">
            <div className="text-[15px] font-poppins font-semibold text-pine mb-4">Profile Info</div>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {profileFields.map(f => (
                <div key={f.label} className="py-2.5 border-b border-line">
                  <div className="text-[12px] font-medium text-faint mb-1">{f.label}</div>
                  <div className="text-[13px] text-muted break-all">{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Cart */}
          <div className="bg-white border border-line rounded-3xl overflow-hidden mb-5">
            <div className="px-5 py-4 border-b border-line">
              <div className="flex items-center justify-between">
                <div className="text-[15px] font-poppins font-semibold text-pine">
                  Current Cart ({user.cart?.items?.length || 0})
                </div>
                {user.cart?.updatedAt && (
                  <div className="text-[10px] text-faint">
                    Last updated: {new Date(user.cart.updatedAt).toLocaleDateString()} {new Date(user.cart.updatedAt).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>

            {(!user.cart?.items || user.cart.items.length === 0) ? (
              <div className="py-8 text-faint text-[13px] text-center"><div className="text-2xl mb-1" aria-hidden>🛒</div>No items in cart.</div>
            ) : (
              <>
                {/* Desktop cart table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-sage">
                        {["Product","Price","Qty","Color","Total"].map(h => (
                          <th key={h} className="px-5 py-2.5 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {user.cart.items.map((item, idx) => {
                        const itemTotal = (item.price || 0) * (item.quantity || 1);
                        return (
                          <tr key={idx} className="border-b border-line hover:bg-[#fafcf9] transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <img 
                                    src={item.image} 
                                    alt={item.name}
                                    className="w-10 h-10 object-cover rounded-lg border border-line"
                                  />
                                )}
                                <div className="text-[13px] text-ink">{item.name || "—"}</div>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-[13px] text-muted whitespace-nowrap">₦{(item.price || 0).toLocaleString()}</td>
                            <td className="px-5 py-3 text-[13px] text-ink whitespace-nowrap">{item.quantity || 1}</td>
                            <td className="px-5 py-3 text-[12px] text-faint whitespace-nowrap">{item.color || "—"}</td>
                            <td className="px-5 py-3 text-[13px] text-ink font-semibold whitespace-nowrap">₦{itemTotal.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cart cards */}
                <div className="sm:hidden flex flex-col divide-y divide-line">
                  {user.cart.items.map((item, idx) => {
                    const itemTotal = (item.price || 0) * (item.quantity || 1);
                    return (
                      <div key={idx} className="px-4 py-3 hover:bg-[#fafcf9] transition-colors">
                        <div className="flex items-start gap-3 mb-2">
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg border border-line flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] text-ink font-medium truncate">{item.name || "—"}</div>
                            <div className="text-[11px] text-faint mt-0.5">{item.color || "—"}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] text-faint">
                            Qty: {item.quantity || 1} × ₦{(item.price || 0).toLocaleString()}
                          </div>
                          <div className="text-[13px] text-ink font-semibold">₦{itemTotal.toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cart total */}
                <div className="px-5 py-3 border-t border-line bg-canvas">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-medium text-faint">Cart Total</span>
                    <span className="text-[17px] font-poppins font-bold text-pine">
                      ₦{user.cart.items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Order History */}
          <div className="bg-white border border-line rounded-3xl overflow-hidden">
            <div className="px-5 py-4 border-b border-line">
              <div className="text-[15px] font-poppins font-semibold text-pine">
                Order History ({orders.length})
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="py-8 text-faint text-[13px] text-center"><div className="text-2xl mb-1" aria-hidden>📭</div>No orders yet.</div>
            ) : (
              <>
                {/* Desktop order table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full border-collapse min-w-[420px]">
                    <thead>
                      <tr className="bg-sage">
                        {["Order ID","Items","Total","Status","Date"].map(h => (
                          <th key={h} className="px-5 py-2.5 text-left text-[11px] tracking-[0.08em] text-faint uppercase font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => {
                        const sColor = STATUS_COLORS[order.status?.toLowerCase()] || "#7c8b84";
                        return (
                          <tr key={order._id} className="border-b border-line hover:bg-[#fafcf9] transition-colors">
                            <td className="px-5 py-3 whitespace-nowrap">
                              <Link href={`/admin_console/orders/${order._id}`} className="text-[12px] font-semibold text-pine no-underline hover:underline">
                                #{String(order._id).slice(-8).toUpperCase()}
                              </Link>
                            </td>
                            <td className="px-5 py-3 text-[13px] text-faint">{order.items?.length || 0}</td>
                            <td className="px-5 py-3 text-[13px] text-ink font-semibold whitespace-nowrap">₦{getTotal(order)}</td>
                            <td className="px-5 py-3 whitespace-nowrap">
                              <span className="text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full border"
                                style={{ color: sColor, background: sColor + "18", borderColor: sColor + "33" }}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-[12px] text-ink whitespace-nowrap">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile order cards */}
                <div className="sm:hidden flex flex-col divide-y divide-line">
                  {orders.map(order => {
                    const sColor = STATUS_COLORS[order.status?.toLowerCase()] || "#7c8b84";
                    return (
                      <div key={order._id} className="px-4 py-3 hover:bg-[#fafcf9] transition-colors">
                        <div className="flex justify-between items-start mb-1.5">
                          <Link href={`/admin_console/orders/${order._id}`} className="text-[12px] font-semibold text-pine no-underline hover:underline">
                            #{String(order._id).slice(-8).toUpperCase()}
                          </Link>
                          <span className="text-[13px] text-ink font-semibold">₦{getTotal(order)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full border"
                              style={{ color: sColor, background: sColor + "18", borderColor: sColor + "33" }}>
                              {order.status}
                            </span>
                            <span className="text-[11px] text-faint">{order.items?.length || 0} item(s)</span>
                          </div>
                          <span className="text-[11px] text-ink">{new Date(order.createdAt).toLocaleDateString()}</span>
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
          <div className="bg-white border border-line rounded-3xl p-5 md:sticky md:top-5">
            <div className="text-[15px] font-poppins font-semibold text-pine mb-5">Account Controls</div>

            {/* Role */}
            <div className="mb-5">
              <div className="text-[12px] font-medium text-faint mb-2">Role</div>
              <div className="flex gap-2">
                {["user", "admin"].map(r => (
                  <button key={r} onClick={() => setRole(r)}
                    className={`flex-1 py-2.5 rounded-full cursor-pointer text-[13px] font-semibold border transition-all
                      ${role === r
                        ? r === "admin"
                          ? "border-pine bg-zest/35 text-pine font-bold"
                          : "border-[#1d6fb0] bg-[#e7f1fb] text-[#1d6fb0] font-bold"
                        : "border-line bg-transparent text-faint hover:border-pine hover:text-pine"
                      }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Status */}
            <div className="mb-6">
              <div className="text-[12px] font-medium text-faint mb-2">Account Status</div>
              <button onClick={() => setIsActive(a => !a)}
                className={`w-full py-2.5 rounded-full cursor-pointer text-[13px] font-semibold border transition-all
                  ${isActive
                    ? "border-[#bfe5cc] bg-[#e3f6e9] text-[#15803d] hover:bg-[#e3f6e9]"
                    : "border-[#f3c4c4] bg-[#fdecec] text-[#c53030] hover:bg-[#fdecec]"
                  }`}>
                {isActive ? "● Active · tap to suspend" : "● Suspended · tap to restore"}
              </button>
              <div className={`text-[11px] mt-1.5 leading-relaxed ${isActive ? "text-ghost" : "text-faint"}`}>
                {isActive ? "Customer can log in and place orders." : "Customer account is suspended."}
              </div>
            </div>

            {error && (
              <div className="px-3 py-2.5 bg-[#fdecec] border border-[#f3c4c4] rounded-xl text-[#c53030] text-[12px] mb-3">
                {error}
              </div>
            )}

            <button onClick={saveChanges} disabled={saving || saved || !hasChanges}
              className={`w-full h-11 border-none rounded-full text-[13px] font-semibold transition-all
                ${saved       ? "bg-mint text-[#15803d] cursor-default"
                : saving      ? "bg-sage text-faint cursor-default"
                : hasChanges  ? "bg-pine text-white cursor-pointer hover:bg-pine-deep"
                : "bg-white text-ghost cursor-default"
                }`}>
              {saved ? "✓ Saved" : saving ? "Saving..." : "Save Changes"}
            </button>

            {/* Quick Links */}
            <div className="mt-5 pt-4 border-t border-line">
              <div className="text-[12px] font-medium text-faint mb-2.5">Quick Links</div>
              <a href={`mailto:${user.email}`}
                className="flex items-center gap-2 px-3.5 h-10 mb-2 rounded-full bg-sage text-[13px] font-medium text-pine no-underline transition-colors hover:bg-mint">
                ✉️ Email customer
              </a>
              {orders.length > 0 && (
                <Link href={`/admin_console/orders?search=${user._id}`}
                  className="flex items-center gap-2 px-3.5 h-10 rounded-full bg-sage text-[13px] font-medium text-pine no-underline transition-colors hover:bg-mint">
                  🧾 View all orders
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}