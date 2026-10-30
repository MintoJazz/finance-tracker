import { ViewContainer } from "@/components/adaptive";
import { ErrorView } from "@/components/error-view";
import { CardProfileAdaptiveConfig } from "@/modules/cards/ui/views/card-profile";
import { getDeviceViewport } from "@/lib/device";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { CardFactory } from "@/modules/cards/infra/factories/card.factory";
import { MovementFactory } from "@/modules/movements/infra/factories/movement.factory";
import { redirect } from "next/navigation";

interface CardProfilePageProps {
    params: Promise<{ id: string }>;
}

export default async function CardProfilePage(props: CardProfilePageProps) {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const params = await props.params;
    const cardId = Number(params.id);

    if (Number.isNaN(cardId) || cardId <= 0) {
        return (
            <ErrorView
                title="Identificador Inválido"
                error="O identificador do cartão informado na rota é inválido."
            />
        );
    }

    const profileUseCase = CardFactory.makeGetCardProfileUseCase();
    const profileResult = await profileUseCase.execute({
        session,
        cardId,
    });

    if (!profileResult.success || !profileResult.data) {
        return (
            <ErrorView
                title="Erro ao carregar cartão"
                error={profileResult.error ?? "Não foi possível carregar os dados do cartão."}
            />
        );
    }

    const profile = profileResult.data;
    const activeCycle = profile.cycles.find((c) => c.status === "OPEN") ?? profile.cycles.at(-1);

    const movementsUseCase = MovementFactory.makeGetCardMovementsUseCase();
    const movementsResult = await movementsUseCase.execute({
        session,
        cardId,
        pageRequest: { page: 1, pageSize: 10 },
        filter: activeCycle ? { from: activeCycle.from, to: activeCycle.to } : {},
    });

    const initialViewport = await getDeviceViewport();

    return (
        <ViewContainer
            initialViewport={initialViewport}
            data={{
                cardId,
                profile,
                initialMovements: movementsResult.success && movementsResult.data ? movementsResult.data : null,
            }}
            {...CardProfileAdaptiveConfig}
        />
    );
}