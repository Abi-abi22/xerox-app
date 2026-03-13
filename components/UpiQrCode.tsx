"use client";

import { useEffect, useState } from "react";

const UPI_ID = "UNGA_AKKA_UPI_ID@okicici";
const PAYEE_NAME = "Akka's Smart Xerox";

interface UpiQrCodeProps {
  amount: number;
  className?: string;
}

export function UpiQrCode({ amount, className = "" }: UpiQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    import("qrcode").then((QRCode) => {
      const uri = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amount}&cu=INR`;
      QRCode.toDataURL(uri, { width: 200, margin: 2 }).then(setDataUrl);
    });
  }, [amount]);

  if (!dataUrl) return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} style={{ width: 200, height: 200 }} />;
  return (
    <img
      src={dataUrl}
      alt="UPI QR Code"
      className={`rounded-lg border border-slate-200 ${className}`}
      width={200}
      height={200}
    />
  );
}

export function getUpiDeepLink(amount: number): string {
  return `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amount}&cu=INR`;
}
