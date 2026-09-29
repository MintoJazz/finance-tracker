import { Button } from "@/components/ui/button"
import { onLogout } from "../actions/logout.action"

export function LogoutButton() {
    return (
        <form action={onLogout}>
            <Button type="submit" variant="outline">
                Sair
            </Button>
        </form>
    )
}