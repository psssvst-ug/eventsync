import { NextResponse } from "next/server";

export async function POST(req) {
  const { paymentIntentId } = await req.json();

  const url = `/paynull/checkout?pi=${paymentIntentId}`;

  return NextResponse.json({
    ok: true,
    url,
  });
}
