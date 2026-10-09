/**
 * Port de verificação de permissões de acesso ao espaço/planejamento.
 * Todas as datas consumidas e manipuladas no Core são datas civis (sem horário / fuso).
 */
import { SessionPayload } from "@/modules/identity/infra/cryptography/jwt-utils";
import { Result } from "@/types/result.types";

export interface PlanningAccessPermissions {
    canViewPlanning: boolean;
    canManagePlanning: boolean;
}

export interface IPlanningAccessProvider {
    execute(session: SessionPayload): Promise<Result<PlanningAccessPermissions>>;
}
