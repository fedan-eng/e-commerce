// app/admin_console/customers/[id]/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { MessageCircle, Phone, Mail, ShoppingBag, ShoppingCart, Users, ExternalLink } from "lucide-react";
import { shortId } from "@/lib/orderStatus";
import {
  PageHeader, Card, CardHeader, Button, Tabs, Segmented, Switch, Checkbox, StatusBadge, Avatar, EmptyState, Spinner, TH, TD, cx,
} from "@/components/admin/ui";
import { money, localPhone, telLink, whatsappLink } from "@/components/admin/format";

const fmtDate = d => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const orderTotal = o => parseFloat(o.total ?? o.subTotal ?? 0);
const ROLE_LABELS = { user: "Customer", creator: "Creator", admin: "Admin" };
const ROLE_CONFIRM = {
  admin:   "Give this account admin access? They'll be able to manage orders, products and customers.",
  creator: "Make this account a creator? They'll see orders, first names and commission for the codes you picked, at /creator.",
  user:    "Make this a regular customer account? They'll lose access to their current dashboard.",
};
const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));

function ProfileRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#eef0ef] py-2.5 text-[13px] last:border-0">
      <span className="shrink-0 text-faint">{label}</span>
      <span className="min-w-0 break-words text-right text-ink">{value || "—"}</span>
    </div>
  );
}

