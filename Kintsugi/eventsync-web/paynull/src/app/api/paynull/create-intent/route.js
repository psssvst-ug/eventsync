import { NextResponse } from "next/server";
import { createIntent } from "@/db/paynull-db";

export async function POST(req) {
  const { amount, currency } = await req.json();

  const intent = createIntent({ amount, currency });

  return NextResponse.json({
    ok: true,
    paymentIntent: intent,
  });
}
