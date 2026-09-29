import { Button } from "@/components/ui/button"
import { onLogout } from "../actions/logout.action"
import { ComponentProps } from "react"

export function LogoutButton({...props}: ComponentProps<typeof Button>) {
    return (
        <form action={onLogout}>
            <Button {...props} type="submit">
                Sair
            </Button>
        </form>
    )
}