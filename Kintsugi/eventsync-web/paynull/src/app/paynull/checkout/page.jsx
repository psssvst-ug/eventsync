"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 

export default function PayNullCheckout() {
  const params = useSearchParams();
  const pi = params.get("pi");
  const router = useRouter();
  const [card, setCard] = useState("");
  const [status, setStatus] = useState("waiting");
  const [darkMode, setDarkMode] = useState(false);

  // Auto-detect system dark mode
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDarkMode(mq.matches);
    const handler = (e) => setDarkMode(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  async function handlePayment() {
    if (!card) {
      alert("Enter test card!");
      return;
    }

    setStatus("processing");

    const res = await fetch("/api/paynull/confirm", {
      method: "POST",
      body: JSON.stringify({ paymentIntentId: pi }),
    });

    const data = await res.json();
    if (data.ok) {
      setStatus("succeeded, redirecting...");
      router.push("/payments/"+pi+"/success")
    }
  }

  return (
    <div className={
      `min-h-screen flex items-center justify-center transition-colors ` +
      (darkMode ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-gray-50 to-gray-200")
    }>
      <div className={
        `shadow-xl rounded-xl p-8 w-full max-w-md border transition-colors ` +
        (darkMode ? "bg-gray-900 border-gray-700" : "bg-white border border-gray-100")
      }>
        <div className="flex items-center mb-6">
          <img src="/paynull-logo.svg" alt="PayNull" className="h-10 w-10 mr-2" />
          <h1 className={
            `text-2xl font-bold tracking-tight ` +
            (darkMode ? "text-white" : "text-gray-900")
          }>PayNull Checkout</h1>
        </div>
        <div className="mb-4 flex justify-between items-center">
          <div>
            <span className={darkMode ? "text-xs text-gray-400" : "text-xs text-gray-500"}>Payment ID</span>
            <div className={
              `text-sm font-mono rounded px-2 py-1 mt-1 ` +
              (darkMode ? "text-gray-200 bg-gray-800" : "text-gray-700 bg-gray-50")
            }>{pi}</div>
          </div>
          <button
            className={
              `px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ` +
              (darkMode ? "bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700" : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200")
            }
            onClick={() => setDarkMode((d) => !d)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
        <label htmlFor="card" className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Card Number</label>
        <input
          id="card"
          className={
            `w-full border p-3 rounded-lg focus:outline-none focus:ring-2 transition mb-4 ` +
            (darkMode
              ? "border-gray-700 bg-gray-800 text-gray-100 focus:ring-blue-800"
              : "border-gray-300 bg-white text-gray-900 focus:ring-blue-500")
          }
          placeholder="1234 5678 9012 3456"
          value={card}
          onChange={(e) => setCard(e.target.value)}
        />
        <button
          className={
            `w-full font-semibold p-3 rounded-lg shadow transition mt-2 ` +
            (darkMode ? "bg-blue-700 hover:bg-blue-800 text-white" : "bg-blue-600 hover:bg-blue-700 text-white")
          }
          onClick={handlePayment}
          disabled={status === 'processing'}
        >
          Pay with PayNull
        </button>
        <div className="mt-6 text-center">
          <span className={darkMode ? "text-xs text-gray-400" : "text-xs text-gray-500"}>Status</span>
          <div className={darkMode ? "text-sm text-gray-200 mt-1" : "text-sm text-gray-700 mt-1"}>{status}</div>
        </div>
        <div className={darkMode ? "mt-6 text-center text-xs text-gray-500" : "mt-6 text-center text-xs text-gray-400"}>
          <span>Powered by PayNull</span>
        </div>
      </div>
    </div>
  );
}
