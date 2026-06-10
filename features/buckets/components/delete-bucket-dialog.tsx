import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: () => void
}

export default function DeleteBucket({ onSubmit, ...dialogDrilling }: Props) {
    return <AlertDialog {...dialogDrilling}>
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