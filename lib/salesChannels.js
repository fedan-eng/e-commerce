// lib/salesChannels.js — where a manual (Sales entry) sale came from. Stored on Order.channel.
export const SALES_CHANNELS = [
  { value: "instagram",  label: "Instagram" },
  { value: "tiktok",     label: "TikTok" },
  { value: "whatsapp",   label: "WhatsApp" },
  { value: "facebook",   label: "Facebook" },
  { value: "returning",  label: "Returning" },
  { value: "outsourced", label: "Outsourced" },
  { value: "others",     label: "Others" },
];

export const SALES_CHANNEL_VALUES = SALES_CHANNELS.map((c) => c.value);

// "orders" was briefly the name for "others"; sales saved with it read as Others
export const LEGACY_CHANNELS = { orders: "others" };
export const normaliseChannel = (v) => LEGACY_CHANNELS[v] || v;

export const channelLabel = (v) => SALES_CHANNELS.find((c) => c.value === normaliseChannel(v))?.label || "";
