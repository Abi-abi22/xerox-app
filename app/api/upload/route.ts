import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

const BUCKET = "xerox-files";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file. Only PDF allowed." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(safeName, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl, path: data.path });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
