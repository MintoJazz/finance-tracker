import { PageRequest, Page } from "@/types/pagination.types";
import { BaseFilter } from "@/types/filters.types";
import { ContractSummaryItem, ContractTypeCounts } from "@/modules/contracts/models/contract.schema";

export interface ContractFilter extends BaseFilter {
    type?: "ALL" | "PAYABLE" | "RECEIVABLE";
}

export interface IContractQueries {
    listContractsByContextId(
        contextId: number,
        pageRequest: PageRequest,
        filter?: ContractFilter
    ): Promise<{ page: Page<ContractSummaryItem>; counts: ContractTypeCounts }>;
}
