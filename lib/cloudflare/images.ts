const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const CF_API_TOKEN = process.env.CLOUDFLARE_IMAGES_API_TOKEN!;

export interface CloudflareImageResult {
    id: string;
    url: string;
    variants: string[];
}

/**
 * Upload a file to Cloudflare Images.
 * Returns the image ID and CDN variant URLs.
 */
export async function uploadImage(file: File | Blob, metadata?: Record<string, string>): Promise<CloudflareImageResult> {
    const formData = new FormData();
    formData.append("file", file);
    if (metadata) {
        formData.append("metadata", JSON.stringify(metadata));
    }

    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1`, {
        method: "POST",
        headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Cloudflare Images upload failed: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    return {
        id: data.result.id,
        url: data.result.variants[0],
        variants: data.result.variants,
    };
}

/**
 * Delete an image from Cloudflare Images.
 */
export async function deleteImage(imageId: string): Promise<void> {
    const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1/${imageId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${CF_API_TOKEN}` } }
    );
    if (!res.ok) throw new Error("Failed to delete Cloudflare image");
}

/**
 * Get a CDN URL for an image with a specific variant.
 */
export function getImageUrl(imageId: string, variant = "public"): string {
    return `https://imagedelivery.net/${CF_ACCOUNT_ID}/${imageId}/${variant}`;
}
