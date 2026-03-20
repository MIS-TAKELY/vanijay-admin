/**
 * Multi-Cloudinary Account Rotation System (Server-side)
 * 
 * Distributes uploads across 5 Cloudinary accounts using round-robin rotation
 * to prevent quota exhaustion on any single account.
 */

export interface CloudinaryAccount {
    cloudName: string;
    uploadPreset: string;
    index: number;
}

const ACCOUNT_COUNT = 5;

/**
 * Server-side rotation index (in-memory)
 */
let rotationIndex = 0;

/**
 * Get the next Cloudinary account in rotation
 */
export function getNextCloudinaryAccount(): CloudinaryAccount {
    const index = rotationIndex;

    // Map explicit variables to avoid issues with dynamic access in standard Next.js build
    const accounts: Record<number, { name: string | undefined, preset: string | undefined }> = {
        0: {
            name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
        },
        1: {
            name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME1,
            preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET1
        },
        2: {
            name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME2,
            preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET2
        },
        3: {
            name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME3,
            preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET3
        },
        4: {
            name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME4,
            preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET4
        }
    };

    const cloudName = accounts[index]?.name;
    const uploadPreset = accounts[index]?.preset;

    if (!cloudName || !uploadPreset) {
        // Fallback to account 0 if the current indexed account is missing
        if (index > 0) {
            rotationIndex = 0;
            const fallbackName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const fallbackPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
            if (fallbackName && fallbackPreset) {
                return { cloudName: fallbackName, uploadPreset: fallbackPreset, index: 0 };
            }
        }
        throw new Error(`Cloudinary account ${index} configuration missing`);
    }

    // Increment for next call BEFORE validation to ensure we don't get stuck
    rotationIndex = (rotationIndex + 1) % ACCOUNT_COUNT;

    return {
        cloudName,
        uploadPreset,
        index
    };
}

/**
 * Upload buffer to Cloudinary with automatic account rotation and retry
 */
export async function uploadBufferWithRotation(
    buffer: Buffer,
    filename?: string,
    mimeType: string = "image/webp",
    maxRetries: number = 3
): Promise<any> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const account = getNextCloudinaryAccount();

            const formData = new FormData();
            const blob = new Blob([buffer as any], { type: mimeType });
            formData.append("file", blob, filename || "image");
            formData.append("upload_preset", account.uploadPreset);
            formData.append("resource_type", "auto");

            if (process.env.NODE_ENV === 'development') {
                console.log(`[Cloudinary] Uploading to account ${account.index} (${account.cloudName})`);
            }

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${account.cloudName}/auto/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();

            if (process.env.NODE_ENV === 'development') {
                console.log(`[Cloudinary] Upload successful to account ${account.index}`);
            }

            return data;
        } catch (error) {
            lastError = error as Error;
            console.error(`[Cloudinary] Upload attempt ${attempt + 1} failed:`, error);

            // If this is the last attempt, throw the error
            if (attempt === maxRetries - 1) {
                break;
            }

            // Wait briefly before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }

    throw new Error(
        `Failed to upload after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`
    );
}
