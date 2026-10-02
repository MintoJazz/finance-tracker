"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Loader2,
  Sparkles,
  UploadCloud,
  User,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { updateAvatarAction } from "@/modules/identity/ui/actions/update-avatar.action"
import { useUpload } from "@/modules/storage/ui/hooks/use-upload"

export interface SignupAvatarStepProps {
  onComplete?: () => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"]

export function SignupAvatarStep({ onComplete }: SignupAvatarStepProps) {
  const router = useRouter()
  const { upload, isUploading } = useUpload()
  const [file, setFile] = React.useState<File | undefined>(undefined)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Gerencia o ciclo de vida da URL de preview
  React.useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  const handleFinish = () => {
    if (onComplete) {
      onComplete()
    } else {
      router.push("/")
    }
  }

  const validateAndSetFile = (selectedFile: File) => {
    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      toast.add({
        type: "error",
        title: "Formato inválido",
        description: "Envie uma imagem em formato PNG, JPG ou WebP.",
        priority: "high",
      })
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.add({
        type: "error",
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB.",
        priority: "high",
      })
      return
    }

    setFile(selectedFile)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      validateAndSetFile(selected)
    }
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const handleRemoveFile = () => {
    setFile(undefined)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
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

    const droppedFile = e.dataTransfer?.files?.[0]
    if (droppedFile) {
      validateAndSetFile(droppedFile)
    }
  }

  const handleSaveAvatar = async () => {
    if (!file) return

    setIsSubmitting(true)
    try {
      // 1. Upload direto para o storage S3 via presigned URL e confirmação
      const uploadResult = await upload(file, "AVATAR")
      if (!uploadResult.success) {
        toast.add({
          type: "error",
          title: "Falha ao enviar foto",
          description: uploadResult.error,
          priority: "high",
        })
        return
      }

      // 2. Vincula a chave do anexo confirmado ao perfil do usuário
      const linkResult = await updateAvatarAction(uploadResult.data.attachmentId)
      if (!linkResult.success) {
        toast.add({
          type: "error",
          title: "Falha ao atualizar foto",
          description: linkResult.error,
          priority: "high",
        })
        return
      }

      toast.add({
        type: "success",
        title: "Foto atualizada com sucesso!",
        description: "Seu perfil foi configurado.",
      })

      handleFinish()
    } catch (error) {
      console.error("[SignupAvatarStep] Erro ao salvar avatar:", error)
      toast.add({
        type: "error",
        title: "Erro inesperado",
        description: "Não foi possível salvar a foto. Tente novamente.",
        priority: "high",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = isUploading || isSubmitting

  return (
    <div className="w-full flex flex-col items-center gap-6 animate-in fade-in-50 duration-300">
      {/* Input nativo oculto */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFileChange}
        disabled={isLoading}
        className="hidden sr-only"
        tabIndex={-1}
      />

      {/* Topo do Passo */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Sparkles className="size-3.5" />
          <span>Conta criada com sucesso!</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Personalize seu Perfil
        </h1>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          Adicione uma foto para ser facilmente identificado por outros membros no seu espaço.
        </p>
      </div>

      {/* Seletor Circular de Avatar */}
      <div className="flex flex-col items-center gap-4 py-2">
        <button
          type="button"
          onClick={() => !isLoading && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-label={previewUrl ? "Alterar foto de perfil" : "Selecionar foto de perfil"}
          className={cn(
            "group relative size-32 sm:size-36 rounded-full cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "flex items-center justify-center overflow-hidden border-2 p-0",
            isDragging
              ? "border-primary bg-primary/10 scale-105"
              : previewUrl
                ? "border-primary/80 shadow-md ring-4 ring-primary/10"
                : "border-dashed border-muted-foreground/30 bg-muted/40 hover:border-primary/60 hover:bg-muted/70",
            isLoading && "cursor-not-allowed opacity-60"
          )}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Pré-visualização do perfil"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-colors">
              <User className="size-12 stroke-[1.5]" />
            </div>
          )}

          {/* Overlay hover para trocar/adicionar foto */}
          {!isLoading && (
            <div
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center bg-black/45 text-white transition-opacity",
                previewUrl ? "opacity-0 group-hover:opacity-100" : "opacity-0"
              )}
            >
              <UploadCloud className="size-6 mb-1" />
              <span className="text-[11px] font-medium">Trocar foto</span>
            </div>
          )}

          {/* Badge de câmera no canto inferior direito quando vazio */}
          {!previewUrl && !isLoading && (
            <div className="absolute bottom-1 right-1 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-2 ring-background">
              <Camera className="size-4" />
            </div>
          )}
        </button>

        {/* Informações ou Ações da Foto */}
        {file ? (
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-xs font-medium text-foreground max-w-50 truncate">
              {file.name}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={isLoading}
                className="h-7 text-xs px-2.5"
              >
                Trocar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={isLoading}
                className="h-7 text-xs px-2 text-muted-foreground hover:text-destructive gap-1"
              >
                <X className="size-3.5" />
                Remover
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-0.5">
            <p className="text-xs font-medium text-foreground">
              Clique ou arraste uma foto aqui
            </p>
            <p className="text-[11px] text-muted-foreground">
              PNG, JPG ou WebP até 5MB
            </p>
          </div>
        )}
      </div>

      {/* Ações de Conclusão */}
      <div className="w-full flex flex-col gap-2 pt-2 border-t border-border">
        <Button
          type="button"
          onClick={handleSaveAvatar}
          disabled={!file || isLoading}
          className="w-full gap-2 h-10 font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Enviando foto...</span>
            </>
          ) : (
            <>
              <span>Salvar e Continuar</span>
              <CheckCircle2 className="size-4" />
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={handleFinish}
          disabled={isLoading}
          className="w-full text-xs text-muted-foreground hover:text-foreground gap-1.5 h-9"
        >
          <span>Pular por enquanto</span>
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

