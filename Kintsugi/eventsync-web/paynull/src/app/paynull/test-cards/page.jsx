"use client";

export default function PayNullTestCards() {
  const testCards = [
    { number: "4242 4242 4242 4242", type: "VISA", status: "Always Success" },
    { number: "4000 0000 0000 9995", type: "VISA", status: "Requires Confirmation" },
    { number: "4000 0000 0000 0002", type: "VISA", status: "Insufficient Funds" },
  ];

  function copy(text) {
    navigator.clipboard.writeText(text);
    alert("Copied card: " + text);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-xl border border-gray-100">
        <div className="flex items-center mb-6">
          <img src="/paynull-logo.svg" alt="PayNull" className="h-10 w-10 mr-2" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">PayNull Test Cards</h1>
        </div>
        <p className="text-gray-500 mb-6">Use these test cards in PayNull Checkout for development and testing.</p>
        <div className="space-y-4">
          {testCards.map((c) => (
            <div key={c.number} className="border p-4 rounded-lg flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition">
              <div>
                <p className="font-semibold text-lg text-gray-800">{c.number}</p>
                <p className="text-sm text-gray-500">{c.type} — {c.status}</p>
              </div>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow"
                onClick={() => copy(c.number)}
              >
                Copy Card
              </button>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center text-xs text-gray-400">
          <span>Powered by PayNull</span>
        </div>
      </div>
    </div>
  );
}
