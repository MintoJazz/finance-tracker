import type { AttachmentFile, AttachmentInputValue } from "./types"

export function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null || Number.isNaN(bytes) || bytes <= 0) {
    return ""
  }
  const units = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
  return `${size.toFixed(size >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}

export function isImage(nameOrUrlOrType?: string): boolean {
  if (!nameOrUrlOrType) return false
  if (nameOrUrlOrType.startsWith("image/")) return true
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)$/i.test(nameOrUrlOrType)
}

export function normalizeAttachmentValue(value: AttachmentInputValue): AttachmentFile[] {
  if (!value) return []

  const rawArray = Array.isArray(value) ? value : [value]

  return rawArray
    .map((item, index): AttachmentFile | null => {
      if (!item) return null

      if (typeof File !== "undefined" && item instanceof File) {
        return {
          id: `file-${index}-${item.name}`,
          name: item.name,
          size: item.size,
          type: item.type,
          file: item,
          previewUrl: item.type.startsWith("image/") ? URL.createObjectURL(item) : undefined,
          state: "done",
        }
      }

      if (typeof item === "string") {
        const name = item.split("/").pop() || "Arquivo"
        return {
          id: `url-${index}-${name}`,
          name,
          url: item,
          previewUrl: isImage(item) ? item : undefined,
          state: "done",
        }
      }

      if (typeof item === "object") {
        const fileObj = item as AttachmentFile
        return {
          id: fileObj.id ?? `attachment-${index}`,
          name: fileObj.name || "Arquivo",
          size: fileObj.size,
          type: fileObj.type,
          url: fileObj.url,
          file: fileObj.file,
          previewUrl:
            fileObj.previewUrl ||
            (fileObj.file?.type.startsWith("image/")
              ? URL.createObjectURL(fileObj.file)
              : isImage(fileObj.url || fileObj.name)
                ? fileObj.url
                : undefined),
          state: fileObj.state ?? "done",
          error: fileObj.error,
        }
      }

      return null
    })
    .filter((item): item is AttachmentFile => item !== null)
}
