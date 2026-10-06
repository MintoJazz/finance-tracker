import { notFound, redirect } from "next/navigation";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { AccountFactory } from "@/modules/account/infra/factories/account.factory";
import { ViewContainer } from "@/components/adaptive";
import { EditCardModalConfig } from "@/modules/account/ui/views/edit-card-modal";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditCardModalPage(props: Props) {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const { id } = await props.params;
    const cardId = Number(id);

    if (Number.isNaN(cardId) || cardId <= 0) {
        notFound();
    }

    const result = await AccountFactory.makeGetCardByIdUseCase().execute({
        session,
        cardId,
    });

    if (!result.success || !result.data) {
        notFound();
    }

    return (
        <ViewContainer
            data={{
                id: result.data.id,
                defaultValues: {
                    name: result.data.name,
                    limit: result.data.limit,
                    closingDay: result.data.closingDay,
                    dueDay: result.data.dueDay,
                },
            }}
            {...EditCardModalConfig}
        />
    );
}