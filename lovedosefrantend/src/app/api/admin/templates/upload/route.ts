import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function sanitizeExtension(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".webp" || ext === ".gif") {
    return ext;
  }

  return ".png";
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed." }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "templates");
    await mkdir(uploadDir, { recursive: true });

    const ext = sanitizeExtension(file.name);
    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    const filepath = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(filepath, buffer);

    return NextResponse.json({ url: `/uploads/templates/${filename}` });
  } catch {
    return unauthorizedResponse();
  }
}
