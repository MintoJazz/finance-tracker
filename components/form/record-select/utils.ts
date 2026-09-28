import type { RecordOptions } from "./types"

export function getRecordEntries(options: RecordOptions, keys?: string[]) {
  return Object.entries(options).filter(([key]) => (keys ? keys.includes(key) : true))
}