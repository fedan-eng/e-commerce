// lib/brevo.js — newsletter contacts in Brevo (https://developers.brevo.com/reference)
const BREVO_API = "https://api.brevo.com/v3";

const listId = (value) => {
  const id = parseInt(value || "", 10);
  return Number.isFinite(id) ? id : null;
};

async function brevo(path, { method = "GET", body } = {}) {
  const res = await fetch(`${BREVO_API}${path}`, {
    method,
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      accept: "application/json",
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

/**
 * Add an email to the newsletter list (BREVO_LIST_ID). A phone number is only
 * stored when the person ticked the SMS consent box; they are then also added
 * to BREVO_SMS_LIST_ID (if set) so SMS campaigns can target consenting contacts.
 *
 * Returns { status: "subscribed" | "exists" }.
 */
export async function subscribeContact({ email, phone, smsOptIn }) {
  if (!process.env.BREVO_API_KEY) throw new Error("BREVO_API_KEY is not set");

  const newsletterList = listId(process.env.BREVO_LIST_ID);
  if (!newsletterList) throw new Error("BREVO_LIST_ID is not set");
  const smsList = listId(process.env.BREVO_SMS_LIST_ID);

  const withSms = Boolean(phone && smsOptIn);
  const listIds = [newsletterList, ...(withSms && smsList ? [smsList] : [])];

  const existing = await brevo(`/contacts/${encodeURIComponent(email)}`);
  if (existing.ok && existing.data?.listIds?.includes(newsletterList) && !existing.data?.emailBlacklisted) {
    return { status: "exists" };
  }

  const create = (attributes) =>
    brevo("/contacts", {
      method: "POST",
      body: { email, listIds, updateEnabled: true, emailBlacklisted: false, ...(attributes ? { attributes } : {}) },
    });

  let res = await create(withSms ? { SMS: phone } : undefined);

  // Brevo rejects an SMS number that already belongs to another contact; keep the email sign-up
  if (!res.ok && withSms && res.status === 400) {
    console.warn("Brevo: retrying without SMS attribute —", res.data?.message);
    res = await create();
  }

  if (!res.ok) {
    throw new Error(`Brevo contact create failed (${res.status}): ${res.data?.message || "unknown error"}`);
  }
  return { status: "subscribed" };
}
