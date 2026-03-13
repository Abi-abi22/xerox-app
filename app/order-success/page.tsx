"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Printer } from "lucide-react";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-6">
          <CheckCircle className="h-10 w-10 text-emerald-600" strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Order placed successfully
        </h1>
        <p className="text-slate-600 mb-6">
          Your print order has been submitted. We will process it shortly.
        </p>
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 mb-8">
          <p className="text-sm font-medium text-slate-500">Order ID</p>
          <p className="text-xl font-mono font-semibold text-indigo-600 mt-1">
            {orderId || "—"}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700"
        >
          <Printer className="h-5 w-5" />
          Place another order
        </Link>
      </div>
    </div>
  );
}
