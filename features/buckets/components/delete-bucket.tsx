import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: () => void
}

export default function DeleteBucket({ open, onOpenChange, onSubmit }: Props) {
    return <AlertDialog open={open} onOpenChange={onOpenChange} >
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Excluir o Bucket?</AlertDialogTitle>
                <AlertDialogDescription>
                    Essa ação nâo pode ser desfeita.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onSubmit}>Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
}