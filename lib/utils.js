export const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
};

export function formatAmount(amount) {
  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  });

  return formatter.format(amount);
}