export default function AdminCustomerDetailPage() {
  const { id } = useParams();
  const [user,     setUser]     = useState(null);
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [role,     setRole]     = useState("user");
  const [isActive, setIsActive] = useState(true);
  const [tab,      setTab]      = useState("orders");
  const [creatorCodes, setCreatorCodes] = useState([]); // every creator code, with who it's linked to
  const [linked,   setLinked]   = useState([]);         // ids picked for this account

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then(r => r.json())
      .then(data => {
        setUser(data.user);
        setOrders(data.orders || []);
        setRole(data.user?.role || "user");
        setIsActive(data.user?.isActive !== false);
        setCreatorCodes(data.creatorCodes || []);
        setLinked((data.creatorCodes || []).filter(c => c.linkedTo === id).map(c => c._id));
      })
      .catch(() => toast.error("Couldn't load this customer"))
      .finally(() => setLoading(false));
  }, [id]);

  const saveChanges = async () => {
    if (role === "creator" && !linked.length) return toast.error("Pick at least one creator code for their dashboard");
    if (role !== user.role && !window.confirm(ROLE_CONFIRM[role])) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, isActive, ...(role === "creator" && { creatorCodes: linked }) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Couldn't save changes");
      setUser(data.user);
      if (role === "creator") setCreatorCodes(list => list.map(c => ({
        ...c, linkedTo: linked.includes(c._id) ? id : c.linkedTo === id ? null : c.linkedTo,
      })));
      toast.success("Account updated");
    } catch (err) {
      toast.error(err.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!user) {
    return (
      <Card>
        <EmptyState
          icon={Users}
          title="Customer not found"
          description="The account may have been deleted."
          action={<Button href="/admin_console/customers">Back to customers</Button>}
        />
      </Card>
    );
  }

  const currentIsActive = user.isActive ?? true;
  const savedLinks      = creatorCodes.filter(c => c.linkedTo === id).map(c => c._id);
  const hasChanges      = role !== user.role || isActive !== currentIsActive || (role === "creator" && !sameSet(linked, savedLinks));
  const name            = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const phone           = localPhone(user.phone);
  const totalSpent      = orders.reduce((acc, o) => acc + orderTotal(o), 0);
  const cartItems       = user.cart?.items || [];
  const cartTotal       = cartItems.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            <Avatar first={user.firstName} last={user.lastName} email={user.email} size="lg" />
            <span className="min-w-0">
              <span className="block">{name}</span>
              <span className="mt-1 flex flex-wrap gap-1.5 font-roboto text-xs font-medium tracking-normal">
                <span className={cx("rounded-full px-2 py-0.5", user.role !== "user" ? "bg-pine-tint text-pine" : "bg-[#f1f3f2] text-sub")}>
                  {ROLE_LABELS[user.role] || "Customer"}
                </span>
                {user.isActive === false && <span className="rounded-full bg-[#fdeeee] px-2 py-0.5 text-[#b91c1c]">Suspended</span>}
                <span className="rounded-full bg-[#f1f3f2] px-2 py-0.5 text-sub">{user.provider === "google" ? "Google sign-in" : "Email sign-in"}</span>
              </span>
            </span>
          </span>
        }
        actions={
          <>
            {phone && <Button onClick={() => window.open(whatsappLink(phone, `Hi ${user.firstName || ""}, this is FIL.`), "_blank", "noopener")}><MessageCircle size={16} aria-hidden /> WhatsApp</Button>}
            {phone && <Button href={telLink(phone)}><Phone size={16} aria-hidden /> Call</Button>}
            <Button variant="primary" href={`mailto:${user.email}`}><Mail size={16} aria-hidden /> Email</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { label: "Orders",        value: orders.length.toLocaleString() },
          { label: "Total spent",   value: money(totalSpent) },
          { label: "Average order", value: money(orders.length ? totalSpent / orders.length : 0) },
          { label: "Member since",  value: fmtDate(user.createdAt) },
        ].map(s => (
          <Card key={s.label} className="px-5 py-4">
            <div className="text-[13px] text-sub">{s.label}</div>
            <div className="mt-1 break-words font-poppins text-lg font-semibold text-ink sm:text-xl">{s.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0">
          <Tabs
            label="Customer activity"
            value={tab}
            onChange={setTab}
            tabs={[
              { value: "orders", label: "Orders", count: orders.length },
              { value: "cart",   label: "Cart",   count: cartItems.length },
            ]}
          />

          {tab === "orders" && (orders.length === 0 ? (
            <EmptyState icon={ShoppingBag} title="No orders yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className={cx(TH, "border-t-0")}>Order</th>
                    <th className={cx(TH, "border-t-0")}>Date</th>
                    <th className={cx(TH, "border-t-0")}>Items</th>
                    <th className={cx(TH, "border-t-0 text-right")}>Total</th>
                    <th className={cx(TH, "border-t-0")}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id} className="hover:bg-[#fafbfa]">
                      <td className={TD}><Link href={`/admin_console/orders/${o._id}`} className="font-medium text-pine no-underline hover:underline">#{shortId(o._id)}</Link></td>
                      <td className={cx(TD, "whitespace-nowrap text-sub")}>{fmtDate(o.createdAt)}</td>
                      <td className={cx(TD, "text-sub")}>{o.items?.length || 0}</td>
                      <td className={cx(TD, "whitespace-nowrap text-right font-medium")}>{money(orderTotal(o))}</td>
                      <td className={TD}><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {tab === "cart" && (cartItems.length === 0 ? (
            <EmptyState icon={ShoppingCart} title="Cart is empty" />
          ) : (
            <>
              {user.cart?.updatedAt && (
                <p className="m-0 px-5 pt-3 text-xs text-faint">Last updated {new Date(user.cart.updatedAt).toLocaleString("en-GB")}</p>
              )}
              <div className="flex flex-col">
                {cartItems.map((it, i) => (
                  <div key={i} className="flex items-center gap-3 border-b border-[#eef0ef] px-5 py-3">
                    {it.image
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={it.image} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-hover object-cover" />
                      : <span className="h-11 w-11 shrink-0 rounded-lg bg-hover" />}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium">{it.name || "—"}</div>
                      <div className="text-xs text-faint">{it.quantity || 1} × {money(it.price)}{it.color ? ` · ${it.color}` : ""}</div>
                    </div>
                    <div className="shrink-0 text-[13px] font-medium">{money((it.price || 0) * (it.quantity || 1))}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between px-5 py-3 text-[13px]">
                <span className="font-medium">Cart total</span>
                <span className="font-poppins text-base font-semibold">{money(cartTotal)}</span>
              </div>
            </>
          ))}
        </Card>

        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardHeader title="Profile" />
            <div className="px-5 pb-3">
              <ProfileRow label="Email" value={user.email} />
              <ProfileRow label="Phone" value={phone} />
              <ProfileRow label="Other phone" value={localPhone(user.addPhone)} />
              <ProfileRow label="Date of birth" value={user.dob} />
              <ProfileRow label="Address" value={user.address} />
              <ProfileRow label="City" value={user.city} />
              <ProfileRow label="Region" value={user.region?.name} />
              <ProfileRow label="Country" value={user.country} />
            </div>
          </Card>

          <Card className="px-5 py-4">
            <h2 className="m-0 mb-3 font-poppins text-[15px] font-semibold text-ink">Account</h2>
            <div className="mb-1.5 text-[13px] font-medium text-sub">Role</div>
            <Segmented
              label="Role"
              value={role}
              onChange={setRole}
              options={Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))}
            />
            {role === "creator" && (
              <div className="mt-4">
                <div className="mb-1.5 text-[13px] font-medium text-sub">Codes on their dashboard</div>
                {creatorCodes.length === 0 ? (
                  <p className="m-0 text-xs text-faint">
                    No creator codes yet. Make one on <Link href="/admin_console/promo-codes" className="text-pine">Promo codes</Link> with the type set to Creator.
                  </p>
                ) : (
                  <ul className="m-0 flex list-none flex-col gap-1 p-0">
                    {creatorCodes.map(c => {
                      const taken = c.linkedTo && c.linkedTo !== id;
                      return (
                        <li key={c._id}>
                          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-hover">
                            <span className="pt-0.5">
                              <Checkbox
                                label={c.code}
                                checked={linked.includes(c._id)}
                                onChange={e => setLinked(l => e.target.checked ? [...l, c._id] : l.filter(x => x !== c._id))}
                              />
                            </span>
                            <span className="min-w-0 text-[13px]">
                              <span className="block font-mono font-medium text-ink">{c.code}</span>
                              <span className="block text-xs text-faint">
                                {c.creatorName}{taken && " · linked to another account, picking it moves it here"}
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
            <div className="mt-4">
              <Switch
                label="Active"
                description={isActive ? "Can sign in and place orders" : "Suspended — can't sign in"}
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
              />
            </div>
            <Button variant="primary" className="mt-4 w-full" onClick={saveChanges} disabled={saving || !hasChanges}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
            {user.role === "creator" && savedLinks.length > 0 && (
              <Button
                variant="ghost"
                className="mt-2 w-full"
                href={`/creator?code=${encodeURIComponent(creatorCodes.find(c => c._id === savedLinks[0]).code)}`}
              >
                See their dashboard <ExternalLink size={14} aria-hidden />
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
