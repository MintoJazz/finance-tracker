import { ViewRenderer } from "@/components/adaptive";
import { LoginView } from "@/modules/identity/ui/views/login";
import { useLoginView } from "@/modules/identity/ui/views/login/hook";

interface LoginPageProps {
    searchParams: Promise<{ callbackUrl?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const { callbackUrl } = await searchParams
    const data = { callbackUrl }
    
    const hook = useLoginView
    const View = LoginView
    const props = { hook, View, data }

    return <ViewRenderer {...props} />
}