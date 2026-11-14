import { isAfter, isBefore, parseISO, startOfDay } from "date-fns";
import { CycleRange } from "@/modules/cycles/models/cycle-primitives.schema";
import { AgreementScheduleContext } from "./cycle-engine.registry";
import { CycleWindowBoundaries } from "./cycle-window.engine";

export type CycleDetailValidationError =
    | {
          code: "INVALID_RANGE_ORDER";
          message: string;
      }
    | {
          code: "OUT_OF_AGREEMENT_BOUNDS";
          message: string;
      }
    | {
          code: "NON_CANONICAL_CYCLE_WINDOW";
          message: string;
      };

export interface ValidatedCycleNeighborhood {
    prev: CycleWindowBoundaries | null;
    current: CycleWindowBoundaries;
    next: CycleWindowBoundaries | null;
}

export class CycleDetailValidator {
    /**
     * Valida a vigência solicitada contra os limites do Agreement e localiza
     * `{ prev, current, next }` dentro das janelas geradas pela CycleWindowEngine.
     */
    static validateAndExtractNeighborhood(params: {
        requestedRange: CycleRange;
        agreement: AgreementScheduleContext;
        generatedWindows: CycleWindowBoundaries[];
    }):
        | { ok: true; value: ValidatedCycleNeighborhood }
        | { ok: false; error: CycleDetailValidationError } {
        const { requestedRange, agreement, generatedWindows } = params;

        const reqFrom = startOfDay(parseISO(requestedRange.from));
        const reqTo = startOfDay(parseISO(requestedRange.to));

        // 1. Ordem cronológica básica
        if (isAfter(reqFrom, reqTo)) {
            return {
                ok: false,
                error: {
                    code: "INVALID_RANGE_ORDER",
                    message: `A data inicial (${requestedRange.from}) não pode ser posterior à data final (${requestedRange.to}).`,
                },
            };
        }

        // 2. Interseção com a vigência do Agreement [startsAt, endsAt]
        const agreementStart = startOfDay(agreement.startsAt);
        const agreementEnd = agreement.endsAt ? startOfDay(agreement.endsAt) : null;

        if (
            isBefore(reqTo, agreementStart) ||
            (agreementEnd !== null && isAfter(reqFrom, agreementEnd))
        ) {
            return {
                ok: false,
                error: {
                    code: "OUT_OF_AGREEMENT_BOUNDS",
                    message: `O ciclo solicitado (${requestedRange.from} a ${requestedRange.to}) está fora da vigência do acordo.`,
                },
            };
        }

        // 3. Busca a vigência exata nas janelas canônicas geradas pela CycleWindowEngine
        const currentIndex = generatedWindows.findIndex(
            (w) =>
                w.range.from === requestedRange.from &&
                w.range.to === requestedRange.to
        );

        if (currentIndex === -1) {
            return {
                ok: false,
                error: {
                    code: "NON_CANONICAL_CYCLE_WINDOW",
                    message: `O intervalo (${requestedRange.from} a ${requestedRange.to}) não corresponde a uma vigência válida para as regras deste acordo.`,
                },
            };
        }

        return {
            ok: true,
            value: {
                prev: currentIndex > 0 ? generatedWindows[currentIndex - 1] : null,
                current: generatedWindows[currentIndex],
                next:
                    currentIndex < generatedWindows.length - 1
                        ? generatedWindows[currentIndex + 1]
                        : null,
            },
        };
    }
}