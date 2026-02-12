export async function verifyPayment(reference) {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!data.status) {
    throw new Error(data.message || "Verification failed");
  }

  // This should return: { status, metadata, ... }
  return data.data;
}
