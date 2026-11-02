// lib/salesChannels.js — where a manual (Sales entry) sale came from. Stored on Order.channel.
export const SALES_CHANNELS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok",    label: "TikTok" },
  { value: "whatsapp",  label: "WhatsApp" },
  { value: "orders",    label: "Orders" },
];

export const SALES_CHANNEL_VALUES = SALES_CHANNELS.map((c) => c.value);

export const channelLabel = (v) => SALES_CHANNELS.find((c) => c.value === v)?.label || "";
