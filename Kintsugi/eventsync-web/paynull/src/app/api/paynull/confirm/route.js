import { NextResponse } from "next/server";
import { confirmIntent } from "@/db/paynull-db";

export async function POST(req) {
  const { paymentIntentId } = await req.json();

  const updated = confirmIntent(paymentIntentId);

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Invalid ID" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    paymentIntent: updated,
  });
}
