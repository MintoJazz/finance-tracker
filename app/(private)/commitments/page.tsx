import { ViewContainer } from "@/components/adaptive";
import { CommitmentsOverviewAdaptiveConfig } from "@/modules/planning/ui/views/commitments-overview";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { CommitmentCycleMockService } from "@/modules/planning/infra/mock/commitment-cycle.mock";
import { getPeriodPresetRange } from "@/modules/planning/ui/hooks/use-commitment-cycle-filters";
import { redirect } from "next/navigation";

export default async function CommitmentsPage() {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const defaultRange = getPeriodPresetRange("current_month");

    const [summaryResult, cyclesResult] = await Promise.all([
        CommitmentCycleMockService.getSummary({ filter: defaultRange }),
        CommitmentCycleMockService.getCycles({
            pageRequest: { page: 1, pageSize: 10 },
            filter: defaultRange,
        }),
    ]);

    return (
        <ViewContainer
            data={{
                title: "Meus Compromissos",
                initialSummary: summaryResult.success && summaryResult.data ? summaryResult.data : null,
                initialCycles: cyclesResult.success && cyclesResult.data ? cyclesResult.data : null,
            }}
            {...CommitmentsOverviewAdaptiveConfig}
        />
    );
}