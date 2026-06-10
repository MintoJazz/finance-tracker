"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BucketFormType, bucketSchema } from "../form/schema/bucket-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, Resolver, useForm } from "react-hook-form";
import { BucketType } from "@/generated/prisma/enums";
import BucketForm from "../form/bucket-form";
import { UserOption } from "@/types/database";
import { UserProvider } from "@/features/user/context/user-options-provider";
import { useEffect, useState } from "react";
import { findAllUserOptions } from "@/features/user/server/queries";
import { toast } from "sonner";

interface Props {
    isOpen: boolean
    onClose?: (open: boolean) => void
    onError?: (errors: FieldErrors<BucketFormType>) => void;
    onSubmit: (data: BucketFormType) => void;
}

export default function CreateBucket({ onSubmit, onError, isOpen, onClose }: Props) {
    const [users, setUsers] = useState<UserOption[]>()
    useEffect(() => {
        findAllUserOptions().then(setUsers)
    }, [])

    const resolver = zodResolver(bucketSchema) as Resolver<BucketFormType>
    const form = useForm<BucketFormType>({
        resolver,
        defaultValues: {
            name: "",
            type: BucketType.WALLET
        },
        mode: "onChange"
    })

    const handleOnError = (errors: FieldErrors<BucketFormType>) => {
        toast.error("Erro ao criar Transação!")
        console.log("❌ FALHA NA VALIDAÇÃO:", errors)
        if (onError) onError(errors)
    }

    return <UserProvider users={users ?? []}>
        <Dialog open={isOpen} onOpenChange={onClose} >
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
    </UserProvider>
}