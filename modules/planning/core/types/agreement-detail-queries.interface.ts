import {
    AgreementAmountHistoryItem,
    AgreementDetailRule,
} from "../schemas/agreement-detail.schema";
import {
    AgreementCycleSourceData,
    CycleWindow,
} from "./commitment-cycle-engine.interface";

export interface AgreementEntityData {
    id: number;
    balanceId: number;
    balanceName: string;
    balanceType: "COMMITMENT" | "PAYABLE" | "RECEIVABLE" | "CREDIT";
    includeInProjection: boolean;
    startsAt: Date;
    endsAt: Date | null;
    isArchived: boolean;
    rule: AgreementDetailRule | null;
    amountHistory: AgreementAmountHistoryItem[];
}

export interface IAgreementDetailQueries {
    findAgreementDetail(
        contextId: number,
        identifier: { agreementId?: number; balanceId?: number }
    ): Promise<AgreementEntityData | null>;

    findAgreementCycleSource(
        contextId: number,
        identifier: { agreementId?: number; balanceId?: number },
        window: CycleWindow
    ): Promise<AgreementCycleSourceData | null>;
}
