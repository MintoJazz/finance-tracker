import { ViewRenderer } from "@/components/adaptive"
import { SignupView } from "@/modules/auth/ui/views/signup"
import { useSignupView } from "@/modules/auth/ui/views/signup/hook"

interface Props {
    searchParams?: Promise<{
        callbackUrl?: string
    }>
}

export default async function SignupPage({ searchParams }: Props) {
    const resolvedParams = await searchParams
    const callbackUrl = resolvedParams?.callbackUrl
    const data = { callbackUrl }

    const hook = useSignupView
    const View = SignupView

    const props = { data, hook, View }

    return <ViewRenderer {...props} />
}