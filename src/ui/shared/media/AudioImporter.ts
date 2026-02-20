// src/ui/shared/AudioImporter.ts
import { putMediaAsset } from "../../../media/mediaStore.js"

/**
 * Allowed audio MIME types for import.
 * WAV is intentionally excluded due to very large, uncompressed filesize.
 */
const ALLOWED_AUDIO_MIME_TYPES = [
    "audio/mpeg", // mp3
    "audio/ogg",
    "audio/webm",
] as const

type AllowedAudioMimeType = (typeof ALLOWED_AUDIO_MIME_TYPES)[number]

/**
 * Limits
 */
const MAX_AUDIO_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

/**
 * Type guard to validate audio MIME types.
 */
export function isAllowedAudioFile(
    file: File,
): file is File & { type: AllowedAudioMimeType } {
    return ALLOWED_AUDIO_MIME_TYPES.includes(file.type as AllowedAudioMimeType)
}

/**
 * Full audio import pipeline:
 * - Validates MIME type
 * - Checks file size (fast)
 * - Stores the original file blob in IndexedDB via putMediaAsset
 *
 * Returns generated media ID (string)
 */
export async function handleAudioFile(file: File): Promise<string> {
    if (!isAllowedAudioFile(file)) {
        throw new Error("Unsupported audio type")
    }

    if (file.size > MAX_AUDIO_FILE_SIZE_BYTES) {
        throw new Error(
            `Audio file too large (max ${Math.round(
                MAX_AUDIO_FILE_SIZE_BYTES / 1024 / 1024,
            )} MB)`,
        )
    }

    const id = crypto.randomUUID()

    await putMediaAsset({
        id,
        type: "audio",
        mimeType: file.type,
        blob: file,
        size: file.size,
        createdAt: Date.now(),
    })

    return id
}
