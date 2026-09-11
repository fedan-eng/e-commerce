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

export function hasCompleteProfile(user) {
  if (!user) return false;
  
  const requiredFields = ['lastName', 'phone', 'region', 'city', 'address'];
  return requiredFields.every(field => {
    const value = user[field];
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'object') return value && Object.keys(value).length > 0;
    return !!value;
  });
}
