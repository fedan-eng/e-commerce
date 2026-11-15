// components/admin/SourceTag.jsx — "Website" or "Manual · <channel>" tag for an order.
// Used on the dashboard's latest orders and the orders list.
import { channelLabel } from "@/lib/salesChannels";
import { cx } from "@/components/admin/ui";

export default function SourceTag({ order }) {
  const manual = order.source === "manual";
  const channel = manual && order.channel ? channelLabel(order.channel) : "";
  return (
    <span className={cx(
      "whitespace-nowrap rounded-md px-1.5 py-px text-[11px] font-medium",
      manual ? "bg-[#fef7e6] text-[#a16207]" : "bg-pine-tint text-pine",
    )}>
      {manual ? `Manual${channel ? ` · ${channel}` : ""}` : "Website"}
    </span>
  );
}
