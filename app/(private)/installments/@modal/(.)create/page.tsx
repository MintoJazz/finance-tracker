import { redirect } from "next/navigation";
import { ViewContainer } from "@/components/adaptive";
import { getDeviceViewport } from "@/lib/device";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { MOCK_INSTALLMENT_FORM_OPTIONS } from "@/modules/installments/infra/mock/installment-form-options.mock";
import { CreateInstallmentModalConfig } from "@/modules/installments/ui/views/create-installment-modal";

export default async function CreateInstallmentModalPage() {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    // TODO(backend): carregar via InstallmentFactory.makeGetInstallmentFormOptionsUseCase()
    // (cartões e categorias reais). Por ora, mock: os ids não existem no banco.
    const options = MOCK_INSTALLMENT_FORM_OPTIONS;

    const initialViewport = await getDeviceViewport();

    return (
        <ViewContainer
            initialViewport={initialViewport}
            data={{ options }}
            {...CreateInstallmentModalConfig}
        />
    );
}
