import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { ViewContainer } from "@/components/adaptive";
import { EditWalletModalConfig } from "@/modules/account/ui/views/edit-wallet-modal";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditWalletDirectPage(props: Props) {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const { id } = await props.params;
    const walletId = Number(id);

    if (Number.isNaN(walletId)) {
        notFound();
    }

    const wallet = await prisma.balance.findFirst({
        where: {
            id: walletId,
            contextId: session.contextId,
            balanceType: "WALLET",
        },
        select: {
            id: true,
            name: true,
        },
    });

    if (!wallet) {
        notFound();
    }

    return (
        <ViewContainer
            data={{
                id: wallet.id,
                defaultName: wallet.name,
            }}
            {...EditWalletModalConfig}
        />
    );
}
