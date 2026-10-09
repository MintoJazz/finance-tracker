import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GetCycleEntriesUseCase } from "./get-cycle-entries.use-case";
import { ICycleEntriesQueries } from "../types/cycle-entries-queries.interface";
import { IPlanningAccessProvider } from "../types/space-access-provider.interface";
import { failure, success } from "@/types/result.types";
import { SessionPayload } from "@/modules/identity/infra/cryptography/jwt-utils";
import { CycleEntryItem } from "../schemas/cycle-entries.schema";
import { Page } from "@/types/pagination.types";

describe("GetCycleEntriesUseCase", () => {
    const mockSession: SessionPayload = {
        partyId: 10,
        contextId: 100,
    };

    const mockEntries: CycleEntryItem[] = [
        {
            entryId: 101,
            description: "Aluguel Outubro 2026",
            type: "ACCRUAL",
            referenceDate: new Date(2026, 9, 10),
            dueDate: new Date(2026, 9, 10),
            competanceDate: new Date(2026, 9, 10),
            amount: 280000,
            isReversed: false,
            movements: [
                {
                    movementId: 201,
                    balanceId: 50,
                    balanceName: "Aluguel Apartamento",
                    amount: -280000,
                    direction: "DEBIT",
                },
                {
                    movementId: 202,
                    balanceId: 70,
                    balanceName: "Moradia",
                    amount: 280000,
                    direction: "CREDIT",
                },
            ],
        },
        {
            entryId: 102,
            description: "Pagamento Aluguel Outubro",
            type: "SETTLEMENT",
            referenceDate: new Date(2026, 9, 10),
            dueDate: new Date(2026, 9, 10),
            competanceDate: new Date(2026, 9, 10),
            amount: 280000,
            isReversed: false,
            movements: [
                {
                    movementId: 203,
                    balanceId: 1,
                    balanceName: "Conta Corrente",
                    amount: -280000,
                    direction: "DEBIT",
                },
                {
                    movementId: 204,
                    balanceId: 50,
                    balanceName: "Aluguel Apartamento",
                    amount: 280000,
                    direction: "CREDIT",
                },
            ],
        },
    ];

    it("should return failure when access provider denies permission", async () => {
        const mockAccess: IPlanningAccessProvider = {
            async execute() {
                return failure("Acesso negado");
            },
        };

        const mockQueries: ICycleEntriesQueries = {
            async listCycleEntries() {
                return {
                    data: [],
                    total: 0,
                    pageIndex: 0,
                    pageSize: 10,
                    pageCount: 0,
                };
            },
        };

        const useCase = new GetCycleEntriesUseCase(mockQueries, mockAccess);
        const result = await useCase.execute({
            session: mockSession,
            input: {
                agreementId: 1,
                from: "2026-10-01",
                to: "2026-10-31",
            },
        });

        assert.equal(result.success, false);
        assert.equal(result.error, "Acesso negado");
    });

    it("should return failure when canViewPlanning is false", async () => {
        const mockAccess: IPlanningAccessProvider = {
            async execute() {
                return success({
                    canViewPlanning: false,
                    canManagePlanning: false,
                });
            },
        };

        const mockQueries: ICycleEntriesQueries = {
            async listCycleEntries() {
                return {
                    data: [],
                    total: 0,
                    pageIndex: 0,
                    pageSize: 10,
                    pageCount: 0,
                };
            },
        };

        const useCase = new GetCycleEntriesUseCase(mockQueries, mockAccess);
        const result = await useCase.execute({
            session: mockSession,
            input: {
                agreementId: 1,
                from: "2026-10-01",
                to: "2026-10-31",
            },
        });

        assert.equal(result.success, false);
        assert.match(result.error!, /Sem permissão/);
    });

    it("should return paginated cycle entries when authorized", async () => {
        const mockAccess: IPlanningAccessProvider = {
            async execute() {
                return success({
                    canViewPlanning: true,
                    canManagePlanning: true,
                });
            },
        };

        const mockQueries: ICycleEntriesQueries = {
            async listCycleEntries(params): Promise<Page<CycleEntryItem>> {
                assert.equal(params.contextId, 100);
                assert.equal(params.identifier.agreementId, 1);
                assert.equal(params.pageRequest.page, 1);
                assert.equal(params.pageRequest.pageSize, 10);

                return {
                    data: mockEntries,
                    total: 2,
                    pageIndex: 0,
                    pageSize: 10,
                    pageCount: 1,
                };
            },
        };

        const useCase = new GetCycleEntriesUseCase(mockQueries, mockAccess);
        const result = await useCase.execute({
            session: mockSession,
            input: {
                agreementId: 1,
                from: "2026-10-01",
                to: "2026-10-31",
                page: 1,
                pageSize: 10,
            },
        });

        assert.equal(result.success, true);
        assert.ok(result.data);
        assert.equal(result.data.total, 2);
        assert.equal(result.data.data.length, 2);
        assert.equal(result.data.data[0].entryId, 101);
        assert.equal(result.data.data[0].type, "ACCRUAL");
        assert.equal(result.data.data[1].entryId, 102);
        assert.equal(result.data.data[1].type, "SETTLEMENT");
    });
});
