import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // "candidate" or "manifesto"
    const candidateId = formData.get('candidateId') as string; // for DB update

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 413 });
    }

    // Accept only images and pdf
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'Only PDF files are allowed for manifesto uploads. Please convert your document to PDF before uploading.',
        },
        { status: 415 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get original filename and extension
    const originalFilename = file.name; // e.g., "manifesto.pdf"
    const extension = originalFilename.split('.').pop(); // "pdf"
    const publicId = originalFilename.replace(/\.[^/.]+$/, ''); // "manifesto"

    // Upload to Cloudinary with public_id and format
    const uploadRes = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'evoting',
          resource_type: file.type.startsWith('image') ? 'image' : 'auto',
          public_id: publicId,
          format: extension,
          timeout: 60000,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    // @ts-expect-error
    const secureUrl = uploadRes.secure_url;

    // Save to DB if candidateId provided
    if (candidateId && type === 'candidate') {
      await prisma.candidate.update({
        where: { id: candidateId },
        data: { photoUrl: secureUrl },
      });
    }
    if (candidateId && type === 'manifesto') {
      await prisma.candidate.update({
        where: { id: candidateId },
        data: { manifesto: secureUrl },
      });
    }

    return NextResponse.json({ success: true, url: secureUrl });
  } catch (error: unknown) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
