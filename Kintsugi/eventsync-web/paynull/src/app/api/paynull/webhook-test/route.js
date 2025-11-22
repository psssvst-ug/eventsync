import { NextResponse } from "next/server";

export async function POST(req) {
  const { url, paymentIntentId } = await req.json();

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "payment.succeeded",
      paymentIntentId,
    }),
  });

  return NextResponse.json({ ok: true });
}
