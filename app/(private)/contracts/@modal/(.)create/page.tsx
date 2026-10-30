import { ViewContainer } from "@/components/adaptive";
import { CreateContractModalConfig } from "@/modules/contracts/ui/views/create-contract-modal";
import { getDeviceViewport } from "@/lib/device";

export default async function CreateContractModalPage() {
  const initialViewport = await getDeviceViewport();
  return <ViewContainer initialViewport={initialViewport} data={{}} {...CreateContractModalConfig} />;
}
