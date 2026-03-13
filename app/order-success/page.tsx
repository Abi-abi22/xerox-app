"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle className="h-10 w-10" />
      </div>
      <h1 className="mb-2 text-3xl font-bold text-slate-800">Order Placed!</h1>
      <p className="mb-8 text-slate-600">
        Your order has been submitted successfully to Akka&apos;s Xerox.
      </p>

      <div className="mb-10 w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Order ID</p>
        <p className="mt-1 font-mono text-lg font-semibold text-slate-800">{orderId || "N/A"}</p>
      </div>

      <div className="flex flex-col w-full gap-3">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Next.js build error fix: Wrap search params in Suspense */}
        <Suspense fallback={<div className="text-slate-500">Loading success details...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}