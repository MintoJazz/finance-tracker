import { redirect } from "next/navigation";
import { ViewContainer } from "@/components/adaptive";
import { ErrorView } from "@/components/error-view";
import { getDeviceViewport } from "@/lib/device";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { getRecurrenceProfileAction } from "@/modules/recurrences/ui/actions/get-recurrence-profile.action";
import { getRecurrenceCyclesAction } from "@/modules/recurrences/ui/actions/get-recurrence-cycles.action";
import { RecurrenceProfileAdaptiveConfig } from "@/modules/recurrences/ui/views/recurrence-profile";
import { RecurrenceCycleStatusFilterSchema } from "@/modules/recurrences/models/schemas/recurrence-cycle-filters.schema";

interface RecurrenceProfilePageProps {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{
        offset?: string;
        status?: string;
        includeProjected?: string;
        q?: string;
    }>;
}

export default async function RecurrenceProfilePage(
    props: RecurrenceProfilePageProps
) {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const params = await props.params;
    const recurrenceId = Number(params.id);

    if (Number.isNaN(recurrenceId) || recurrenceId <= 0) {
        return (
            <ErrorView
                title="Identificador Inválido"
                error="O identificador da recorrência informado na rota é inválido."
            />
        );
    }

    const searchParams = props.searchParams
        ? await props.searchParams
        : undefined;

    const parsedOffset = searchParams?.offset
        ? parseInt(searchParams.offset, 10)
        : 0;
    const offset = Number.isNaN(parsedOffset) ? 0 : parsedOffset;

    const parsedStatus = RecurrenceCycleStatusFilterSchema.safeParse(
        searchParams?.status
    );
    const status = parsedStatus.success ? parsedStatus.data : "ALL";

    const includeProjected =
        searchParams?.includeProjected === "false" ? false : true;

    const q = searchParams?.q?.trim() || undefined;

    // 1. Busca perfil da recorrência (SSR)
    const profileResult = await getRecurrenceProfileAction(recurrenceId);

    if (!profileResult.success || !profileResult.data) {
        return (
            <ErrorView
                title="Erro ao carregar recorrência"
                error={
                    profileResult.error ??
                    "Não foi possível carregar os dados da recorrência."
                }
            />
        );
    }

    const profile = profileResult.data;

    // 2. Busca ciclos do macro-horizonte (SSR)
    const cyclesResult = await getRecurrenceCyclesAction(recurrenceId, {
        offset,
        status,
        includeProjected,
        q,
    });

    const initialCyclesData =
        cyclesResult.success && cyclesResult.data ? cyclesResult.data : null;

    const initialViewport = await getDeviceViewport();

    return (
        <ViewContainer
            initialViewport={initialViewport}
            data={{
                balanceId: recurrenceId,
                profile,
                initialCyclesData,
            }}
            {...RecurrenceProfileAdaptiveConfig}
        />
    );
}

