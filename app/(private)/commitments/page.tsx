import { ViewContainer } from "@/components/adaptive";
import { CommitmentsOverviewAdaptiveConfig } from "@/modules/planning/ui/views/commitments-overview";

export default function CommitmentsPage() {
    return (
        <ViewContainer
            data={{ title: "Meus Compromissos" }}
            {...CommitmentsOverviewAdaptiveConfig}
        />
    );
}