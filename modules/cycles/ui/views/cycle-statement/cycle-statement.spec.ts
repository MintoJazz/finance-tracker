import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    CYCLE_STATUS_TONE_MAP,
    CYCLE_SUMMARY_LABELS,
    STATUS_BADGE_CLASSES,
} from "../../components/cycle-summary/labels";
import { CycleStatementAdaptiveConfig } from "./index";
import { CycleStatusSchema } from "@/modules/cycles/models/cycle-primitives.schema";

describe("CycleStatementView - Configuração e Mapas", () => {
    it("CYCLE_SUMMARY_LABELS possui rótulos estritos para CARD e CONTRACT_CYCLE", () => {
        assert.equal(CYCLE_SUMMARY_LABELS.CARD.total, "Total da fatura");
        assert.equal(CYCLE_SUMMARY_LABELS.CARD.period, "Ciclo");
        assert.equal(CYCLE_SUMMARY_LABELS.CARD.dueDate, "Vencimento");
        assert.equal(CYCLE_SUMMARY_LABELS.CARD.paid, "Pago");
        assert.equal(CYCLE_SUMMARY_LABELS.CARD.open, "Em aberto");

        assert.equal(CYCLE_SUMMARY_LABELS.CONTRACT_CYCLE.total, "Total do ciclo");
        assert.equal(CYCLE_SUMMARY_LABELS.CONTRACT_CYCLE.period, "Competência");
        assert.equal(CYCLE_SUMMARY_LABELS.CONTRACT_CYCLE.dueDate, "Vencimento");
        assert.equal(CYCLE_SUMMARY_LABELS.CONTRACT_CYCLE.paid, "Pago");
        assert.equal(CYCLE_SUMMARY_LABELS.CONTRACT_CYCLE.open, "Em aberto");
    });

    it("CYCLE_STATUS_TONE_MAP cobre todos os status do enum de ciclo com tons semânticos válidos", () => {
        const statuses = CycleStatusSchema.options;
        for (const s of statuses) {
            const mapped = CYCLE_STATUS_TONE_MAP[s];
            assert.ok(mapped, `Status ${s} não está mapeado no tom`);
            assert.ok(
                ["destructive", "amber", "emerald", "neutral"].includes(mapped.tone),
                `Tom inválido para ${s}: ${mapped.tone}`
            );
            assert.ok(
                STATUS_BADGE_CLASSES[mapped.tone],
                `Classe de badge ausente para o tom ${mapped.tone}`
            );
        }
    });

    it("CycleStatementAdaptiveConfig expõe viewports desktop e mobile", () => {
        assert.ok(CycleStatementAdaptiveConfig.views.desktop);
        assert.ok(CycleStatementAdaptiveConfig.views.desktop.View);
        assert.ok(CycleStatementAdaptiveConfig.views.desktop.hook);

        assert.ok(CycleStatementAdaptiveConfig.views.mobile);
        assert.ok(CycleStatementAdaptiveConfig.views.mobile.View);
        assert.ok(CycleStatementAdaptiveConfig.views.mobile.hook);
    });
});

