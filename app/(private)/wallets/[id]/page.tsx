import { ViewContainer } from "@/components/adaptive";
import { ErrorView } from "@/components/error-view";
import { WalletProfileAdaptiveConfig } from "@/modules/account/ui/views/wallet-profile";

interface WalletProfilePageProps {
    params: Promise<{ id: string }>;
}

export default async function WalletProfilePage(props: WalletProfilePageProps) {
    const params = await props.params;
    const walletId = Number(params.id);

    if (Number.isNaN(walletId) || walletId <= 0) {
        return (
            <ErrorView
                title="Identificador Inválido"
                error="O identificador da carteira informado na rota é inválido."
            />
        );
    }

    return (
        <ViewContainer
            data={{ walletId }}
            {...WalletProfileAdaptiveConfig}
        />
    );
}
