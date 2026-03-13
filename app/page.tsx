"use client";

import {
  Printer,
  Upload,
  FileText,
  Loader2,
  Copy,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const BUCKET = "xerox-files";

const B_W_PRICE = 2;
const COLOR_PRICE = 10;
const UPI_ID = "upi@okicici";

export default function Home() {
  const router = useRouter();
  const [copies, setCopies] = useState(1);
  const [isColor, setIsColor] = useState(false);
  const [isDoubleSided, setIsDoubleSided] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "offline">("online");
  const [upiTransactionId, setUpiTransactionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "saving">("idle");
  const [message, setMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });
  const [copied, setCopied] = useState(false);

  const pageCount = files.length > 0 ? files.length : 1;
  const pricePerPage = isColor ? COLOR_PRICE : B_W_PRICE;
  const total = copies * pageCount * pricePerPage;

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: null, text: "" }), 5000);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "application/pdf"
    );
    setFiles((prev) => [...prev, ...dropped]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).filter(
      (f) => f.type === "application/pdf"
    );
    setFiles((prev) => [...prev, ...selected]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: null, text: "" });

    if (files.length === 0) {
      showMessage("error", "Please upload at least one PDF file.");
      return;
    }

    if (paymentMethod === "online" && !upiTransactionId.trim()) {
      showMessage("error", "Please enter your UPI Transaction ID for online payment.");
      return;
    }

    setIsSubmitting(true);
    setUploadStatus("uploading");

    try {
      const file = files[0];
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(safeName, file, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) throw new Error(uploadError.message);

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(uploadData.path);

      setUploadStatus("saving");

      const orderData = {
        file_url: publicUrl,
        copies,
        color_mode: isColor ? "color" : "bw",
        printing_side: isDoubleSided ? "double" : "single",
        total_price: total,
        payment_status: "pending",
        payment_method: paymentMethod === "online" ? "Online" : "Offline",
        upi_transaction_id: paymentMethod === "online" ? upiTransactionId.trim() : null,
      };

      const { data: orderResult, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select("id")
        .single();

      if (orderError) throw new Error(orderError.message);
      if (orderResult?.id) {
        router.push(`/order-success?orderId=${orderResult.id}`);
      } else {
        throw new Error("No order ID returned");
      }
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Something went wrong."
      );
      setIsSubmitting(false);
      setUploadStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast messages */}
      {message.type && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg ${
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
        <div className="mx-auto max-w-2xl px-6 py-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
            <Printer className="h-5 w-5" strokeWidth={2} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">
            Akka&apos;s Smart Xerox
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <label className="mb-3 block text-sm font-medium text-slate-700">
              Upload PDF files
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors
                ${isDragging ? "border-indigo-500 bg-indigo-50/50" : "border-slate-300 bg-slate-50 hover:border-indigo-400"}
              `}
            >
              <input
                type="file"
                accept=".pdf,application/pdf"
                multiple
                onChange={handleFileSelect}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <div className="rounded-full bg-slate-200 p-3 text-slate-500 mb-3">
                <Upload className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <p className="text-slate-600 font-medium">
                Drag & drop PDFs or click to browse
              </p>
              <p className="mt-1 text-sm text-slate-500">PDF only</p>
              {files.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {files.map((file, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-100 px-2.5 py-1.5 text-sm font-medium text-indigo-800"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {file.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(i);
                        }}
                        className="ml-0.5 rounded p-0.5 hover:bg-indigo-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Options */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-800">
              Print options
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="copies"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Number of copies
                </label>
                <input
                  id="copies"
                  type="number"
                  min={1}
                  max={100}
                  value={copies}
                  onChange={(e) =>
                    setCopies(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-24 rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Color / B&W
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsColor(false)}
                    className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      !isColor
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/20"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    B&W
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsColor(true)}
                    className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      isColor
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/20"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    Color
                  </button>
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Sides
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDoubleSided(false)}
                    className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      !isDoubleSided
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/20"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    Single
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDoubleSided(true)}
                    className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      isDoubleSided
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/20"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    Double
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Price */}
          <section className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-700">Estimated total</p>
            <p className="mt-1 text-2xl font-bold text-indigo-700">₹{total}</p>
            <p className="mt-1 text-xs text-slate-600">
              ₹{pricePerPage}/page ({isColor ? "color" : "B&W"}) × {pageCount}{" "}
              page(s) × {copies} copy/copies
            </p>
          </section>

          {/* Payment */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-800">
              Select Payment Method
            </h2>

            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("online")}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  paymentMethod === "online"
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/20"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                Online (UPI)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("offline")}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  paymentMethod === "offline"
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/20"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                Offline (Pay at Shop)
              </button>
            </div>

            {paymentMethod === "online" ? (
              <>
                <p className="mb-3 text-sm text-slate-600">
                  Pay ₹{total} via UPI to complete your order.
                </p>
                <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    UPI ID
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-md bg-white px-3 py-2.5 font-mono text-sm text-indigo-700">
                      {UPI_ID}
                    </code>
                    <button
                      type="button"
                      onClick={copyUpiId}
                      className="rounded-lg bg-indigo-600 px-3 py-2.5 text-white hover:bg-indigo-700"
                      title="Copy"
                    >
                      {copied ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="txn-id"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    UPI Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="txn-id"
                    type="text"
                    value={upiTransactionId}
                    onChange={(e) => setUpiTransactionId(e.target.value)}
                    placeholder="Enter transaction ID from your UPI app"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </>
            ) : (
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Please pay at the shop while collecting your prints.
              </p>
            )}
          </section>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {uploadStatus === "uploading"
                  ? "Uploading file..."
                  : "Saving order..."}
              </>
            ) : (
              "Submit Order"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
