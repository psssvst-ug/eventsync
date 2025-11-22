let payments = {};

export function createIntent({ amount, currency }) {
  const id = "pi_" + Math.random().toString(36).substring(2, 10);
  payments[id] = {
    id,
    amount,
    currency,
    status: "requires_confirmation",
  };
  return payments[id];
}

export function confirmIntent(id) {
  if (!payments[id]) return null;
  payments[id].status = "succeeded";
  return payments[id];
}

export function getIntent(id) {
  return payments[id] || null;
}
