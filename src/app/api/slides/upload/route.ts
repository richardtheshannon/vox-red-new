import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * POST /api/slides/upload
 * Handles file uploads for slides (audio and images)
 * Body: multipart/form-data with 'file' field
 * Query params: ?type=audio|image&rowId=[rowId]
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    const searchParams = request.nextUrl.searchParams;
    const fileType = searchParams.get('type'); // 'audio' or 'image'
    const rowId = searchParams.get('rowId');

    if (!file) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'No file provided',
        },
        { status: 400 }
      );
    }

    if (!fileType || !['audio', 'image'].includes(fileType)) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid or missing type parameter. Must be "audio" or "image"',
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    if (fileType === 'audio' && !allowedAudioTypes.includes(file.type)) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid audio file type. Allowed: MP3, WAV, OGG',
        },
        { status: 400 }
      );
    }

    if (fileType === 'image' && !allowedImageTypes.includes(file.type)) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid image file type. Allowed: JPG, PNG, WebP',
        },
        { status: 400 }
      );
    }

    // Validate file size
    const maxAudioSize = 10 * 1024 * 1024; // 10MB
    const maxImageSize = 5 * 1024 * 1024; // 5MB

    if (fileType === 'audio' && file.size > maxAudioSize) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Audio file too large. Maximum size: 10MB',
        },
        { status: 400 }
      );
    }

    if (fileType === 'image' && file.size > maxImageSize) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Image file too large. Maximum size: 5MB',
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const baseFileName = path.basename(file.name, fileExtension)
      .replace(/[^a-zA-Z0-9-_]/g, '_') // Sanitize filename
      .substring(0, 50); // Limit length

    const fileName = rowId
      ? `${rowId}_${timestamp}_${baseFileName}${fileExtension}`
      : `${timestamp}_${baseFileName}${fileExtension}`;

    // Determine upload directory
    const uploadDir = path.join(
      process.cwd(),
      'public',
      'media',
      'slides',
      rowId || 'general'
    );

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate public URL
    const publicUrl = `/media/slides/${rowId || 'general'}/${fileName}`;

    return NextResponse.json({
      status: 'success',
      message: 'File uploaded successfully',
      file: {
        name: fileName,
        url: publicUrl,
        type: fileType,
        size: file.size,
        originalName: file.name,
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to upload file',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/slides/upload
 * Returns upload configuration and limits
 */
export async function GET() {
  return NextResponse.json({
    status: 'success',
    config: {
      audio: {
        allowedTypes: ['MP3', 'WAV', 'OGG'],
        maxSize: '10MB',
        maxSizeBytes: 10 * 1024 * 1024,
      },
      image: {
        allowedTypes: ['JPG', 'PNG', 'WebP'],
        maxSize: '5MB',
        maxSizeBytes: 5 * 1024 * 1024,
      },
    },
  });
}
