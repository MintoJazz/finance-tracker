import { ViewContainer } from "@/components/adaptive";
import { ErrorView } from "@/components/error-view";
import { WalletProfileAdaptiveConfig } from "@/modules/wallets/ui/views/wallet-profile";
import { getDeviceViewport } from "@/lib/device";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { WalletFactory } from "@/modules/wallets/infra/factories/wallet.factory";
import { MovementFactory } from "@/modules/movements/infra/factories/movement.factory";
import { redirect } from "next/navigation";

interface WalletProfilePageProps {
    params: Promise<{ id: string }>;
}

export default async function WalletProfilePage(props: WalletProfilePageProps) {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

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

    const profileUseCase = WalletFactory.makeGetWalletProfileUseCase();
    const profileResult = await profileUseCase.execute({
        session,
        walletId,
    });

    if (!profileResult.success || !profileResult.data) {
        return (
            <ErrorView
                title="Erro ao carregar carteira"
                error={profileResult.error ?? "Não foi possível carregar os dados da carteira."}
            />
        );
    }

    const movementsUseCase = MovementFactory.makeGetWalletMovementsUseCase();
    const movementsResult = await movementsUseCase.execute({
        session,
        walletId,
        pageRequest: { page: 1, pageSize: 10 },
        filter: {},
    });

    const initialViewport = await getDeviceViewport();

    return (
        <ViewContainer
            initialViewport={initialViewport}
            data={{
                walletId,
                profile: profileResult.data,
                initialMovements: movementsResult.success && movementsResult.data ? movementsResult.data : null,
            }}
            {...WalletProfileAdaptiveConfig}
        />
    );
}
