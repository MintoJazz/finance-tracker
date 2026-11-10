import { redirect } from "next/navigation"
import { ViewContainer } from "@/components/adaptive"
import { getDeviceViewport } from "@/lib/device"
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler"
import { parseOperationSeedFromSearchParams } from "@/modules/operations/models/operation-seed.schema"
import { getOperationOptionsAction } from "@/modules/operations/ui/actions/get-operation-options.action"
import { MOCK_OPERATION_OPTIONS } from "@/modules/operations/infra/mock/operation-options.mock"
import { OperationWizardModalConfig } from "@/modules/operations/ui/views/operation-wizard-modal"

export interface NewOperationModalPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function NewOperationModalPage(
  props: NewOperationModalPageProps
) {
  const session = await SessionHandler.getSession()
  if (!session) redirect("/login")

  const rawSearchParams = (await props.searchParams) ?? {}
  const seed = parseOperationSeedFromSearchParams(rawSearchParams)

  const optionsResult = await getOperationOptionsAction()
  const options = optionsResult.success
    ? optionsResult.data
    : MOCK_OPERATION_OPTIONS

  const initialViewport = await getDeviceViewport()

  return (
    <ViewContainer
      key={`op-modal-${seed.nature ?? "none"}-${seed.custodyBalanceId ?? "0"}`}
      initialViewport={initialViewport}
      data={{ seed, options }}
      {...OperationWizardModalConfig}
    />
  )
}

