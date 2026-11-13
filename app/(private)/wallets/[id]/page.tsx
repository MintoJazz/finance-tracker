import { ViewContainer } from "@/components/adaptive";
import { ErrorView } from "@/components/error-view";
import { WalletProfileAdaptiveConfig } from "@/modules/wallets/ui/views/wallet-profile";
import { getDeviceViewport } from "@/lib/device";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { WalletFactory } from "@/modules/wallets/infra/factories/wallet.factory";
import { MovementFactory } from "@/modules/movements/infra/factories/movement.factory";
import {
    MovementEntryType,
    MovementEntryTypeSchema,
} from "@/modules/movements/models/movement-entry.schema";
import { WalletMovementFilters } from "@/modules/movements/models/wallet-movement.schema";
import { redirect } from "next/navigation";

interface WalletProfilePageProps {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{
        page?: string;
        pageSize?: string;
        q?: string;
        from?: string;
        to?: string;
        direction?: string;
        types?: string;
        includeReversed?: string;
    }>;
}

export default async function WalletProfilePage(props: WalletProfilePageProps) {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const [params, rawSearchParams] = await Promise.all([
        props.params,
        props.searchParams,
    ]);
    const walletId = Number(params.id);
    const searchParams = rawSearchParams ?? {};

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

    const rawPage = Number(searchParams.page);
    const rawPageSize = Number(searchParams.pageSize);
    const page = !Number.isNaN(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const pageSize = !Number.isNaN(rawPageSize) && rawPageSize > 0 ? Math.floor(rawPageSize) : 10;

    const rawTypes = searchParams.types;
    const types = rawTypes
        ? (rawTypes
              .split(",")
              .map((t) => t.trim())
              .filter((t) =>
                  MovementEntryTypeSchema.options.includes(t as MovementEntryType)
              ) as MovementEntryType[])
        : undefined;

    const filter: WalletMovementFilters = {
        q: searchParams.q?.trim() || undefined,
        from: searchParams.from || undefined,
        to: searchParams.to || undefined,
        direction:
            searchParams.direction === "CREDIT" || searchParams.direction === "DEBIT"
                ? searchParams.direction
                : undefined,
        types: types && types.length > 0 ? types : undefined,
        includeReversed: searchParams.includeReversed === "true" ? true : undefined,
    };

    const movementsUseCase = MovementFactory.makeGetWalletMovementsUseCase();
    const movementsResult = await movementsUseCase.execute({
        session,
        walletId,
        pageRequest: { page, pageSize },
        filter,
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
