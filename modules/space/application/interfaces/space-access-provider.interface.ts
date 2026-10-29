import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { Result } from "@/types/result.types";

export interface SpaceAccessPermissions {
    canViewBalances: boolean;
    canManageBalances: boolean;
}

export interface ISpaceAccessProvider {
    execute(session: SessionPayload): Promise<Result<SpaceAccessPermissions>>;
}
