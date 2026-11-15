import { ViewContainer } from "@/components/adaptive";
import { ErrorView } from "@/components/error-view";
import { CardProfileAdaptiveConfig } from "@/modules/cards/ui/views/card-profile";
import { getDeviceViewport } from "@/lib/device";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { CardFactory } from "@/modules/cards/infra/factories/card.factory";
import { CycleFactory } from "@/modules/cycles/infra/factories/cycle.factory";
import { MovementFactory } from "@/modules/movements/infra/factories/movement.factory";
import { mapCycleDetailOutputToCycleDetail } from "@/modules/cycles/infra/mappers/cycle-detail.mapper";
import { redirect } from "next/navigation";

interface CardProfilePageProps {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ from?: string; to?: string }>;
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

    const searchParams = props.searchParams ? await props.searchParams : undefined;
    const range =
        searchParams?.from && searchParams?.to
            ? { from: searchParams.from, to: searchParams.to }
            : undefined;

    // 1. Busca perfil do cartão
    const profileUseCase = CardFactory.makeGetCardProfileUseCase();
    const profileResult = await profileUseCase.execute({
        session,
        cardId,
    });

    if (!profileResult.success || !profileResult.data) {
        return (
            <ErrorView
                title="Erro ao carregar cartão"
                error={
                    profileResult.error ??
                    "Não foi possível carregar os dados do cartão."
                }
            />
        );
    }

    const profile = profileResult.data;

    // 2. Busca detalhe do ciclo (específico ou ativo na data corrente)
    const cycleUseCase = CycleFactory.makeGetCycleDetailUseCase();
    const cycleResult = await cycleUseCase.execute({
        session,
        balanceId: cardId,
        range,
    });

    const initialDetail =
        cycleResult.success && cycleResult.data
            ? mapCycleDetailOutputToCycleDetail(cycleResult.data)
            : null;

    // 3. Busca lançamentos da fatura para o ciclo resolvido
    const activeRange = initialDetail
        ? { from: initialDetail.from, to: initialDetail.to }
        : range;

    const movementsUseCase = MovementFactory.makeGetCardMovementsUseCase();
    const movementsResult = await movementsUseCase.execute({
        session,
        cardId,
        pageRequest: { page: 1, pageSize: 10 },
        filter: activeRange
            ? {
                  from: activeRange.from,
                  to: activeRange.to,
                  includeReversed: false,
              }
            : undefined,
    });

    const initialMovements =
        movementsResult.success && movementsResult.data
            ? movementsResult.data
            : null;

    const initialViewport = await getDeviceViewport();

    return (
        <ViewContainer
            initialViewport={initialViewport}
            data={{
                cardId,
                profile,
                initialDetail,
                initialMovements,
                range: activeRange,
            }}
            {...CardProfileAdaptiveConfig}
        />
    );
}
