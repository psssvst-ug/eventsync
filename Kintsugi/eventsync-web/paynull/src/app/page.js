"use client"

export default function Home() {
  const go = async () => {
    const res = await fetch("/api/paynull/create-intent", {
      method: "POST",
      body: JSON.stringify({ amount: 5000, currency: "INR" }),
    });
    const data = await res.json();
    console.log(data.paymentIntent.id);

    if (data) {
      const res = await fetch("/api/paynull/session", {
        method: "POST",
        body: JSON.stringify({ paymentIntentId: data.paymentIntent.id }),
      });

      window.location.href = (await res.json()).url;

    }

  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <button onClick={go}>Test</button>
    </div>
  );
}
