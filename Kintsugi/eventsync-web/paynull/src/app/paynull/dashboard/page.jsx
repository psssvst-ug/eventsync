"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PayNullDashboard() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetch("/api/paynull/history")
      .then((res) => res.json())
      .then((data) => setPayments(data.history));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-2xl border border-gray-100">
        <div className="flex items-center mb-6">
          <img src="/paynull-logo.svg" alt="PayNull" className="h-10 w-10 mr-2" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">PayNull Dashboard</h1>
        </div>
        <div className="mb-6 flex justify-between items-center">
          <span className="text-gray-500">Your recent payments are listed below.</span>
          <Link className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow" href="/paynull/test-cards">
            View Test Cards →
          </Link>
        </div>
        <h2 className="text-lg font-semibold mb-2 text-gray-800">Payment History</h2>
        <div className="space-y-2">
          {payments.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No payments found.</div>
          ) : (
            payments.map((p) => (
              <div
                key={p.id}
                className="border p-4 rounded-lg flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition"
              >
                <span className="font-mono text-sm text-gray-700">
                  {p.id} — <span className="font-bold">{(p.amount / 100).toFixed(2)} {p.currency.toUpperCase()}</span>
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    p.status === "succeeded" ? "bg-green-500 text-white" : "bg-yellow-400 text-gray-900"
                  }`}
                >
                  {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </span>
              </div>
            ))
          )}
        </div>
        <div className="mt-8 text-center text-xs text-gray-400">
          <span>Powered by PayNull</span>
        </div>
      </div>
    </div>
  );
}
