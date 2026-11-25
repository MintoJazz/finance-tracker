import { notFound, redirect } from "next/navigation";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { getWalletByIdAction } from "@/modules/wallets/ui/actions/get-wallet-by-id.action";
import { ViewContainer } from "@/components/adaptive";
import { EditWalletModalConfig } from "@/modules/wallets/ui/views/edit-wallet-modal";
import { getDeviceViewport } from "@/lib/device";

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

    const result = await getWalletByIdAction(walletId);

    if (!result.success || !result.data) {
        notFound();
    }

    const initialViewport = await getDeviceViewport();

    return (
        <ViewContainer
            initialViewport={initialViewport}
            data={{
                id: result.data.id,
                defaultName: result.data.name,
            }}
            {...EditWalletModalConfig}
        />
    );
}
