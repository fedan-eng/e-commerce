// components/admin/AdminContext.jsx
// The signed-in admin plus the "things waiting on you" counts that the
// sidebar badges, the notification bell and the dashboard all share.
"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const AdminContext = createContext({ user: null, alerts: null, refreshAlerts: () => {} });

export const useAdmin = () => useContext(AdminContext);

const STALE_DAYS = 3; // a confirmed order older than this needs a nudge

const total = url =>
  fetch(url, { cache: "no-store" })
    .then(r => (r.ok ? r.json() : {}))
    .then(d => d.total || 0)
    .catch(() => 0);

export function AdminProvider({ user, children }) {
  const [alerts, setAlerts] = useState(null);

  const refreshAlerts = useCallback(async () => {
    const staleBefore = new Date(Date.now() - STALE_DAYS * 86400000).toISOString();
    const [pendingReviews, confirmedOrders, staleOrders, outOfStock, abandonedCarts, recent] = await Promise.all([
      total("/api/admin/reviews?status=pending&limit=1"),
      total("/api/admin/orders?status=confirmed&limit=1"),
      total(`/api/admin/orders?status=confirmed&limit=1&to=${encodeURIComponent(staleBefore)}`),
      total("/api/products?availability=outOfStock&limit=1"),
      total("/api/admin/users?cartStatus=abandoned&limit=1"),
      fetch("/api/admin/orders?limit=5", { cache: "no-store" })
        .then(r => (r.ok ? r.json() : {}))
        .then(d => d.orders || [])
        .catch(() => []),
    ]);
    setAlerts({ pendingReviews, confirmedOrders, staleOrders, staleDays: STALE_DAYS, outOfStock, abandonedCarts, recentOrders: recent });
  }, []);

  useEffect(() => {
    if (user) refreshAlerts();
  }, [user, refreshAlerts]);

  return (
    <AdminContext.Provider value={{ user, alerts, refreshAlerts }}>
      {children}
    </AdminContext.Provider>
  );
}
