import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, FieldErrors, Resolver } from "react-hook-form"
import { toast } from "sonner"
import { bucketSchema, BucketFormType } from "../form/schema/bucket-schema"
import { Dialog, DialogDescription, DialogTitle, DialogContent, DialogHeader } from "@/components/ui/dialog"
import BucketForm from "../form/bucket-form"
import { toSchema } from "../mappers/toSchema"
import { Bucket } from "@/generated/prisma/client"

interface Props {
    target: Bucket | null
    open: boolean
    onOpenChange?: (open: boolean) => void
    onSubmit: (data: BucketFormType) => void;
}

export default function UpdateBucket({ target, onSubmit, ...dialogDrilling }: Props) {
    const values = toSchema(target!)

    const resolver = zodResolver(bucketSchema) as Resolver<BucketFormType>
    const form = useForm<BucketFormType>({
        resolver,
        values,
        mode: "onChange"
    })

    const handleOnError = (errors: FieldErrors<BucketFormType>) => {
        toast.error("Erro ao criar Bucket!")
        console.log("❌ FALHA NA VALIDAÇÃO:", errors)
    }

    return <Dialog {...dialogDrilling} >
        <DialogContent className="max-h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>Novo Bucket</DialogTitle>
                <DialogDescription>Insira aqui os dados para criar um novo Bucket</DialogDescription>
            </DialogHeader>
            <div className="flex-1 min-h-0 overflow-y-auto p-1 no-scrollbar">
                <BucketForm form={form} onSubmit={onSubmit} onError={handleOnError} />
            </div>
        </DialogContent>
    </Dialog>
}