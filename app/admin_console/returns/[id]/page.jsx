// app/admin_console/returns/[id]/page.jsx
// One refund or return request: move it to the next step (the customer is emailed each time,
// with an optional message), keep internal notes, and see the customer, item and bank details.
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Check, Copy, ExternalLink, MessageCircle, Phone, Mail } from "lucide-react";
import {
  PageHeader, Card, CardHeader, Button, StatusBadge, EmptyState, Spinner, Field,
  inputCls, selectCls, textareaCls, cx,
} from "@/components/admin/ui";
import { money, localPhone, telLink, whatsappLink } from "@/components/admin/format";
import { useAdmin } from "@/components/admin/AdminContext";
import { shortId } from "@/lib/orderStatus";
import { REQUEST_TYPES, nextActions, statusInfo, statusLabel, statusesOf, isFinal } from "@/lib/returnRefund";

const fmtDateTime = d => new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

async function patch(id, body) {
  const res = await fetch(`/api/admin/returns/${id}`, {
    method: "PATCH",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);
  const data = await res?.json().catch(() => ({}));
  if (!res?.ok) throw new Error(data?.message || "Something went wrong");
  return data;
}

function copy(text, label) {
  navigator.clipboard?.writeText(String(text)).then(() => toast.success(`${label} copied`), () => {});
}

// Vertical steps with the date each was reached
function Steps({ request }) {
  const steps = REQUEST_TYPES[request.type].steps;
  const declined = request.status === "rejected";
  const current = steps.findIndex(s => s.key === request.status);
  const shown = declined ? [steps[0], { key: "rejected", label: "Declined" }] : steps;
  const reachedAt = key => [...(request.history || [])].reverse().find(h => h.status === key)?.date;

  return (
    <ol className="px-5 pb-5">
      {shown.map((step, i) => {
        const done = declined || i <= current;
        const now = declined ? i === shown.length - 1 : i === current;
        const when = reachedAt(step.key);
        return (
          <li key={step.key} className="relative flex gap-3 pb-4 last:pb-0">
            {i < shown.length - 1 && (
              <span className={cx("absolute left-[13px] top-7 h-[calc(100%-28px)] w-0.5", i < current || declined ? "bg-pine" : "bg-edge")} aria-hidden />
            )}
            <span className={cx(
              "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
              step.key === "rejected" ? "border-[#b91c1c] bg-[#b91c1c] text-white"
                : done ? "border-pine bg-pine text-white" : "border-edge bg-white text-faint",
              now && "ring-4 ring-pine/15",
            )}>
              {step.key === "rejected" ? "!" : done ? <Check size={14} strokeWidth={3} aria-hidden /> : i + 1}
            </span>
            <div className="pt-1">
              <div className={cx("text-[13px] font-medium", done ? "text-ink" : "text-faint")}>{step.label}</div>
              {when && <div className="text-xs text-faint">{fmtDateTime(when)}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// The next step: message to the customer, refund details when they're needed, and the buttons
function NextStep({ request, onSaved }) {
  const actions = nextActions(request.type, request.status);
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState(request.refundedAmount ?? request.amount ?? "");
  const [reference, setReference] = useState(request.refundReference || "");
  const [busy, setBusy] = useState("");
  const [fixStatus, setFixStatus] = useState("");
  const needsRefundDetails = actions.some(a => a.to === "refunded");

  const run = async (to) => {
    if (to === "rejected" && !message.trim()) return toast.error("Tell the customer why it was declined");
    setBusy(to);
    try {
      const body = { status: to, customerNote: message };
      if (to === "refunded") Object.assign(body, { refundedAmount: amount, refundReference: reference });
      const data = await patch(request._id, body);
      toast.success(data.emailed ? `${statusLabel(request.type, to)}: customer emailed` : `${statusLabel(request.type, to)}: saved (no email sent)`);
      setMessage("");
      onSaved(data.request);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy("");
    }
  };

  return (
    <Card>
      <CardHeader
        title={isFinal(request.type, request.status) ? "This request is closed" : "Next step"}
        description={isFinal(request.type, request.status)
          ? "Nothing left to do. You can still correct the status below."
          : "The customer gets an email with the new status and your message."}
      />
      <div className="flex flex-col gap-4 border-t border-edge px-5 py-5">
        <Field label="Message to the customer" hint="Optional, except when declining. Shown in the email and on their tracking page.">
          <textarea
            rows={3}
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={1000}
            placeholder={request.type === "return" && request.status === "requested"
              ? "e.g. Drop it at 20 Fedan St, Ojo, or we'll send a rider on Tuesday."
              : "e.g. Sent from our GTBank account this morning."}
            className={textareaCls}
          />
        </Field>

        {actions.length > 0 && (
          <>
            {needsRefundDetails && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Amount refunded (₦)" hint={`Requested: ${money(request.amount)}`}>
                  <input type="number" min={0} value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Transfer reference" hint="From your bank app">
                  <input value={reference} onChange={e => setReference(e.target.value)} maxLength={100} className={inputCls} />
                </Field>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {actions.map(a => (
                <Button
                  key={a.to}
                  variant={a.danger ? "danger" : "primary"}
                  disabled={Boolean(busy)}
                  onClick={() => run(a.to)}
                >
                  {busy === a.to ? "Saving…" : a.label}
                </Button>
              ))}
            </div>
          </>
        )}

        <details className="text-[13px] text-sub">
          <summary className="cursor-pointer select-none text-faint hover:text-ink">Correct the status</summary>
          <div className="mt-3 flex flex-wrap gap-2">
            <select value={fixStatus} onChange={e => setFixStatus(e.target.value)} className={cx(selectCls, "w-auto")}>
              <option value="">Choose a status…</option>
              {statusesOf(request.type).filter(s => s !== request.status).map(s => (
                <option key={s} value={s}>{statusLabel(request.type, s)}</option>
              ))}
            </select>
            <Button disabled={!fixStatus || Boolean(busy)} onClick={() => run(fixStatus).then(() => setFixStatus(""))}>
              Set status
            </Button>
          </div>
          <p className="mt-2 text-xs text-faint">For mistakes. The customer is emailed about the change too.</p>
        </details>
      </div>
    </Card>
  );
}

function InternalNote({ request, onSaved }) {
  const [note, setNote] = useState(request.adminNote || "");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      const data = await patch(request._id, { adminNote: note });
      toast.success("Note saved");
      onSaved(data.request);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Card>
      <CardHeader title="Internal note" description="Only admins see this." />
      <div className="flex flex-col gap-3 border-t border-edge px-5 py-5">
        <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} maxLength={2000} className={textareaCls} placeholder="e.g. Rider: Tunde, picked up 3 Nov" />
        <div>
          <Button onClick={save} disabled={saving || note === (request.adminNote || "")}>{saving ? "Saving…" : "Save note"}</Button>
        </div>
      </div>
    </Card>
  );
}

function Row({ label, children, onCopy }) {
  if (!children && children !== 0) return null;
  return (
    <div className="flex items-start justify-between gap-4 border-t border-[#eef0ef] px-5 py-2.5 first:border-t-0">
      <dt className="shrink-0 text-[13px] text-faint">{label}</dt>
      <dd className="flex min-w-0 items-center gap-1.5 text-right text-[13px] font-medium text-ink">
        <span className="break-words">{children}</span>
        {onCopy && (
          <button type="button" onClick={onCopy} aria-label={`Copy ${label}`} className="cursor-pointer rounded p-1 text-faint hover:bg-hover hover:text-ink">
            <Copy size={13} aria-hidden />
          </button>
        )}
      </dd>
    </div>
  );
}

export default function ReturnRequestPage() {
  const { id } = useParams();
  const { refreshAlerts } = useAdmin();
  const [request, setRequest] = useState(null);
  const [trackUrl, setTrackUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/returns/${id}`, { cache: "no-store" })
      .then(r => r.json().then(d => (r.ok ? d : Promise.reject(d))))
      .then(d => { setRequest(d.request); setTrackUrl(d.trackUrl); })
      .catch(d => setError(d?.message || "Couldn't load this request"));
  }, [id]);

  const onSaved = r => { setRequest(r); refreshAlerts?.(); };

  if (error) return <Card><EmptyState title="Request not found" description={error} action={<Button href="/admin_console/returns">Back to returns & refunds</Button>} /></Card>;
  if (!request) return <div className="flex justify-center py-20"><Spinner /></div>;

  const isRefund = request.type === "refund";
  const name = [request.firstName, request.lastName].filter(Boolean).join(" ") || "Customer";
  const wa = whatsappLink(request.phone, `Hi ${request.firstName || ""}, this is FIL Store about your ${isRefund ? "refund" : "return"} ${request.code}.`);

  return (
    <>
      <Link href={`/admin_console/returns?type=${request.type}`} className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-sub no-underline hover:text-ink">
        <ArrowLeft size={15} aria-hidden /> {isRefund ? "Refunds" : "Returns"}
      </Link>
      <PageHeader
        title={<span className="flex flex-wrap items-center gap-3">{request.code}<StatusBadge status={request.status}>{statusLabel(request.type, request.status)}</StatusBadge></span>}
        description={`${REQUEST_TYPES[request.type].label} · requested ${fmtDateTime(request.createdAt)} · ${statusInfo(request.type, request.status).customer}`}
        actions={trackUrl && (
          <Button href={trackUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={15} aria-hidden /> Customer&apos;s view
          </Button>
        )}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <NextStep key={request.status} request={request} onSaved={onSaved} />

          <Card>
            <CardHeader title="What they said" />
            <div className="border-t border-edge px-5 py-4">
              <div className="flex items-center gap-3">
                {request.item?.image && <img src={request.item.image} alt="" className="h-14 w-14 shrink-0 rounded-lg bg-canvas object-contain" />}
                <div className="min-w-0">
                  <div className="font-medium text-ink">{request.item?.name}</div>
                  <div className="text-xs text-faint">
                    {[request.item?.color, `Qty ${request.quantity}`, money(request.item?.price)].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
              {request.condition && <p className="mt-4 text-[13px]"><span className="text-faint">Condition: </span>{request.condition}</p>}
              <p className="mt-3 whitespace-pre-line rounded-lg bg-canvas px-3.5 py-3 text-[13px] leading-relaxed text-ink">{request.reason}</p>
            </div>
          </Card>

          <InternalNote request={request} onSaved={onSaved} />
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <Card>
            <CardHeader title="Progress" />
            <Steps request={request} />
          </Card>

          <Card>
            <CardHeader title={name} description={<Link href={`/admin_console/orders/${request.orderId}`} className="text-pine">Order #{shortId(request.orderId)}</Link>} />
            <dl className="border-t border-edge py-1">
              <Row label="Phone" onCopy={request.phone ? () => copy(localPhone(request.phone), "Phone") : null}>{localPhone(request.phone)}</Row>
              <Row label="Email">{request.email}</Row>
              {!isRefund && <Row label="Deliver back to">{[request.address, request.city, request.region].filter(Boolean).join(", ")}</Row>}
            </dl>
            <div className="flex flex-wrap gap-2 border-t border-edge px-5 py-3">
              {telLink(request.phone) && <Button size="sm" href={telLink(request.phone)}><Phone size={13} aria-hidden /> Call</Button>}
              {wa && <Button size="sm" href={wa} target="_blank" rel="noreferrer"><MessageCircle size={13} aria-hidden /> WhatsApp</Button>}
              {request.email && <Button size="sm" href={`mailto:${request.email}?subject=${encodeURIComponent(`Your ${isRefund ? "refund" : "return"} ${request.code}`)}`}><Mail size={13} aria-hidden /> Email</Button>}
            </div>
          </Card>

          {isRefund && (
            <Card>
              <CardHeader title="Refund to" />
              <dl className="border-t border-edge py-1">
                <Row label="Requested">{money(request.amount)}</Row>
                <Row label="Bank">{request.bank?.bankName}</Row>
                <Row label="Account no." onCopy={() => copy(request.bank?.accountNumber, "Account number")}>{request.bank?.accountNumber}</Row>
                <Row label="Account name" onCopy={() => copy(request.bank?.accountName, "Account name")}>{request.bank?.accountName}</Row>
                {request.refundedAmount != null && <Row label="Refunded">{money(request.refundedAmount)}</Row>}
                <Row label="Reference">{request.refundReference}</Row>
              </dl>
            </Card>
          )}

          {request.customerNote && (
            <Card>
              <CardHeader title="Last message to the customer" />
              <p className="whitespace-pre-line border-t border-edge px-5 py-4 text-[13px] text-ink">{request.customerNote}</p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
