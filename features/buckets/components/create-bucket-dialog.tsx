import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BucketFormType, bucketSchema } from "../form/schema/bucket-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, Resolver, useForm } from "react-hook-form";
import { BucketType } from "@/generated/prisma/enums";
import BucketForm from "../form/bucket-form";

interface Props {
    isOpen: boolean
    onClose?: (open: boolean) => void
    onError?: (errors: FieldErrors<BucketFormType>) => void;
    onSubmit: (data: BucketFormType) => void;
}

export default function CreateBucket({ onSubmit, onError, isOpen, onClose }: Props) {
    const resolver = zodResolver(bucketSchema) as Resolver<BucketFormType>
    const form = useForm<BucketFormType>({
        resolver,
        defaultValues: {
            description: "",
            userId: 1,
            type: BucketType.WALLET
        },
    })

    return <Dialog open={isOpen} onOpenChange={onClose} >
        <DialogContent className="max-h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>Novo Bucket</DialogTitle>
                <DialogDescription>Insira aqui os dados para criar um novo Bucket</DialogDescription>
            </DialogHeader>

            <BucketForm form={form} onSubmit={onSubmit} onError={onError} />

        </DialogContent>
    </Dialog>
}