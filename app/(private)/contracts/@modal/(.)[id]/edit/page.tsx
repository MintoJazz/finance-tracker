import { notFound, redirect } from "next/navigation";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { ViewContainer } from "@/components/adaptive";
import { EditContractModalConfig } from "@/modules/planning/ui/views/edit-contract-modal";
import { getContractByIdAction } from "@/modules/planning/ui/actions/get-contract-by-id.action";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditContractModalPage(props: Props) {
  const session = await SessionHandler.getSession();
  if (!session) redirect("/login");

  const { id } = await props.params;
  const contractId = Number(id);

  if (Number.isNaN(contractId) || contractId <= 0) {
    notFound();
  }

  const result = await getContractByIdAction(contractId);
  const data = result.success && result.data ? result.data : null;

  return (
    <ViewContainer
      data={{
        id: contractId,
        defaultValues: data
          ? {
              type: data.type,
              name: data.name,
              value: data.value,
              frequency: data.frequency,
              validity: {
                from: data.startsAt,
                to: data.endsAt ?? undefined,
              },
              dueDay: data.dueDay,
              hasCustomClosingDay: false,
              closingDay: null,
              includeInProjection: data.includeInProjection,
            }
          : undefined,
      }}
      {...EditContractModalConfig}
    />
  );
}
