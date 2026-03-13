"use client";

import {
  Printer,
  Loader2,
  Check,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  file_url: string;
  copies: number;
  color_mode: string;
  printing_side: string;
  total_price: number;
  payment_status: string;
  payment_method?: string | null;
  upi_transaction_id: string | null;
  created_at: string;
  printed_at: string | null;
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: null, text: "" }), 4000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setOrders(data ?? []);
    } catch {
      showMessage("error", "Failed to load orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const markAsPrinted = async (id: string) => {
    setMarkingId(id);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ printed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? { ...o, printed_at: new Date().toISOString() }
            : o
        )
      );
      showMessage("success", "Order marked as printed.");
    } catch {
      showMessage("error", "Failed to update order.");
    } finally {
      setMarkingId(null);
    }
  };

  const formatDate = (s: string) => {
    const d = new Date(s);
    return d.toLocaleString("en-IN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Toast */}
      {message.type && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg ${
            message.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Printer className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Admin Dashboard</h1>
              <p className="text-sm text-slate-500">Akka&apos;s Smart Xerox</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <Link
              href="/"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/25"
            >
              Customer view
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-slate-200 bg-white">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            <p className="mt-4 text-slate-600 font-medium">
              Loading orders...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-16 text-center">
            <p className="text-slate-600">No orders yet.</p>
            <p className="mt-2 text-sm text-slate-500">
              Orders will appear here when customers submit.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Order Time
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Details
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Payment Method
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Transaction ID
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className={`border-b border-slate-100 last:border-0 ${
                        order.printed_at ? "bg-slate-50/50" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {formatDate(order.created_at)}
                        </p>
                        <p className="text-xs font-mono text-slate-400 truncate max-w-[140px]">
                          {order.id}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <a
                            href={order.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-200 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            Download PDF
                          </a>
                          <p className="text-sm text-slate-600">
                            {order.copies} copy · {order.color_mode} ·{" "}
                            {order.printing_side} · ₹{order.total_price}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${
                            order.payment_method === "Offline"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-indigo-100 text-indigo-700"
                          }`}
                        >
                          {order.payment_method || "Online"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="rounded-md bg-slate-100 px-2 py-1 text-xs font-mono text-slate-700">
                          {order.upi_transaction_id || "—"}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          <span
                            className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${
                              order.payment_status === "verified"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {order.payment_status}
                          </span>
                          {order.printed_at && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">
                              <Check className="h-3 w-3" />
                              Printed
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {!order.printed_at ? (
                          <button
                            onClick={() => markAsPrinted(order.id)}
                            disabled={markingId === order.id}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70 transition-colors"
                          >
                            {markingId === order.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                            Mark as Printed
                          </button>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
