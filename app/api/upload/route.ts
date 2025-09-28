import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "candidate" or "manifesto"
    const candidateId = formData.get("candidateId") as string; // for DB update

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 413 });
    }

    // Accept only images, pdf, word
    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 415 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadRes = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "evoting",
          resource_type: file.type.startsWith("image") ? "image" : "auto",
          timeout: 60000
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    // @ts-ignore
    const secureUrl = uploadRes.secure_url;

    // Save to DB if candidateId provided
    if (candidateId && type === "candidate") {
      await prisma.candidate.update({
        where: { id: candidateId },
        data: { photoUrl: secureUrl }
      });
    }
    if (candidateId && type === "manifesto") {
      await prisma.candidate.update({
        where: { id: candidateId },
        data: { manifesto: secureUrl }
      });
    }

    return NextResponse.json({ success: true, url: secureUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}