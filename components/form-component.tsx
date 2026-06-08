import { FieldValues, FormProvider, SubmitErrorHandler, UseFormReturn } from "react-hook-form";
import { ReactNode } from "react";
import { FieldGroup } from "./ui/field";
import { Button } from "./ui/button";

interface Props<T extends FieldValues> {
    id: string
    submitText?: string
    children: ReactNode
    form: UseFormReturn<T>
    onError?: SubmitErrorHandler<T>
    onSubmit: (form: T) => void,
}

export default function Form<T extends FieldValues>({ id, form, onSubmit, onError, children, submitText = "Salvar" }: Props<T>) {
    return <FormProvider {...form}>
        <form id={id} onSubmit={form.handleSubmit(onSubmit, onError)} className="flex flex-col gap-6">
            <FieldGroup className="gap-2">
                {children}
            </FieldGroup>
            <Button type="submit" form={id}>
                {submitText}
            </Button>
        </form>
    </FormProvider>
}