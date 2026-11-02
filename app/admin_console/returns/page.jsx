// app/admin_console/returns/page.jsx
// Refund and return requests from customers, each kind on its own, split into
// New (needs a decision), In progress and Closed.
"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Undo2 } from "lucide-react";
import {
  PageHeader, Card, Segmented, Tabs, SearchInput, Pagination, StatusBadge, EmptyState, Skeleton, Spinner, TH, TD,
} from "@/components/admin/ui";
import { money, timeAgo, localPhone } from "@/components/admin/format";
import { statusLabel } from "@/lib/returnRefund";

const LIMIT = 20;
const STAGE_TABS = [
  { value: "new", label: "New" },
  { value: "active", label: "In progress" },
  { value: "closed", label: "Closed" },
];
const EMPTY_COPY = {
  new: "Nothing waiting for a decision.",
  active: "Nothing in progress right now.",
  closed: "Finished and declined requests show up here.",
};

function ReturnsList() {
  const router = useRouter();
  const params = useSearchParams();
  const type = params.get("type") === "return" ? "return" : "refund";
  const stage = STAGE_TABS.some(t => t.value === params.get("stage")) ? params.get("stage") : "new";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);

  // Type and stage live in the URL so the back button from a request lands on the same list
  const go = (next) => {
    const q = new URLSearchParams({ type, stage, ...next });
    router.replace(`/admin_console/returns?${q}`);
    setPage(1);
  };

  const load = useCallback(() => {
    setData(null);
    const q = new URLSearchParams({ type, stage, page, limit: LIMIT, ...(query && { search: query }) });
    fetch(`/api/admin/returns?${q}`, { cache: "no-store" })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setData({ requests: [], total: 0, totalPages: 1, counts: null }));
  }, [type, stage, page, query]);
  useEffect(load, [load]);

  const counts = data?.counts?.[type];
  const otherNew = data?.counts?.[type === "refund" ? "return" : "refund"]?.new;

  return (
    <>
      <PageHeader
        title="Returns & refunds"
        description="Refunds send money back. Returns bring an item in and deliver it back. Every status change emails the customer."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented
          label="Request type"
          value={type}
          onChange={v => go({ type: v, stage: "new" })}
          options={[
            { value: "refund", label: `Refunds${type === "return" && otherNew ? ` · ${otherNew} new` : ""}` },
            { value: "return", label: `Returns${type === "refund" && otherNew ? ` · ${otherNew} new` : ""}` },
          ]}
        />
        <SearchInput
          className="w-full sm:ml-auto sm:w-72"
          value={search}
          onChange={setSearch}
          onSubmit={() => { setPage(1); setQuery(search.trim()); }}
          onClear={() => { setSearch(""); setQuery(""); setPage(1); }}
          placeholder="ID, name, phone or product"
        />
      </div>

      <Card>
        <Tabs
          label="Stage"
          value={stage}
          onChange={v => go({ stage: v })}
          tabs={STAGE_TABS.map(t => ({ ...t, count: counts?.[t.value] }))}
        />

        {!data ? (
          <div className="flex flex-col gap-3 p-5">
            {[0, 1, 2].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : data.requests.length === 0 ? (
          <EmptyState
            icon={Undo2}
            title={query ? "No matches" : `No ${type === "refund" ? "refunds" : "returns"} here`}
            description={query ? `Nothing matches “${query}”.` : EMPTY_COPY[stage]}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr>
                  <th className={TH}>Request</th>
                  <th className={TH}>Customer</th>
                  <th className={TH}>Item</th>
                  {type === "refund" && <th className={TH}>Amount</th>}
                  <th className={TH}>Status</th>
                  <th className={TH}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {data.requests.map(r => (
                  <tr
                    key={r._id}
                    onClick={() => router.push(`/admin_console/returns/${r._id}`)}
                    className="cursor-pointer transition-colors hover:bg-[#fafbfa]"
                  >
                    <td className={TD}>
                      <Link
                        href={`/admin_console/returns/${r._id}`}
                        onClick={e => e.stopPropagation()}
                        className="font-semibold tracking-wide text-pine no-underline hover:underline"
                      >
                        {r.code}
                      </Link>
                    </td>
                    <td className={TD}>
                      <div className="font-medium text-ink">{[r.firstName, r.lastName].filter(Boolean).join(" ") || "—"}</div>
                      <div className="text-xs text-faint">{localPhone(r.phone)}</div>
                    </td>
                    <td className={TD}>
                      <div className="max-w-[260px] truncate text-ink">{r.item?.name}</div>
                      <div className="text-xs text-faint">Qty {r.quantity}</div>
                    </td>
                    {type === "refund" && <td className={TD}>{money(r.amount)}</td>}
                    <td className={TD}><StatusBadge status={r.status}>{statusLabel(r.type, r.status)}</StatusBadge></td>
                    <td className={`${TD} whitespace-nowrap text-[13px] text-faint`}>{timeAgo(r.updatedAt || r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            total={data.total}
            pageSize={LIMIT}
            onChange={setPage}
            noun={type === "refund" ? "refunds" : "returns"}
          />
        )}
      </Card>
    </>
  );
}

export default function ReturnsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Spinner /></div>}>
      <ReturnsList />
    </Suspense>
  );
}
