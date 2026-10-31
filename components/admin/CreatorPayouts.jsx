// components/admin/CreatorPayouts.jsx
// Creators page: what one creator has earned, what's been sent to them, and a form to record a payout.
// Earned = commission on paid and delivered orders (lib/creatorStats.js). The creator sees the same on /creator.
"use client";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ExternalLink, Trash2 } from "lucide-react";
import { Card, CardHeader, Button, IconButton, Field, Skeleton, inputCls } from "./ui";
import { money } from "./format";

const today = () => new Date().toLocaleDateString("en-CA");
const fmtDate = d => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function CreatorPayouts({ code, name }) {
  const [data,   setData]   = useState(null);
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(today);
  const [note,   setNote]   = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setData(null);
    try {
      const res = await fetch(`/api/admin/creators/payouts?code=${encodeURIComponent(code)}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const body = await res.json();
      setData(body);
      setAmount(body.balance.owed > 0 ? String(body.balance.owed) : "");
    } catch {
      toast.error("Couldn't load payouts");
    }
  }, [code]);

  useEffect(() => { load(); }, [load]);

  const record = async e => {
    e.preventDefault();
    const n = Number(amount);
    if (!(n > 0)) return toast.error("Enter an amount above ₦0");
    if (n > data.balance.owed && !window.confirm(`That's more than the ${money(data.balance.owed)} ${name} is owed. Record it anyway?`)) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/creators/payouts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, amount: n, paidAt, note }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Couldn't record the payout");
      setData(body);
      setAmount(body.balance.owed > 0 ? String(body.balance.owed) : "");
      setNote("");
      toast.success(`${money(n)} payout recorded`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async p => {
    if (!window.confirm(`Delete the ${money(p.amount)} payout from ${fmtDate(p.paidAt)}? ${name} will be shown as owed that amount again.`)) return;
    const res = await fetch(`/api/admin/creators/payouts/${p.id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Couldn't delete the payout");
    toast.success("Payout deleted");
    load();
  };

  const b = data?.balance;
  const tiles = b && [
    { label: "Earned",   value: b.earned,  hint: "Paid and delivered" },
    { label: "Pending",  value: b.pending, hint: "Not delivered yet" },
    { label: "Paid out", value: b.paidOut },
    { label: "Owed",     value: b.owed,    strong: true },
  ];

  return (
    <Card>
      <CardHeader
        title={`Payouts · ${name}`}
        description="All time, whatever the date range above. They see the same numbers on their dashboard."
        action={<Button size="sm" href={`/creator?code=${encodeURIComponent(code)}`}>Their dashboard <ExternalLink size={13} aria-hidden /></Button>}
      />
      <div className="flex flex-col gap-5 px-5 pb-5">
        {!data ? <Skeleton className="h-16 w-full" /> : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {tiles.map(t => (
              <div key={t.label} className="rounded-lg bg-[#f6f8f7] px-4 py-3">
                <div className="text-xs text-sub">{t.label}</div>
                <div className={t.strong ? "font-poppins text-lg font-semibold text-pine" : "font-poppins text-lg font-semibold text-ink"}>{money(t.value)}</div>
                {t.hint && <div className="text-[11px] text-faint">{t.hint}</div>}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={record} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[140px_160px_minmax(0,1fr)_auto]">
          <Field label="Amount (₦)">
            <input className={inputCls} type="number" min="0" step="0.01" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} />
          </Field>
          <Field label="Paid on">
            <input className={inputCls} type="date" value={paidAt} max={today()} onChange={e => setPaidAt(e.target.value)} />
          </Field>
          <Field label="Note (they can see it)">
            <input className={inputCls} value={note} maxLength={200} placeholder="e.g. Transfer ref 0123…" onChange={e => setNote(e.target.value)} />
          </Field>
          <Button type="submit" variant="primary" disabled={saving || !data}>{saving ? "Saving…" : "Record payout"}</Button>
        </form>

        {data?.payouts.length > 0 && (
          <ul className="m-0 flex list-none flex-col p-0">
            {data.payouts.map(p => (
              <li key={p.id} className="flex items-center gap-3 border-t border-[#eef0ef] py-2.5 text-[13px]">
                <span className="w-28 shrink-0 text-sub">{fmtDate(p.paidAt)}</span>
                <span className="min-w-0 flex-1 truncate text-faint">{p.note}</span>
                <span className="shrink-0 font-medium">{money(p.amount)}</span>
                <IconButton label="Delete payout" className="h-8 w-8" onClick={() => remove(p)}><Trash2 size={15} aria-hidden /></IconButton>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
