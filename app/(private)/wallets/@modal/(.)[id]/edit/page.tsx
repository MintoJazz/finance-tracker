import { notFound, redirect } from "next/navigation";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { AccountFactory } from "@/modules/account/infra/factories/account.factory";
import { ViewContainer } from "@/components/adaptive";
import { EditWalletModalConfig } from "@/modules/account/ui/views/edit-wallet-modal";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditWalletModalPage(props: Props) {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const { id } = await props.params;
    const walletId = Number(id);

    if (Number.isNaN(walletId) || walletId <= 0) {
        notFound();
    }

    const result = await AccountFactory.makeGetWalletByIdUseCase().execute({
        session,
        walletId,
    });

    if (!result.success || !result.data) {
        notFound();
    }

    return (
        <ViewContainer
            data={{
                id: result.data.id,
                defaultName: result.data.name,
            }}
            {...EditWalletModalConfig}
        />
    );
}
