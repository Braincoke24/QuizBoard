// src/ui/shared/ImageImporter.ts
import { putMediaAsset } from "../../media/mediaStore.js"

/**
 * Allowed image MIME types for import.
 * SVG is intentionally excluded for security reasons.
 */
const ALLOWED_IMAGE_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
] as const

type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number]

/**
 * Maximum output image dimensions.
 * Images larger than this will be downscaled proportionally.
 */
const MAX_IMAGE_WIDTH = 1600
const MAX_IMAGE_HEIGHT = 1600

/**
 * Output encoding configuration.
 */
const OUTPUT_IMAGE_TYPE = "image/webp"
const OUTPUT_IMAGE_QUALITY = 0.85

/**
 * Type guard to validate image MIME types.
 */
function isAllowedImageFile(
    file: File,
): file is File & { type: AllowedImageMimeType } {
    return ALLOWED_IMAGE_MIME_TYPES.includes(file.type as AllowedImageMimeType)
}

/**
 * Loads an image element from a File object.
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file)
        const image = new Image()

        image.onload = () => {
            URL.revokeObjectURL(objectUrl)
            resolve(image)
        }

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl)
            reject(new Error("Failed to load image file"))
        }

        image.src = objectUrl
    })
}

/**
 * Resizes an image to fit within the given bounds while preserving aspect ratio.
 */
function resizeImage(
    image: HTMLImageElement,
    maxWidth: number,
    maxHeight: number,
): HTMLCanvasElement {
    let { width, height } = image

    const widthRatio = maxWidth / width
    const heightRatio = maxHeight / height
    const scale = Math.min(1, widthRatio, heightRatio)

    width = Math.round(width * scale)
    height = Math.round(height * scale)

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext("2d")
    if (!context) {
        throw new Error("Failed to acquire 2D canvas context")
    }

    context.drawImage(image, 0, 0, width, height)

    return canvas
}

/**
 * Converts a canvas to a Blob using the configured output format.
 */
function canvasToBlob(
    canvas: HTMLCanvasElement,
    type: string,
    quality: number,
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error("Failed to encode image"))
                    return
                }

                resolve(blob)
            },
            type,
            quality,
        )
    })
}

/**
 * Full import pipeline:
 * - Validates MIME type
 * - Loads image
 * - Downscales if necessary
 * - Re-encodes to a safe, compact format
 *
 * Returns a Blob ready for storage (IndexedDB, Cache, etc.).
 */
export async function handleImageFile(file: File): Promise<string> {
    if (!isAllowedImageFile(file)) {
        throw new Error("Unsupported image type")
    }

    const image = await loadImageFromFile(file)

    const canvas = resizeImage(image, MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT)

    const blob = await canvasToBlob(
        canvas,
        OUTPUT_IMAGE_TYPE,
        OUTPUT_IMAGE_QUALITY,
    )

    const id = crypto.randomUUID()

    await putMediaAsset({
        id: id,
        type: "image",
        mimeType: blob.type,
        blob: blob,
        size: blob.size,
        createdAt: Date.now(),
    })

    return id
}
