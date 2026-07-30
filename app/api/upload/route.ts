import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

// Kun disse filtyper accepteres som billede af ønsket design.
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
// Maks. 8 MB pr. billede.
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

// Modtager et billede fra booking-formularen og gemmer det i Vercel Blob,
// så det kan vises sammen med bookingen på admin-siden.
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Ingen fil modtaget." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Kun JPG- og PNG-billeder er tilladt." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Billedet er for stort (maks 8 MB)." },
      { status: 400 }
    );
  }

  const extension = file.type === "image/png" ? "png" : "jpg";
  const filename = `booking-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
