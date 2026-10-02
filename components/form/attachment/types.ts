import type * as React from "react"

export interface AttachmentFile {
  id?: string
  name: string
  size?: number
  type?: string
  url?: string
  file?: File
  previewUrl?: string
  state?: "idle" | "uploading" | "processing" | "error" | "done"
  error?: string
}

export type AttachmentInputValue =
  | File
  | File[]
  | string
  | string[]
  | AttachmentFile
  | AttachmentFile[]
  | null
  | undefined

export interface AttachmentInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Valor controlado do campo (File, File[], string URL, AttachmentFile, etc.) */
  value?: AttachmentInputValue
  /** Callback disparado quando o arquivo ou lista de arquivos é alterado */
  onChange?: (value: any) => void
  /** Callback disparado ao perder o foco */
  onBlur?: () => void
  /** Tipos de arquivos aceitos (ex: "image/*", ".pdf,.docx") */
  accept?: string
  /** Se permite seleção de múltiplos arquivos */
  multiple?: boolean
  /** Quantidade máxima de arquivos quando multiple=true */
  maxFiles?: number
  /** Tamanho máximo por arquivo em bytes (ex: 5 * 1024 * 1024 para 5MB) */
  maxSize?: number
  /** Tamanho visual do card de anexo */
  size?: "default" | "sm" | "xs"
  /** Orientação do card de anexo (horizontal para listagem, vertical para formato avatar/card) */
  orientation?: "horizontal" | "vertical"
  /** Texto placeholder quando não há arquivo selecionado */
  placeholder?: string
  /** Descrição adicional de ajuda (ex: "PNG, JPG até 5MB") */
  helperText?: string
  /** Se o campo está desabilitado */
  disabled?: boolean
  /** ID para acessibilidade e label */
  id?: string
  /** Nome do campo */
  name?: string
  /** Indicador de erro do react-hook-form */
  "aria-invalid"?: boolean
}
