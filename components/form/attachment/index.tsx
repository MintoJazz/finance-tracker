"use client"

import * as React from "react"
import { FileText, FileUp, Plus, X } from "lucide-react"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { cn } from "@/lib/utils"

import type { AttachmentFile, AttachmentInputProps } from "./types"
import { formatFileSize, isImage, normalizeAttachmentValue } from "./utils"

export type { AttachmentFile, AttachmentInputProps, AttachmentInputValue } from "./types"

export function AttachmentInput({
  value,
  onChange,
  onBlur,
  accept,
  multiple = false,
  maxFiles,
  maxSize,
  size = "default",
  orientation = "horizontal",
  placeholder = "Clique ou arraste para enviar",
  helperText,
  disabled = false,
  id,
  name,
  className,
  "aria-invalid": ariaInvalid,
  ...props
}: AttachmentInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Normaliza o valor atual em uma lista de itens com metadados
  const normalizedItems = React.useMemo(() => {
    return normalizeAttachmentValue(value)
  }, [value])

  const handleOpenFileDialog = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const validateFiles = (files: File[]): { valid: File[]; error?: string } => {
    if (maxSize) {
      const oversized = files.find((f) => f.size > maxSize)
      if (oversized) {
        return {
          valid: [],
          error: `O arquivo ${oversized.name} excede o tamanho máximo de ${formatFileSize(maxSize)}.`,
        }
      }
    }

    if (maxFiles && multiple) {
      const totalCount = normalizedItems.length + files.length
      if (totalCount > maxFiles) {
        return {
          valid: [],
          error: `Limite máximo de ${maxFiles} arquivos atingido.`,
        }
      }
    }

    return { valid: files }
  }

  const handleFilesAdded = (newFiles: FileList | File[] | null) => {
    if (!newFiles || newFiles.length === 0) return
    setErrorMessage(null)

    const fileArray = Array.from(newFiles)
    const { valid, error } = validateFiles(fileArray)

    if (error) {
      setErrorMessage(error)
      return
    }

    if (multiple) {
      // Extrai os arquivos brutos anteriores se existirem, ou cria array
      const existingFiles: (File | string | AttachmentFile)[] = normalizedItems.map(
        (item) => item.file ?? item.url ?? item
      )
      const updated = [...existingFiles, ...valid]
      onChange?.(updated)
    } else {
      // Modo único: passa diretamente o File
      onChange?.(valid[0])
    }

    // Limpa o valor do input nativo para permitir selecionar o mesmo arquivo novamente
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const handleNativeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesAdded(e.target.files)
  }

  const handleRemove = (indexToRemove: number) => {
    if (disabled) return
    setErrorMessage(null)

    if (multiple) {
      const updated = normalizedItems
        .filter((_, index) => index !== indexToRemove)
        .map((item) => item.file ?? item.url ?? item)
      onChange?.(updated.length > 0 ? updated : undefined)
    } else {
      onChange?.(undefined)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (disabled) return

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files)
    }
  }

  const canAddMore = multiple ? !maxFiles || normalizedItems.length < maxFiles : normalizedItems.length === 0

  return (
    <div
      id={id}
      data-slot="attachment-input"
      className={cn("w-full space-y-2", className)}
      onBlur={onBlur}
      {...props}
    >
      {/* Input nativo oculto */}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only hidden"
        tabIndex={-1}
        onChange={handleNativeInputChange}
      />

      {/* Lista de itens anexados */}
      {normalizedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {multiple ? (
            <AttachmentGroup className="w-full">
              {normalizedItems.map((item, index) => (
                <AttachmentItemCard
                  key={item.id ?? index}
                  item={item}
                  size={size}
                  orientation={orientation}
                  disabled={disabled}
                  onRemove={() => handleRemove(index)}
                />
              ))}
            </AttachmentGroup>
          ) : (
            <div className="w-full">
              <AttachmentItemCard
                item={normalizedItems[0]}
                size={size}
                orientation={orientation}
                disabled={disabled}
                onRemove={() => handleRemove(0)}
              />
            </div>
          )}
        </div>
      )}

      {/* Área de Upload / Dropzone quando vazio ou quando pode adicionar mais no modo múltiplo */}
      {canAddMore && (
        <button
          type="button"
          disabled={disabled}
          onClick={handleOpenFileDialog}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-4 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isDragging
              ? "border-primary bg-primary/5 text-primary"
              : "border-muted-foreground/25 hover:border-muted-foreground/40 hover:bg-muted/30 text-muted-foreground",
            ariaInvalid && "border-destructive/60 bg-destructive/5 text-destructive",
            disabled && "cursor-not-allowed opacity-50",
            normalizedItems.length > 0 && multiple ? "py-3" : "py-6"
          )}
        >
          {normalizedItems.length > 0 && multiple ? (
            <div className="flex items-center gap-2 text-xs font-medium">
              <Plus className="size-4" />
              <span>Adicionar outro arquivo</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
                <FileUp className="size-4.5" />
              </div>
              <div className="text-xs font-medium text-foreground">
                {placeholder}
              </div>
              {(helperText || accept) && (
                <div className="text-[11px] text-muted-foreground">
                  {helperText ?? (accept ? `Formatos: ${accept}` : undefined)}
                </div>
              )}
            </div>
          )}
        </button>
      )}

      {/* Mensagem de erro de validação local (ex: tamanho de arquivo excedido) */}
      {errorMessage && (
        <p className="text-xs font-medium text-destructive">{errorMessage}</p>
      )}
    </div>
  )
}

interface AttachmentItemCardProps {
  item: AttachmentFile
  size?: "default" | "sm" | "xs"
  orientation?: "horizontal" | "vertical"
  disabled?: boolean
  onRemove: () => void
}

function AttachmentItemCard({
  item,
  size,
  orientation,
  disabled,
  onRemove,
}: AttachmentItemCardProps) {
  const isImg = !!item.previewUrl || isImage(item.name || item.url)

  return (
    <Attachment
      size={size}
      orientation={orientation}
      state={item.state ?? "done"}
      className="w-full max-w-full"
    >
      <AttachmentMedia variant={isImg ? "image" : "icon"}>
        {item.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.previewUrl}
            alt={item.name}
            className="aspect-square size-full object-cover"
          />
        ) : (
          <FileText className="size-4" />
        )}
      </AttachmentMedia>

      <AttachmentContent>
        <AttachmentTitle>{item.name}</AttachmentTitle>
        <AttachmentDescription>
          {formatFileSize(item.size) || (isImg ? "Imagem" : "Documento")}
        </AttachmentDescription>
      </AttachmentContent>

      <AttachmentActions>
        <AttachmentAction
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          aria-label={`Remover ${item.name}`}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="size-3.5" />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  )
}
