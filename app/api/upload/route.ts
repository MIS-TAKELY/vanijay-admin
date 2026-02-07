
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// Helper to upload buffer to Cloudinary with rotation
import { uploadBufferWithRotation } from "@/utils/cloudinary-rotation";

async function uploadBufferToCloudinary(
    buffer: Buffer,
    folder: string = "admin",
    filename?: string,
    mimeType: string = "image/webp"
): Promise<any> {
    // Note: folder parameter is ignored as Cloudinary unsigned presets
    // have predefined folder configurations
    return uploadBufferWithRotation(buffer, filename, mimeType);
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const type = formData.get("type") as string | null; // 'banner', 'category', etc.

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let processedBuffer: Buffer;
        let contentType: string;

        const isVideo = file.type.startsWith("video/");
        const isSmallFile = buffer.length <= 300 * 1024;

        if (isVideo || isSmallFile) {
            // Skip compression for videos and small files
            processedBuffer = buffer;
            contentType = file.type || (isVideo ? "video/mp4" : "image/webp");
        } else {
            // Sharp Optimization Logic
            const image = sharp(buffer);

            // Default to converting to WebP for optimization
            let sharpInstance = image.webp({ quality: 80 });

            if (type === "banner") {
                // Banners: 1920x600 (16:5 Aspect Ratio)
                sharpInstance = sharpInstance.resize(1920, 600, {
                    fit: "cover",
                    position: "center",
                }).sharpen();
            } else if (type === "category") {
                // Categories: 500x500 (Square)
                sharpInstance = sharpInstance.resize(500, 500, {
                    fit: "cover",
                    position: "center",
                });
            } else if (type === "product") {
                // Fallback or explicit product upload in admin
                sharpInstance = sharpInstance.resize(1080, 1080, {
                    fit: "cover",
                    position: "center",
                });
            }

            processedBuffer = await sharpInstance.toBuffer();
            contentType = "image/webp";
        }

        // Upload to Cloudinary
        const result = await uploadBufferToCloudinary(
            processedBuffer,
            "admin",
            file.name,
            contentType
        );

        return NextResponse.json({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
            size: result.bytes,
            altText: result.display_name
        });

    } catch (error) {
        console.error("Upload handler error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
